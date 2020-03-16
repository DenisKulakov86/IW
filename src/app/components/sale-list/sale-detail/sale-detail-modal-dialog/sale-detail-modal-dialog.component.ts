import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sale-detail-modal-dialog',
  templateUrl: './sale-detail-modal-dialog.component.html',
  styleUrls: ['./sale-detail-modal-dialog.component.scss']
})
export class SaleDetailModalDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SaleDetailModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) { }

  ngOnInit() {
  }

}
