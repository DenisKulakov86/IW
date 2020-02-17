import { Component, OnInit, DoCheck, AfterViewInit, ViewChild, TemplateRef, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from "@angular/core";
import { Observable, merge, zip, Subscription } from "rxjs";
import { map, first, filter } from "rxjs/operators";

import { File, Response } from "../../store/drive.store"
import { IBreadcrumbs, DriveStore } from 'src/app/store/drive.store';
import { FileService } from 'src/app/service/google-gapi/file.service';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from './modal-diolog/modal-diolog.component';

@Component({
  selector: 'app-drive-viewer',
  templateUrl: './drive-viewer.component.html',
  styleUrls: ['./drive-viewer.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriveViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("matListTemplate", { static: true }) matListTemplate: TemplateRef<any>;
  @ViewChild("fileTemplate", { static: true }) fileTemplate: TemplateRef<any>;

  pre$;
  breadcrumbs$: Observable<IBreadcrumbs>;
  list$: Observable<File[]>;
  file$: Observable<{ name, text }>
  selectedFile: File = null;
  isNewFile: boolean = false;
  sub: Subscription = new Subscription();

  fcTextarea: FormControl = new FormControl('', Validators.required);
  fcInput: FormControl = new FormControl("", Validators.required);
  fg: FormGroup;

  constructor(
    public driveStore: DriveStore,
    public fileService: FileService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
    this.fg = formBuilder.group({
      name: ["", [Validators.required]],
      text: [""]
    })
  }

  ngOnInit() {
    
    this.pre$ = zip(this.driveStore.list$, this.driveStore.file$);
    this.list$ = this.driveStore.list$;
    this.breadcrumbs$ = this.driveStore.breadcrumbs$.pipe(map(bc => bc.length ? bc.slice(-1)[0] : { id: "root", name: "root" }));

    this.file$ = this.driveStore.file$.pipe(map(f => {

      return ({
        name: f.result.name,
        text: f.body
      })
    }));

  }
  ngAfterViewInit() {

    setTimeout(() => this.driveStore.list());
  }

  onSelected(file: File) {

    if (file.mimeType === "application/json") {
      this.isNewFile = true;
      this.selectedFile = file;
      this.driveStore.file(file.id);
    } else {
      this.driveStore.list({ id: file.id });
    }
  }


  navigateTo() {
    if (this.isNewFile) {
      this.isNewFile = false;
      this.selectedFile = null;

      this.sub.add(
        this.breadcrumbs$.pipe(first()).subscribe(bc => {
          this.driveStore.list({ id: bc.id });
        })
      )
    } else {
      this.driveStore.navigateTo();
    }
  }

  getFile() {
    this.driveStore.file("1_K6xMleGXyF1qVwQvryEMoUVtSR3IbWJ");
  }
  getList(file: File = { id: "root" }) {
    this.driveStore.list({ id: file.id });
  }
  deleteFile(file: File) {
    this.driveStore.delete(file.id);
  }

  crateFile() {
    this.isNewFile = true;
    this.selectedFile = null;
    this.driveStore.fileNew();
    console.log(`select ${this.selectedFile} new file: ${this.isNewFile}`);
    // this.fcTextarea.valid;
  }
  saveFile() {
    console.log(`select ${this.selectedFile} new file: ${this.isNewFile}`);
    if (!this.selectedFile && this.isNewFile) {
      this.driveStore.createFile({
        name: this.fg.get('name').value,
        data: JSON.parse(this.fg.get('text').value)
      })
    } else {
      this.sub.add(
        this.driveStore.file$.pipe(first()).subscribe((file: Response<File>) => {
          this.driveStore.updataFile({
            id: file.result.id,
            name: this.fg.get('name').value,
            data: JSON.parse(this.fg.get('text').value)
          })
        })
      )

    }

  }

  loadTemplate() {
    if (this.isNewFile) {
      return this.fileTemplate;
    }
    return this.matListTemplate;
  }

  openDialog() {
    const dialogRef = this.dialog.open(
      // this.modalDialogComponent
      ModalDialogComponent
      , {
        minWidth: '300px',
        data: {
          text: "Без названия",
          title: "Новая папка"
        }
      }
    )
    this.sub.add(
      dialogRef.afterClosed()
        .pipe(filter(r => !!r))
        .subscribe((result: string) => {
          this.driveStore.createFolder({ name: result })
        })
    )
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
