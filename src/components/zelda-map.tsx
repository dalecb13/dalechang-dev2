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
    const keys = new Set<string>();
    let posX = 8 * TILE; // top-left of the character's 16x16 cell
    let posY = 7 * TILE;
    let facing: Facing = 'down';
    let moveTime = 0; // accumulates while walking, drives the step animation
    let last = performance.now();
    let raf = 0;

    const SPEED = 64; // pixels per second
    const DIAG = Math.SQRT1_2;

    // The character's feet are the only thing that collides with the world.
    function collides(x: number, y: number) {
      const hx = x + 3;
      const hy = y + 10;
      const hw = 10;
      const hh = 5;
      const corners = [
        [hx, hy],
        [hx + hw - 1, hy],
        [hx, hy + hh - 1],
        [hx + hw - 1, hy + hh - 1],
      ];
      for (const [cx, cy] of corners) {
        if (isBlockedChar(tileChar(Math.floor(cx / TILE), Math.floor(cy / TILE)))) {
          return true;
        }
      }
      return false;
    }

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

      const walking =
        keys.has('up') || keys.has('down') || keys.has('left') || keys.has('right');
      const frame = walking ? Math.floor(moveTime / 0.15) % 2 : 0;
      drawChar(posX, posY, facing, frame);
    }

    function frameLoop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      let dx = 0;
      let dy = 0;
      if (keys.has('left')) dx -= 1;
      if (keys.has('right')) dx += 1;
      if (keys.has('up')) dy -= 1;
      if (keys.has('down')) dy += 1;

      if (dx !== 0 || dy !== 0) {
        moveTime += dt;
        if (dx !== 0 && dy !== 0) {
          dx *= DIAG;
          dy *= DIAG;
        }
        // face the dominant axis of travel
        if (Math.abs(dx) > Math.abs(dy)) {
          facing = dx < 0 ? 'left' : 'right';
        } else {
          facing = dy < 0 ? 'up' : 'down';
        }

        const step = SPEED * dt;
        const nx = posX + dx * step;
        if (!collides(nx, posY)) posX = nx;
        const ny = posY + dy * step;
        if (!collides(posX, ny)) posY = ny;

        posX = Math.max(0, Math.min(CANVAS_W - TILE, posX));
        posY = Math.max(0, Math.min(CANVAS_H - TILE, posY));
      } else {
        moveTime = 0;
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
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      e.preventDefault();
      keys.add(dir);
    }
    function onKeyUp(e: KeyboardEvent) {
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      keys.delete(dir);
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
