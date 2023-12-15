import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  collection: any = [];
  nu: number = 0;
  worksheetForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.worksheetForm = this.formBuilder.group({
      timeSeriesType: [, [Validators.required]],
      startRange: [, [Validators.required]],
      endRange: [, [Validators.required]],
      levelNames: [[], [Validators.required]],
      levelCount: [[], [Validators.required]]
    });
  }

  //sets rating dropdown value 
  onSelected(event: any) {
    this.worksheetForm['timeSeriesType']?.setValue(event.target.value, {
      onlySelf: true,
    });
  }

  add() {
    this.nu = this.nu + 1;
    this.collection.push(this.nu);
  }

  createWorksheet() {
    this.router.navigate(['/worksheet']);
  }
}
