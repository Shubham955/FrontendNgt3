import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

  notification:string=''

  public notify(message:string){
    this.notification= message;
  }

  getNotification(){
    return this.notification;
  }

}
