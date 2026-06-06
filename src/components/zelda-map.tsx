'use client';

import { useEffect, useRef } from 'react';

/**
 * GameBoy-era Legend of Zelda inspired island.
 *
 * Iteration 1: a single-screen tile map (water-bound island with a horizontal
 * dirt path, grass, trees and a sand beach) and a character you can walk around
 * with WASD / arrow keys. Everything is rendered to a small pixel-art canvas
 * that the browser scales up crisply, using the classic 4-shade DMG green palette.
 */

// Classic Game Boy (DMG) 4-shade green palette, light -> dark.
const C0 = '#9bbc0f'; // lightest
const C1 = '#8bac0f'; // light
const C2 = '#306230'; // dark
const C3 = '#0f380f'; // darkest

const TILE = 16;

// Pause-menu options, top to bottom. Only "Close" reacts to the action button.
const MENU_ITEMS = ['Inventory', '2024', 'Close'];

// Tile legend:
//   ~ water   . sand   , grass   = path   T tree (sits on grass)
const MAP = [
  '~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~',
  '~~..............~~',
  '~~.,,,,,,,,,,,,.~~',
  '~~.,,T,,,,,,T,,.~~',
  '~~.,,,,,,,,,,,,.~~',
  '~~.,,,,,T,,,,,,.~~',
  '~~==============~~',
  '~~.,,,,,,,,T,,,.~~',
  '~~.,,T,,,,,,,,,.~~',
  '~~.,,,,,,,,,,,,.~~',
  '~~.,,,,T,,,T,,,.~~',
  '~~..............~~',
  '~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~',
];

const MAP_W = MAP[0].length;
const MAP_H = MAP.length;
const CANVAS_W = MAP_W * TILE;
const CANVAS_H = MAP_H * TILE;

type Facing = 'up' | 'down' | 'left' | 'right';

function isBlockedChar(ch: string) {
  return ch === '~' || ch === 'T';
}

function tileChar(col: number, row: number) {
  if (col < 0 || row < 0 || col >= MAP_W || row >= MAP_H) return '~';
  return MAP[row][col];
}

export default function ZeldaMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    let tileX = 8;
    let tileY = 7;
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

    function drawPath(x: number, y: number) {
      ctx!.fillStyle = C0; // bright packed-dirt road
      ctx!.fillRect(x, y, TILE, TILE);
      ctx!.fillStyle = C2; // framed top & bottom edges form the road shape
      ctx!.fillRect(x, y, TILE, 2);
      ctx!.fillRect(x, y + 14, TILE, 2);
      const pebbles = [
        [3, 6],
        [9, 9],
        [12, 5],
        [6, 11],
      ];
      for (const [dx, dy] of pebbles) ctx!.fillRect(x + dx, y + dy, 2, 1);
      ctx!.fillStyle = C1;
      ctx!.fillRect(x + 5, y + 7, 1, 1);
      ctx!.fillRect(x + 11, y + 10, 1, 1);
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
              drawPath(x, y);
              break;
            case 'T':
              drawTree(x, y);
              break;
            default:
              drawGrass(x, y);
          }
        }
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
        if (!isBlockedChar(tileChar(ntx, nty))) {
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
      // scrolls; on the "Close" row it dismisses the menu, otherwise no-op.
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (menuOpen && MENU_ITEMS[menuIndex] === 'Close') menuOpen = false;
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
