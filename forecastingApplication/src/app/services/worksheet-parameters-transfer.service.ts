import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorksheetParametersTransferService {
  sheetName: any;
  timeSeriesType:any;
  startRange:any;
  endRange:any;
  levelNames:any=[];
  levelCount:any=[]; 
  jsonSchemaCreate: any; 
  
  constructor() { }
}
