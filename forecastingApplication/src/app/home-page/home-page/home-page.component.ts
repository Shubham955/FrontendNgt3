import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { WorksheetParametersTransferService } from 'src/app/services/worksheet-parameters-transfer.service';

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

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private worksheetParametersTransferService:WorksheetParametersTransferService) { }

  ngOnInit(): void {
    this.worksheetForm = this.formBuilder.group({
      timeSeriesType: [, [Validators.required]],
      startRange: [, [Validators.required]],
      endRange: [, [Validators.required]]
    });
    this.addLevelForm=this.formBuilder.group({
      levelName: [,[Validators.required]],
      levelValue: [,[Validators.required]]
    });
  }

  //sets rating dropdown value 
  onSelected(event: any) {
    this.worksheetForm['timeSeriesType']?.setValue(event.target.value, {
      onlySelf: true,
    });
  }

  saveLevel(){
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
    this.worksheetParametersTransferService.endRange=this.worksheetForm.value.endRange;
    this.worksheetParametersTransferService.startRange=this.worksheetForm.value.startRange;
    this.worksheetParametersTransferService.timeSeriesType=this.worksheetForm.value.timeSeriesType;
    this.worksheetParametersTransferService.levelNames=this.levelNameArr;
    this.worksheetParametersTransferService.levelCount=this.levelCountArr;

    this.router.navigate(['/worksheet']);
  }
}
