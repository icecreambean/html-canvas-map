import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { transformFittedPoint } from './utils/object-fit-math/transform-fitted-point';
import { FitMode } from './utils/object-fit-math/types';
import { getImgSizeInfo } from './utils/object-fit-util';

// https://jsfiddle.net/khrismuc/pvtesy68/
// 
// https://stackoverflow.com/questions/3768565/drawing-an-svg-file-on-a-html5-canvas

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasMap')
  canvasRef: ElementRef<HTMLCanvasElement> | null = null;
  ctx: CanvasRenderingContext2D | null = null;

  // @Input() // TODO: redraw on set
  radiusRatio = 0.02;
  
  // @Input() // TODO: redraw on set
  imgUrl = "/assets/floorplan-3d.jpg";
  // imgUrl = 'https://www.houseplanshelper.com/images/how-to-read-floor-plans-dimensions.jpg';
  img = new Image();

  // instead of drawing circles, draw images (assumed to be square)
  activeAvatarUrl = "/assets/ws-active.png";
  inactiveAvatarUrl = "/assets/ws-inactive.png";
  activeAvatarImg = new Image();
  inactiveAvatarImg = new Image();
  loadedImagesCount: number = 0;

  circleHistory: MapMarker[] = [];

  ngOnInit(): void {
    this.img.src = this.imgUrl;
    this.img.onload = () => {
      this.onImageLoad();
    }

    this.activeAvatarImg.src = this.activeAvatarUrl;
    this.inactiveAvatarImg.src = this.inactiveAvatarUrl;
    this.activeAvatarImg.onload = () => {
      this.onImageLoad();
    }
    this.inactiveAvatarImg.onload = () => {
      this.onImageLoad();
    }
  }

  onImageLoad() {
    this.loadedImagesCount += 1;
    if (this.loadedImagesCount >= 3) {
      this.reloadCanvas();
      this.drawPositions();
    }
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef?.nativeElement?.getContext('2d') ?? null;
  }

  reloadCanvas() {
    if (this.img.src.length > 0 && this.ctx != null) {
      // note: canvas width/height are the px image resolution
      // this does not have to match the HTML element's width/height
      // const canvasImgWidth = this.ctx.canvas.width;
      const canvasImgWidth = 1920; // for HD images
      const canvasImgHeight =  canvasImgWidth / this.img.width * this.img.height;

      this.ctx.canvas.width = canvasImgWidth;
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

  private drawPositions() {
    WORKSTATIONS.forEach(x => this.drawCircle(x));
  }

  private drawCircle(m: MapMarker) {
    if (this.ctx == null) return;
    const { cx, cy, cr } = this.getCircleParams(
      m, 
      this.ctx.canvas.width,
      this.ctx.canvas.height);

    if (true) { // this.isDrawCircles
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, cr, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = m.color ?? 'red';
      this.ctx.fill();

    } 
    /*else*/ if (
      this.activeAvatarImg.src.length > 0 &&
      this.inactiveAvatarImg.src.length > 0
    ) {
      const x1 = cx - cr;
      const y1 = cy - cr;
      if (Math.random() > 0.5) { // active
        this.ctx?.drawImage(this.activeAvatarImg, x1, y1, cr * 2, cr * 2);
      } else { // inactive
        this.ctx?.drawImage(this.inactiveAvatarImg, x1, y1, cr * 2, cr * 2);
      }

    } else {
      console.warn('drawCircle: active/inactive images not yet loaded!');
    }

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

    // with object-fit support??
    // const rect = this.ctx.canvas.getBoundingClientRect();
    // const { objectFit, objectPosition } = getComputedStyle( this.ctx.canvas );
    // const [ left, top ] = objectPosition.split( ' ' );

    // const { x: fitOffsetX, y: fitOffsetY } = transformFittedPoint(
    //   // { x: event.offsetX, y: event.offsetY }, 
    //   { x: 0, y: 0 }, 
    //   rect, this.ctx.canvas, 
    //   objectFit as FitMode, 
    //   left, top
    // );
    // const x = event.clientX - rect.left + fitOffsetX/2;
    // const y = event.clientY - rect.top + fitOffsetY/2;
    // console.log(x, event.clientX, rect.left, fitOffsetX);

    console.log('onCanvasClick', rect, [x,y], [event.offsetX, event.offsetY]);
    for (let m of this.circleHistory) {
      // width/height:
      // - draw events use canvas
      // - click events use getBoundingClientRect
      const { cx, cy, cr } = this.getCircleParams(
        m, 
        rect.width, 
        rect.height
      );
      const isIntersects = intersectCircle(x, y, cx, cy, cr);

      console.log('  * Evaluating:', [x, y], [cx, cy], cr, isIntersects, m);
      // if (isIntersects) {
      //   console.log('  - Cursor intersects:', m);
      //   // TODO: OutputEmitter
      // }
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