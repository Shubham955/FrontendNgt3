import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorksheetParametersTransferService {
  sheetName: any;
  timeSeriesType:any;
  startRange:any=2019;
  endRange:any=2021;
  levelNames:any=[];
  levelCount:any=[]; 
  jsonSchemaCreate: any;  
  loadingSheet: boolean = false;
  constructor() { }
}
