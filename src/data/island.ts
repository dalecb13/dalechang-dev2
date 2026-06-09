import type { BadgeProps } from '@/components/badge-collection';
import workItemsJson from './work-items.json';
import projectsJson from './projects.json';

/**
 * Phase 1 data layer for the "/next" route — "Dale's Island".
 *
 * Normalizes the raw `work-items.json` and `projects.json` files into a single
 * `Chapter` shape and groups them into four themed regions of the island. The
 * JSON files stay the source of truth for the underlying facts (titles, years,
 * tech, descriptions); the region grouping, ordering, and narrative connective
 * tissue live here so the data files don't have to be reshaped.
 *
 * Pixel/landmark placement is intentionally NOT here — that belongs to the
 * canvas layer (Phase 3). This module is pure data and is safe to import from
 * either server or client components.
 */

// ---- raw JSON shapes (mirror the two data files) ----
type RawWorkItem = {
  companyName: string;
  companyLink: string;
  jobTitle: string;
  otherTitles?: string[];
  startYear: number;
  endYear?: number;
  notableTechnologies: BadgeProps[];
  description: string;
};

type RawProjectItem = {
  projectName: string;
  projectLink: string;
  startYear: number;
  isCompleted: boolean;
  notableTechnologies: BadgeProps[];
  description: string;
};

// ---- unified chapter shape consumed by the panel + canvas ----
export type ChapterKind = 'work' | 'project';

export type Chapter = {
  /** stable slug, e.g. "leidos-2016" — used as the interaction key */
  id: string;
  kind: ChapterKind;
  /** company name (work) or project name (project) */
  title: string;
  /** job title for work; undefined for projects */
  subtitle?: string;
  startYear: number;
  /** undefined for single-year projects */
  endYear?: number;
  technologies: BadgeProps[];
  description: string;
  /** external link (company site or project repo/site); may be empty */
  link?: string;
  regionId: RegionId;
};

export type RegionId =
  | 'government-coast'
  | 'health-hills'
  | 'startup-forest'
  | 'projects-grove';

export type Region = {
  id: RegionId;
  displayName: string;
  /** narrative blurb shown when the hero enters the region (the "story" glue) */
  intro: string;
  /** chapter ids, in chronological order, that live in this region */
  chapterIds: string[];
};

// ---- helpers ----
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, '') // drop apostrophes so "Kiki's" -> "kikis"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function chapterId(name: string, startYear: number): string {
  return `${slugify(name)}-${startYear}`;
}

// ---- normalize raw JSON into chapters (region assigned below) ----
const PLACEHOLDER_REGION = 'government-coast' satisfies RegionId;

const workChapters: Chapter[] = (workItemsJson as RawWorkItem[]).map((w) => ({
  id: chapterId(w.companyName, w.startYear),
  kind: 'work',
  title: w.companyName,
  subtitle: w.jobTitle,
  startYear: w.startYear,
  endYear: w.endYear,
  technologies: w.notableTechnologies,
  description: w.description,
  link: w.companyLink || undefined,
  regionId: PLACEHOLDER_REGION,
}));

const projectChapters: Chapter[] = (projectsJson as RawProjectItem[]).map((p) => ({
  id: chapterId(p.projectName, p.startYear),
  kind: 'project',
  title: p.projectName,
  startYear: p.startYear,
  technologies: p.notableTechnologies,
  description: p.description,
  link: p.projectLink || undefined,
  regionId: PLACEHOLDER_REGION,
}));

const allChapters = [...workChapters, ...projectChapters];

const chaptersById = new Map<string, Chapter>();
for (const chapter of allChapters) {
  if (chaptersById.has(chapter.id)) {
    throw new Error(`Duplicate chapter id "${chapter.id}" — slug collision in island data.`);
  }
  chaptersById.set(chapter.id, chapter);
}

// ---- region definitions ----
// Each region lists its member chapter ids; membership is the single source of
// truth and is validated against the normalized chapters below.
type RegionDef = Omit<Region, 'chapterIds'> & { chapterIds: string[] };

const REGION_DEFS: RegionDef[] = [
  {
    id: 'government-coast',
    displayName: 'Government Coast',
    intro:
      'Where the journey began. Along this rugged shoreline I cut my teeth on big-data platforms for government agencies — parsing documents, wrangling Spark and Hadoop, and shipping tools that had to hold up when it mattered most.',
    chapterIds: ['leidos-2016', 'leidos-2018', 'saic-koverse-2023'],
  },
  {
    id: 'health-hills',
    displayName: 'Health Hills',
    intro:
      'Up in the enterprise highlands I joined a Fortune 20 health company, leading internal financial reporting systems and learning to steer complex, high-stakes deployments without dropping the ball.',
    chapterIds: ['cigna-2019'],
  },
  {
    id: 'startup-forest',
    displayName: 'Startup Forest',
    intro:
      'Off the beaten path: smaller teams, bigger ownership. From leading an Air Force UX team to freelancing and building climate-impact tooling, this is where I learned to wear every hat at once.',
    chapterIds: ['innovim-2022', 'freelance-2024', 'minnow-collective-2026'],
  },
  {
    id: 'projects-grove',
    displayName: 'Projects Grove',
    intro:
      'Side quests and passion projects — a visual-novel game built in six weeks, a website for a therapist growing her practice, and mentoring the next wave of student engineers.',
    chapterIds: ['mind-lab-2020', 'kikis-scavenger-hunt-2024', 'hannah-therapy-online-2025'],
  },
];

// Assign each chapter to its region and validate that every chapter is placed
// exactly once and every referenced id exists.
const seen = new Set<string>();
for (const region of REGION_DEFS) {
  for (const id of region.chapterIds) {
    const chapter = chaptersById.get(id);
    if (!chapter) {
      throw new Error(`Region "${region.id}" references unknown chapter id "${id}".`);
    }
    if (seen.has(id)) {
      throw new Error(`Chapter "${id}" is assigned to more than one region.`);
    }
    seen.add(id);
    chapter.regionId = region.id;
  }
}

const unplaced = allChapters.filter((c) => !seen.has(c.id));
if (unplaced.length > 0) {
  throw new Error(`Chapters not assigned to any region: ${unplaced.map((c) => c.id).join(', ')}`);
}

// Sort each region's chapters chronologically (defensive — keeps display order
// correct even if the lists above are edited out of order).
for (const region of REGION_DEFS) {
  region.chapterIds.sort((a, b) => chaptersById.get(a)!.startYear - chaptersById.get(b)!.startYear);
}

// ---- public exports ----
export const CHAPTERS: readonly Chapter[] = allChapters;
export const REGIONS: readonly Region[] = REGION_DEFS;

export function getChapter(id: string): Chapter | undefined {
  return chaptersById.get(id);
}

export function getRegion(id: RegionId): Region | undefined {
  return REGION_DEFS.find((r) => r.id === id);
}

/** Chapters of a region, resolved and in chronological order. */
export function getRegionChapters(id: RegionId): Chapter[] {
  const region = getRegion(id);
  if (!region) return [];
  return region.chapterIds.map((cid) => chaptersById.get(cid)!);
}
