import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ForecastDisplayComponent } from '../display-page/forecast-display/forecast-display.component';

const routes: Routes = [
  {
    path: "",
    component: HomePageComponent
  },
  {
    path: "worksheet",
    component: ForecastDisplayComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule { }
