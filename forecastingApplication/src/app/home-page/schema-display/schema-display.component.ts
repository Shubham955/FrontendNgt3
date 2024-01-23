import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-schema-display',
  templateUrl: './schema-display.component.html',
  styleUrls: ['./schema-display.component.css']
})
export class SchemaDisplayComponent {
  @Input()
  levelNumbers : Array<number> = [];
  @Input()
  levelNames : Array<string> = [];
  @Input()
  valueCounts : Array<number> = [];

  @Output()
  levelNameEdit = new EventEmitter<{index : number , value :  string}>();
  @Output()
  valueCountEdit = new EventEmitter<{index : number ,value : number}>();

  onLevelNameEdit(event: Event, i: number) {
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
    this.levelNames[i] = value;
    this.levelNameEdit.emit({index : i , value : value});
  }

  onValueCountEdit(event :  Event , i : number){
    const target = event.target as HTMLTableCellElement;
    const value = target.innerText.trim();
    const intValue = parseInt(value);
    this.valueCounts[i] = intValue;
    this.valueCountEdit.emit({index : i,value: intValue});
  }

}
