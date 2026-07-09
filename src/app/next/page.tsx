'use client';

import { useState } from 'react';
import ZeldaMap from '@/components/zelda-map';
import StoryPanel from '@/components/story-panel';
import { getChapter, getRegion } from '@/data/island';
import type { Chapter, Region } from '@/data/island';

export default function NextPage() {
  const [chapter, setChapter] = useState<Chapter | undefined>(undefined);
  const [region, setRegion] = useState<Region | undefined>(undefined);

  return (
    <div className="min-h-screen w-full lg:col-span-2 flex flex-col items-center justify-center gap-6 py-12">
      <h1 className="font-mono text-xl font-bold tracking-[0.3em] text-[#306230] dark:text-[#9bbc0f]">
        DALE&apos;S ISLAND
      </h1>

      <div className="flex w-full flex-col items-center gap-6 xl:flex-row xl:items-start xl:justify-center">
        <ZeldaMap
          onInteract={(id) => setChapter(getChapter(id))}
          onEnterRegion={(regionId) => {
            // Entering / leaving a quadrant resets the open chapter back to the
            // region (or island) intro, so the panel always reflects where you are.
            setRegion(regionId ? getRegion(regionId) : undefined);
            setChapter(undefined);
          }}
        />
        <StoryPanel
          chapter={chapter}
          region={region}
          className="w-[min(90vw,720px)] xl:w-96 xl:max-w-sm"
        />
      </div>

      <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
        Move with{' '}
        <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-100">WASD</kbd> or the{' '}
        <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-100">arrow keys</kbd>
      </p>
      <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
        Walk up to a landmark and press{' '}
        <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-100">Space</kbd> to open its chapter
      </p>
    </div>
  );
}
