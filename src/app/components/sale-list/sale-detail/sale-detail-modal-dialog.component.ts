import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-sale-detail-modal-dialog",
  template: `
    <div mat-dialog-content>
      {{ data }}
    </div>

    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Да</button>
      <button mat-button [mat-dialog-close]="false">Нет</button>
    </div>
  `,
  styles: [
    `.mat-dialog-actions {
        justify-content: flex-end;
        margin-top: 15px;
      }
    `
  ]
})
export class SaleDetailModalDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SaleDetailModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  ngOnInit() {}
}
