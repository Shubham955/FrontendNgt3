import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DisplayPageRoutingModule } from './display-page-routing.module';
import { ForecastDisplayComponent } from './forecast-display/forecast-display.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ForecastDisplayComponent
  ],
  imports: [
    CommonModule,
    DisplayPageRoutingModule,
    ReactiveFormsModule
  ]
})
export class DisplayPageModule { }
