import dynamic from 'next/dynamic';
import { CharacterCanvasProps } from './CharacterCanvas.types';
import { Loader2 } from 'lucide-react';

const CharacterCanvasClient = dynamic(
  () => import('./CharacterCanvas.client'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center gap-3 p-6 bg-slate-100 border-2 border-slate-200 rounded-xl">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        <span className="text-sm font-medium text-slate-600">로딩 중...</span>
      </div>
    ),
  }
);

export default function CharacterCanvas(props: CharacterCanvasProps) {
  return <CharacterCanvasClient {...props} />;
}
