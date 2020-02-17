import { Directive, TemplateRef, ViewContainerRef, OnInit, OnDestroy, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { fromEvent, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

@Directive({
  selector: '.btn-fly[mat-fab]'
})
export class FlyDirective implements OnInit, OnDestroy {
  sub: Subscription;
  nativEl: HTMLButtonElement;

  @Input("mat-fab") offset;
  constructor(
    private matFab: MatButton,
    private breakpointObserver: BreakpointObserver,
    // private templateRef: TemplateRef<any>,
    // private viewContainer: ViewContainerRef
  ) {

  }
  ngOnInit() {
    if (!this.offset) this.offset = 200;
    this.nativEl = this.matFab._elementRef.nativeElement;
    this.sub = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(result => result.matches))
      .subscribe(v => this.nativEl.style.left = v ? "0" : `${this.offset}px`)
    // fromEvent(window, "resize").subscribe(v => {
    //   // console.log(document.documentElement.clientWidth);
    // })
  }

  ngOnDestroy() {
    console.log("ngOnDestroy");

    this.sub && this.sub.unsubscribe();
  }

}
