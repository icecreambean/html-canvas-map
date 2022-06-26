import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MapMarker } from './shared/canvas-map/canvas-map.component';

// https://jsfiddle.net/khrismuc/pvtesy68/
// 
// https://stackoverflow.com/questions/3768565/drawing-an-svg-file-on-a-html5-canvas

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  workstations = WORKSTATIONS;

  imgUrl = "/assets/floorplan-3d.jpg";
  // imgUrl = 'https://www.houseplanshelper.com/images/how-to-read-floor-plans-dimensions.jpg';
  activeAvatarUrl = "/assets/ws-active.png";
  inactiveAvatarUrl = "/assets/ws-inactive.png";

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  // test only
  onAddCircle() {
    let m: MapMarker = {
      id: 'WS ' + (Math.random() * 1000).toFixed(0),
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      status: (Math.random() >= 0.5) ? 'active' : 'inactive',
    };
    console.log('onAddCircle', m);
    this.workstations = [...this.workstations, m];
  }

  reloadCanvas() {
    this.workstations = WORKSTATIONS;
  }

  onClickWorkstation(e: MapMarker) {
    console.log('onClickWorkstation', e);
  }
}

const COLORS = [
  'blue',
  'orange',
  'pink',
  'black'
];

const WORKSTATIONS: MapMarker[] = [
  {
    id: 'WS 1',
    x: 25,
    y: 25,
    color: 'blue',
    status: 'active'
  },
  {
    id: 'WS 2',
    x: 50,
    y: 50,
    color: 'green',
    status: 'active'
  },
  {
    id: 'WS 2',
    x: 75,
    y: 75,
  }
];
