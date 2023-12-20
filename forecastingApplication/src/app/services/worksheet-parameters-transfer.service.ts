import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorksheetParametersTransferService {
  timeSeriesType:any;
  startRange:any=2019;
  endRange:any=2023;
  levelNames:any=[];
  levelCount:any=[];
  
  constructor() { }
}
