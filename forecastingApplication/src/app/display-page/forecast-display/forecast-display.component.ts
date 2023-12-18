import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forecast-display',
  templateUrl: './forecast-display.component.html',
  styleUrls: ['./forecast-display.component.css'],
})
export class ForecastDisplayComponent implements OnInit{
  // levels:any=[];
  // data:any=[];
  years: any = [];

  jsonData = {
    levels: {
      level1: 'Country',
      level2: 'Gender',
      level3: 'Age Group',
      series: 'year',
      'range-start': '2019',
      'range-end': '2023',
    },
    data: [
      {
        level1: 'country1',
        male: {
          '20-40': {
            '2019': 10,
            '2020': 8,
            '2021': 15,
          },
          '40-60': {
            '2019': 10,
            '2020': 8,
            '2021': 15,
          },
          '60-80': {
            '2019': 10,
            '2020': 8,
            '2021': 15,
          },
        },
        female: {
          '20-40': {
            '2019': 19,
            '2020': 8,
            '2021': 15,
          },
          '40-60': {
            '2019': 10,
            '2020': 8,
            '2021': 15,
          },
          '60-80': {
            '2019': 10,
            '2020': 8,
            '2021': 15,
          },
        },
      },
    ],
  };


  ngOnInit(): void {
    // this.getLevels();
    // this.getData();
    this.getYearRange();
  }

  getYearRange(){
    const startYear = 2019; 
    const endYear = new Date().getFullYear(); 

    // Generate an array of years from startYear to endYear
    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
    console.log("Year Range", this.years)
  }

  
  // getLevels() {
  //   this.dataService.getLevels().subscribe((res)=>{
  //       this.levels=res;
  //       console.log("levels", this.levels);
  //   })
  // }

  // getData() {
  //   this.dataService.getData().subscribe((res)=>{
  //     this.data=res;
  //     console.log("data", this.data);
  // })
  // }
}
