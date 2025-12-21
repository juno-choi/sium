import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FlyerForm from '@/components/flyers/FlyerForm';

export default async function NewFlyerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">새 전단지 작성</h1>
            <FlyerForm mode="create" />
        </div>
    );
}
