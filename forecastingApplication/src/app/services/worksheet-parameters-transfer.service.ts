import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorksheetParametersTransferService {
  sheetName: any;
  timeSeriesType:any;
  startRange:any=2019;
  endRange:any=2023;
  levelNames:any=[];
  levelCount:any=[]; 
  jsonSchemaCreate: any; 
  
  constructor() { }
}
