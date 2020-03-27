import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatRadioChange, MatRadioGroup } from "@angular/material/radio";

export interface HistoryDialogData {
  period: string[];
  select: number;
}

@Component({
  selector: "app-history-modal-dialog",
  template: `
    <mat-radio-group class="radio-group">
      <mat-radio-button
        class="radio-button"
        *ngFor="let period of data.period; let i = index"
        [value]="period"
        [checked]="i == data.select"
        (click)="onSelect(i)"
      >
        {{ period }}
      </mat-radio-button>
    </mat-radio-group>
  `,
  styles: [
    `
      .radio-group {
        display: flex;
        flex-direction: column;
        margin: 15px 0;
      }
      .radio-button {
        margin: 15px;
      }
      .mat-dialog-container {
        padding: 0 !important;
        background-color: red;
      }
    `
  ]
})
export class HistoryModalDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<HistoryModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HistoryDialogData
  ) {}

  ngOnInit() {}
  onSelect(i) {
    this.dialogRef.close(i);
  }
}
