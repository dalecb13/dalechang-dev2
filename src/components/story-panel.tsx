import type { Chapter, Region } from '@/data/island';
import { getRegionChapters } from '@/data/island';

/**
 * The "book" beside the island canvas (Phase 2).
 *
 * Presentational only — the page owns which chapter/region is active and passes
 * it down. Three states, in priority order:
 *   1. `chapter` set  -> full chapter page (title, years, tech, description)
 *   2. `region` set   -> region intro + list of its landmarks
 *   3. neither        -> island welcome + region directory
 *
 * Styled as a second Game Boy screen using the DMG 4-shade green palette so it
 * pairs with the canvas independent of the site's light/dark theme.
 */

// Classic Game Boy (DMG) palette, light -> dark.
const C0 = '#9bbc0f'; // lightest — screen background
const C1 = '#8bac0f'; // light — chip fill
const C2 = '#306230'; // dark — secondary text / accents
const C3 = '#0f380f'; // darkest — text & borders

export type StoryPanelProps = {
  chapter?: Chapter;
  region?: Region;
  className?: string;
};

// Island-level welcome copy. Lives here for now; can move into island.ts
// alongside the region intros if we want all narrative in one place.
const ISLAND_INTRO =
  "A decade of building, mapped to one island. Wander from the Government Coast where it all began (2016) out to the Startup Forest and beyond (2026). Every landmark is a chapter — a job or a project.";

function formatYears(startYear: number, endYear?: number): string {
  if (!endYear || endYear === startYear) return `${startYear}`;
  return `${startYear} – ${endYear}`;
}

function TechChip({ displayText, href }: { displayText: string; href?: string }) {
  const chip = (
    <span
      className="inline-block border-2 px-2 py-0.5 font-mono text-xs leading-none"
      style={{ borderColor: C3, backgroundColor: C1, color: C3 }}
    >
      {displayText}
    </span>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
      {chip}
    </a>
  ) : (
    chip
  );
}

/** Thin pixel divider in the darkest shade. */
function Divider() {
  return <div className="my-4 h-0.5 w-full" style={{ backgroundColor: C3 }} aria-hidden="true" />;
}

function ChapterView({ chapter }: { chapter: Chapter }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C2 }}>
        {chapter.kind === 'project' ? 'Project' : 'Work'} · {formatYears(chapter.startYear, chapter.endYear)}
      </p>
      <h2 className="mt-1 font-mono text-2xl font-bold leading-tight" style={{ color: C3 }}>
        {chapter.title}
      </h2>
      {chapter.subtitle && (
        <p className="font-mono text-sm" style={{ color: C2 }}>
          {chapter.subtitle}
        </p>
      )}

      <Divider />

      <p className="text-sm leading-relaxed" style={{ color: C3 }}>
        {chapter.description}
      </p>

      {chapter.technologies.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {chapter.technologies.map((t) => (
            <TechChip key={t.displayText} displayText={t.displayText} href={t.href} />
          ))}
        </div>
      )}

      {chapter.link && (
        <a
          href={chapter.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block border-2 px-3 py-1 font-mono text-sm hover:opacity-80"
          style={{ borderColor: C3, color: C3 }}
        >
          Visit ↗
        </a>
      )}
    </div>
  );
}

function RegionView({ region }: { region: Region }) {
  const chapters = getRegionChapters(region.id);
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C2 }}>
        Region
      </p>
      <h2 className="mt-1 font-mono text-2xl font-bold leading-tight" style={{ color: C3 }}>
        {region.displayName}
      </h2>

      <Divider />

      <p className="text-sm leading-relaxed" style={{ color: C3 }}>
        {region.intro}
      </p>

      <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C2 }}>
        Landmarks
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {chapters.map((c) => (
          <li key={c.id} className="font-mono text-sm" style={{ color: C3 }}>
            <span style={{ color: C2 }}>{formatYears(c.startYear, c.endYear)}</span> &nbsp;{c.title}
          </li>
        ))}
      </ul>

      <p className="mt-5 font-mono text-xs italic" style={{ color: C2 }}>
        Walk up to a landmark and press the action button to read its story.
      </p>
    </div>
  );
}

function IslandIntroView() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C2 }}>
        Welcome to
      </p>
      <h2 className="mt-1 font-mono text-2xl font-bold leading-tight" style={{ color: C3 }}>
        Dale&apos;s Island
      </h2>

      <Divider />

      <p className="text-sm leading-relaxed" style={{ color: C3 }}>
        {ISLAND_INTRO}
      </p>

      <p className="mt-5 font-mono text-xs italic" style={{ color: C2 }}>
        Explore the island. Press the action button at a landmark to open its chapter.
      </p>
    </div>
  );
}

export default function StoryPanel({ chapter, region, className }: StoryPanelProps) {
  return (
    // Dark bezel matching the canvas, wrapping a Game Boy "screen".
    <div className={`rounded-lg bg-[#2b2b2b] p-3 shadow-2xl ring-1 ring-black/40 ${className ?? ''}`}>
      <div
        className="h-full min-h-[280px] p-5"
        style={{ backgroundColor: C0, border: `3px solid ${C3}` }}
      >
        {chapter ? (
          <ChapterView chapter={chapter} />
        ) : region ? (
          <RegionView region={region} />
        ) : (
          <IslandIntroView />
        )}
      </div>
    </div>
  );
}
