import { Component, OnInit } from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { filter, takeUntil } from "rxjs/operators";
import { Subject, Observable } from "rxjs";
import { slideInAnimation } from "../../animation";
import { SaleState } from 'src/app/store/state/sale.state';
import { Select } from '@ngxs/store';

@Component({
  selector: "app-content-view",
  templateUrl: "./content-view.component.html",
  styleUrls: ["./content-view.component.scss"],
  animations: [slideInAnimation]
})
export class ContentViewComponent implements OnInit {
  title: string;
  @Select(SaleState.loading) loading$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(private titleServise: Title, private router: Router) {}

  ngOnInit() {
    this.setTitle(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(e => this.setTitle(e.url));
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData["animation"]
    );
  }
}
