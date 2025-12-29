import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Homepage implements AfterViewInit {
  @ViewChild('bgCanvas', { static: true })
  bgCanvas!: ElementRef<HTMLCanvasElement>;

  private bgCtx!: CanvasRenderingContext2D;

  private width = 0;
  private height = 0;

  private entities: any[] = [];
  private rockets: any[] = [];
  private particles: any[] = [];

  ngAfterViewInit() {
    this.setupCanvas();
    this.initBackground();
    this.animate();
    this.startRocketLoop();
  }
  private startRocketLoop() {
    const spawn = () => {
      // 1–3 rockets per burst
      const count = 1 + Math.floor(Math.random() * 3);

      for (let i = 0; i < count; i++) {
        setTimeout(() => this.launchRocket(), i * 120);
      }

      // random delay before next burst
      const next = 600 + Math.random() * 100;
      setTimeout(spawn, next);
    };

    spawn();
  }

  private resizeObserver!: ResizeObserver;

  private setupCanvas() {
    const parent = this.bgCanvas.nativeElement.parentElement as HTMLElement;

    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;

      if (w === 0 || h === 0) return;

      this.width = w;
      this.height = h;

      this.bgCanvas.nativeElement.width = w;
      this.bgCanvas.nativeElement.height = h;
    };

    // Initial resize
    resize();

    // Watch for Swiper layout changes
    this.resizeObserver = new ResizeObserver(() => resize());
    this.resizeObserver.observe(parent);

    this.bgCtx = this.bgCanvas.nativeElement.getContext('2d')!;
  }

  /* ================= BACKGROUND ================= */

  private initBackground() {
    for (let i = 0; i < this.height; i++) {
      this.entities.push(new Star(this.width, this.height));
    }

    this.entities.push(new ShootingStar(this.width, this.height));
    this.entities.push(new ShootingStar(this.width, this.height));

    this.entities.push(
      new Terrain(this.width, this.height, {
        mHeight: this.height * 0.75,
      })
    );

    this.entities.push(
      new Terrain(this.width, this.height, {
        displacement: 90,
        scrollDelay: 50,
        fillStyle: 'rgb(17,20,40)',
        mHeight: this.height * 0.82,
      })
    );

    this.entities.push(
      new Terrain(this.width, this.height, {
        displacement: 70,
        scrollDelay: 25,
        fillStyle: 'rgb(10,10,5)',
        mHeight: this.height * 0.9,
      })
    );
  }

  /* ================= FIREWORKS ================= */

private launchRocket() {
  const types = [
    { type: 'circle', weight: 0.080 }, // rare
    { type: 'heart', weight: 0.35 },
    { type: 'star', weight: 0.35 },
    { type: 'text', weight: 0.25 },
  ];

  const rand = Math.random();
  let cumulative = 0;
  let selected = 'heart';

  for (const item of types) {
    cumulative += item.weight;
    if (rand <= cumulative) {
      selected = item.type;
      break;
    }
  }

  this.rockets.push({
    x: Math.random() * this.width,
    y: this.height + 80,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -(8 + Math.random() * 3),
    targetY: this.height * (0.18 + Math.random() * 0.25),
    trail: [],
    type: selected,
  });
}


  private explode(x: number, y: number, type: string = 'generic') {
    let vectors: { x: number; y: number }[] = [];

    switch (type) {
      case 'heart':
        vectors = this.makeHeartShape();
        break;

      case 'star':
        vectors = this.makeStarShape();
        break;

      case 'circle':
        vectors = this.makeCircleShape();
        break;

      case 'generic':
      default:
        vectors = this.makeGenericShape();
        break;
    }

    const baseSpeed = 4.2;

    for (const v of vectors) {
      this.particles.push({
        x,
        y,
        vx: v.x * baseSpeed,
        vy: v.y * baseSpeed,

        gravity: 0.035,
        drag: 0.985,

        life: 1,
        decay: 0.006 + Math.random() * 0.01,

        size: 1.4 + Math.random() * 1.6,
        color: this.randomColor(),
      });
    }
  }

  private makeGenericShape() {
    const points: { x: number; y: number }[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.6 + Math.random() * 0.6;

      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    return points;
  }

  private makeCircleShape(text: string = 'meow') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = 420;
    canvas.height = 140;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const points: { x: number; y: number }[] = [];

    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const i = (y * canvas.width + x) * 4;
        if (img.data[i + 3] > 150) {
          points.push({
            x: (x - canvas.width / 2) / 60,
            y: (y - canvas.height / 2) / 60,
          });
        }
      }
    }

    return points;
  }
  private makeHeartShape() {
    const points = [];

    for (let t = 0; t < Math.PI * 2; t += 0.15) {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

      points.push({
        x: x / 18,
        y: -y / 18,
      });
    }

    return points;
  }
  private makeStarShape() {
    const points = [];
    const spikes = 5;
    const outer = 1;
    const inner = 0.45;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (Math.PI / spikes) * i;
      const r = i % 2 === 0 ? outer : inner;

      points.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    return points;
  }

  /* ================= MAIN LOOP ================= */

  private animate = () => {
    requestAnimationFrame(this.animate);

    // clear background

    this.bgCtx.fillStyle = '#110E19';
    this.bgCtx.fillRect(0, 0, this.width, this.height);

    // draw stars + shooting stars
    this.bgCtx.fillStyle = '#ffffff';
    this.bgCtx.strokeStyle = '#ffffff';

    for (const e of this.entities) {
      e.update(this.bgCtx);
    }

    // === FIREWORKS (DRAW BEFORE TERRAIN) ===
    this.drawFireworks();

    // === TERRAIN LAST (foreground) ===
    for (const e of this.entities) {
      if (e instanceof Terrain) {
        e.update(this.bgCtx);
      }
    }
  };
  private drawFireworks() {
    this.bgCtx.globalCompositeOperation = 'lighter';

    // rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];

      r.vy += 0.06; // slower gravity = higher rise
      r.x += r.vx;
      r.y += r.vy;

      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 10) r.trail.shift();

      for (let t = 0; t < r.trail.length; t++) {
        const p = r.trail[t];
        this.bgCtx.globalAlpha = t / r.trail.length;
        this.bgCtx.shadowBlur = 10 + p.life * 25;

        this.bgCtx.shadowColor = p.color;

        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.bgCtx.fillStyle = p.color;
        this.bgCtx.fill();
      }

      if (r.vy > -0.5 || r.y <= r.targetY) {
        this.explode(r.x, r.y, r.type);
        this.rockets.splice(i, 1);
      }
    }

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= 0.98;
      p.vy = p.vy * 0.98 + 0.035;

      p.x += p.vx;
      p.y += p.vy;

      p.life -= 0.004;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.bgCtx.globalAlpha = p.life;
      this.bgCtx.beginPath();
      this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.bgCtx.fillStyle = p.color;
      this.bgCtx.fill();
    }
    this.bgCtx.shadowBlur = 0;
    this.bgCtx.globalAlpha = 1;
    this.bgCtx.globalCompositeOperation = 'source-over';
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }
  private randomColor(): string {
    const palette = [
      '#ff7675', // red
      '#74b9ff', // blue
      '#ffeaa7', // yellow
      '#a29bfe', // purple
      '#55efc4', // mint
      '#fd79a8', // pink
      '#fab1a0', // peach
      '#81ecec', // cyan
    ];

    return palette[Math.floor(Math.random() * palette.length)];
  }
}
class Star {
  x!: number;
  y!: number;
  size!: number;
  speed!: number;

  constructor(private width: number, private height: number) {
    this.reset();
  }

  reset() {
    this.size = Math.random() * 2;
    this.speed = Math.random() * 0.05;
    this.x = Math.random() * this.width;
    this.y = Math.random() * this.height;
  }

  update(ctx: CanvasRenderingContext2D) {
    this.x -= this.speed;

    if (this.x < 0) this.reset();

    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

class ShootingStar {
  x = 0;
  y = 0;
  len = 0;
  speed = 0;
  size = 0;
  waitTime = 0;
  active = false;

  constructor(private width: number, private height: number) {
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.width;
    this.y = 0;
    this.len = Math.random() * 80 + 20;
    this.speed = Math.random() * 10 + 6;
    this.size = Math.random() + 0.3;
    this.waitTime = Date.now() + Math.random() * 3000;
    this.active = false;
  }

  update(ctx: CanvasRenderingContext2D) {
    if (this.active) {
      this.x -= this.speed;
      this.y += this.speed;

      if (this.x < 0 || this.y > this.height) {
        this.reset();
      } else {
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.len, this.y - this.len);
        ctx.stroke();
      }
    } else if (Date.now() > this.waitTime) {
      this.active = true;
    }
  }
}
class Terrain {
  points: number[] = [];
  lastScroll = Date.now();

  constructor(
    private width: number,
    private height: number,
    private options: {
      displacement?: number;
      scrollDelay?: number;
      fillStyle?: string;
      mHeight?: number;
    } = {}
  ) {
    const displacement = options.displacement ?? 140;
    const mHeight = options.mHeight ?? height;
    const power = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));

    this.points[0] = mHeight;
    this.points[power] = mHeight;

    let disp = displacement;

    for (let i = 1; i < power; i *= 2) {
      for (let j = power / i / 2; j < power; j += power / i) {
        this.points[j] =
          (this.points[j - power / i / 2] + this.points[j + power / i / 2]) /
            2 +
          Math.random() * disp -
          disp / 2;
      }
      disp *= 0.6;
    }
  }

  update(ctx: CanvasRenderingContext2D) {
    const scrollDelay = this.options.scrollDelay ?? 60;
    const fillStyle = this.options.fillStyle ?? '#191D4C';

    if (Date.now() > this.lastScroll + scrollDelay) {
      this.lastScroll = Date.now();
      this.points.push(this.points.shift()!);
    }

    ctx.fillStyle = fillStyle;
    ctx.beginPath();

    for (let i = 0; i < this.points.length; i++) {
      if (i === 0) ctx.moveTo(0, this.points[i]);
      else ctx.lineTo(i, this.points[i]);
    }

    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();
  }
}
