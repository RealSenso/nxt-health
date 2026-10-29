import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useInView, useMotionValueEvent, useScroll, useSpring, animate } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  FileText,
  Layers,
  Users,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { store } from '../services/store';
import { PublicLayout } from './public/PublicLayout';
import { InquiryForm, LeadRole } from './public/InquiryForm';
import { BlogCard } from './public/BlogPages';
import type { Startup } from '../types';
import { OneInFive, Rise, useBeat } from './public/HomeSections';
import { Btn, RuleList } from './public/ui';
import { WORLD_OUTLINE } from '../data/worldOutline';

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* =========================================================================
   HERO BACKGROUND: A SNOWFALL THAT BECOMES THE CLIMB
   Tens of thousands of particles, all moved on the GPU. They fall as snow,
   settle into a mountain, and a trail of light winds up it through five
   waypoints to the summit while a climber of light works its way up. Then the
   mountain lets go and it snows again. The pointer tilts the scene and pushes
   the particles aside. Colours follow the theme, light or dark.
   ========================================================================= */
const GL_VERT = `
attribute vec4 a_seed;
attribute vec4 a_mount;
uniform float u_t, u_m, u_aspect, u_dpr, u_shift, u_scale, u_boost;
uniform vec2 u_cam, u_mouse;
uniform vec3 u_green, u_ink;
varying vec4 v_col;

void main() {
  float t = u_t;
  float h1 = fract(a_seed.x * 7.13), h2 = fract(a_seed.y * 5.71), h3 = fract(a_seed.z * 3.97);
  vec3 snow = vec3((h1 - 0.5) * 18.0 + sin(t * 0.5 + h2 * 20.0) * 0.4,
                   5.0 - mod(h2 * 10.0 + t * (0.35 + a_seed.z * 0.6), 10.0),
                   (h3 - 0.5) * 9.0);

  /* the mountain turns slowly */
  float ang = t * 0.1;
  vec3 mt = vec3(a_mount.x * cos(ang) + a_mount.z * sin(ang), a_mount.y - 1.7, -a_mount.x * sin(ang) + a_mount.z * cos(ang));

  float e = u_m * u_m * (3.0 - 2.0 * u_m);
  float w = 4.0 * u_m * (1.0 - u_m);
  vec3 swirl = vec3(sin(a_seed.y * 40.0 + t), cos(a_seed.z * 40.0 + t * 1.3), sin(a_seed.x * 40.0 - t)) * w * 1.6;
  vec3 p = (mix(snow, mt, e) + swirl) * u_scale;

  float cy2 = cos(u_cam.x), sy = sin(u_cam.x), cp = cos(u_cam.y), sp = sin(u_cam.y);
  p = vec3(p.x * cy2 + p.z * sy, p.y, -p.x * sy + p.z * cy2);
  p = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);
  p.z -= 9.0;

  float f = 1.0 / tan(0.4);
  vec2 s = vec2(p.x * f / u_aspect, p.y * f) / (-p.z) + vec2(u_shift, 0.0);
  vec2 d = (s - u_mouse) * vec2(u_aspect, 1.0);
  float dist = length(d);
  s += (d / (dist + 0.001)) * exp(-dist * 4.0) * 0.14 * vec2(1.0 / u_aspect, 1.0);
  gl_Position = vec4(s, 0.0, 1.0);

  float kind = a_mount.w;                      /* -1 terrain, 0..1 trail, 10+ waypoint, 20 summit flag */
  bool trail = kind >= 0.0 && kind <= 1.0;
  bool mark = kind >= 10.0;
  float climber = trail ? exp(-pow(kind - fract(t * 0.06), 2.0) / 0.0006) : 0.0;

  float depth = clamp(1.0 - (-p.z - 6.0) / 8.0, 0.35, 1.0);
  float size = (1.0 + a_seed.z * 1.5) * (trail ? 1.15 : 1.0) * (mark ? 1.7 : 1.0) * (1.0 + 3.2 * climber);
  gl_PointSize = size * u_dpr * (15.0 / (-p.z)) * (1.0 + 0.3 * e);
  vec3 formCol = (trail || mark) ? u_green : u_ink;
  float formA = trail ? 0.95 : mark ? 1.0 : 0.9;
  float tw = 0.8 + 0.2 * sin(t * 2.0 + a_seed.x * 60.0);
  float pulse = mark ? 0.7 + 0.3 * sin(t * 2.4 + kind) : 1.0;
  v_col = vec4(mix(u_ink, formCol, e), (mix(0.5, formA, e) * tw * pulse + climber) * depth * u_boost);
}
`;
const GL_FRAG = `
precision mediump float;
varying vec4 v_col;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  float k = v_col.a * a * a;
  gl_FragColor = vec4(v_col.rgb * k, k);
}
`;

/** Height of the mountain at (x, z): a main peak with two shoulders and some ridging, falling to flat at the edge. */
const peak = (x: number, z: number) => {
  const r2 = x * x + z * z;
  const h = 4.8 * Math.exp(-r2 / 1.9) + 2.3 * Math.exp(-((x - 2.4) ** 2 + (z + 0.9) ** 2) / 1.5) + 1.9 * Math.exp(-((x + 2.5) ** 2 + (z - 0.7) ** 2) / 1.3)
    + 0.22 * Math.abs(Math.sin(x * 2.3 + z * 1.4)) * Math.exp(-r2 / 14);
  return h * Math.max(0, 1 - Math.pow(Math.sqrt(r2) / 5.2, 3));
};
/** Where the particles go when it settles: the terrain, a switchback trail to the summit, five waypoints and a flag. */
const sampleMountain = (count: number): Float32Array => {
  const out = new Float32Array(count * 4);
  const onTrail = (u: number): [number, number, number] => {
    const th = 0.6 + u * Math.PI * 4.4, r = 2.7 * Math.pow(1 - u, 0.9) + 0.08;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    return [x, peak(x, z) + 0.07, z];
  };
  for (let i = 0; i < count; i++) {
    const k = Math.random();
    let x: number, y: number, z: number, kind: number;
    if (k < 0.66) {
      x = 0; z = 0; y = 0;
      for (let tries = 0; tries < 8 && y < 0.06; tries++) { x = (Math.random() * 2 - 1) * 5.2; z = (Math.random() * 2 - 1) * 5.2; y = peak(x, z); }
      y += (Math.random() - 0.5) * 0.04; kind = -1;
    } else if (k < 0.9) {
      kind = Math.random();
      const p = onTrail(kind);
      x = p[0] + (Math.random() - 0.5) * 0.05; y = p[1] + (Math.random() - 0.5) * 0.04; z = p[2] + (Math.random() - 0.5) * 0.05;
    } else if (k < 0.98) {
      const n = (Math.random() * 5) | 0;
      const p = onTrail((n + 1) / 5.4);
      const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1), rr = 0.16 * Math.cbrt(Math.random());
      x = p[0] + rr * Math.sin(b) * Math.cos(a); y = p[1] + 0.08 + rr * Math.cos(b); z = p[2] + rr * Math.sin(b) * Math.sin(a);
      kind = 10 + n;
    } else {
      const top = peak(0, 0);
      x = (Math.random() - 0.5) * 0.03; z = (Math.random() - 0.5) * 0.03; y = top + Math.random() * 1.1; kind = 20;
    }
    out[i * 4] = x; out[i * 4 + 1] = y; out[i * 4 + 2] = z; out[i * 4 + 3] = kind;
  }
  return out;
};

/** 0 to 1 and back: eases in over `rise`, holds, eases out over `fall`, all in seconds from `start`. */
const pulse = (t: number, start: number, rise: number, hold: number, fall: number) => {
  if (t < start || t > start + rise + hold + fall) return 0;
  if (t < start + rise) return (t - start) / rise;
  if (t < start + rise + hold) return 1;
  return 1 - (t - start - rise - hold) / fall;
};

const HeroPathway: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const gl = c?.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!c || !gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn('hero shader:', gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, GL_VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, GL_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const COUNT = window.innerWidth > 900 ? 48000 : 22000;
    const seeds = new Float32Array(COUNT * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    const attr = (name: string, data: Float32Array, size: number) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    attr('a_seed', seeds, 4);
    attr('a_mount', sampleMountain(COUNT), 4);
    gl.enable(gl.BLEND);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uT = U('u_t'), uM = U('u_m'), uAspect = U('u_aspect'), uDpr = U('u_dpr'), uShift = U('u_shift'), uScale = U('u_scale'), uBoost = U('u_boost');
    const uCam = U('u_cam'), uMouse = U('u_mouse'), uGreen = U('u_green'), uInk = U('u_ink');

    /* any CSS colour to 0..1 rgb, via a one-pixel canvas */
    const px = document.createElement('canvas');
    px.width = px.height = 1;
    const pctx = px.getContext('2d', { willReadFrequently: true })!;
    const rgb = (css: string, fallback: string): [number, number, number] => {
      pctx.clearRect(0, 0, 1, 1);
      pctx.fillStyle = fallback;
      pctx.fillStyle = css || fallback;
      pctx.fillRect(0, 0, 1, 1);
      const d = pctx.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };

    let W = 0, H = 0, raf = 0, visible = true, last = performance.now(), t = 0, frame = 0;
    let mx = 0, my = 0, cx = 0, cy = 0, mouseX = 9, mouseY = 9;
    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 1.5);
      W = c.clientWidth; H = c.clientHeight;
      c.width = Math.round(W * d); c.height = Math.round(H * d);
      gl.viewport(0, 0, c.width, c.height);
      gl.uniform1f(uDpr, d);
      gl.uniform1f(uAspect, W / H);
      gl.uniform1f(uShift, W > 900 ? 0.28 : 0.0);
      gl.uniform1f(uScale, W > 900 ? 1.1 : Math.max(0.4, Math.min(0.7, (W / H) * 0.65)));
    };

    const draw = () => {
      const now = performance.now();
      t += Math.min(0.05, (now - last) / 1000);
      last = now;
      if (frame++ % 30 === 0) {
        const g = rgb(cssVar('--nxt-green'), '#0B8A44'), k = rgb(cssVar('--nxt-ink'), '#111111');
        gl.uniform3fv(uGreen, g); gl.uniform3fv(uInk, k);
        const dark = (k[0] + k[1] + k[2]) / 3 > 0.5;
        /* light on dark glows (additive); dark on light needs ordinary blending */
        gl.blendFunc(gl.ONE, dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
        gl.uniform1f(uBoost, dark ? 1 : 2.2);
      }
      cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05;
      /* a 28 second loop: a little snow, the mountain settles and is climbed, then it lets go */
      const cyc = (t + 1.5) % 28;
      gl.uniform1f(uT, t);
      gl.uniform1f(uM, pulse(cyc, 1, 3, 19, 3));
      gl.uniform2f(uCam, cx * 0.35 + Math.sin(t * 0.12) * 0.08, 0.42 + cy * 0.14);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, COUNT);
    };
    const loop = () => {
      if (!visible) return;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      mouseX = mx; mouseY = -my;
    };
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) { last = performance.now(); loop(); }
    });

    resize();
    io.observe(c);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    loop();
    return () => {
      visible = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full pointer-events-none" />;
};

/* =========================================================================
   GLOBE: DRAGGABLE WIREFRAME GLOBE OF CLINICAL HUBS (kept from the previous homepage)
   ========================================================================= */
const Interactive3DGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let W = 0, H = 0, CX = 0, CY = 0, R = 0;
    let rotX = 0.25, rotY = -1.3; /* India faces the viewer first */
    let dragging = false;
    let lastX = 0, lastY = 0;
    let velX = 0;
    let frame = 0;
    let visible = false;
    let green = '#0B8A44', ink = '#111111';

    const hubs = [
      { lat: 18.9, lon: 72.8, label: 'Mumbai Hub' },
      { lat: 28.6, lon: 77.2, label: 'Delhi AIIMS' },
      { lat: 12.9, lon: 77.6, label: 'Bengaluru Tech' },
      { lat: 17.3, lon: 78.4, label: 'Hyderabad Pharma' },
      { lat: 42.3, lon: -71.0, label: 'Boston Med' },
      { lat: 51.5, lon: -0.1, label: 'London NHS' },
      { lat: 1.3, lon: 103.8, label: 'Singapore' },
      { lat: 37.7, lon: -122.4, label: 'San Francisco' },
    ];

    const ARCS: [number, number][] = [[0, 4], [1, 5], [2, 6], [3, 7], [4, 5], [6, 1]];
    let arcT = 0;

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = Math.round(W * d);
      c.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      /* a big globe on the right of wide screens, centred behind the copy on narrow ones */
      CX = W > 900 ? W * 0.68 : W * 0.5;
      CY = H / 2;
      R = Math.min(H * 0.38, W * (W > 900 ? 0.26 : 0.4));
    };

    const latLonTo3D = (lat: number, lon: number): [number, number, number] => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = (lon * Math.PI) / 180;
      return [R * Math.sin(phi) * Math.sin(theta), R * Math.cos(phi), R * Math.sin(phi) * Math.cos(theta)];
    };

    const rotate = ([x, y, z]: [number, number, number]): [number, number, number] => {
      const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
      return [x * Math.cos(rotY) + z2 * Math.sin(rotY), y2, -x * Math.sin(rotY) + z2 * Math.cos(rotY)];
    };

    /* country borders: unit vectors computed once, rotated and scaled each frame */
    const outline = WORLD_OUTLINE.map(flat => {
      const pts: [number, number, number][] = [];
      for (let i = 0; i < flat.length; i += 2) {
        const phi = ((90 - flat[i + 1]) * Math.PI) / 180;
        const theta = (flat[i] * Math.PI) / 180;
        pts.push([Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta)]);
      }
      return pts;
    });
    const traceBorder = (pts: [number, number, number][]) => {
      ctx.beginPath();
      let first = true;
      for (const u of pts) {
        const r = rotate([u[0] * R, u[1] * R, u[2] * R]);
        if (r[2] > -R * 0.02) {
          const x = CX + r[0], y = CY - r[1];
          if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        } else first = true;
      }
      ctx.stroke();
    };

    const draw = () => {
      if (frame++ % 30 === 0) {
        green = cssVar('--nxt-green') || green;
        ink = cssVar('--nxt-ink') || ink;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = green;
      ctx.lineWidth = 0.9;
      ctx.globalAlpha = 0.7;
      outline.forEach(traceBorder);

      /* routes between hubs: an arc lifted off the surface with a pulse running along it */
      arcT += 0.006;
      ARCS.forEach(([a, b], k) => {
        const A = hubs[a], B = hubs[b];
        const pa = latLonTo3D(A.lat, A.lon).map(v => v / R), pb = latLonTo3D(B.lat, B.lon).map(v => v / R);
        const dot = Math.max(-1, Math.min(1, pa[0] * pb[0] + pa[1] * pb[1] + pa[2] * pb[2]));
        const om = Math.acos(dot) || 1e-3, so = Math.sin(om);
        const point = (u: number): [number, number, number] => {
          const w1 = Math.sin((1 - u) * om) / so, w2 = Math.sin(u * om) / so;
          const lift = R * (1 + 0.28 * Math.sin(Math.PI * u) * Math.min(1, om / 1.2));
          return rotate([(pa[0] * w1 + pb[0] * w2) * lift, (pa[1] * w1 + pb[1] * w2) * lift, (pa[2] * w1 + pb[2] * w2) * lift]);
        };
        ctx.strokeStyle = green;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.32;
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= 40; i++) {
          const q = point(i / 40);
          if (q[2] > -R * 0.05) { const x = CX + q[0], y = CY - q[1]; if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; } } else pen = false;
        }
        ctx.stroke();
        const u = (arcT * 0.9 + k * 0.23) % 1;
        const q = point(u);
        if (q[2] > -R * 0.05) {
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = green;
          ctx.beginPath(); ctx.arc(CX + q[0], CY - q[1], 2.6, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 0.25;
          ctx.beginPath(); ctx.arc(CX + q[0], CY - q[1], 7, 0, 6.2832); ctx.fill();
        }
      });
      hubs.forEach(hub => {
        const r = rotate(latLonTo3D(hub.lat, hub.lon));
        if (r[2] <= -R * 0.05) return;
        const x = CX + r[0], y = CY - r[1];
        const depth = (r[2] + R) / (2 * R);
        const dotR = 2.5 + depth * 2.5, alpha = 0.35 + depth * 0.65;
        ctx.fillStyle = green;
        ctx.globalAlpha = alpha * 0.28;
        ctx.beginPath(); ctx.arc(x, y, dotR * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ink;
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(x, y, dotR, 0, Math.PI * 2); ctx.fill();
        ctx.font = `${11 + depth * 3}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        ctx.fillText(hub.label, x + dotR + 6, y + 3);
      });
      ctx.restore();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = green;
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;

      if (!dragging) { rotY -= 0.003; velX *= 0.95; }
      rotY += velX;
    };

    const loop = () => {
      if (!visible) return;
      draw();
      animId = requestAnimationFrame(loop);
    };

    const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; velX = 0; };
    const onUp = () => { dragging = false; };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      velX = (e.clientX - lastX) * 0.005;
      rotY += velX;
      rotX = Math.max(-1.2, Math.min(1.2, rotX + (e.clientY - lastY) * 0.003));
      lastX = e.clientX; lastY = e.clientY;
    };
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) loop();
    });

    resize();
    draw();
    io.observe(c);
    c.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('resize', resize);
    return () => {
      visible = false;
      cancelAnimationFrame(animId);
      io.disconnect();
      c.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 select-none">
      <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing touch-pan-y" aria-label="Interactive wireframe globe of clinical hubs. Drag to rotate." />
    </div>
  );
};

/* =========================================================================
   TILT CARD: leans toward the pointer in 3D and lights up under it
   ========================================================================= */
const TiltCard: React.FC<{ children: React.ReactNode; className?: string; max?: number }> = ({ children, className = '', max = 6 }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transition = 'transform 80ms linear';
    el.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div style={{ perspective: 1400 }}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`group relative overflow-hidden rounded-[22px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 sm:p-9 ${className}`}
        style={{ transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))', transformStyle: 'preserve-3d', transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(360px circle at var(--mx, 50%) var(--my, 0%), var(--nxt-green-soft), transparent 65%)' }}
        />
        <div className="relative" style={{ transform: 'translateZ(24px)' }}>{children}</div>
      </div>
    </div>
  );
};

/** A number that counts up to its value the first time it scrolls into view. */
const CountUp: React.FC<{ to: number; suffix?: string; className?: string }> = ({ to, suffix = '', className }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: v => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return <p ref={ref} className={className}>{n}{suffix}</p>;
};

/** A thin route down the right edge of wide screens: it lights up as the page is read, with a glowing head. */
const ScrollRoute: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const [pct, setPct] = useState(0);
  useMotionValueEvent(grow, 'change', v => setPct(v));
  return (
    <div aria-hidden="true" className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 h-[46vh] w-px bg-[var(--nxt-line)] z-30 pointer-events-none">
      <motion.div className="absolute inset-x-0 top-0 bg-[var(--nxt-green)]" style={{ height: `${pct * 100}%` }} />
      <span className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--nxt-green)] shadow-[0_0_14px_3px_var(--nxt-green)]" style={{ top: `calc(${pct * 100}% - 4px)` }} />
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <span key={f} className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border transition-colors duration-300 ${pct >= f - 0.01 ? 'border-[var(--nxt-green)] bg-[var(--nxt-green)]' : 'border-[var(--nxt-line)] bg-[var(--nxt-bg)]'}`} style={{ top: `calc(${f * 100}% - 3px)` }} />
      ))}
    </div>
  );
};

/* =========================================================================
   SECTION LABEL
   ========================================================================= */
const Kicker: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`inline-flex items-center gap-3 text-[12px] sm:text-[13px] uppercase tracking-[0.16em] text-[var(--nxt-ink-soft)] ${className}`}>
    <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-px w-6 bg-[var(--nxt-green)] origin-left" />
    {children}
  </p>
);

/** Section headline: light, to match the hero. */
const H2: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`font-display font-light text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.12] tracking-[-0.03em] ${className}`}>{children}</h2>
);

/** The one italic in a headline: the phrase that carries the point, in green. */
const Accent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <em className="italic font-normal text-[var(--nxt-green)]">{children}</em>
);

const GateStack: React.FC = () => {
  const tick = useBeat();
  const sectionRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const seen = useInView(sectionRef, { amount: 0.25 });
  const seenRef = useRef(false);
  seenRef.current = seen;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (tick > 0 && seenRef.current) setActive(a => (a + 1) % STEPS.length);
  }, [tick]);

  useEffect(() => {
    let raf = 0, t = 0;
    const spin = () => {
      t += 0.009;
      const el = stackRef.current;
      if (el && seenRef.current) {
        el.style.setProperty('--sz', `${-38 + Math.sin(t) * 12}deg`);
        el.style.setProperty('--sx', `${52 + Math.cos(t * 0.8) * 3}deg`);
      }
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={sectionRef} className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
      <div className="relative grid place-items-center h-[clamp(600px,66vw,760px)] pt-[clamp(170px,18vw,240px)]" style={{ perspective: 1800 }} aria-hidden="true">
        <div
          ref={stackRef}
          className="relative w-[min(340px,68%)] aspect-square"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(var(--sx, 52deg)) rotateZ(var(--sz, -38deg))' }}
        >
          {STEPS.map((s, k) => {
            const on = k === active;
            return (
              <div
                key={s.num}
                className="absolute inset-0 rounded-[18px] border px-5 pt-4 pb-3 flex items-end justify-between gap-3 text-[15px] font-normal uppercase tracking-[0.1em]"
                style={{
                  transform: `translateZ(${k * 74 + (k > active ? 80 : 0)}px)`,
                  transitionProperty: 'transform, background-color, border-color, box-shadow, color',
                  transitionDuration: '1100ms, 600ms, 600ms, 800ms, 600ms',
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: `${Math.abs(k - active) * 45}ms`,
                  backgroundColor: on ? 'var(--nxt-green)' : 'color-mix(in srgb, var(--nxt-surface) 92%, transparent)',
                  borderColor: on ? 'var(--nxt-green)' : k < active ? 'color-mix(in srgb, var(--nxt-green) 40%, var(--nxt-line))' : 'var(--nxt-line)',
                  color: on ? 'var(--nxt-green-ink)' : 'var(--nxt-ink-soft)',
                  boxShadow: on ? '0 0 80px -10px var(--nxt-green)' : 'none',
                }}
              >
                <span className={on ? '' : 'text-[var(--nxt-ink)]'}>{s.title}</span>
                <span className={`text-[22px] tracking-[-0.03em] font-normal ${on ? '' : 'text-[var(--nxt-ink-soft)]'}`}>{s.num}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ol className="flex flex-col">
        {STEPS.map((s, k) => {
          const on = k === active;
          return (
            <li key={s.num} className={`grid grid-cols-[44px_minmax(0,1fr)] gap-x-4 py-5 border-t border-[var(--nxt-line)] last:border-b transition-colors duration-300 ${on ? '' : 'text-[var(--nxt-ink-soft)]'}`}>
              <span className={`row-span-2 pt-1.5 text-sm tracking-[0.08em] transition-colors ${on ? 'text-[var(--nxt-green)]' : ''}`}>{s.num}</span>
              <h3 className="font-display font-normal text-[1.35rem] tracking-[-0.02em] text-[var(--nxt-ink)]">{s.title}</h3>
              <div className={`col-start-2 grid transition-[grid-template-rows] duration-500 ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="pt-2.5 text-base">{s.body}</p>
                  <dl className="mt-4 pt-3.5 border-t border-dashed border-[var(--nxt-line)] grid gap-2 text-sm">
                    <div>
                      <dt className="text-[11.5px] uppercase tracking-[0.12em]">Deliverable</dt>
                      <dd className="text-[var(--nxt-ink)]">{s.deliverable}</dd>
                    </div>
                    <div>
                      <dt className="text-[11.5px] uppercase tracking-[0.12em]">Gatekeeper</dt>
                      <dd className="text-[var(--nxt-ink)]">{s.gatekeeper}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const AUDIENCES = [
  {
    id: 'who-founders',
    n: '01',
    role: 'Prospective Founders & Builders',
    title: 'Stop guessing market fit. Build with guaranteed demand.',
    intro: 'You bring the execution and technical vision. We give you validated, funded clinical problems and the exact execution pathway to bring them to market.',
    points: [
      'Tailored Roadmaps: A commercial pathway built specifically for your product type and target market.',
      'Stage-Matched Guidance: Connect with specialized experts at the exact moment your venture encounters a friction point.',
      'Unfiltered Platform Support: Get direct, private answers to critical strategic, operational, and structural questions.',
    ],
    cta: 'Join Free & Explore',
    to: '/signup',
  },
  {
    id: 'who-pharma',
    n: '02',
    role: 'Pharma Companies & Enterprise Innovators',
    title: 'Fund a solved challenge, not an unvalidated pitch.',
    intro: 'Define the high-value clinical problem. We deploy screened, execution-focused founder teams who deliver evidence at every stage-gate.',
    points: [
      'Low-Risk Pilot Capital: Initiate engagement with targeted innovation grants.',
      'Full Stage-Gate Transparency: Track team progress, evidence submissions, and milestone completion in real time.',
      'De-Risked Dealflow: Build a scalable solution pipeline with built-in co-investment options.',
    ],
    cta: 'Seed a Challenge',
    to: '/?as=pharma#start',
  },
  {
    id: 'who-hospitals',
    n: '03',
    role: 'Hospitals & Health Systems',
    title: 'Turn daily clinical friction into institutional revenue.',
    intro: 'List the real-world operational and clinical challenges your physicians face. Leverage existing research infrastructure to validate solutions and open new revenue channels.',
    points: [
      'Targeted Problem Solving: Dedicated teams building solutions specifically for your frontline needs.',
      'Asset Optimization: Run validation studies using existing research and clinical capacity.',
      'Direct Commercial Revenue: Create a recurring revenue line for your research wing and clinical departments.',
    ],
    cta: 'List a Problem',
    to: '/?as=hospital#start',
  },
  {
    id: 'who-experts',
    n: '04',
    role: 'Domain Experts & Advisors',
    title: 'Monetize your specialized industry experience.',
    intro: 'Founders encounter regulatory, clinical, and commercial roadblocks you’ve already solved. Connect with teams at the precise stage where your knowledge moves the needle.',
    points: [
      'Flexible Engagement: Set your custom hourly rate, from pro bono mentoring to high-value consulting.',
      'Precision Matching: Get routed to founders only when they reach the exact milestone you specialize in.',
      'Seamless Platform Delivery: Integrated booking, video conferencing, and direct communication built right in.',
    ],
    cta: 'Become an Expert',
    to: '/experts/join',
  },
  {
    id: 'who-incubators',
    n: '05',
    role: 'Incubators & Accelerators',
    title: 'De-risk your cohort by introducing the buyer on Day 1.',
    intro: 'Instead of helping founders search for market fit at graduation, give them access to problems that pharma and hospitals have already funded.',
    points: [
      'Built-In Market Demand: Provide your cohort with access to pre-funded clinical needs.',
      'Structured Progress Tracking: Utilize standardized roadmaps and evidence gates across your entire portfolio.',
      'Program Integration: Get recommended to founder teams at the exact development stage where your curriculum adds value.',
    ],
    cta: 'Partner as an Incubator',
    to: '/?as=incubator#start',
  },
  {
    id: 'who-us',
    n: '06',
    role: 'Global Companies Entering the US Market',
    title: 'Execute a proven GTM route, not a high-risk guess.',
    intro: 'Navigate US healthcare expansion with a structured, regulatory-compliant roadmap backed by vetted FDA and commercialization veterans.',
    points: [
      'US-Specific Roadmaps: Step-by-step guidance covering FDA pathways, reimbursement, and health system procurement.',
      'Vetted GTM Experts: Book advisors who have successfully cleared FDA hurdles and sold into US hospital networks.',
      'De-Risked Market Entry: Validate local demand and commercial viability before committing heavy launch capital.',
    ],
    cta: 'Plan US Expansion',
    to: '/?as=us#start',
  },
];

const PLATFORM_PILLARS = [
  {
    number: '01',
    title: 'Validated Problem Library',
    tag: 'Clinical Demand',
    icon: Stethoscope,
    text: 'Explore an active index of funded clinical challenges sourced directly from pharma partners and health systems, complete with requirements, scope, and target outcomes.',
  },
  {
    number: '02',
    title: 'Streamlined Funding Applications',
    tag: 'Dedicated Grants',
    icon: FileText,
    text: 'Submit your venture proposal for dedicated project capital. Benefit from structured screening protocols and direct, actionable feedback to refine resubmissions.',
  },
  {
    number: '03',
    title: 'Stage-Gate Roadmaps',
    tag: '26 Product Routes',
    icon: Layers,
    text: 'Execute against pre-mapped development blueprints tailored to your specific product type. Featuring explicit milestones, regulatory checkpoints, and fixed deadlines.',
  },
  {
    number: '04',
    title: 'Precision Expert Matching',
    tag: 'Verified Specialists',
    icon: Users,
    text: 'Instantly connect with vetted industry advisors. Book stage-matched consulting sessions with integrated scheduling, payment, and private communication tools.',
  },
  {
    number: '05',
    title: 'Collaborative Team Workspace',
    tag: 'Execution Engine',
    icon: Briefcase,
    text: 'Centralize your startup operations. Onboard co-founders and team members while maintaining a real-time, shared execution log.',
  },
  {
    number: '06',
    title: 'Sponsor Progress View',
    tag: 'Transparent Gates',
    icon: ShieldCheck,
    text: 'Give funding partners and enterprise sponsors real-time visibility into your venture’s stage-gate progression and evidence verification.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Problem Selection',
    body: 'Start with verified, high-value clinical needs sourced from frontline healthcare.',
    deliverable: 'Clinical Need Specification & Scope Validation Document',
    gatekeeper: 'Practicing Clinical Specialists',
  },
  {
    num: '02',
    title: 'Capital Matching',
    body: 'Lock in dedicated funding attached directly to the healthcare challenge.',
    deliverable: 'Approved Milestone Grant & Tranche Disbursement Schedule',
    gatekeeper: 'Pharma / Hospital Investment Committee',
  },
  {
    num: '03',
    title: 'Tailored Roadmap',
    body: 'Set a clear commercial route tailored to clinical, legal, and operational realities.',
    deliverable: 'CDSCO / FDA Regulatory Classification & Verification Protocol',
    gatekeeper: 'Regulatory & Quality Affairs Advisors',
  },
  {
    num: '04',
    title: 'Stage-Gated Execution',
    body: 'Deliver required evidence against fixed deadlines. Clear the gate to unlock the next tranche of capital and progress.',
    deliverable: 'Verified Bench Data, IRB Ethics Approval, or Pilot Trial Dataset',
    gatekeeper: 'Institutional Review & Peer Audit',
  },
  {
    num: '05',
    title: 'Target Acceleration',
    body: 'Access specialized advisor networks, from clinical trials to hospital procurement, to drive market entry.',
    deliverable: 'Live Clinical Adoption, Hospital Pilot Tender, & Expansion Capital',
    gatekeeper: 'Hospital Procurement & Clinical Chairs',
  },
];

const asRole = (value: string | null): LeadRole => {
  switch (value) {
    case 'hospital': case 'incubator': case 'us': case 'founder': case 'pharma': return value;
    default: return 'pharma';
  }
};

export const HomePage: React.FC = () => {
  const [params] = useSearchParams();
  const initialRole = asRole(params.get('as'));
  const site = store.getSite();
  const blogs = store.getBlogs().filter(b => b.status === 'published').slice(0, 3);
  const startups = store.getStartups();

  return (
    <PublicLayout variant="home">
      <ScrollRoute />
      {/* 1. HERO: the helix is the background of the headline */}
      <section className="relative overflow-hidden border-b border-[var(--nxt-line)]">
        <HeroPathway />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 45% 60% at 74% 45%, var(--nxt-green-soft), transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 45%, transparent 92%)',
            maskImage: 'linear-gradient(to bottom, #000 45%, transparent 92%)',
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[var(--nxt-bg)]/70 lg:bg-transparent" />
        <div className="nxt-container relative z-10 flex items-center min-h-[max(600px,calc(100dvh-4.5rem))] py-20">
          <div className="max-w-[50rem] flex flex-col items-start gap-7">
            <Rise><Kicker>Validated clinical demand · Dedicated funding</Kicker></Rise>
            <Rise delay={0.06}>
              <h1 className="font-display font-light text-[clamp(2.2rem,4.8vw,4.2rem)] tracking-[0.04em] uppercase leading-[1.08] text-balance">
                Roadmaps that direct innovation
                <em className="block italic text-[var(--nxt-green)] font-normal mt-1">straight to patients.</em>
              </h1>
            </Rise>
            <Rise delay={0.12}>
              <p className="max-w-[46rem] text-[clamp(1.05rem,1.4vw,1.25rem)] text-[var(--nxt-ink-soft)] leading-relaxed">
                {site.hero_subtitle || <>SirOsler pairs validated clinical problems with ambitious founders,<br className="hidden md:block" /> providing a complete pathway from idea to scale.</>}
              </p>
            </Rise>
            <Rise delay={0.18}>
              <div className="flex flex-wrap items-center gap-3">
                <Btn variant="green" to="/problems">Claim a problem <ArrowRight className="w-4 h-4" /></Btn>
                <Btn variant="outline" to="/#start">Fund a challenge</Btn>
              </div>
            </Rise>
          </div>
        </div>
      </section>

      {/* 2. 1 IN 5: shares a clock with the stage-gate stack below */}
      <OneInFive
        stat="1 in 5"
        headline="doctors encounters a critical clinical problem every day and waits for someone to solve it."
        subtitle="SirOsler captures these frontline pains, validates them with industry funding, and connects them to ambitious founders ready to build the solution."
      />

      {/* 3. THE PARADIGM SHIFT */}
      <section className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)]">
        <Rise className="max-w-3xl">
          <Kicker>The paradigm shift</Kicker>
          <H2 className="mt-5">Others launch startups in a vacuum. We connect founders with the clinical challenges <Accent>healthcare is waiting to solve.</Accent></H2>
        </Rise>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <TiltCard className="h-full">
            <span className="text-[12px] uppercase tracking-[0.14em] text-[var(--nxt-ink-soft)]">The traditional route</span>
            <h3 className="font-display font-normal text-[clamp(1.5rem,2.6vw,2.1rem)] tracking-[-0.025em] leading-tight mt-3">Build first. Search for buyers later.</h3>
            <p className="mt-4 text-[var(--nxt-ink-soft)] leading-relaxed">Founders build a product, craft a pitch deck, and hunt for market fit, wasting critical time and capital on unvalidated ideas.</p>
            <CountUp to={90} suffix="%+" className="font-display font-normal text-[clamp(3.4rem,8vw,6rem)] leading-none tracking-[-0.05em] text-[var(--nxt-ink-soft)] mt-8" />
            <ul className="mt-6">
              {[
                'Building in a market vacuum without frontline validation',
                'Burning capital searching for pilot access and hospital partners',
                'Venture mortality from a lack of genuine buyer demand',
              ].map(t => (
                <li key={t} className="flex gap-3.5 py-3.5 border-t border-[var(--nxt-line)] text-[15px]"><span className="w-3.5 shrink-0 text-[var(--nxt-ink-soft)]">×</span>{t}</li>
              ))}
            </ul>
          </TiltCard>
          <TiltCard className="h-full !border-[color-mix(in_srgb,var(--nxt-green)_45%,var(--nxt-line))]">
            <span className="text-[12px] uppercase tracking-[0.14em] text-[var(--nxt-ink-soft)]">The NXT route</span>
            <h3 className="font-display font-normal text-[clamp(1.5rem,2.6vw,2.1rem)] tracking-[-0.025em] leading-tight mt-3">
              <span className="text-[var(--nxt-green)]">Start</span> with guaranteed demand.
            </h3>
            <p className="mt-4 text-[var(--nxt-ink-soft)] leading-relaxed">Doctors and industry define the clinical problem and fund the solution. SirOsler matches ambitious founders with validated challenges, capital, and the end-to-end support needed to launch.</p>
            <p className="font-display font-normal text-[clamp(3.4rem,8vw,6rem)] leading-none tracking-[-0.05em] text-[var(--nxt-green)] mt-8">0%</p>
            <ul className="mt-6">
              {[
                'Clinicians and industry leaders define verified problems',
                'Non-dilutive challenge grant capital tied to clear milestone gates',
                'Step-by-step regulatory, evidence, and hospital procurement pathway',
              ].map(t => (
                <li key={t} className="flex gap-3.5 py-3.5 border-t border-[var(--nxt-line)] text-[15px]"><span className="w-3.5 shrink-0 text-[var(--nxt-green)]">✓</span>{t}</li>
              ))}
            </ul>
          </TiltCard>
        </div>
      </section>

      {/* 4. HOW IT WORKS: the stage-gate stack */}
      <section id="how-it-works" className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Rise className="max-w-3xl mb-10">
          <Kicker>The stage-gate pathway</Kicker>
          <H2 className="mt-5">From frontline hospital to <Accent>global launch.</Accent></H2>
          <p className="mt-4 text-[var(--nxt-ink-soft)] text-lg max-w-xl">Each gate unlocks the next tranche of capital. A structured, milestone-driven pathway engineered to eliminate startup risk.</p>
        </Rise>
        <GateStack />
      </section>

      {/* 5. WHO IT'S FOR */}
      <section id="who-its-for" className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Rise className="max-w-3xl mb-12">
          <Kicker>Who it's for</Kicker>
          <H2 className="mt-5">One platform, <Accent>six ways in.</Accent></H2>
        </Rise>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map(a => (
            <TiltCard key={a.id} max={7} className="h-full min-h-[240px]">
              <p className="text-[12px] uppercase tracking-[0.14em] text-[var(--nxt-green)]">{a.role}</p>
              <h3 className="font-display font-normal text-[1.5rem] tracking-[-0.02em] leading-tight mt-3.5">{a.title}</h3>
              <p className="mt-3.5 text-[15.5px] text-[var(--nxt-ink-soft)] leading-relaxed">{a.intro}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 6. GLOBAL CLINICAL NETWORK: the globe fills the section and is still draggable */}
      <section className="relative overflow-hidden border-b border-[var(--nxt-line)]">
        <Interactive3DGlobe />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[var(--nxt-bg)]/60 lg:bg-transparent" />
        <div className="nxt-container relative z-10 flex items-center min-h-[max(560px,85dvh)] py-20 pointer-events-none">
          <Rise className="max-w-xl">
            <Kicker>Global clinical network</Kicker>
            <H2 className="mt-5">Clinical hubs on <Accent>three continents.</Accent></H2>
            <p className="mt-4 text-[var(--nxt-ink-soft)] text-lg">
              Connecting clinical challenges across premier medical research centers, hospital systems, and global regulatory jurisdictions.
            </p>
          </Rise>
        </div>
      </section>

      {/* 7. WHAT'S INSIDE THE PLATFORM */}
      <section className="nxt-container py-20 sm:py-28 border-b border-[var(--nxt-line)]">
        <Rise className="max-w-3xl mb-12">
          <Kicker>What's inside</Kicker>
          <H2 className="mt-5">Everything a funded venture <Accent>runs on.</Accent></H2>
        </Rise>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--nxt-line)]">
          {PLATFORM_PILLARS.map(item => (
            <div key={item.title} className="p-7 border-r border-b border-[var(--nxt-line)] transition-colors hover:bg-[var(--nxt-surface)]">
              <div className="flex items-center justify-between mb-10">
                <item.icon className="w-5 h-5 text-[var(--nxt-green)] nxt-bob" />
                <span className="text-[12px] uppercase tracking-[0.14em] text-[var(--nxt-green)]">{item.tag}</span>
              </div>
              <h3 className="font-display font-normal text-[1.35rem] tracking-[-0.02em] mb-2.5">{item.title}</h3>
              <p className="text-[15.5px] text-[var(--nxt-ink-soft)] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. STARTUPS WORKING WITH US */}
      {site.show_startups && startups.length > 0 && (
        <section id="startups" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <div className="max-w-3xl mb-12">
            <Kicker>Active Cohort</Kicker>
            <H2 className="mt-5">Companies taking problems <Accent>to patients.</Accent></H2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map(s => <StartupCard key={s.id} startup={s} />)}
          </div>
        </section>
      )}

      {/* 9. PRICING & ACCESS TIERS */}
      <section id="pricing" className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)] scroll-mt-20">
        <div className="max-w-3xl mb-12">
          <Rise>
            <Kicker>Transparent Pricing</Kicker>
            <H2 className="mt-5">Free to start. <Accent>At cost to build.</Accent></H2>
            <p className="mt-4 text-[var(--nxt-ink-soft)] text-lg">
              Founders join free and pay at cost once they are ready to build.
            </p>
          </Rise>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <PriceCard
            label="Community"
            price="Free"
            note="always · open to everyone"
            points={[
              'Problem headlines & clinical briefs',
              'Founder town hall access',
              'Starter regulatory & incorporation guides',
              'Community Slack & peer network',
            ]}
          />

          <PriceCard
            label="Founder Member"
            price="₹2,000"
            note="per month · about $22 · at cost"
            points={[
              'Full clinical problems & data',
              'Apply for funded challenge grants',
              'Complete 26-route stage-gate roadmaps',
              'Multi-seat co-founder workspace & notes',
            ]}
            featured
          />

          <PriceCard
            label="Dedicated Project Support"
            price="₹22,500"
            note="per month · about $250 · optional add-on"
            points={[
              'Dedicated project coordinator on your roadmap',
              'Assisted hospital pilot & trial submissions',
              'Vetted mentor session matching',
              'Direct regulatory liaison review',
            ]}
          />
        </div>
      </section>

      {/* 10. SPONSORSHIP FOR PHARMA & HOSPITALS */}
      <section id="pricing-pharma" className="nxt-container py-24 sm:py-32 border-b border-[var(--nxt-line)] scroll-mt-20">
        <div className="max-w-3xl mb-12">
          <Kicker>For Enterprise & Health Systems</Kicker>
          <H2 className="mt-5">Start with one problem. <Accent>Grow into a scalable pipeline.</Accent></H2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <PriceCard
            label="Seed a Problem"
            price="₹5–10 lakh"
            note="one grant · about $6–11K · plus 15% management"
            points={[
              'One validated clinical problem challenge',
              'Screened founder teams & execution protocol',
              'Transparent gate-by-gate progress view',
            ]}
            featured
          />
          <PriceCard
            label="Annual Sponsor"
            price="₹45 lakh"
            note="per year · about $50K"
            points={[
              'Two funded clinical problems per year',
              'Validation at your site or partner hospital network',
              'Quarterly pipeline executive briefings',
              'Keynote slot at founder symposiums',
            ]}
          />
          <PriceCard
            label="Co-Invest Partner"
            price="₹90 lakh"
            note="per year · about $100K"
            points={[
              'Everything in Annual Sponsor',
              'Pro-rata co-investment rights in cohort winners',
              'First-look licensing & commercial rights',
            ]}
          />
        </div>
      </section>

      {/* 11. BLOG / CONTENT */}
      {site.show_blogs && blogs.length > 0 && (
        <section id="blog" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <Kicker>Insights & Dispatches</Kicker>
              <H2 className="mt-5">Ideas for people <Accent>building health.</Accent></H2>
            </div>
            <Btn variant="outline" to="/blog" className="border-[var(--nxt-line)]">
              All posts
            </Btn>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* 12. FINAL CALL TO ACTION (MIDNIGHT MEDIA HIGH-CONTRAST INTAKE) */}
      <section id="start" className="bg-[#050505] text-white py-24 sm:py-32 scroll-mt-16 relative overflow-hidden border-t border-[var(--nxt-green)]/20">
        <div className="nxt-container grid gap-12 lg:grid-cols-2 lg:gap-20 items-start relative z-10">
          <div>
            <Kicker>Commence Today</Kicker>
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] leading-tight mt-6">
              Put capital behind a real clinical need or <Accent>claim one to scale.</Accent>
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
              Fund a clinical challenge to deploy screened founder teams or join free to build with guaranteed demand from day one.
            </p>

            <div className="mt-10 space-y-4 pt-8 border-t border-white/10 max-w-lg text-sm text-white/80">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--nxt-green)] shrink-0" />
                <span>Zero equity taken on non-dilutive challenge grants</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--nxt-green)] shrink-0" />
                <span>Verified frontline physicians guiding technical product specs</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--nxt-green)] shrink-0" />
                <span>Full stage-gate transparency for funding partners</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] text-white p-8 sm:p-10 border border-[var(--nxt-green)]/30 shadow-2xl">
            <h3 className="font-display font-normal text-2xl tracking-[-0.02em] mb-2">
              Start with SirOsler
            </h3>
            <p className="text-xs text-[var(--nxt-ink-soft)] mb-6">
              ✦ CLINICAL INNOVATION TEAM // 24-HOUR RESPONSE ✦
            </p>
            <InquiryForm kind="lead" initialRole={initialRole} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

const StartupCard: React.FC<{ startup: Startup }> = ({ startup }) => {
  const body = (
    <>
      <div className="flex items-center gap-4">
        {startup.logo_url
          ? <img src={startup.logo_url} alt="" className="w-14 h-14 object-contain border border-[var(--nxt-line)] bg-white p-1.5" loading="lazy" />
          : <div className="w-14 h-14 bg-[#111] text-white font-display font-normal text-xl flex items-center justify-center border border-white/20" aria-hidden="true">{startup.name.slice(0, 1).toUpperCase()}</div>}
        <div className="min-w-0">
          <h3 className="font-display font-normal text-lg tracking-[-0.02em] leading-tight">{startup.name}</h3>
          <p className="text-[12px] text-[var(--nxt-ink-soft)] mt-0.5">{[startup.sector, startup.stage, startup.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {startup.tagline && <p className="mt-4 font-normal text-sm">{startup.tagline}</p>}
      {startup.description && <p className="mt-2 text-xs text-[var(--nxt-ink-soft)] leading-relaxed line-clamp-3">{startup.description}</p>}
    </>
  );
  const cls = 'block border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6 hover:border-[var(--nxt-green)] transition-colors';
  return startup.website
    ? <a href={startup.website} target="_blank" rel="noreferrer" className={cls}>{body}</a>
    : <article className={cls}>{body}</article>;
};

const PriceCard: React.FC<{
  label: string; price: string; note: string; points: string[]; featured?: boolean;
}> = ({ label, price, note, points, featured }) => (
  <article className={`p-8 border bg-[var(--nxt-surface)] flex flex-col ${featured ? 'border-[var(--nxt-green)]' : 'border-[var(--nxt-line)]'}`}>
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-widest text-[var(--nxt-green)] font-normal">{label}</span>
      {featured && (
        <span className="bg-[var(--nxt-green)] text-[var(--nxt-green-ink)] px-2 py-0.5 text-[10px] font-normal uppercase tracking-wider">
          Recommended
        </span>
      )}
    </div>
    <p className={`font-display font-normal text-[2.75rem] leading-none tracking-[-0.04em] mt-6 ${price === 'Free' ? 'text-[var(--nxt-green)]' : ''}`}>{price}</p>
    <p className="mt-2 text-xs text-[var(--nxt-ink-soft)]">{note}</p>
    <div className="mt-6">
      <RuleList items={points} />
    </div>
  </article>
);
