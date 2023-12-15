import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorksheetParametersTransferService {
  timeSeriesType:any;
  startRange:any;
  endRange:any;
  levelNames:any=[];
  levelCount:any=[];
  
  constructor() { }
}
