'use client';

import { useEffect, useRef } from 'react';
import { CHAPTERS, getChapter } from '@/data/island';
import type { RegionId } from '@/data/island';

/**
 * GameBoy-era Legend of Zelda inspired island — "Dale's Island".
 *
 * The island is split into four quadrants by a cross of dirt paths, each a
 * themed career region. Within the quadrants sit landmarks (a building per job,
 * a signpost per project), one for every chapter in `island.ts`. Walk the hero
 * (WASD / arrow keys, grid-locked) up to a landmark; a blinking "!" appears, and
 * the action button reports that chapter up to the page via `onInteract`.
 * Stepping into / out of a quadrant reports the current region via
 * `onEnterRegion` (null on the connecting paths). Rendering uses the classic
 * 4-shade DMG green palette on a small pixel-art canvas scaled up crisply.
 */

// Classic Game Boy (DMG) 4-shade green palette, light -> dark.
const C0 = '#9bbc0f'; // lightest
const C1 = '#8bac0f'; // light
const C2 = '#306230'; // dark
const C3 = '#0f380f'; // darkest

const TILE = 16;

// Pause-menu options, top to bottom. Only "Close" reacts to the action button.
const MENU_ITEMS = ['Inventory', '2024', 'Close'];

const COLS = 24;
const ROWS = 18;

// Landmarks: one per chapter, grouped spatially into the four region quadrants.
// `chapterId` keys back into island.ts (validated at module load below).
const LANDMARKS: { col: number; row: number; chapterId: string }[] = [
  // Government Coast (top-left)
  { col: 4, row: 3, chapterId: 'leidos-2016' },
  { col: 8, row: 3, chapterId: 'leidos-2018' },
  { col: 6, row: 6, chapterId: 'saic-koverse-2023' },
  // Health Hills (top-right)
  { col: 17, row: 4, chapterId: 'cigna-2019' },
  // Startup Forest (bottom-left)
  { col: 4, row: 11, chapterId: 'innovim-2022' },
  { col: 8, row: 11, chapterId: 'freelance-2024' },
  { col: 6, row: 14, chapterId: 'minnow-collective-2026' },
  // Projects Grove (bottom-right)
  { col: 15, row: 11, chapterId: 'mind-lab-2020' },
  { col: 19, row: 11, chapterId: 'kikis-scavenger-hunt-2024' },
  { col: 17, row: 14, chapterId: 'hannah-therapy-online-2025' },
];

// Region quadrants as inclusive tile bounds. The hero is "in" a region only
// while standing inside one of these; the connecting paths belong to none.
const REGION_ZONES: { id: RegionId; colMin: number; colMax: number; rowMin: number; rowMax: number }[] = [
  { id: 'government-coast', colMin: 3, colMax: 10, rowMin: 3, rowMax: 7 },
  { id: 'health-hills', colMin: 13, colMax: 20, rowMin: 3, rowMax: 7 },
  { id: 'startup-forest', colMin: 3, colMax: 10, rowMin: 10, rowMax: 14 },
  { id: 'projects-grove', colMin: 13, colMax: 20, rowMin: 10, rowMax: 14 },
];

// Decorative trees (grass tiles, kept clear of paths and landmarks).
const TREES = new Set([
  '10,4', '3,6', '14,3', '19,6', '15,6',
  '10,12', '3,13', '13,13', '20,13', '14,10',
]);

// Lookups + validation against island data, computed once at module load.
const landmarkByKey = new Map<string, { chapterId: string; kind: 'work' | 'project' }>();
for (const l of LANDMARKS) {
  const chapter = getChapter(l.chapterId);
  if (!chapter) throw new Error(`zelda-map: landmark references unknown chapter id "${l.chapterId}".`);
  landmarkByKey.set(`${l.col},${l.row}`, { chapterId: l.chapterId, kind: chapter.kind });
}
{
  const covered = new Set(LANDMARKS.map((l) => l.chapterId));
  for (const ch of CHAPTERS) {
    if (!covered.has(ch.id)) console.warn(`zelda-map: chapter "${ch.id}" has no landmark on the map.`);
  }
}
const LANDMARK_SPRITES = LANDMARKS.map((l) => ({
  col: l.col,
  row: l.row,
  kind: getChapter(l.chapterId)!.kind,
}));

// Terrain map, generated as concentric water/sand rings around a grass interior
// with a cross of paths and scattered trees.
//   ~ water   . sand   , grass   = path   T tree
const MAP: string[] = (() => {
  const rows: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let s = '';
    for (let c = 0; c < COLS; c++) {
      let ch: string;
      if (c < 2 || c > COLS - 3 || r < 2 || r > ROWS - 3) ch = '~'; // 2-tile water border
      else if (c < 3 || c > COLS - 4 || r < 3 || r > ROWS - 4) ch = '.'; // sand ring
      else if (c === 11 || c === 12 || r === 8 || r === 9) ch = '='; // cross of paths
      else if (TREES.has(`${c},${r}`)) ch = 'T';
      else ch = ',';
      s += ch;
    }
    rows.push(s);
  }
  return rows;
})();

const MAP_W = MAP[0].length;
const MAP_H = MAP.length;
const CANVAS_W = MAP_W * TILE;
const CANVAS_H = MAP_H * TILE;

type Facing = 'up' | 'down' | 'left' | 'right';

function tileChar(col: number, row: number) {
  if (col < 0 || row < 0 || col >= MAP_W || row >= MAP_H) return '~';
  return MAP[row][col];
}

function isBlockedTile(col: number, row: number) {
  const ch = tileChar(col, row);
  if (ch === '~' || ch === 'T') return true;
  return landmarkByKey.has(`${col},${row}`);
}

function regionAt(col: number, row: number): RegionId | null {
  for (const z of REGION_ZONES) {
    if (col >= z.colMin && col <= z.colMax && row >= z.rowMin && row <= z.rowMax) return z.id;
  }
  return null;
}

export type ZeldaMapProps = {
  /** Fired when the hero presses the action button while facing a landmark. */
  onInteract?: (chapterId: string) => void;
  /** Fired when the hero's region changes (null on the connecting paths). */
  onEnterRegion?: (regionId: RegionId | null) => void;
};

export default function ZeldaMap({ onInteract, onEnterRegion }: ZeldaMapProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep the latest callbacks in refs so the (deps: []) game loop never goes stale.
  const onInteractRef = useRef(onInteract);
  const onEnterRegionRef = useRef(onEnterRegion);
  onInteractRef.current = onInteract;
  onEnterRegionRef.current = onEnterRegion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    // --- mutable game state (kept out of React to avoid re-renders) ---
    // Movement is locked to the grid: every step moves the character exactly
    // one tile. `held` tracks pressed directions in order so the most recently
    // pressed key wins, and holding a key keeps stepping tile-by-tile.
    const held: Array<'up' | 'down' | 'left' | 'right'> = [];
    let tileX = 11;
    let tileY = 8;
    let facing: Facing = 'down';

    let moving = false;
    let progress = 0; // 0..1 across the current tile step
    let fromPX = tileX * TILE;
    let fromPY = tileY * TILE;
    let toPX = fromPX;
    let toPY = fromPY;
    let toTileX = tileX;
    let toTileY = tileY;
    let legPhase = 0; // flips each step so the legs alternate

    // ---- pause-menu state ----
    let menuOpen = false;
    let menuIndex = 0; // which MENU_ITEMS row the cursor is on

    // ---- region tracking: fire onEnterRegion only on change (undefined = unset) ----
    let lastRegionId: RegionId | null | undefined = undefined;

    let last = performance.now();
    let raf = 0;

    const STEP_TIME = 0.16; // seconds to cross one tile

    const DELTA: Record<'up' | 'down' | 'left' | 'right', [number, number]> = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };

    // ---- tile painters (all draw within a 16x16 cell at x,y) ----
    function drawWater(x: number, y: number, t: number) {
      ctx!.fillStyle = C2;
      ctx!.fillRect(x, y, TILE, TILE);
      ctx!.save();
      ctx!.beginPath();
      ctx!.rect(x, y, TILE, TILE);
      ctx!.clip();
      const shift = Math.floor(t * 6) % 6;
      for (const wy of [4, 11]) {
        const off = wy === 4 ? shift : 6 - shift;
        for (let wx = -6; wx < TILE; wx += 6) {
          ctx!.fillStyle = C0;
          ctx!.fillRect(x + wx + off + 1, y + wy, 3, 1);
          ctx!.fillStyle = C3;
          ctx!.fillRect(x + wx + off + 1, y + wy + 1, 3, 1);
        }
      }
      ctx!.restore();
    }

    function drawSand(x: number, y: number) {
      ctx!.fillStyle = C0;
      ctx!.fillRect(x, y, TILE, TILE);
      ctx!.fillStyle = C1;
      const dots = [
        [3, 5],
        [10, 4],
        [6, 11],
        [13, 9],
        [8, 7],
      ];
      for (const [dx, dy] of dots) ctx!.fillRect(x + dx, y + dy, 1, 1);
    }

    function drawGrass(x: number, y: number) {
      ctx!.fillStyle = C1;
      ctx!.fillRect(x, y, TILE, TILE);
      const v = ((x / TILE + y / TILE) | 0) % 2;
      const tufts = v
        ? [
            [3, 4],
            [9, 7],
            [6, 12],
            [13, 10],
          ]
        : [
            [5, 3],
            [11, 5],
            [2, 9],
            [8, 11],
          ];
      ctx!.fillStyle = C2;
      for (const [tx, ty] of tufts) {
        ctx!.fillRect(x + tx, y + ty, 1, 2);
        ctx!.fillRect(x + tx + 1, y + ty + 1, 1, 1);
      }
      ctx!.fillStyle = C0;
      ctx!.fillRect(x + (v ? 7 : 4), y + (v ? 9 : 6), 1, 1);
    }

    function isPathTile(col: number, row: number) {
      return tileChar(col, row) === '=';
    }

    function drawPath(x: number, y: number, col: number, row: number) {
      ctx!.fillStyle = C0; // bright packed-dirt road
      ctx!.fillRect(x, y, TILE, TILE);
      // Frame the edges that don't connect to another path tile so straights,
      // corners and the central junction all read correctly.
      ctx!.fillStyle = C2;
      if (!isPathTile(col, row - 1)) ctx!.fillRect(x, y, TILE, 2);
      if (!isPathTile(col, row + 1)) ctx!.fillRect(x, y + 14, TILE, 2);
      if (!isPathTile(col - 1, row)) ctx!.fillRect(x, y, 2, TILE);
      if (!isPathTile(col + 1, row)) ctx!.fillRect(x + 14, y, 2, TILE);
      const pebbles = [
        [5, 6],
        [9, 9],
        [7, 5],
      ];
      for (const [dx, dy] of pebbles) ctx!.fillRect(x + dx, y + dy, 2, 1);
      ctx!.fillStyle = C1;
      ctx!.fillRect(x + 6, y + 8, 1, 1);
      ctx!.fillRect(x + 10, y + 11, 1, 1);
    }

    function drawTree(x: number, y: number) {
      drawGrass(x, y);
      ctx!.fillStyle = C3; // trunk
      ctx!.fillRect(x + 7, y + 10, 2, 4);
      ctx!.fillStyle = C3; // canopy outline
      ctx!.fillRect(x + 3, y + 2, 10, 9);
      ctx!.fillStyle = C2; // canopy body
      ctx!.fillRect(x + 4, y + 3, 8, 7);
      ctx!.fillStyle = C1; // leaf highlights
      const leaves = [
        [5, 4],
        [8, 5],
        [6, 7],
        [10, 6],
      ];
      for (const [dx, dy] of leaves) ctx!.fillRect(x + dx, y + dy, 1, 1);
    }

    // A small house — used for "work" landmarks. Sits on grass.
    function drawBuilding(x: number, y: number) {
      drawGrass(x, y);
      ctx!.fillStyle = C3; // wall outline
      ctx!.fillRect(x + 2, y + 5, 12, 10);
      ctx!.fillStyle = C1; // wall
      ctx!.fillRect(x + 3, y + 6, 10, 8);
      ctx!.fillStyle = C3; // roof eave
      ctx!.fillRect(x + 1, y + 4, 14, 2);
      ctx!.fillStyle = C2; // roof ridge
      ctx!.fillRect(x + 3, y + 2, 10, 2);
      ctx!.fillStyle = C3; // door
      ctx!.fillRect(x + 7, y + 10, 3, 5);
      ctx!.fillStyle = C2; // windows
      ctx!.fillRect(x + 4, y + 8, 2, 2);
      ctx!.fillRect(x + 10, y + 8, 2, 2);
    }

    // A signpost — used for "project" landmarks. Sits on grass.
    function drawSign(x: number, y: number) {
      drawGrass(x, y);
      ctx!.fillStyle = C3; // post
      ctx!.fillRect(x + 7, y + 9, 2, 6);
      ctx!.fillStyle = C3; // board border
      ctx!.fillRect(x + 2, y + 2, 12, 7);
      ctx!.fillStyle = C0; // board face
      ctx!.fillRect(x + 3, y + 3, 10, 5);
      ctx!.fillStyle = C2; // "writing"
      ctx!.fillRect(x + 4, y + 4, 8, 1);
      ctx!.fillRect(x + 4, y + 6, 5, 1);
    }

    function drawChar(px: number, py: number, dir: Facing, frame: number) {
      const x = Math.round(px);
      const y = Math.round(py);

      // cap
      ctx!.fillStyle = C2;
      ctx!.fillRect(x + 5, y + 2, 6, 3);
      ctx!.fillStyle = C3;
      ctx!.fillRect(x + 4, y + 4, 8, 1);

      // head
      if (dir === 'up') {
        ctx!.fillStyle = C3; // back of the head, no face
        ctx!.fillRect(x + 5, y + 5, 6, 3);
      } else {
        ctx!.fillStyle = C0; // face
        ctx!.fillRect(x + 5, y + 5, 6, 3);
        ctx!.fillStyle = C3;
        if (dir === 'left') {
          ctx!.fillRect(x + 6, y + 6, 1, 1);
          ctx!.fillRect(x + 4, y + 7, 1, 1); // nose
        } else if (dir === 'right') {
          ctx!.fillRect(x + 9, y + 6, 1, 1);
          ctx!.fillRect(x + 11, y + 7, 1, 1); // nose
        } else {
          ctx!.fillRect(x + 6, y + 6, 1, 1);
          ctx!.fillRect(x + 9, y + 6, 1, 1);
        }
      }

      // tunic + hands
      ctx!.fillStyle = C3;
      ctx!.fillRect(x + 4, y + 8, 8, 4);
      ctx!.fillStyle = C2;
      ctx!.fillRect(x + 5, y + 8, 6, 3);
      ctx!.fillStyle = C0;
      ctx!.fillRect(x + 3, y + 9, 1, 2);
      ctx!.fillRect(x + 12, y + 9, 1, 2);

      // legs (simple two-frame walk)
      ctx!.fillStyle = C3;
      if (frame === 0) {
        ctx!.fillRect(x + 5, y + 12, 2, 3);
        ctx!.fillRect(x + 9, y + 12, 2, 3);
      } else {
        ctx!.fillRect(x + 5, y + 12, 2, 3);
        ctx!.fillRect(x + 9, y + 12, 2, 2);
        ctx!.fillRect(x + 9, y + 13, 3, 1);
      }
    }

    // Blinking "!" bubble floating above a landmark the hero is facing.
    function drawPrompt(col: number, row: number, t: number) {
      if (Math.floor(t * 2) % 2 !== 0) return;
      const x = col * TILE + 4;
      const y = row * TILE - 12;
      ctx!.fillStyle = C3;
      ctx!.fillRect(x - 1, y - 1, 10, 12);
      ctx!.fillStyle = C0;
      ctx!.fillRect(x, y, 8, 10);
      ctx!.fillStyle = C3;
      ctx!.fillRect(x + 3, y + 1, 2, 5);
      ctx!.fillRect(x + 3, y + 7, 2, 2);
    }

    function drawMenu(t: number) {
      const lineH = 16;
      const padX = 18; // leaves room for the cursor arrow
      const padY = 9;
      const boxW = 104;
      const boxH = padY * 2 + MENU_ITEMS.length * lineH;
      const boxX = Math.floor((CANVAS_W - boxW) / 2);
      const boxY = 28;

      // double frame: dark outer border, light panel, thin dark inner line
      ctx!.fillStyle = C3;
      ctx!.fillRect(boxX - 3, boxY - 3, boxW + 6, boxH + 6);
      ctx!.fillStyle = C0;
      ctx!.fillRect(boxX, boxY, boxW, boxH);
      ctx!.strokeStyle = C3;
      ctx!.lineWidth = 1;
      ctx!.strokeRect(boxX + 1.5, boxY + 1.5, boxW - 3, boxH - 3);

      ctx!.font = '10px "Courier New", monospace';
      ctx!.textBaseline = 'middle';
      // Blink the cursor on a ~0.5s cycle so it reads as "active".
      const cursorVisible = Math.floor(t * 2) % 2 === 0;

      for (let i = 0; i < MENU_ITEMS.length; i++) {
        const ty = boxY + padY + i * lineH + lineH / 2;
        ctx!.fillStyle = C3;
        ctx!.fillText(MENU_ITEMS[i], boxX + padX, ty);
        if (i === menuIndex && cursorVisible) {
          const cx = boxX + 8;
          ctx!.beginPath();
          ctx!.moveTo(cx, ty - 4);
          ctx!.lineTo(cx + 5, ty);
          ctx!.lineTo(cx, ty + 4);
          ctx!.closePath();
          ctx!.fill();
        }
      }
    }

    function render(t: number) {
      for (let r = 0; r < MAP_H; r++) {
        for (let c = 0; c < MAP_W; c++) {
          const x = c * TILE;
          const y = r * TILE;
          switch (MAP[r][c]) {
            case '~':
              drawWater(x, y, t);
              break;
            case '.':
              drawSand(x, y);
              break;
            case '=':
              drawPath(x, y, c, r);
              break;
            case 'T':
              drawTree(x, y);
              break;
            default:
              drawGrass(x, y);
          }
        }
      }

      // landmarks (buildings for work, signs for projects)
      for (const lm of LANDMARK_SPRITES) {
        const x = lm.col * TILE;
        const y = lm.row * TILE;
        if (lm.kind === 'project') drawSign(x, y);
        else drawBuilding(x, y);
      }

      let px: number;
      let py: number;
      if (moving) {
        px = fromPX + (toPX - fromPX) * progress;
        py = fromPY + (toPY - fromPY) * progress;
      } else {
        px = tileX * TILE;
        py = tileY * TILE;
      }
      drawChar(px, py, facing, moving ? legPhase : 0);

      // "!" prompt when settled and facing a landmark
      if (!moving && !menuOpen) {
        const [dx, dy] = DELTA[facing];
        const fc = tileX + dx;
        const fr = tileY + dy;
        if (landmarkByKey.has(`${fc},${fr}`)) drawPrompt(fc, fr, t);
      }

      if (menuOpen) drawMenu(t);
    }

    function frameLoop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (moving) {
        progress += dt / STEP_TIME;
        if (progress >= 1) {
          progress = 0;
          moving = false;
          tileX = toTileX;
          tileY = toTileY;
        }
      }

      // Only accept new input once the character is settled on a tile, so
      // motion always starts and ends aligned to the grid.
      if (!moving && held.length > 0) {
        const dir = held[held.length - 1];
        facing = dir;
        const [dx, dy] = DELTA[dir];
        const ntx = tileX + dx;
        const nty = tileY + dy;
        if (!isBlockedTile(ntx, nty)) {
          fromPX = tileX * TILE;
          fromPY = tileY * TILE;
          toPX = ntx * TILE;
          toPY = nty * TILE;
          toTileX = ntx;
          toTileY = nty;
          progress = 0;
          moving = true;
          legPhase ^= 1;
        }
      }

      // Report region changes once the hero has settled on a tile.
      if (!moving) {
        const reg = regionAt(tileX, tileY);
        if (reg !== lastRegionId) {
          lastRegionId = reg;
          onEnterRegionRef.current?.(reg);
        }
      }

      render(now / 1000);
      raf = requestAnimationFrame(frameLoop);
    }

    const KEY_MAP: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
      W: 'up',
      S: 'down',
      A: 'left',
      D: 'right',
    };

    function onKeyDown(e: KeyboardEvent) {
      // Spacebar is the action button. Always swallow it so the page never
      // scrolls. In the menu it dismisses on "Close"; in the world it triggers
      // the landmark the hero is facing.
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (menuOpen) {
          if (MENU_ITEMS[menuIndex] === 'Close') menuOpen = false;
          return;
        }
        if (!moving) {
          const [dx, dy] = DELTA[facing];
          const lm = landmarkByKey.get(`${tileX + dx},${tileY + dy}`);
          if (lm) onInteractRef.current?.(lm.chapterId);
        }
        return;
      }

      // Escape always closes the menu, regardless of the cursor position.
      if (e.key === 'Escape') {
        if (menuOpen) {
          e.preventDefault();
          menuOpen = false;
        }
        return;
      }

      // Enter opens the menu (with the cursor reset to the first item).
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!menuOpen) {
          menuOpen = true;
          menuIndex = 0;
          held.length = 0; // drop any held direction so the hero stops walking
        }
        return;
      }

      const dir = KEY_MAP[e.key];
      if (!dir) return;
      e.preventDefault();

      // While the menu is open, up/down move the cursor (wrapping around);
      // left/right are ignored and the hero doesn't walk.
      if (menuOpen) {
        if (e.repeat) return;
        if (dir === 'down') menuIndex = (menuIndex + 1) % MENU_ITEMS.length;
        else if (dir === 'up') menuIndex = (menuIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        return;
      }

      if (e.repeat) return; // OS key-repeat is ignored; the loop handles stepping
      if (!held.includes(dir)) held.push(dir);
    }
    function onKeyUp(e: KeyboardEvent) {
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      const i = held.indexOf(dir);
      if (i !== -1) held.splice(i, 1);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(frameLoop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div className="rounded-lg bg-[#2b2b2b] p-3 shadow-2xl ring-1 ring-black/40">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="block"
        style={{
          imageRendering: 'pixelated',
          width: 'min(90vw, 720px)',
          height: 'auto',
        }}
      />
    </div>
  );
}
