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
  SetPeriod,
  ToggleReverse,
  SetView
} from "src/app/store/actions/history.action";
import * as moment from "moment";
import {
  takeUntil,
  map,
  pairwise,
  tap,
  filter,
  startWith,
  switchMap
} from "rxjs/operators";

function instrument<T>(source: Observable<T>) {
  return new Observable<T>(observer => {
    console.log("source: subscribing");
    const subscription = source
      .pipe(tap(value => console.log("source emit: ", value)))
      .subscribe(observer);
    return () => {
      subscription.unsubscribe();
      console.log("source: unsubscribed");
    };
  });
}

@Component({
  selector: "app-selector",
  templateUrl: "./selector.component.html",
  styleUrls: ["./selector.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectorComponent implements OnInit, OnDestroy {
  dateFrom: FormControl = new FormControl();
  dateTo: FormControl = new FormControl();
  destroy$: Subject<void> = new Subject();
  dates: moment.Moment[];
  title$: Observable<string>;

  showSelector$: Observable<boolean>;
  view$: Observable<string>;

  // @Select(HistorySatate.getValue("start"))
  // start$: Observable<moment.Moment>

  // @Select(HistorySatate.getValue("end"))
  // end$: Observable<moment.Moment>

  @Select(HistorySatate.getValue("reverse"))
  reverse$: Observable<boolean>;

  constructor(public dialog: MatDialog, public store: Store) {
    // moment.locale("ru");
  }

  ngOnInit() {
    this.initFrom(this.dateFrom, "start");
    this.initFrom(this.dateTo, "end");

    let periodAndSelect$ = combineLatest(
      this.store.select(HistorySatate.getValue("dialogPeriod")),
      this.store.select(HistorySatate.getValue("currentPeriod"))
    );

    this.showSelector$ = periodAndSelect$.pipe(
      map(([dp, sp]: [string[], number]) =>
        dp.length - 1 == sp ? true : false
      )
    );

    this.title$ = periodAndSelect$.pipe(
      map(([dp, s]: [string[], number]) => dp[s])
    );
    this.view$ = combineLatest(
      this.store.select(HistorySatate.getValue("dialogView")),
      this.store.select(HistorySatate.getValue("currentView"))
    ).pipe(map(([dv, s]: [string[], number]) => dv[s]));
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialodPeriod() {
    let dialogRef = this.dialog.open(HistoryModalDialogComponent, {
      minWidth: "300px",
      data: {
        period: this.store.selectSnapshot(
          HistorySatate.getValue("dialogPeriod")
        ),
        select: this.store.selectSnapshot(
          HistorySatate.getValue("currentPeriod")
        )
      },
      autoFocus: false
      // hasBackdrop: false
    });

    dialogRef.afterClosed().subscribe(select => {
      !isNaN(select) && this.store.dispatch(new SetPeriod(select));
    });
  }

  openDialodView() {
    let dialogRef = this.dialog.open(HistoryModalDialogComponent, {
      minWidth: "200px",
      data: {
        period: this.store.selectSnapshot(HistorySatate.getValue("dialogView")),
        select: this.store.selectSnapshot(HistorySatate.getValue("currentView"))
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(select => {
      !isNaN(select) && this.store.dispatch(new SetView(select));
    });
  }

  toggleReverse() {
    this.store.dispatch(new ToggleReverse());
  }

  initFrom(control: FormControl, selector: "start" | "end") {
    this.store
      .selectOnce(HistorySatate.getValue(selector))
      .pipe(
        tap(start => control.patchValue(start)),
        switchMap(start =>
          control.valueChanges.pipe(
            startWith(start),
            pairwise<moment.Moment>(),
            filter(([oldV, newV]) => !newV.isSame(oldV)),
            map(([, newVal]) => newVal)
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(v => this.store.dispatch(new SetHistory(selector, v)));
  }
}
