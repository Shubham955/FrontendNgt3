import { ChangeDetectorRef, Component, OnChanges, OnInit } from '@angular/core';
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
  isDataFieldEdited: boolean = false;
  firstTimeIntervalNotFilled: boolean = false;
  isSavedIntoDatabase: boolean = false;
  message: string = '';
  loadSpinner: boolean = false;
  selected : Array<any> = [];
  copied : Array<any> = [];

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public worksheetParametersTransferService: WorksheetParametersTransferService,
    private forecastManagementService: ForecastManagementService,
    private changeDetectorRef: ChangeDetectorRef) { }
  inputObject = this.worksheetParametersTransferService.jsonSchemaCreate;
  outputObjectJson: any;

  ngOnInit(): void {
    // get notification
    this.notify();
    //fetch sheet form
    this.fetchSheetForm = this.formBuilder.group({
      sheetName: [, [Validators.required]]
    });
    this.getYearRange();
    this.populateParameters();
    if (this.worksheetParametersTransferService.loadingSheet) {
      this.forecastManagementService.getTableData(this.worksheetParametersTransferService.jsonSchemaCreate["tableName"]).subscribe(
        (res) => {
          this.outputObjectJson = res;
          this.initializeLevelTotals();
          this.isSavedIntoDatabase = true;
          console.log(res);
          
        }
      )
    } else {
      this.outputObjectJson = this.generateSheet(this.inputObject);
      this.initializeLevelTotals();
      this.forecastManagementService.saveTableSchema(this.inputObject).subscribe(
        () => {
          console.log("Schema Saved");

        }
      );
    }
    console.log("output obj in string form", JSON.stringify(this.outputObjectJson));

  }

  notify() {
    this.message = this.worksheetParametersTransferService.getNotification();
    this.eraseNotification()
  }
  eraseNotification() {
    setTimeout(() => {
      this.message = ''
    }, 3000);
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
    //change in label values
    const originalValue = item[key];
    item[key] = value;
    this.updateOtherItems(key, originalValue, value);
    console.log("edit occured", this.outputObjectJson);
    this.initializeLevelTotals();
  }

  onDataCellEdit(event: Event, key: string, item: any) {
    this.isDataFieldEdited = true;
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
    //change in data values
    item.data[key] = parseFloat(value);
    console.log("data edit occured", this.outputObjectJson);
    this.initializeLevelTotals();
  }

  updateOtherItems(key: string, oldValue: string, newValue: string) {
    this.outputObjectJson.sheet.forEach((item: { [x: string]: string; }) => {
      if (item[key] === oldValue) {
        item[key] = newValue;
      }
    });
  }

  onTotalCellEdit(event: Event, j: number, item: any, data: any) {
    //to understand this first check reasoning of fillCurrentTotalArray
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
    //converts value in total cell to float
    const intValue = parseFloat(value);

    // second last level total has got changed 
    // (colOffset is empty cells before this Total Cell eg CountryTotal being level 1 leaves 0 cell before it) 
    // suppose there are 4 levels then second last total is after TotalLevels-2 cells
    // suppose there are 3 levels then second last total is again after TotalLevels-2 cells
    if (data['colOffset'] == this.levelNamesArr.length - 2) {
      //itemKey generated
      let itemKeyCopy = this.getKey(item);
      this.adjustSecondLastLevelTotal(intValue, j, itemKeyCopy);
    } else {//last level does not has total cell so below is for level behind second last level
      //item key genrated
      //because suppose 5 level sheet created with levels Country	Gender	Age	City	Religion with 2 count each
      //Gender1 total will be in both country1 and country2 so to identify whose total has got edited
      //and once we know whose total country1-gender1 or country2-gender1 has got edited then we can 
      //know where to drill down
      let itemKey = this.getKey(item);
      let itemKeyArr = itemKey.split('-');
      
      //array is 0 indexed but levels in real are 1 indexed
      //below line is itemKey is reduced in size till level whose total has got changed
      //suppose key is Country2-Gender2-Age2-City2 and gender2Total's jth year value has changed
      //then we are reducing key to country2-gender2
      //data['colOffset] for gender2Total will be 1 as only 1 empty cell will be before it
      //itemKeyArr is 0 indexed based and has values Country2,Gender2,Age2,City2
      //so we want Country2-Gender2 so itemKeyArr spliced to 0,1+1 as 2nd parameter in splice is 
      //excluded
      let curTotalKey = itemKeyArr.splice(0, data['colOffset'] + 1).join('-');

      //3rd param curLevel is kept 1 indexed that's why data['colOffset]+1
      this.adjustOtherLevelTotal(intValue, j, data['colOffset'] + 1, curTotalKey);
    }
  }

  adjustSecondLastLevelTotal(value: number, j: number, curItemKey: string) {
    let currLevelTotalKey = curItemKey;
    let reqdTotalArr: any[] = [];
    let yearLessTotalArr: any[] = [];
    let changedYear = this.timeRangeArr[j];
    let prevYearExists = j == 0 ? false : true;

    //here logic is that if suppose 2015 to 2017 years present and suppose 2016 total changed
    //then if 2016 has any non zero value then we will take ratios of 2016 otherwise ratios of
    //it's previous year

    //firstly assumption that we will use prevYear logic and if any non zero value found in 2016 year
    //then useYearLessTotal made false
    let useYearLessTotal = true;
    //as this is second level total so suppose in 5 level chart if
    //curLevelTotalKey=Country1-Gender2-Age2-City2
    //then next level i.e Religion will also have same key so iterating outputObjectJson we will
    //find items with same key take their existing values and also existing values of prevYear
    //if any non zero value found in jth year (year whose total has got changed) then use ratios of
    //current year else previous year
    this.outputObjectJson.sheet.forEach((iterItem: SheetEntry) => {
      if (currLevelTotalKey === this.getKey(iterItem)) {
        reqdTotalArr.push(iterItem.data[changedYear]);
        if (prevYearExists) {
          yearLessTotalArr.push(iterItem.data[changedYear - 1]);
        }
        if (iterItem.data[changedYear] != 0) {
          useYearLessTotal = false;
        }
      }
    });

    //now we know which array to use (if useYearLessTotal is still true then a safety check that
    //whether previous year exists)
    if (useYearLessTotal && prevYearExists) {
      reqdTotalArr = yearLessTotalArr;
    }

    //based on existing/previous year values sum calculated
    let reqdTotalArrSum = reqdTotalArr.reduce((acc, curValue) => acc + curValue, 0);
    //user given total distributed in ratios as in existing/previous year values array
    reqdTotalArr = reqdTotalArr.map((x) => x * value / reqdTotalArrSum);
    
    //this updates updated last level totals in dom by using map function
    this.updateSheetWithAdjustedValues(currLevelTotalKey, changedYear, reqdTotalArr)
    
    console.log("after second last total adjust", this.outputObjectJson);
    
    //totals once again initialized 
    this.initializeLevelTotals();
  }

  private updateSheetWithAdjustedValues(currLevelTotalKey: string, changedYear: any, reqdTotalArr: number[]) {
    //output object json, item that match our currLevelTotalKey, these items jth year data changed
    //rest kept same and whole updatedSheet stored in updatedSheet
    const updatedSheet = this.outputObjectJson.sheet.map((iterItem: SheetEntry) => {
      if (currLevelTotalKey === this.getKey(iterItem)) {
        return {
          ...iterItem,
          data: {
            ...iterItem.data,
            [changedYear]: (reqdTotalArr.shift() || 0),
          },
        };
      }
      return iterItem;
    });

    //output object json also spread and sheet updated with updated values
    this.outputObjectJson = {
      ...this.outputObjectJson,
      sheet: updatedSheet,
    };

    //below reflects changed values on dom
    this.changeDetectorRef.detectChanges();
  }

  adjustOtherLevelTotal(intValue: number, j: number, curLevel: number, curTotalLevelKey: string) {
    //explaining params
    //intValue:- value changed in total
    //j:- year index in levelTotals[levelTotals ki keys] array
    //curLevel:- level number whose total has got changed (here i have kept curLevel 1 indexed)
    //curTotalLevelKey:- item key till curLevel

    //nextLevel is nextLevel in which we want to distribute intValue
    let nextLevelNum = curLevel + 1;

    let yearLessTotalArr: any[] = [];
    let prevYearExists = j == 0 ? false : true;

    //useYearLessTotal has same logic as in secondLastLevelTotal that non zero value wala
    let useYearLessTotal = true;

    let nextLevelTotal: any[] = [];

    //here levelTotals array iterated
    //suppose curTotalLeveLKey=Country2-Gender2
    //then this changed total has to get distributed in AGe level having keys=Country2-Gender2-Age1 and Country2-Gender2-Age2
    
    //logic is iterate levelTotals find keys which start with curTotalLevelKey and have length equal to nextLevelNum
    for (const levelTotalKey in this.levelTotals) {
      if (levelTotalKey.startsWith(curTotalLevelKey) && levelTotalKey.split('-').length == nextLevelNum) {
        nextLevelTotal.push(this.levelTotals[levelTotalKey][j]);

        if (prevYearExists) {
          yearLessTotalArr.push(this.levelTotals[levelTotalKey][j - 1]);
        }
        if (this.levelTotals[levelTotalKey][j] != 0) {
          useYearLessTotal = false;
        }
      }
    }

    if (useYearLessTotal && prevYearExists) {
      nextLevelTotal = yearLessTotalArr;
    }

    let nextLevelTotalSum = nextLevelTotal.reduce((acc, curValue) => acc + curValue, 0);
    nextLevelTotal = nextLevelTotal.map((x) => x * intValue / nextLevelTotalSum);

    //reallocate to key in totals which satisfied our condition so same condition
    for (const levelTotalKey in this.levelTotals) {
      if (levelTotalKey.startsWith(curTotalLevelKey) && levelTotalKey.split('-').length == nextLevelNum) {
        console.log("CALL AHEAD to", nextLevelNum);
        //satisfied key given distributed int value as per it's ratio
        this.levelTotals[levelTotalKey][j] = nextLevelTotal.shift();

        //if nextLevel is secondLast then secondLast adjust called else adjOther again
        if ((nextLevelNum == this.levelNamesArr.length - 1)) {
          this.adjustSecondLastLevelTotal(this.levelTotals[levelTotalKey][j], j, levelTotalKey);
        } else {
          this.adjustOtherLevelTotal(this.levelTotals[levelTotalKey][j], j, nextLevelNum, levelTotalKey);
        }
      }
    }
  }

  onGrandTotalEdit(event: Event, j: number) {
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
    const intValue = parseFloat(value);

    let nextLevelNum = 1;
    let yearLessTotalArr: any[] = [];
    let prevYearExists = j == 0 ? false : true;
    let useYearLessTotal = true;//false;
    let nextLevelTotal: any[] = [];

    //same logic as adjustOtherLevel
    //here length should be equal to nextLevelNum i.e 1 here but key should not be GrandTotal as 
    //it's length is also 1
    for (const levelTotalKey in this.levelTotals) {
      if (levelTotalKey.split('-').length == nextLevelNum && levelTotalKey != 'GrandTotal') {
        nextLevelTotal.push(this.levelTotals[levelTotalKey][j]);
        if (prevYearExists) {
          yearLessTotalArr.push(this.levelTotals[levelTotalKey][j - 1]);
        }
        if (this.levelTotals[levelTotalKey][j] != 0) {//&& prevYearExists
          useYearLessTotal = false;//true;
        }
        console.log("GRAND TOTAL ADJUST me iterTotal hai yeh", levelTotalKey, "year data fetched", nextLevelTotal[j]);
      }
    }

    if (useYearLessTotal && prevYearExists) {
      nextLevelTotal = yearLessTotalArr;
    }

    let nextLevelTotalSum = nextLevelTotal.reduce((acc, curValue) => acc + curValue, 0);
    nextLevelTotal = nextLevelTotal.map((x) => x * intValue / nextLevelTotalSum);

    //reallocate to key in totals
    for (const levelTotalKey in this.levelTotals) {
      if (levelTotalKey.split('-').length == nextLevelNum && levelTotalKey != 'GrandTotal') {
        this.levelTotals[levelTotalKey][j] = nextLevelTotal.shift();

        console.log("GrToAd CALL AHEAD to", nextLevelNum);

        //if only 2 levels then grand total has to be distributed to next level which is second last
        //level
        if (this.levelNamesArr.length == 2) {
          this.adjustSecondLastLevelTotal(this.levelTotals[levelTotalKey][j], j, levelTotalKey);
        } else {
          this.adjustOtherLevelTotal(this.levelTotals[levelTotalKey][j], j, nextLevelNum, levelTotalKey);
        }
      }
    }
  }


  getKey(item: SheetEntry) {
    let key = ""
    const lastLevel = this.levelNamesArr[this.levelNamesArr.length - 1];
    for (const objKey in item) {
      if (objKey !== "data" && objKey !== lastLevel && objKey != "_id") {
        key = key + `${item[objKey]}-`
      }
    }
    key = key.slice(0, key.length - 1);
    return key;
  }

  // Function to get the key for a specific level in the current row
  getLevelKey(item: SheetEntry, level: string): string {
    return this.levelNamesArr.slice(0, this.levelNamesArr.indexOf(level) + 1).map((name: string | number) => item[name]).join("-");
  }

  //levelTotals store levelFor each key
  levelTotals = {};
  //sample of level totals
//   Country1:(4) [0, 0, 0, 0]
// Country1-Gender1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age1-City1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age1-City1-Religion1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age1-City1-Religion2: (4) [0, 0, 0, 0]
// Country1-Gender1-Age1-City2: (4) [0, 0, 0, 0]
// Country1-Gender1-Age1-City2-Religion1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age1-City2-Religion2: (4) [0, 0, 0, 0]
// Country1-Gender1-Age2: (4) [0, 0, 0, 0]
// Country1-Gender1-Age2-City1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age2-City1-Religion1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age2-City1-Religion2: (4) [0, 0, 0, 0]
// Country1-Gender1-Age2-City2: (4) [0, 0, 0, 0]
// Country1-Gender1-Age2-City2-Religion1: (4) [0, 0, 0, 0]
// Country1-Gender1-Age2-City2-Religion2: (4) [0, 0, 0, 0]
// Country1-Gender2: (4) [0, 0, 0, 0]
// ....so on and ends with next line
// GrandTotal: (4) [0, 0, 0, 0]

  // Function to initialize the level totals object
  initializeLevelTotals() {
    this.levelTotals = {};
    const grandTotalKey = 'GrandTotal';
    if (!this.levelTotals[grandTotalKey]) {
      this.levelTotals[grandTotalKey] = new Array(this.timeRangeArr.length).fill(0);
    }
    this.outputObjectJson.sheet.forEach((entry: SheetEntry) => {
      this.levelNamesArr.forEach((level: string) => {
        const levelKey = this.getLevelKey(entry, level);
        if (!this.levelTotals[levelKey]) {
          this.levelTotals[levelKey] = new Array(this.timeRangeArr.length).fill(0);
        }

        for (let i = 0; i < this.timeRangeArr.length; i++) {
          this.levelTotals[levelKey][i] += entry.data[this.timeRangeArr[i]] || 0;
          if (levelKey.split("-").length === 1) {
            this.levelTotals[grandTotalKey][i] += entry.data[this.timeRangeArr[i]] || 0;
          }
        }
      });
    });

    console.log("totals array", this.levelTotals);
  }

  fillCurrentTotalArray(prevKey: string, nextKey: string) {
    //below variable stores total of all levels that are different in prevKey and nextKey 
    let currentDiffTotalRows = [];
    //below for grand total (And grand total gets written when last item of outputJson is being executed)
    if (prevKey == '' && nextKey == '') {
      let obj = {};
      obj['totalColValue'] = this.levelTotals['GrandTotal'];
      currentDiffTotalRows.push(obj);
      return currentDiffTotalRows;
    }
    //below for other Total values
    try {
      //suppose prevKey=Country1-Gender2-Age2-City2
      //suppose nextKey=Country2-Gender1-Age1-City1
      //now untill prev and next key are not different repeat loop
      //REASON of prev line (
      //suppose prevKey=Country1-Gender1-Age1-City1(in 5 level chart line 2)
      //suppose nextKey=Country1-Gender1-Age1-City2(in 5 level chart line 3)
      //as above 2 key differ in these 2 keys by just 1 level so here after line 2 City1 total will come
      //)
      //so Prevkey me jahan par bhi next key differ karegi wahan PrevKey se jo level different mila 
      //uska total wali row aayegi
      while (prevKey !== nextKey) {
        let obj = {};

        let splittedKey = prevKey.split('-');
        //suppose in 5 levels prevKey=Country1-Gender1-Age2-City2
        //nextKey=Country1-Gender2-Age1-City1
        //now city1 total row will look like
        //3 empty cells then city1 total then 1 empty cell and then data cells
        //colOffset represents starting empty cells which will be splittedKey.length-1
        //here splittedKey length is 4 so 4-1=3
        obj['colOffset'] = splittedKey.length - 1;
        //remaining levels represent empty celss after Total cell
        //remaining levels here is LevelCount-splittedKey.length
        obj['remainingLevels'] = this.levelNamesArr.length - splittedKey.length;
        //generating male Total, female Total words etc
        //lastWord in splittedKey array tells that which level total we have to write
        obj['totalColName'] = splittedKey[splittedKey.length - 1] + " " + "Total";
        //setting total value from levelTotals
        obj['totalColValue'] = this.levelTotals[prevKey];
        currentDiffTotalRows.push(obj);

        //-1 means last element mentioned and splice excludes 2nd index element
        //below 2 lines changes prevKey to Country1-Gender1-Age2
        splittedKey = splittedKey.slice(0, -1);
        prevKey = splittedKey.join('-');

        //below 3 lines change nextKey to Country1-Gender2-Age1
        let splittedNextKey = nextKey.split('-');
        splittedNextKey = splittedNextKey.slice(0, -1);
        nextKey = splittedNextKey.join('-');

        //now prevKey and nextKey lengths have changed so in next iteration this will affect
        //colOffset and remainingLevels shifting our next Totals one one cell back
        console.log("rejoined", prevKey, "next key", nextKey);
      }
      //logging all the totals this PrevKey and nextKey have generated
      console.log("cur tot arr", currentDiffTotalRows);
    }
    catch (error) {
      console.log("err caught ", error);
    }
    //this list of generated totals is returned and used to genrate rows
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



  saveSheet() {
    this.loadSpinner = !this.loadSpinner;
    let tableName = this.worksheetParametersTransferService.sheetName;
    if (!this.isSavedIntoDatabase) {
      this.forecastManagementService.saveTableData(tableName, this.outputObjectJson).subscribe((result) => {
        let i = 0;
        for (let obj of result["sheet"]) {
          this.outputObjectJson.sheet[i] = { ...this.outputObjectJson.sheet[i], "_id": obj["_id"] }
          i++;
        }
        this.isSavedIntoDatabase = !this.isSavedIntoDatabase;
        console.log(this.outputObjectJson)
        this.loadSpinner = !this.loadSpinner;
        this.message = "Data saved into Database successfully!!";
        this.eraseNotification()
      }, (error) => {
        this.message = "Something went wong..."
        this.eraseNotification();
      })

    } else {
      // update the db
      this.forecastManagementService.updateTableData(tableName, this.outputObjectJson).subscribe((result) => {
        console.log(result)
        this.loadSpinner = !this.loadSpinner;
        this.message = "Data saved into Database successfully!!";
        this.eraseNotification()
      }, (error) => {
        this.message = "Something went wrong..."
        this.eraseNotification();
      })

    }
  }

  selectCell($event: MouseEvent,year: number,item : SheetEntry) {
    if($event.shiftKey){
      let selectedCell = {}
      selectedCell["cell"] = item;
      selectedCell["year"] = year;
      this.selected.push(selectedCell);
      console.log("selected",this.selected);
    }
  }

  handleKeyDown($event: KeyboardEvent,year: number,item : SheetEntry) {
    if($event.ctrlKey && $event.key === 'c'){
      if(this.selected.length){
        $event.preventDefault()
      }
      this.copied = {...this.selected};
      this.selected = [];
      console.log("copy",this.copied);
      console.log("select",this.selected);
    }
    else if($event.ctrlKey && $event.key === 'v'){
      for (let index = 0; index < this.selected.length; index++) {
        this.selected[index]["cell"].data[this.selected[index]["year"]] = this.copied[index]["cell"].data[this.copied[index]["year"]]
      }
      this.selected = [];
      this.copied = [];
    }
  }

  checkSelected(item : SheetEntry , year : number){
    for (let index = 0; index < this.selected.length; index++) {
      if(this.selected[index]["cell"] == item && this.selected[index]["year"] == year ){
        return true;
      };
    }
    return false;
  }

  checkCopied(item : SheetEntry , year : number){
    for (let index = 0; index < this.copied.length; index++) {
      if(this.copied[index]["cell"] == item && this.copied[index]["year"] == year ){
        return true;
      };
    }
    return false;
  }
}
