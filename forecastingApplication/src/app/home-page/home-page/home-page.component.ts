import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { WorksheetParametersTransferService } from 'src/app/services/worksheet-parameters-transfer.service';
import { ForecastManagementService } from 'src/app/services/forecast-management.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  levelNumber: number = 0;
  worksheetForm!: FormGroup;
  addLevelForm!: FormGroup;
  isLevelToBeAdded: boolean=false;
  levelNoArr: any = [];
  levelNameArr: any=[];
  levelCountArr:any=[];
  sheetNameExists: boolean=false;
  wordRegex = "^[a-zA-Z]*$";
  numericRegex= "^[1-9]+[0-9]*$";
  addLevelErrorsExist: boolean=false;
  createSheetFormErrorsExist: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private worksheetParametersTransferService:WorksheetParametersTransferService,
    private forecastManagementService: ForecastManagementService) { }

  ngOnInit(): void {
    this.worksheetForm = this.formBuilder.group({
      sheetName: [, [Validators.required]],
      timeSeriesType: [, [Validators.required]],
      startRange: [, [Validators.required, Validators.pattern(this.numericRegex)]],
      endRange: [, [Validators.required, Validators.pattern(this.numericRegex)]]
    });
    this.addLevelForm=this.formBuilder.group({
      levelName: [,[Validators.required, Validators.pattern(this.wordRegex)]],
      levelValue: [,[Validators.required, Validators.pattern(this.numericRegex)]]
    });
  }

  getWorksheetFormControl(name:any):AbstractControl | null{
    return this.worksheetForm.get(name);
  }

  getAddLevelControl(name:any):AbstractControl | null{
    return this.addLevelForm.get(name);
  }

  //sets rating dropdown value 
  onSelected(event: any) {
    this.worksheetForm['timeSeriesType']?.setValue(event.target.value, {
      onlySelf: true,
    });
  }

  saveLevel(){
    if(this.addLevelForm.invalid){
      this.addLevelErrorsExist=true;
      return;
    }
    this.addLevelErrorsExist=false;
    console.log(this.addLevelForm.value.levelName,"addForm",this.addLevelForm.value.levelValue);
    this.levelNumber = this.levelNumber + 1;
    this.levelNoArr.push(this.levelNumber);
    this.levelNameArr.push(this.addLevelForm.value.levelName);
    this.levelCountArr.push(this.addLevelForm.value.levelValue);
    this.isLevelToBeAdded=false;
    this.addLevelForm.reset();
  }

  add() {
    this.isLevelToBeAdded=true;
  }

  createWorksheet() {
    if(this.worksheetForm.invalid){
      this.createSheetFormErrorsExist=true;
      return;
    }
    this.createSheetFormErrorsExist=false;
    this.worksheetParametersTransferService.sheetName=this.worksheetForm.value.sheetName;
    this.worksheetParametersTransferService.endRange=this.worksheetForm.value.endRange;
    this.worksheetParametersTransferService.startRange=this.worksheetForm.value.startRange;
    this.worksheetParametersTransferService.timeSeriesType=this.worksheetForm.value.timeSeriesType;
    this.worksheetParametersTransferService.levelNames=this.levelNameArr;
    this.worksheetParametersTransferService.levelCount=this.levelCountArr;

    let creationJsonData=this.getCreationTimeJson();

    this.worksheetParametersTransferService.jsonSchemaCreate=creationJsonData;
    this.forecastManagementService.saveTableSchema(creationJsonData).subscribe((result)=>{
      console.log("result fetched",result);
      if(result==-1){
        this.sheetNameExists=true;
      } else {
        this.router.navigate(['/worksheet']); 
      }
    }); 
    //this.router.navigate(['/worksheet']);
  }

  getCreationTimeJson(){
    let jsonSheetCreate='{"tableName": '+this.worksheetParametersTransferService.sheetName+',"fields": [';
    //all levels filled in fields section
    for(let i=0;i<this.worksheetParametersTransferService.levelNames.length;i++){
      jsonSheetCreate=jsonSheetCreate+'{ "name": '+this.worksheetParametersTransferService.levelNames[i]+', "type": "String", "numberOfValues": '+this.worksheetParametersTransferService.levelCount[i]+' },';
    }
    //data filled in fields section
    jsonSheetCreate=jsonSheetCreate+'{ "name": "data", "type": "Object" }], "time" : {';
    //time values filling
    jsonSheetCreate=jsonSheetCreate+'"series" : '+this.worksheetParametersTransferService.timeSeriesType+',';
    jsonSheetCreate=jsonSheetCreate+'"start" : '+this.worksheetParametersTransferService.startRange+',';
    jsonSheetCreate=jsonSheetCreate+'"end" : '+this.worksheetParametersTransferService.endRange+'}  }'; 

    console.log(jsonSheetCreate);

    let jsonSheet = {};
    jsonSheet["tableName"]= this.worksheetParametersTransferService.sheetName;
    
    let fieldArray=[];
    for(let i=0;i<this.worksheetParametersTransferService.levelNames.length;i++){
      let obj= {}
      obj["name"]= this.worksheetParametersTransferService.levelNames[i];
      obj["type"]= "String";
      obj["numberOfValues"]= this.worksheetParametersTransferService.levelCount[i];
      fieldArray.push(obj);
    }
    fieldArray.push({"name": "data", "type":"Object"});

    jsonSheet["fields"] = fieldArray;

    jsonSheet["time"] = {
      "series": this.worksheetParametersTransferService.timeSeriesType,
      "start": this.worksheetParametersTransferService.startRange,
      "end": this.worksheetParametersTransferService.endRange
    }

    console.log(jsonSheet)

    return jsonSheet;
  }
}
