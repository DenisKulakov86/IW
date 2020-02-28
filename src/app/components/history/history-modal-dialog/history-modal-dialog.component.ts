import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange, MatRadioGroup } from '@angular/material/radio';

export interface HistoryDialogData {
  period: string[],
  select: number
}


@Component({
  selector: 'app-history-modal-dialog',
  templateUrl: './history-modal-dialog.component.html',
  styleUrls: ['./history-modal-dialog.component.scss']
})
export class HistoryModalDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<HistoryModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HistoryDialogData
  ) { }

  ngOnInit() { }
  onSelect(i) {
    this.dialogRef.close(i);
  }
}
