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
export class ForecastDisplayComponent implements OnInit {
  levelNamesArr: any = [];
  timeRangeArr: any = [];
  levelCountArr: any = [];
  years: any = [];
  isOldWorksheet: boolean = false;
  levelNameValueArr: any = [];

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public worksheetParametersTransferService: WorksheetParametersTransferService) { }


//   jsonData={
//     "levels": {
//       "level1": "Country",
//       "level2": "Gender",
//       "level3": "Age Group",
//       "series": "year",
//       "range-start": "2019",
//       "range-end": "2023"
//     },
  // inputObject = {
  // "tableName": "testtabletime",
  // "fields": [
  //   { "name": "country", "type": "String", "numberOfValues": 2 },
  //   { "name": "gender", "type": "String", "numberOfValues": 2 },
  //   { "name": "age", "type": "String", "numberOfValues": 3 },
  //   { "name": "data", "type": "Object" } 
  // ],
  // "time": {
  //   "series": "year",
  //   "start": 2019,
  //   "end": 2021
  // }
  // };

  inputObject = this.worksheetParametersTransferService.jsonSchemaCreate;
  outputObjectJson: any;

//   jsonDataSchema = {
//     "tableName": "testtable",
//     "fields": [
//       { "name": "country", "type": "String" },
//       { "name": "gender", "type": "String" },
//       { "name": "size", "type": "String" },
//       { "name": "data", "type": "Object" }
//     ]
//   }

//    jsonDataLevels = {
//     "sheet": [
//       {
//         "country": "a",
//         "gender": "male",
//         "age": "20-40",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       },
//       {
//         "country": "a",
//         "gender": "male",
//         "age": "40-60",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       },
//       {
//         "country": "a",
//         "gender": "female",
//         "age": "20-40",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       },
//       {
//         "country": "a",
//         "gender": "female",
//         "age": "40-60",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       },
//       {
//         "country": "b",
//         "gender": "male",
//         "age": "20-40",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       },
//       {
//         "country": "b",
//         "gender": "male",
//         "age": "40-60",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       },
//       {
//         "country": "b",
//         "gender": "female",
//         "age": "20-40",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       },
//       {
//         "country": "b",
//         "gender": "female",
//         "age": "40-60",
//         "data": {
//           "2019": 0,
//           "2020": 0,
//           "2021": 0
//         }
//       }
//     ]
//   };

  ngOnInit(): void {
    this.getYearRange();
    this.populateParameters();
    this.outputObjectJson = this.generateSheet(this.inputObject);
    console.log("output obj in string form", JSON.stringify(this.outputObjectJson));
  }

  getYearRange() {
    const startRng = this.inputObject.time.start;
    const endRng = this.inputObject.time.end;

    // Generate an array of years from startYear to endYear
    for (let i = startRng; i <= endRng; i++) {
      this.timeRangeArr.push(i);
    }
    console.log("Time Range", this.timeRangeArr);
  }

  populateParameters() {
    //this.levelNamesArr=['Country', 'Gender', 'Age Group'];//this.worksheetParametersTransferService.levelNames;
    // this.levelCountArr=[2,2,3];//this.worksheetParametersTransferService.levelCount;
    // this.levelNameValueArr=['Country 1','Country 2','Male','Female','Age 20-40','Age 40-60','Age 60-80'];
    
    this.inputObject.fields.slice(0, -1).forEach((ele: { name: any; }) => {
      console.log("input obj field", ele);
      this.levelNamesArr.push(ele.name);
    });

  //fetch code related function
  loadWorksheet() {
    this.inputObject//=response from db while fetching
    //and then while fetching these 3 commands also to be issued as fetch button will be pressed 
    //after page has got loaded, so ngInit commands need to be repeated here
    this.getYearRange();
    this.populateParameters();
    this.outputObjectJson=this.generateSheet(this.inputObject);
  }



  generateSheet(inputObject: { fields: Field[]; time: { start: any; end: number; }; }): Sheet {
    const outputObject: Sheet = {
      sheet: [],
    };

    const combinations = this.generateCombinations(inputObject.fields);

    let combinationCounts: Record<string, number> = {}; // Keep track of counts for each combination

    combinations.forEach((combination: Field[]) => {
      const emptydata: Record<string, number> = {};
      const sheetEntry: SheetEntry = {
        data: emptydata
        ,
      };

      combination.forEach((field: Field) => {
        if (field.type === "Object") {
          for (let year = inputObject.time.start; year <= inputObject.time.end; year++) {
            sheetEntry['data'][year.toString()] = 0; // Initialize data for each year to 0
          }
        } else {
          sheetEntry[field.name] = field.value as string;
        }
      });

      const combinationKey = JSON.stringify(sheetEntry); // Use a unique key for each combination

      if (!combinationCounts[combinationKey]) {
        combinationCounts[combinationKey] = 1;
      }

      for (let year = inputObject.time.start; year <= inputObject.time.end; year++) {
        sheetEntry['data'][year.toString()] = combinationCounts[combinationKey];
      }

      combinationCounts[combinationKey]++;
      outputObject.sheet.push(sheetEntry);
    });
    console.log(outputObject);

    return outputObject;
  }

  generateCombinations(fields: Field[]): Field[][] {
    const combinations: Field[][] = [];

    const generateCombination = (currentCombination: Field[], remainingFields: Field[]): void => {
      if (remainingFields.length === 0) {
        combinations.push([...currentCombination]);
        return;
      }

      const currentField = remainingFields[0];
      remainingFields = remainingFields.slice(1);

      if (currentField) {
        const numberOfValues = currentField.numberOfValues || 1; // Default to 1 if numberOfValues is not provided

        for (let i = 0; i < numberOfValues; i++) {
          generateCombination([...currentCombination, { name: currentField.name, type: currentField.type, value: `${currentField.name}${i + 1}` }], remainingFields);
        }
      }
    };

    generateCombination([], fields);

    return combinations;
  }
}
