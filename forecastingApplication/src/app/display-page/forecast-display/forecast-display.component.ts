import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormRecord, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorksheetParametersTransferService } from 'src/app/services/worksheet-parameters-transfer.service';
import { Field } from 'src/app/field';
import { Sheet } from 'src/app/sheet';
import { SheetEntry } from 'src/app/sheetentry';
import { Time } from 'src/app/time';
import { ForecastManagementService } from 'src/app/services/forecast-management.service';
import { groupBy, reduce } from 'rxjs/operators';
import { from, pipe } from 'rxjs';


@Component({
  selector: 'app-forecast-display',
  templateUrl: './forecast-display.component.html',
  styleUrls: ['./forecast-display.component.css'],
})
export class ForecastDisplayComponent implements OnInit {
  levelNamesArr: any = [];
  timeRangeArr: any = [];
  fetchSheetForm!: FormGroup;
  isFetchRequested: boolean = false;
  wrongSheetName: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public worksheetParametersTransferService: WorksheetParametersTransferService,
    private forecastManagementService: ForecastManagementService) { }

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

  // jsonDataLevels = {
  //   "sheet": [
  //     {
  //       "country": "a",
  //       "gender": "male",
  //       "age": "20-40",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     },
  //     {
  //       "country": "a",
  //       "gender": "male",
  //       "age": "40-60",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     },
  //     {
  //       "country": "a",
  //       "gender": "female",
  //       "age": "20-40",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     },
  //     {
  //       "country": "a",
  //       "gender": "female",
  //       "age": "40-60",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     },
  //     {
  //       "country": "b",
  //       "gender": "male",
  //       "age": "20-40",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     },
  //     { 
  //       "country": "b",
  //       "gender": "male",
  //       "age": "40-60",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     },
  //     {
  //       "country": "b",
  //       "gender": "female",
  //       "age": "20-40",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     },
  //     {
  //       "country": "b",
  //       "gender": "female",
  //       "age": "40-60",
  //       "data": {
  //         "2019": 0,
  //         "2020": 0,
  //         "2021": 0
  //       }
  //     }
  //   ]
  // };

  ngOnInit(): void {
    //fetch sheet form
    this.fetchSheetForm = this.formBuilder.group({
      sheetName: [, [Validators.required]]
    });
    this.getYearRange();
    this.populateParameters();
    this.outputObjectJson = this.generateSheet(this.inputObject);
    console.log("output obj in string form", JSON.stringify(this.outputObjectJson));
    this.initializeLevelTotals();
  }

  //to get fields of form
  //function name: after colon is return type of function that provides error detecting properties
  getControl(name: any): AbstractControl | null {
    return this.fetchSheetForm.get(name);
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

  //populates level name array
  populateParameters() {
    this.inputObject.fields.slice(0, -1).forEach((ele: { name: any; }) => {
      console.log("input obj field", ele);
      this.levelNamesArr.push(ele.name);
    });
  }

  //fetch button clicked
  fetchClicked() {
    this.isFetchRequested = true;
  }

  //open sheet code related function
  loadWorksheet() {
    this.forecastManagementService.getTableSchema(this.worksheetParametersTransferService.sheetName).subscribe((result) => {
      if (result == -1) {
        this.wrongSheetName = true;
      } else {
        this.inputObject = result;
        //using input object year range and nameArray filled
        this.getYearRange();
        this.populateParameters();
        this.forecastManagementService.getTableData(this.worksheetParametersTransferService.sheetName).subscribe((fetchedTableData) => {
          this.outputObjectJson = fetchedTableData;
        });
      }
    });
    //fetch form closed
    this.isFetchRequested = false;
  }

  onCellEdit(event: Event, key: string, item: any) {
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
      if ((event as KeyboardEvent).key === 'Backspace' || (event as KeyboardEvent).key === 'Delete') {
        event.preventDefault();
        const newValue : string =  ( event as KeyboardEvent).key === 'Backspace' ? value.slice(0,-1) : ""; 
        // Process value or perform necessary actions
        // Update your data accordingly
        item[key] = newValue; // Update the value in your data
      }
    if (key === 'data') { //change in data values
      item.data[key] = parseInt(value, 10);
    } else { //change in label values
      const originalValue = item[key];
      item[key] = value;
      this.updateOtherItems(key, originalValue, value);
    }
    console.log("edit occured", this.outputObjectJson);
    this.initializeLevelTotals();
  }

  updateOtherItems(key: string, oldValue: string, newValue: string) {
    this.outputObjectJson.sheet.forEach((item: { [x: string]: string; }) => {
      if (item[key] === oldValue) {
        item[key] = newValue;
      }
    });
  }

  getKey(item: SheetEntry) {
    let key = ""
    const lastLevel = this.levelNamesArr[this.levelNamesArr.length - 1];
    for (const objKey in item) {
      if (objKey !== "data" && objKey !== lastLevel) {
        key = key + `${item[objKey]}-`
      }
    }
    key = key.slice(0, key.length - 1);
    console.log("itttttt", key);
    return key;
  }

  // Function to get the key for a specific level in the current row
  getLevelKey(item: SheetEntry, level: string): string {
    return this.levelNamesArr.slice(0, this.levelNamesArr.indexOf(level) + 1).map((name: string | number) => item[name]).join("-");
  }

  levelTotals = {};

  // Function to initialize the level totals object
  initializeLevelTotals() {
    this.levelTotals = {};

    this.outputObjectJson.sheet.forEach((entry: SheetEntry) => {
      this.levelNamesArr.forEach((level: string) => {
        const levelKey = this.getLevelKey(entry, level);
        if (!this.levelTotals[levelKey]) {
          this.levelTotals[levelKey] = new Array(this.timeRangeArr.length).fill(0);
        }

        for (let i = 0; i < this.timeRangeArr.length; i++) {
          this.levelTotals[levelKey][i] += entry.data[this.timeRangeArr[i]] || 0;
        }
      });
    });
    console.log("totals array", this.levelTotals);

  }

  fillCurrentTotalArray(prevKey: string, nextKey: string) {
    console.log("start of diff curr total arra", prevKey, "nextkey", nextKey);
    let currentDiffTotalRows = [];
    try {
      while (prevKey !== nextKey) {
        let obj = {};

        let splittedKey = prevKey.split('-');
        obj['colOffset'] = splittedKey.length - 1;
        obj['remainingLevels'] = this.levelNamesArr.length - splittedKey.length;
        //generating male Total, female Total words etc
        obj['totalColName'] = splittedKey[splittedKey.length - 1] + " " + "Total";
        obj['totalColValue'] = this.levelTotals[prevKey];
        currentDiffTotalRows.push(obj);

        //-1 means last element mentioned and splice excludes 2nd index element
        splittedKey = splittedKey.slice(0, -1);
        prevKey = splittedKey.join('-');

        let splittedNextKey = nextKey.split('-');
        splittedNextKey = splittedNextKey.slice(0, -1);
        nextKey = splittedNextKey.join('-');
        console.log("rejoined", prevKey, "next key", nextKey);
      }
      console.log("cur tot arr", currentDiffTotalRows);
    }
    catch (error) {
      console.log("err caught ", error);
    }
    return currentDiffTotalRows;
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
            sheetEntry['data'][year.toString()] = Math.floor(Math.random() * 10); // Initialize data for each year to 0
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
        sheetEntry['data'][year.toString()] = 0;
      }

      combinationCounts[combinationKey]++;
      outputObject.sheet.push(sheetEntry);
    });

    const totals: any = {};

    outputObject.sheet.forEach((entry: any) => {
      const key = `${entry.country}-${entry.gender}`;

      if (!totals[key]) {
        totals[key] = {};
      }

      for (const year in entry.data) {
        if (!totals[key][year]) {
          totals[key][year] = 0;
        }

        totals[key][year] += entry.data[year];
      }
    });

    console.log(totals);

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
