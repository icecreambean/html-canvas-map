import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

// https://jsfiddle.net/khrismuc/pvtesy68/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  
  @ViewChild('canvasMap')
  canvasRef: ElementRef<HTMLCanvasElement> | null = null;
  ctx: CanvasRenderingContext2D | null = null;

  radiusRatio = 0.02;
  img = new Image();
  imgUrl = "/assets/floorplan-3d.jpg";

  circleHistory: MapMarker[] = [];

  ngOnInit(): void {
    this.img.src = this.imgUrl;

    this.img.onload = () => {
      this.reloadCanvas();
      this.drawPositions();
    }
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef?.nativeElement?.getContext('2d') ?? null;
  }

  reloadCanvas() {
    if (this.img.src.length > 0 && this.ctx != null) {
      const canvasImgWidth = this.ctx.canvas.width;
      const canvasImgHeight =  this.ctx.canvas.width / this.img.width * this.img.height;
      this.ctx.canvas.height = canvasImgHeight;

      console.log(
        'reloadCanvas', 
        this.ctx.canvas.width, this.ctx.canvas.height,
        this.img.width, this.img.height
      );
      console.log('img.onload', this.img.src);

      this.ctx?.drawImage(this.img, 0, 0, canvasImgWidth, canvasImgHeight);
      this.circleHistory = [];
    }
  }

  drawPositions() {
    WORKSTATIONS.forEach(x => this.drawCircle(x));
  }

  drawCircle(m: MapMarker) {
    if (this.ctx == null) return;
    const { cx, cy, cr } = this.getCircleParams(
      m, 
      this.ctx.canvas.width,
      this.ctx.canvas.height);

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, cr, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = m.color ?? 'red';
    this.ctx.fill();
    this.circleHistory.push(JSON.parse(JSON.stringify(m))); // shallow copy
  }

  private getCircleParams(m: MapMarker, canW: number, canH: number) {
    const cx = m.x/100 * canW;
    const cy = m.y/100 * canH;
    const cr = this.radiusRatio * canW;
    return { cx, cy, cr };
  }

  onCanvasClick(event: MouseEvent) {
    if (this.ctx == null) return;
    let rect = this.ctx.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    console.log('onCanvasClick', rect, event);
    for (let m of this.circleHistory) {
      // width/height:
      // - draw events use canvas
      // - click events use getBoundingClientRect
      const { cx, cy, cr } = this.getCircleParams(m, rect.width, rect.height);
      const isIntersects = intersectCircle(x, y, cx, cy, cr);

      console.log('  * Evaluating:', [x, y], [cx, cy], cr, isIntersects, m);
      if (isIntersects) {
        console.log('  - Cursor intersects:', m);
      }
    }
  }

  // test only
  onAddCircle() {
    let m: MapMarker = {
      id: 'WS ' + (Math.random() * 1000).toFixed(0),
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    console.log('onAddCircle', m);
    this.drawCircle(m);
  }
}

// distance formula from center of circle
function intersectCircle(
  x: number, y: number, 
  cx: number, cy: number, cr: number
) {
  // distance squared
  const d2 = Math.pow(x - cx, 2) + Math.pow(y - cy, 2);
  // radius squared
  const r2 = Math.pow(cr, 2);
  return d2 < r2;
}

interface MapMarker {
  id: string;
  x: number;
  y: number;
  color?: string;
}

const COLORS = [
  'blue',
  'orange',
  'pink',
  'black'
];

const WORKSTATIONS = [
  {
    id: 'WS 1',
    x: 25,
    y: 25,
    color: 'blue',
  },
  {
    id: 'WS 2',
    x: 50,
    y: 50,
    color: 'green'
  },
  {
    id: 'WS 2',
    x: 75,
    y: 75,
  }
];