import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { WorksheetParametersTransferService } from 'src/app/services/worksheet-parameters-transfer.service';

@Component({
  selector: 'app-forecast-display',
  templateUrl: './forecast-display.component.html',
  styleUrls: ['./forecast-display.component.css'],
})
export class ForecastDisplayComponent implements OnInit{
  levelNamesArr:any=[];
  timeRangeArr:any=[];
  levelCountArr:any=[];
  years: any = [];
  isOldWorksheet:boolean=false;
  levelNameValueArr:any=[];

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public worksheetParametersTransferService:WorksheetParametersTransferService) { }

  // jsonData = {
  //   levels: {
  //     level1: 'Country',
  //     level2: 'Gender',
  //     level3: 'Age Group',
  //     series: 'year',
  //     'range-start': '2019',
  //     'range-end': '2023',
  //   },
  //   data: [
  //     {
  //       level1: 'country1',
  //       male: {
  //         '20-40': {
  //           '2019': 10,
  //           '2020': 8,
  //           '2021': 15,
  //         },
  //         '40-60': {
  //           '2019': 10,
  //           '2020': 8,
  //           '2021': 15,
  //         },
  //         '60-80': {
  //           '2019': 10,
  //           '2020': 8,
  //           '2021': 15,
  //         },
  //       },
  //       female: {
  //         '20-40': {
  //           '2019': 19,
  //           '2020': 8,
  //           '2021': 15,
  //         },
  //         '40-60': {
  //           '2019': 10,
  //           '2020': 8,
  //           '2021': 15,
  //         },
  //         '60-80': {
  //           '2019': 10,
  //           '2020': 8,
  //           '2021': 15,
  //         },
  //       },
  //     },
  //   ],
  // };

  jsonDataSchema={
    "tableName": "testtable",
    "fields": [
      { "name": "country", "type": "String" },
      { "name": "gender", "type": "String" },
      { "name": "size", "type": "String" },
      { "name": "data", "type": "Object" }
    ]
  }

  jsonDataLevels={
    "sheet": [
      {
        "country": "a",
        "gender": "male",
        "age": "20-40",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      },
      {
        "country": "a",
        "gender": "male",
        "age": "40-60",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      },
      {
        "country": "a",
        "gender": "female",
        "age": "20-40",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      },
      {
        "country": "a",
        "gender": "female",
        "age": "40-60",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      },
      {
        "country": "b",
        "gender": "male",
        "age": "20-40",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      },
      {
        "country": "b",
        "gender": "male",
        "age": "40-60",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      },
      {
        "country": "b",
        "gender": "female",
        "age": "20-40",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      },
      {
        "country": "b",
        "gender": "female",
        "age": "40-60",
        "data": {
          "2019": 0,
          "2020": 0,
          "2021": 0
        }
      }
    ]
  };
 
  ngOnInit(): void {
    // this.getLevels();
    // this.getData();
    this.getYearRange();
    this.populateParameters();
  }

  getYearRange(){
    const startRng = this.worksheetParametersTransferService.startRange; 
    const endRng = this.worksheetParametersTransferService.endRange; 

    // Generate an array of years from startYear to endYear
    for (let i = startRng; i <= endRng; i++) {
      this.timeRangeArr.push(i);
    }
    console.log("Time Range", this.timeRangeArr);
  }

  populateParameters(){
    this.levelNamesArr=['Country', 'Gender', 'Age Group'];//this.worksheetParametersTransferService.levelNames;
    this.levelCountArr=[2,2,3];//this.worksheetParametersTransferService.levelCount;
    this.levelNameValueArr=['Country 1','Country 2','Male','Female','Age 20-40','Age 40-60','Age 60-80'];
    console.log("LL",this.levelNamesArr.length);
    this.genNewSheetJson();
  }

  loadWorksheet(){
    this.isOldWorksheet=true;
  }

  genNewSheetJson(){
    
    var newSheetJson='{"levels": {';
    for(let y=0;y<this.levelNamesArr.length;y++){
      newSheetJson=newSheetJson+ '"level'+(y+1)+'": "'+this.levelNamesArr[y]+'",';
    }
    newSheetJson=newSheetJson+'"series": "'+this.worksheetParametersTransferService.timeSeriesType+'",';
    newSheetJson=newSheetJson+'"series": "'+this.worksheetParametersTransferService.startRange+'",';
    newSheetJson=newSheetJson+'"series": "'+this.worksheetParametersTransferService.endRange+'",},';

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
