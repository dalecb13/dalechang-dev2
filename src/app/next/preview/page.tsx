// THROWAWAY preview for Phase 2 — remove after review.
import StoryPanel from '@/components/story-panel';
import { getChapter, getRegion } from '@/data/island';

export default function StoryPanelPreview() {
  const chapter = getChapter('cigna-2019');
  const region = getRegion('startup-forest');
  return (
    <div className="min-h-screen w-full lg:col-span-2 flex flex-col items-center gap-8 py-12">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-3">
        <div>
          <p className="mb-2 font-mono text-sm text-slate-400">1. Island intro</p>
          <StoryPanel />
        </div>
        <div>
          <p className="mb-2 font-mono text-sm text-slate-400">2. Region intro</p>
          <StoryPanel region={region} />
        </div>
        <div>
          <p className="mb-2 font-mono text-sm text-slate-400">3. Chapter</p>
          <StoryPanel chapter={chapter} />
        </div>
      </div>
    </div>
  );
}
