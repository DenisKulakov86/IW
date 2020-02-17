import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../../drive-viewer/modal-diolog/modal-diolog.component';
import { Router } from '@angular/router';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { FileState } from '../../../store/state/file.state';
import { File } from '../../../models/file.model';
import { Store, Select, Actions, ofActionCanceled, ofActionErrored, ofActionCompleted, ofActionSuccessful } from '@ngxs/store';
import { GetFileList, GetFile, CreateFile, DeleteFile, UpdateFile, GetBodyFile } from 'src/app/store/actions/file.actions';
import { SaleState } from 'src/app/store/state/sale.state';
import { DeleteBaseInfo, SetBaseInfo } from 'src/app/store/actions/sale.actions';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit, OnDestroy {
  @Select(FileState.list) files$: Observable<File[]>;

  subscription:Subscription = new Subscription();

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private store: Store,
    private actions$: Actions
  ) { }

  ngOnInit() {
    this.store.dispatch(new GetFileList());
  }
  select(file: File) {
    this.store.dispatch(new SetBaseInfo(file));
    this.store.dispatch(new GetFile(file.id));
    this.goBack();
  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  create() {
    const dialogRef = this.dialog.open(
      ModalDialogComponent,
      {
        minWidth: '300px',
        data: {
          text: "",
          title: "Новая база"
        }
      }
    )
    this.subscription = dialogRef.afterClosed()
      .subscribe((result: string) => {
        if (result) {
          this.store.dispatch(new CreateFile(result, { sales: [] }))
        }
      })
  }
  goBack() {
    this.router.navigate(['/setting'])
  }
  delete(ev, file: File) {
    ev.stopPropagation();
    const baseInfo = this.store.selectSnapshot(SaleState.baseInfo);
    if (file.id === (baseInfo && baseInfo.id))
      this.store.dispatch(new DeleteBaseInfo());
    this.store.dispatch(new DeleteFile(file.id))
  }
  update(ev, file: File) {
    ev.stopPropagation();
    this.store.dispatch(new UpdateFile(file.id, "update name", {}))
  }
  getBodyFile(ev, file: File) {
    ev.stopPropagation();
    this.store.dispatch(new GetBodyFile(file.id)).subscribe(res => console.log(res))
  }
}
