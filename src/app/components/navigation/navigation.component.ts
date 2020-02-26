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
import { AuthState, User } from "src/app/store/state/auth.state";
import { SignIn, SignOut } from "src/app/store/actions/auth.actions";
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
import { GetSales } from "src/app/store/actions/sale.actions";
import { ToggleDarkTheme, SetTheme } from "src/app/store/actions/config.action";
import { THEME, ConfigState } from "src/app/store/state/config.state";
import { FormControl } from "@angular/forms";
import { slideInAnimation } from "../animation";
import { MatSidenavContent } from "@angular/material/sidenav";
import { AuthenticationService } from "src/app/service/auth.service";
import { FireDataBaseService } from "src/app/service/firedatabase";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
  animations: [slideInAnimation]
})
export class NavigationComponent implements OnInit, OnDestroy {
  @Select(SaleState.loading) loading$: Observable<boolean>;
  @Select(SaleState.error) error$: Observable<boolean>;
  @Select(AuthState.user) user$: Observable<User>;
  title: string;
  isDarkOrLight: FormControl = new FormControl(false);
  private destroy$ = new Subject<void>();
  links = [
    { name: "Sale", patch: "/sale-list" },
    { name: "History", patch: "/history" },
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
    private router: Router,
    private titleServise: Title,
    public auth: AuthenticationService,
  ) {
  }
  setTitle(url: string) {
    switch (url) {
      case "/sale-list":
        this.titleServise.setTitle("Продажи");
        this.title = "Продажи";
        break;
      case "/history":
        this.titleServise.setTitle("История");
        this.title = "История";
        break;
      case "/setting":
        this.titleServise.setTitle("Настройки");
        this.title = "Настройки";
        break;
      default:
        this.titleServise.setTitle("iw");
        this.title = "";
    }
  }

  ngOnInit() {
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

    this.setTitle(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(e => this.setTitle(e.url));
  }
  signOut() {
    this.store.dispatch(new SignOut());
  }

  getSales() {
    this.store.dispatch(new GetSales());
  }
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

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData["animation"]
    );
  }
}
