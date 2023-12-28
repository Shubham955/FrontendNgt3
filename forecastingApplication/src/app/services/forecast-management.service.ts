import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ForecastManagementService {

  url="http://localhost:5000"
  constructor(private httpClient: HttpClient) { }

  saveTableSchema(data:any){
    return this.httpClient.post(`${this.url}/schema`,data);
  }

  getTableSchema(tableName:any){
    return this.httpClient.get(`${this.url}/schema?table=${tableName}`);
  }

  getTableData(tableName:any){
    return this.httpClient.get(`${this.url}/schema/:${tableName}`);
  }


  saveTableData(tableName:string, data:any){
    return this.httpClient.post(`${this.url}/sheet/${tableName}`, data);
  }

  updateTableData(tableName:string, updatedData:any){
    return this.httpClient.put(`${this.url}/sheet/${tableName}`, updatedData);
  }


}
