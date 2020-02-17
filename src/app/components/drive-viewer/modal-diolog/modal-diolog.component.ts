import { Component, OnInit, Inject, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { Subscription } from 'rxjs';


export interface IDialogData {
  text: string,
  title: string
}

@Component({
  selector: 'app-modal-diolog',
  templateUrl: './modal-diolog.component.html',
  styleUrls: ['./modal-diolog.component.scss']
})
export class ModalDialogComponent implements OnInit, OnDestroy {
  @ViewChild("inputNameFolder", { static: false }) inputNameFolder: ElementRef<HTMLInputElement>;

  sub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<ModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogData
  ) { }
  ngOnInit() {
    this.sub = this.dialogRef.afterOpen().subscribe(() => {
      this.inputNameFolder.nativeElement.select();
    })
  }
  onNoClick() {
    this.dialogRef.close();
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
