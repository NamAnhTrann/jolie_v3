declare module 'zdog' {
  export interface Vector {
    x: number;
    y: number;
    z: number;
  }

  export class Anchor {
    constructor(options?: any);

    addTo?: Anchor;

    translate: Vector;
    rotate: Vector;
    scale: number | Vector;

    children: any[];

    updateGraph(): void;
    renderGraphCanvas(ctx: CanvasRenderingContext2D): void;
  }

  export class Shape {
    constructor(options?: any);

    color: string;
    stroke: number;
    fill?: boolean;
    path?: any[];

    translate: Vector;
    rotate: Vector;

    copy(options?: any): Shape;
  }
}
