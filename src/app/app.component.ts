import { Component, OnInit, AfterViewInit, HostBinding, HostListener } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { ThemeService } from './service/theme.service';
import { Store, Select } from '@ngxs/store';
import { GetSales } from './store/actions/sale.actions';
import { SaleState } from './store/state/sale.state';
import { ConfigState } from './store/state/config.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
  @HostBinding('class') componentCssClass;
  @Select(SaleState.loading) loading$: Observable<boolean>;


  title = 'iw';
  constructor(
    private theme: ThemeService,
    private store: Store
  ) { }
  ngOnInit() {

    this.store.select(ConfigState.theme).subscribe(theme => this.componentCssClass = theme)
    // this.theme.isDarkTheme.subscribe((isDark) => this.componentCssClass = isDark ? "dark-theme" : "")
    // this.theme.theme.subscribe((theme) => {
    // this.componentCssClass= theme.split(" ")[0]+" "+ theme.split(" ")[1];
    // })
  }
  ngAfterViewInit() {
    // console.log(this.componentCssClass);

    // setTimeout(() => {
    //   this.saleStory.getSaleList();
    // }, 0)
  }

  onRouterOutletActivate(event: Component) {
    // console.log(event);
  }

}
