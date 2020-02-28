import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef,
  ContentChild,
  AfterViewInit,
  ViewChild
} from "@angular/core";
import { GeneratorBase } from "../../service/generator-sale.service";
import { Subject, Observable, fromEvent } from "rxjs";
import { Store, Select } from "@ngxs/store";
import { takeUntil, switchMap, filter, map } from "rxjs/operators";
import { HistorySatate } from "src/app/store/state/history.state";
import { trigger, transition, style, animate } from "@angular/animations";
import { MatSidenavContent } from "@angular/material/sidenav";

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms", style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HistoryComponent implements OnInit, OnDestroy {
  @Select(HistorySatate.getHistory) historys$: Observable<any>;
  destroy$: Subject<void> = new Subject();

  scroll: Observable<Event>

  constructor(
    private genereteService: GeneratorBase,
    private store: Store,
    private el: ElementRef
  ) { }

  ngOnInit() {
    let NativeComponent = this.el.nativeElement as HTMLElement;
    this.scroll = fromEvent(NativeComponent, "scroll")
      .pipe(takeUntil(this.destroy$))
    this.scroll
      .pipe(
        map(() => [NativeComponent.clientHeight, NativeComponent.getBoundingClientRect().bottom]),
        filter(([clientHeight, bottom]) => {
          console.log(`bottom - clientHeight: ${bottom - clientHeight}`);
          
        return  bottom < clientHeight
        })
      )
      .subscribe(() => {
        console.log(

          (this.el.nativeElement as HTMLElement).clientHeight,
          (this.el.nativeElement as HTMLElement).getBoundingClientRect().bottom
        );
      })

  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sales;
  generete() {
    this.sales = this.genereteService.genereteSale(new Date(2018, 0, 1));
    return JSON.stringify(this.sales, null, 2);
  }
}
