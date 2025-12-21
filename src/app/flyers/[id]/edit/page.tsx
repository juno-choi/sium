import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import FlyerForm from '@/components/flyers/FlyerForm';
import { extractImageUrls } from '@/lib/flyer-template';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditFlyerPage({ params }: PageProps) {
    const resolvedParams = await params;
    const supabase = await createClient();

    const { data: flyer, error } = await supabase
        .from('flyers')
        .select('*')
        .eq('uuid', resolvedParams.id)
        .single();

    if (error || !flyer) {
        notFound();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== flyer.user_id) {
        redirect('/');
    }

    const imageUrls = extractImageUrls(flyer.html_content);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">전단지 수정</h1>
            <FlyerForm
                mode="edit"
                flyerId={resolvedParams.id}
                initialData={{
                    title: flyer.title,
                    description: flyer.description || '',
                    imageUrls,
                    templateId: flyer.template_id,
                    formData: flyer.form_data,
                }}
            />
        </div>
    );
}
