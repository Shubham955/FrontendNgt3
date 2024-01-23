import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DisplayPageModule } from '../display-page/display-page.module';
import { SchemaDisplayComponent } from './schema-display/schema-display.component';

@NgModule({
  declarations: [
    HomePageComponent,
    SchemaDisplayComponent
  ],
  imports: [
    CommonModule,
    HomePageRoutingModule,
    ReactiveFormsModule,
    DisplayPageModule
  ]
})
export class HomePageModule { }
