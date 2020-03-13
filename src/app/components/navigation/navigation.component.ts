import {
  Component,
  OnInit,
  HostBinding,
  AfterViewInit,
  AfterContentInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable, Subject, pipe, fromEvent } from "rxjs";
import {
  map,
  shareReplay,
  tap,
  startWith,
  filter,
  retry,
  takeUntil,
  switchMapTo,
  switchMap,
  delay
} from "rxjs/operators";
import { OverlayContainer } from "@angular/cdk/overlay";
import { ThemeService } from "../../service/theme.service";
import {
  Select,
  Store,
  Actions,
  ofActionErrored,
  ofActionCompleted
} from "@ngxs/store";
import { AuthState } from "src/app/store/state/auth.state";
import { SignOut } from "src/app/store/actions/auth.actions";
import { SaleState } from "src/app/store/state/sale.state";
import { Sale } from "src/app/models/sale.model";
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
  RouterOutlet
} from "@angular/router";
import { Title } from "@angular/platform-browser";
import { SalesService, IUser } from "src/app/service/sales.service";
import { ToggleDarkTheme, SetTheme } from "src/app/store/actions/config.action";
import { THEME, ConfigState } from "src/app/store/state/config.state";
import { FormControl } from "@angular/forms";
import { slideInAnimation } from "../animation";
import { MatSidenavContent } from "@angular/material/sidenav";
import { FireDataBaseService } from "src/app/service/firedatabase";
import { User } from 'src/app/models/user.model';

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
  
})
export class NavigationComponent implements OnInit, OnDestroy {
  @Select(SaleState.loading) loading$: Observable<boolean>;
  @Select(SaleState.error) error$: Observable<boolean>;
  @Select(AuthState.user) user$: Observable<User>;
  @Select(ConfigState.theme) theme$: Observable<string>;
  defTheme$: Observable<boolean>;
  greenTheme$: Observable<boolean>;
  purpleTheme$: Observable<boolean>;
  pinkTheme$: Observable<boolean>;
  isDarkOrLight: FormControl = new FormControl(false);
  private destroy$ = new Subject<void>();
  links = [
    { name: "Продажи", patch: "/sale-list" },
    { name: "История", patch: "/history" },
  ];

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  //  isSmallScreen = this.breakpointObserver.isMatched('(max-width: 599px)');

  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store,
   
  ) {
  }

  ngOnInit() {
    let theme = this.theme$.pipe(map(t => t.split(" ")[1]))
    this.defTheme$ = theme.pipe(map(t => t === THEME.indigo));
    this.greenTheme$ = theme.pipe(map(t => t === THEME.green));
    this.purpleTheme$ = theme.pipe(map(t => t === THEME.deepPpurple));
    this.pinkTheme$ = theme.pipe(map(t => t === THEME.pink));

    this.isDarkOrLight.valueChanges
      .pipe(
        switchMap(() => this.store.dispatch(new ToggleDarkTheme())),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.store
      .select(ConfigState.theme)
      .pipe(
        map(t => t.includes(THEME.dark)),
        takeUntil(this.destroy$)
      )
      .subscribe(t => this.isDarkOrLight.setValue(t, { emitEvent: false }));

  
  }
  signOut() {
    this.store.dispatch(new SignOut());
  }

  // getSales() {
  //   this.store.dispatch(new GetSales());
  // }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setGreenTheme() {
    this.store.dispatch(new SetTheme(THEME.green));
  }
  setIndigoTheme() {
    this.store.dispatch(new SetTheme(THEME.indigo));
  }
  setDeepPurpleTheme() {
    this.store.dispatch(new SetTheme(THEME.deepPpurple));
  }
  setPinkTheme() {
    this.store.dispatch(new SetTheme(THEME.pink));
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData["animation"]
    );
  }
}
