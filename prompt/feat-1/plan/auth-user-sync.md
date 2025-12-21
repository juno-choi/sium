# [목표 설명]
Supabase의 `auth.users` 테이블에 새로운 사용자가 등록되거나 **정보가 변경되거나 삭제될 때**, `public.users` 테이블에도 해당 내용을 자동으로 동기화합니다.

**동기화 시나리오**:
- **신규 가입**: `auth.users` INSERT → `public.users` INSERT
- **정보 수정**: `auth.users` UPDATE → `public.users` UPDATE
- **계정 삭제**: `auth.users` DELETE → `public.users` DELETE

## 사용자 검토 필요 사항
> [!IMPORTANT]
> 이 작업은 데이터베이스의 **Trigger**와 **Function**을 생성하는 작업입니다.
> 1. **신규 가입**: `insert` 트리거가 처리
> 2. **정보 수정**: `update` 트리거가 처리 (이메일, 메타데이터 변경 시에만)
> 3. **계정 삭제**: `delete` 트리거가 처리

> [!WARNING]
> - 함수는 `security definer`로 실행되어 슈퍼유저 권한을 갖습니다.
> - 트리거는 자동으로 실행되며, 애플리케이션 코드에서 직접 호출하지 마세요.
> - **기존 사용자**: 트리거 생성 후 마이그레이션 쿼리 실행 필요

## 변경 제안

### 데이터베이스 스키마
#### [수정] [schema.sql](file:///c:/project/personal/2025/sium/supabase/schema.sql)

**1. Foreign Key 동작 명시**

먼저 `flyers` 테이블의 외래 키 동작을 명시해야 합니다:

```sql
-- 기존 flyers 테이블 수정
-- user_id 외래 키에 CASCADE 동작 추가
alter table public.flyers
  drop constraint if exists flyers_user_id_fkey;

alter table public.flyers
  add constraint flyers_user_id_fkey
    foreign key (user_id)
    references public.users(uuid)
    on delete cascade;  -- 사용자 삭제 시 전단지도 삭제
```

**동작 옵션**:
- `on delete cascade`: 사용자 삭제 시 전단지도 함께 삭제 **(권장)**
- `on delete set null`: 사용자 삭제 시 전단지는 남기고 user_id만 NULL (user_id가 nullable해야 함)
- `on delete restrict`: 전단지가 있으면 사용자 삭제 불가

---

**2. 유저 생성 핸들러 (`public.handle_new_user`)**

`auth.users`에 **INSERT** 발생 시 실행되며, `public.users`에 새로운 행을 생성합니다.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (uuid, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (uuid) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;
```

**개선 사항**:
- `on conflict (uuid) do update`: 중복 방지 (재가입 시나리오 대응)
- `coalesce()`: NULL 처리 및 OAuth 제공자별 필드 차이 대응
  - Google: `name` 또는 `full_name`
  - 없으면 빈 문자열

---

**3. 유저 수정 핸들러 (`public.handle_user_update`)**

`auth.users`에 **UPDATE** 발생 시 실행되며, `public.users`의 정보를 최신 상태로 갱신합니다.

```sql
create or replace function public.handle_user_update()
returns trigger as $$
begin
  update public.users
  set
    email = new.email,
    full_name = coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      full_name  -- 기존 값 유지
    ),
    avatar_url = coalesce(
      new.raw_user_meta_data->>'avatar_url',
      avatar_url  -- 기존 값 유지
    ),
    updated_at = now()
  where uuid = new.id;

  return new;
end;
$$ language plpgsql security definer;
```

**개선 사항**:
- NULL 처리: 새 값이 NULL이면 기존 값 유지
- `updated_at` 자동 갱신

---

**4. 유저 삭제 핸들러 (`public.handle_user_delete`)**

`auth.users`에서 **DELETE** 발생 시 실행되며, `public.users`에서도 삭제합니다.

```sql
create or replace function public.handle_user_delete()
returns trigger as $$
begin
  delete from public.users where uuid = old.id;
  return old;
end;
$$ language plpgsql security definer;
```

**동작**:
- `public.users` 삭제
- `flyers` 테이블은 FK의 `on delete cascade`에 의해 자동 삭제

---

**5. 트리거 연결**

```sql
-- INSERT 트리거
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- UPDATE 트리거 (필요한 필드 변경 시에만 실행)
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row
  when (
    old.email is distinct from new.email OR
    old.raw_user_meta_data is distinct from new.raw_user_meta_data
  )
  execute procedure public.handle_user_update();

-- DELETE 트리거
drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute procedure public.handle_user_delete();
```

**UPDATE 트리거 최적화**:
- `WHEN` 조건: 실제 필요한 필드(email, meta_data)가 변경될 때만 실행
- `last_sign_in_at` 같은 필드 변경 시에는 실행되지 않음 (성능 향상)

---

**6. 기존 사용자 마이그레이션**

트리거는 앞으로 생성/수정/삭제되는 사용자에게만 적용되므로, **기존 사용자를 수동으로 동기화**해야 합니다.

```sql
-- 기존 auth.users의 모든 사용자를 public.users에 동기화
insert into public.users (uuid, email, full_name, avatar_url, created_at)
select
  id,
  email,
  coalesce(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    ''
  ) as full_name,
  raw_user_meta_data->>'avatar_url',
  created_at
from auth.users
on conflict (uuid) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url;

-- 동기화 확인
select
  (select count(*) from auth.users) as auth_users_count,
  (select count(*) from public.users) as public_users_count;
```

## 검증 계획

### 수동 검증

**1. SQL 실행 순서**:

```sql
-- 1단계: FK 동작 수정
-- (위의 "1. Foreign Key 동작 명시" 실행)

-- 2단계: 함수 생성
-- (위의 "2. 유저 생성 핸들러" ~ "4. 유저 삭제 핸들러" 실행)

-- 3단계: 트리거 연결
-- (위의 "5. 트리거 연결" 실행)

-- 4단계: 기존 사용자 마이그레이션
-- (위의 "6. 기존 사용자 마이그레이션" 실행)
```

**2. 트리거 작동 확인**:

```sql
-- 트리거 목록 조회
select
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
order by trigger_name;

-- 예상 결과: 3개의 트리거
-- - on_auth_user_created (INSERT, AFTER)
-- - on_auth_user_updated (UPDATE, AFTER)
-- - on_auth_user_deleted (DELETE, AFTER)
```

**3. 기존 사용자 마이그레이션 확인**:

```sql
-- 행 개수 일치 확인
select
  (select count(*) from auth.users) as auth_count,
  (select count(*) from public.users) as public_count;

-- 특정 사용자 데이터 비교
select
  a.id,
  a.email as auth_email,
  p.email as public_email,
  a.raw_user_meta_data->>'full_name' as auth_name,
  p.full_name as public_name
from auth.users a
left join public.users p on a.id = p.uuid
limit 5;
```

**4. 신규 가입 테스트**:

- 브라우저에서 로그아웃
- 새 이메일로 가입 (또는 Google OAuth)
- 가입 후 확인:

```sql
-- 최근 생성된 사용자 확인
select * from public.users
order by created_at desc
limit 1;
```

- `uuid`, `email`, `full_name`, `avatar_url`이 올바르게 동기화되었는지 확인

**5. 정보 수정 테스트**:

**옵션 A: Supabase 대시보드**
- Authentication → Users → 특정 사용자 선택
- User Metadata 수정 (예: `full_name` 변경)
- `public.users`에서 변경 확인:

```sql
select uuid, full_name, updated_at
from public.users
where uuid = '<사용자-uuid>';
```

**옵션 B: 코드에서 업데이트**
```typescript
await supabase.auth.updateUser({
  data: { full_name: '새로운 이름' }
});
```

**6. 중복 방지 테스트**:

```sql
-- 동일 uuid로 INSERT 시도 (트리거 테스트)
-- 에러 없이 ON CONFLICT로 UPDATE되어야 함
insert into auth.users (id, email, raw_user_meta_data)
values (
  '<기존-uuid>',
  'test@example.com',
  '{"full_name": "테스트"}'::jsonb
);
```

**7. 계정 삭제 테스트**:

> [!CAUTION]
> 실제 운영 계정으로 테스트하지 마세요. 테스트 계정을 생성하여 진행하세요.

```sql
-- 테스트 사용자 생성 (Supabase 대시보드 또는 회원가입)
-- 해당 사용자의 전단지 생성 (선택)

-- 사용자 삭제 전 확인
select * from public.users where uuid = '<테스트-uuid>';
select * from public.flyers where user_id = '<테스트-uuid>';

-- Supabase Authentication에서 사용자 삭제
-- 또는 SQL로 삭제 (권장하지 않음):
-- delete from auth.users where id = '<테스트-uuid>';

-- 삭제 후 확인
select * from public.users where uuid = '<테스트-uuid>';  -- 0 rows
select * from public.flyers where user_id = '<테스트-uuid>';  -- 0 rows (cascade)
```

**8. NULL 처리 테스트**:

```sql
-- raw_user_meta_data가 빈 사용자 시뮬레이션
-- (수동으로 테스트하기 어려우므로, 코드 리뷰로 대체 가능)
```

**9. UPDATE 트리거 조건 확인**:

```sql
-- last_sign_in_at 변경 시 트리거 실행되지 않아야 함
update auth.users
set last_sign_in_at = now()
where id = '<사용자-uuid>';

-- public.users의 updated_at이 변경되지 않았는지 확인
select uuid, updated_at from public.users where uuid = '<사용자-uuid>';
```

## 롤백 방법

트리거와 함수를 제거하려면 다음 순서로 실행:

```sql
-- 1단계: 트리거 삭제 (먼저 삭제해야 함)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;
drop trigger if exists on_auth_user_deleted on auth.users;

-- 2단계: 함수 삭제
drop function if exists public.handle_new_user();
drop function if exists public.handle_user_update();
drop function if exists public.handle_user_delete();

-- 3단계: FK 원복 (필요 시)
alter table public.flyers
  drop constraint if exists flyers_user_id_fkey;

alter table public.flyers
  add constraint flyers_user_id_fkey
    foreign key (user_id)
    references public.users(uuid);
    -- on delete cascade 제거됨
```

## 추가 고려사항

### 1. updated_at 자동 업데이트 (선택사항)

`public.users`를 직접 UPDATE하는 경우에도 `updated_at`을 자동 갱신하려면:

```sql
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute procedure public.update_updated_at_column();
```

**참고**: 현재는 `auth.users`를 통해서만 업데이트하므로 필수는 아닙니다.

### 2. 성능 모니터링

대량의 사용자 가입/수정 시 트리거 성능 영향을 모니터링:

```sql
-- 트리거 실행 통계 확인 (PostgreSQL 확장 필요)
-- pg_stat_user_functions
```

### 3. 에러 로깅

트리거 실패 시 로깅을 추가하려면 별도 로그 테이블 생성 및 `EXCEPTION` 처리 필요 (고급 주제).
