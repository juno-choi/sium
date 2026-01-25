import * as PIXI from 'pixi.js';
import { Spine, TextureAtlas, SkeletonJson, AtlasAttachmentLoader } from '@esotericsoftware/spine-pixi-v8';

export interface PixiSpineCharacterConfig {
    jsonUrl: string;
    atlasUrl: string;
    pngUrl: string;
    animationName?: string;
    skinName?: string;
    width: number;
    height: number;
}

export class PixiSpineCharacter {
    private app: PIXI.Application | null = null;
    private spine: Spine | null = null;
    private container: HTMLElement;
    private isReady: boolean = false;
    private isDestroyed: boolean = false;

    constructor(container: HTMLElement, config: PixiSpineCharacterConfig) {
        this.container = container;
        this.app = new PIXI.Application();

        // 초기화 실행
        this.init(config);
    }

    private async init(config: PixiSpineCharacterConfig) {
        if (this.isDestroyed || !this.app) return;

        try {
            // PixiJS v8 초기화
            await this.app.init({
                width: config.width,
                height: config.height,
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (this.isDestroyed || !this.app) {
                this.cleanupApp();
                return;
            }

            // Canvas를 컨테이너에 추가
            if (this.container && this.app.canvas) {
                this.container.appendChild(this.app.canvas);
            }

            await this.loadSpineAssets(config);

            if (this.isDestroyed) {
                this.cleanupApp();
                return;
            }

            this.isReady = true;

            // 사용 가능한 애니메이션과 스킨 로그 출력
            if (this.spine) {
                const availableAnimations = this.spine.skeleton.data.animations.map((a: any) => a.name);
                const availableSkins = this.spine.skeleton.data.skins.map((s: any) => s.name);
                console.log('[PixiSpine] 사용 가능한 애니메이션:', availableAnimations);
                console.log('[PixiSpine] 사용 가능한 스킨:', availableSkins);

                // 로드 후 애니메이션/스킨 설정 (존재하는 경우에만)
                if (config.animationName) {
                    this.setAnimation(config.animationName);
                } else if (availableAnimations.length > 0) {
                    // 기본 애니메이션이 없으면 첫 번째 애니메이션 재생
                    console.log(`[PixiSpine] 기본 애니메이션 재생: ${availableAnimations[0]}`);
                    this.setAnimation(availableAnimations[0]);
                }

                if (config.skinName) {
                    console.log(`[PixiSpine] 스킨 설정: ${config.skinName}`);
                    this.setSkin(config.skinName);
                } else if (availableSkins.includes('full_skins')) {
                    console.log(`[PixiSpine] 기본 스킨 적용: full_skins`);
                    this.setSkin('full_skins');
                } else {
                    console.log(`[PixiSpine] 현재 스킨: default`);
                }
            }

        } catch (error) {
            console.error('[PixiSpine] 초기화 실패:', error);
        }
    }

    private async loadSpineAssets(config: PixiSpineCharacterConfig) {
        if (!this.app) return;

        try {
            console.log('[PixiSpine] 로드 시작');

            // 1. 텍스처를 먼저 로드
            const texture = await PIXI.Assets.load(config.pngUrl);
            console.log('[PixiSpine] 1. 텍스처 로드 완료');

            // 2. Atlas 텍스트 파일 로드
            const atlasResponse = await fetch(config.atlasUrl);
            if (!atlasResponse.ok) throw new Error('Atlas 파일을 불러올 수 없습니다.');
            const atlasText = await atlasResponse.text();
            console.log('[PixiSpine] 2. Atlas 텍스트 로드 완료');

            // 3. Skeleton JSON 로드
            const skeletonResponse = await fetch(config.jsonUrl);
            if (!skeletonResponse.ok) throw new Error('Skeleton JSON 파일을 불러올 수 없습니다.');
            const skeletonJson = await skeletonResponse.json();
            console.log('[PixiSpine] 3. Skeleton JSON 로드 완료');

            if (this.isDestroyed || !this.app) return;

            // 4. Atlas 파일에서 참조하는 이미지 파일명 추출하고 캐시에 등록
            const imageNameMatch = atlasText.match(/^(.+\.png)/m);
            const imageName = imageNameMatch ? imageNameMatch[1].trim() : 'texture.png';
            console.log(`[PixiSpine] Atlas 내부 이미지명: "${imageName}"`);

            // 텍스처를 캐시에 등록 (TextureAtlas가 자동으로 찾도록)
            PIXI.Assets.cache.set(imageName, texture);

            // 5. TextureAtlas 생성
            const spineAtlas = new TextureAtlas(atlasText);
            console.log('[PixiSpine] 4. Atlas 생성 완료');

            // 디버깅: Atlas 구조 확인
            console.log('[PixiSpine] Atlas pages 개수:', spineAtlas.pages?.length);
            console.log('[PixiSpine] Atlas regions 개수:', spineAtlas.regions?.length);
            if (spineAtlas.pages && spineAtlas.pages.length > 0) {
                spineAtlas.pages.forEach((page: any, index: number) => {
                    console.log(`[PixiSpine] Page ${index}:`, {
                        name: page.name,
                        hasTexture: !!page.texture,
                        hasBaseTexture: !!page.baseTexture,
                        width: page.width,
                        height: page.height
                    });

                    // 수동으로 텍스처 할당
                    if (!page.texture || !page.baseTexture) {
                        console.log(`[PixiSpine] Page ${index}에 텍스처 수동 할당`);

                        // SpineTexture 형식으로 래핑
                        const spineTexture = {
                            texture: texture,
                            source: texture.source,
                            width: texture.width,
                            height: texture.height,
                        };

                        page.texture = spineTexture;
                        page.baseTexture = texture.source;

                        console.log(`[PixiSpine] 할당 후 - hasTexture: ${!!page.texture}`);
                    }
                });
            }

            // Regions 확인 및 텍스처 할당
            if (spineAtlas.regions && spineAtlas.regions.length > 0) {
                console.log(`[PixiSpine] 첫 번째 region:`, {
                    name: spineAtlas.regions[0].name,
                    hasTexture: !!spineAtlas.regions[0].texture,
                    page: spineAtlas.regions[0].page?.name
                });

                // 모든 regions에 텍스처 할당
                let assignedCount = 0;
                spineAtlas.regions.forEach((region: any) => {
                    if (!region.texture && region.page) {
                        // Page의 텍스처를 region에 할당
                        region.texture = region.page.texture;
                        assignedCount++;
                    }
                });

                console.log(`[PixiSpine] ${assignedCount}개 region에 텍스처 할당 완료`);
                console.log(`[PixiSpine] 첫 번째 region 재확인:`, {
                    hasTexture: !!spineAtlas.regions[0].texture
                });
            }

            // 6. SkeletonData 생성
            const atlasLoader = new AtlasAttachmentLoader(spineAtlas);
            const parser = new SkeletonJson(atlasLoader);
            parser.scale = 1;

            const skeletonData = parser.readSkeletonData(skeletonJson);
            console.log('[PixiSpine] 5. Skeleton 데이터 파싱 완료');

            if (this.isDestroyed || !this.app) return;

            // 6. Spine 객체 생성
            if (!this.app.renderer) {
                throw new Error('PixiJS renderer가 초기화되지 않았습니다.');
            }

            this.spine = new Spine(skeletonData);
            this.spine.autoUpdate = true; // 자동 업데이트 활성화

            // stage에 추가
            this.app.stage.addChild(this.spine);

            // 위치와 스케일 설정
            this.spine.x = config.width / 2;
            this.spine.y = config.height * 0.9;

            const baseScale = Math.min(config.width, config.height) / 450;
            this.spine.scale.set(baseScale);

            console.log('[PixiSpine] ✅ 로드 및 렌더링 완료');

        } catch (error) {
            console.error('[PixiSpine] ❌ 에셋 로드 실패:', error);
            throw error;
        }
    }

    // 애니메이션 변경
    setAnimation(name: string, loop: boolean = true) {
        if (this.isReady && this.spine) {
            try {
                this.spine.state.setAnimation(0, name, loop);
            } catch (e) {
                console.warn(`[PixiSpine] 애니메이션 재생 실패: ${name}`, e);
            }
        }
    }

    // 스킨 변경
    setSkin(name: string) {
        if (!this.isReady || !this.spine) return;

        try {
            const skin = this.spine.skeleton.data.findSkin(name);
            if (skin) {
                this.spine.skeleton.setSkin(skin);
                this.spine.skeleton.setSlotsToSetupPose();
            }
        } catch (e) {
            console.warn(`[PixiSpine] 스킨 설정 오류: ${name}`, e);
        }
    }

    // 리사이즈
    resize(width: number, height: number) {
        if (!this.isReady || !this.app || !this.app.renderer) return;

        this.app.renderer.resize(width, height);
        if (this.spine) {
            this.spine.x = width / 2;
            this.spine.y = height * 0.9;
            const scale = Math.min(width, height) / 450;
            this.spine.scale.set(scale);
        }
    }

    private cleanupApp() {
        if (this.app) {
            try {
                // renderer가 있을 때만 destroy 호출 (v8 에러 방지)
                if (this.app.renderer) {
                    this.app.destroy(true, { children: true, texture: true });
                }
            } catch (e) {
                console.warn('[PixiSpine] App 파괴 중 경고:', e);
            }
            this.app = null;
        }
    }

    // 정리
    destroy() {
        this.isDestroyed = true;
        this.isReady = false;
        this.cleanupApp();
    }
}
