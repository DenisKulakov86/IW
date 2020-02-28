import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { HistoryModalDialogComponent } from "../history-modal-dialog/history-modal-dialog.component";
import { Store, Select, Selector } from "@ngxs/store";
import {
  HistorySatate,
  HistorySatateModel
} from "src/app/store/state/history.state";
import { Observable, Subject, combineLatest } from "rxjs";
import {
  SetHistory,
  SelectPeriod,
  ToggleReverse,
  SelectView
} from "src/app/store/actions/history.action";
import * as moment from "moment";
import { takeUntil, map } from "rxjs/operators";
@Component({
  selector: "app-selector",
  templateUrl: "./selector.component.html",
  styleUrls: ["./selector.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectorComponent implements OnInit, OnDestroy {
  dateFrom: FormControl = new FormControl();
  dateTo: FormControl = new FormControl();
  dialogPeriod: string[];
  destroy$: Subject<void> = new Subject();
  dates: moment.Moment[];
  title$: Observable<string>;



  showSelector$: Observable<boolean>;
  view$: Observable<string>;
  
  @Select(HistorySatate.getValue("start")) 
  start$: Observable<moment.Moment>
  
  @Select(HistorySatate.getValue("end")) 
  end$: Observable<moment.Moment>

  @Select(HistorySatate.getValue("reverse")) 
  reverse$: Observable<boolean>;


  constructor(public dialog: MatDialog, public store: Store) {
    // moment.locale("ru");
  }

  ngOnInit() {
    let periodAndSelect$ = combineLatest(
      this.store.select(HistorySatate.getValue("dialogPeriod")),
      this.store.select(HistorySatate.getValue("selectPeriod"))
    );

    this.showSelector$ = periodAndSelect$.pipe(
      map(([dp, s]: [string[], number]) => (dp.length - 1 == s ? true : false))
    );

    this.title$ = periodAndSelect$.pipe(
      map(([dp, s]: [string[], number]) => dp[s])
    );
    this.view$ = combineLatest(
      this.store.select(HistorySatate.getValue("dialogView")),
      this.store.select(HistorySatate.getValue("selectView"))
    ).pipe(map(([dv, s]: [string[], number]) => dv[s]));

    this.dateFrom.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.store.dispatch(new SetHistory("start", v)));

    this.dateTo.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      this.store.dispatch(new SetHistory("end", v));
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialodPeriod() {
    let dialogRef = this.dialog.open(HistoryModalDialogComponent, {
      minWidth: "300px",
      data: {
        period: this.store.selectSnapshot(HistorySatate.getValue("dialogPeriod")),
        select: this.store.selectSnapshot(HistorySatate.getValue("selectPeriod"))
      },
      autoFocus: false,
      // hasBackdrop: false
    });

    dialogRef.afterClosed().toPromise().then(select => {
      if (select === undefined) return;
      this.store.dispatch(new SelectPeriod(select));
    });
  }

  openDialodView() {
    let dialogRef = this.dialog.open(HistoryModalDialogComponent, {
      minWidth: "200px",
      data: {
        period: this.store.selectSnapshot(HistorySatate.getValue("dialogView")),
        select: this.store.selectSnapshot(HistorySatate.getValue("selectView"))
      },
      autoFocus: false
    });

    dialogRef.afterClosed().toPromise().then(select => {
      if (select === undefined) return;
      this.store.dispatch(new SelectView(select));
    });
  }

  toggleReverse() {
    this.store.dispatch(new ToggleReverse());
  }
}
