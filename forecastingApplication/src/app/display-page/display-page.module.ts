import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DisplayPageRoutingModule } from './display-page-routing.module';
import { ForecastDisplayComponent } from './forecast-display/forecast-display.component';


@NgModule({
  declarations: [
    ForecastDisplayComponent
  ],
  imports: [
    CommonModule,
    DisplayPageRoutingModule
  ]
})
export class DisplayPageModule { }
