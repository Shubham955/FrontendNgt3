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
  loadForm!: FormGroup;
  message:string=''

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
    this.loadForm = this.formBuilder.group({
      sheetName : [,[Validators.required,Validators.pattern(this.wordRegex)]]
    })
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

  onLevelNameEdit(event: Event, i: number){
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
    this.levelNameArr[i]=value;
  }

  onLevelCountEdit(event: Event, i: number){
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
    const intValue=parseInt(value);
    this.levelCountArr[i]=intValue;
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
 
//comment next line before push --------------------------------------------------------------
     this.router.navigate(['/worksheet']);
//uncomment next few lines ----------------------------------------------------------------
    // this.forecastManagementService.saveTableSchema(creationJsonData).subscribe({
    //   next: (result)=>{
    //     console.log("result fetched",result);
    //     // on success notify
    //     this.worksheetParametersTransferService.notify(`Sheet with Name: "${result['tableName']}" has been created successfully!!`); 
    //     this.router.navigate(['/worksheet']);
    //   },
    //   error: (error)=>{
    //     console.log(error)
    //     console.log(error.error.message)
    //     if(error.status == 400){
    //     this.message = error.error.message
    //     }else{
    //       this.message="Something went wrong...please try again later!"
    //     }
    //     this.sheetNameExists=true;
    //     this.router.navigate(['/']);
    //   }
    // })
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

  loadWorkSheet(){
    const tableName = this.loadForm.value.sheetName;
    this.forecastManagementService.getTableSchema(tableName).subscribe(
      (res)=>{
        this.worksheetParametersTransferService.jsonSchemaCreate = res;
        this.worksheetParametersTransferService.levelNames = [];
        this.worksheetParametersTransferService.levelCount = 0;
        this.worksheetParametersTransferService.endRange = res["time"]["end"];
        this.worksheetParametersTransferService.startRange = res["time"]["start"];
        this.worksheetParametersTransferService.timeSeriesType = res["time"]["series"];
        res["fields"].forEach((field: any)=>{
          this.worksheetParametersTransferService.levelNames.push(field);
          this.worksheetParametersTransferService.levelCount+=1;
        })
        this.worksheetParametersTransferService.loadingSheet = true;        
      },
      (err) =>{
        console.error(err);
      },
      ()=>{
        this.router.navigate(["/worksheet"]);
      }
    )
  } 
}
