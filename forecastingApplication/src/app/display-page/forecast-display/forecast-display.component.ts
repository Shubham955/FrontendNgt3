import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormRecord } from '@angular/forms';
import { Router } from '@angular/router';
import { WorksheetParametersTransferService } from 'src/app/services/worksheet-parameters-transfer.service';
import { Field } from 'src/app/field';
import { Sheet } from 'src/app/sheet';
import { SheetEntry } from 'src/app/sheetentry';
import { Time } from 'src/app/time';

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

  jsonData={
    "levels": {
      "level1": "Country",
      "level2": "Gender",
      "level3": "Age Group",
      "series": "year",
      "range-start": "2019",
      "range-end": "2023"
    },
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
    console.log(this.isOldWorksheet)
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
}
