import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  color?: string;
  status?: 'active' | 'inactive';
  
  // any other fields
  [key:string]: any;
}

// https://stackblitz.com/edit/angular-yk6gx2
// https://jsfiddle.net/khrismuc/pvtesy68/
// https://stackoverflow.com/questions/3768565/drawing-an-svg-file-on-a-html5-canvas

@Component({
  selector: 'app-canvas-map',
  templateUrl: './canvas-map.component.html',
  styleUrls: ['./canvas-map.component.scss']
})
export class CanvasMapComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasMap')
  canvasRef: ElementRef<HTMLCanvasElement> | null = null;
  ctx: CanvasRenderingContext2D | null = null;

  _mapMarkers: MapMarker[] = [];
  @Input() set mapMarkers(e: MapMarker[]) {
    this._mapMarkers = e;
    this.reloadCanvas();
    this.drawPositions();
  }
  @Output() onClickCircle = new EventEmitter<MapMarker>();

  @Input() isDrawCircles: boolean = true;
  @Input() radiusRatio: number = 0.02;
  @Input() imgUrl: string = ""; // TODO - put placeholder URLs?
  img = new Image();

  @Input() activeAvatarUrl: string = "";
  @Input() inactiveAvatarUrl: string = "";
  activeAvatarImg = new Image();
  inactiveAvatarImg = new Image();
  loadedImagesCount: number = 0;

  circleHistory: MapMarker[] = [];
  
  constructor() { }

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

  private onImageLoad() {
    this.loadedImagesCount += 1;
    const numImagesRequired = 
      ((this.imgUrl != '') ? 1 : 0) +
      ((this.activeAvatarUrl != '') ? 1 : 0) +
      ((this.inactiveAvatarUrl != '') ? 1 : 0);
      
    if (this.loadedImagesCount >= numImagesRequired) {
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
      // console.log(
      //   'reloadCanvas', 
      //   this.ctx.canvas.width, this.ctx.canvas.height,
      //   this.img.width, this.img.height
      // );

      this.ctx?.drawImage(this.img, 0, 0, canvasImgWidth, canvasImgHeight);
      this.circleHistory = [];
    }
  }

  private drawPositions() {
    if (Array.isArray(this._mapMarkers)) {
      this._mapMarkers.forEach(x => this.drawCircle(x));
    }
  }

  private drawCircle(m: MapMarker) {
    if (this.ctx == null) return;
    const { cx, cy, cr } = this.getCircleParams(
      m, 
      this.ctx.canvas.width,
      this.ctx.canvas.height);

    if (this.isDrawCircles) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, cr, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = m.color ?? 'red';
      this.ctx.fill();
    }

    if (
      m.status != null &&
      this.activeAvatarImg.src.length > 0 &&
      this.inactiveAvatarImg.src.length > 0
    ) {
      const x1 = cx - cr;
      const y1 = cy - cr;
      let imgSrc = this.inactiveAvatarImg;
      if (m.status == 'active') {
        imgSrc = this.activeAvatarImg;
      }
      this.ctx?.drawImage(imgSrc, x1, y1, cr * 2, cr * 2);
    }

    this.circleHistory.push(JSON.parse(JSON.stringify(m))); // shallow copy
  }

  private getCircleParams(m: MapMarker, canW: number, canH: number) {
    const cx = m.x/100 * canW;
    const cy = m.y/100 * canH;
    const cr = this.radiusRatio * canW;
    return { cx, cy, cr };
  }

  private getCanvasCoordsFromObjectFit(eventX: number, eventY: number) {
    if (this.ctx == null) return { x: 0, y: 0 };
    // assuming the following CSS: "width: 100%; object-fit: contain"
    // use HTML height and canvas aspect ratio to infer HTML width occupied
    const htmlView = this.ctx.canvas.getBoundingClientRect();
    const htmlCanvasWidth = (htmlView.height) / this.ctx.canvas.height * this.ctx.canvas.width;
    const htmlSideOffset = (htmlView.width - htmlCanvasWidth) / 2;
    // map this to the canvas dimensions
    // console.log('htmlView:', [htmlCanvasWidth, htmlView.height]);
    return { // canvas dimensions are returned
      x: (eventX - htmlView.left - htmlSideOffset) / htmlCanvasWidth * this.ctx.canvas.width,
      y: (eventY - htmlView.top) / htmlView.height * this.ctx.canvas.height
    };
  }

  onCanvasClick(event: MouseEvent) {
    if (this.ctx == null) return;

    // let rect = this.ctx.canvas.getBoundingClientRect();
    // let x = event.clientX - rect.left;
    // let y = event.clientY - rect.top;
    let { x, y } = this.getCanvasCoordsFromObjectFit(event.x, event.y);

    // console.log(
    //   'onCanvasClick', 
    //   '\n  rect:', [rect.width, rect.height], rect,
    //   '\n  canvas:', [this.ctx.canvas.width, this.ctx.canvas.height],
    //   '\n  event:', [event.offsetX, event.offsetY],
    //   '\n  calc:', [x, y], 
    // );
    for (let m of this.circleHistory) {
      // compare event coords (in canvas format) to circle coords (in canvas format)
      const { cx, cy, cr } = this.getCircleParams(
        m, 
        this.ctx.canvas.width,
        this.ctx.canvas.height,
      );
      const isIntersects = intersectCircle(x, y, cx, cy, cr);

      // console.log('  * Evaluating:', [x, y], [cx, cy], cr, isIntersects, m);
      if (isIntersects) {
        // console.log('  - Cursor intersects:', m);
        this.onClickCircle.emit(m);
      }
    }
  }
}

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