import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasMapModule } from './shared/canvas-map/canvas-map.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CanvasMapModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
