import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HistoryComponent } from './components/history/history.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { LoginComponent } from './components/login/login.component';
import { SaleListComponent } from './components/sale-list/sale-list.component';
import { SaleDetailComponent } from './components/sale-list/sale-detail/sale-detail.component';
import { AuthGuard } from './guard/auth.guard';
import { AppComponent } from './app.component';

const routesSection: Routes = [
   { path: "", redirectTo: "sale-list", pathMatch: "full" },
   {
      path: "sale-list",
      component: SaleListComponent,
      data: { animation: "SalesAnim" }
   },
   {
      path: "history",
      component: HistoryComponent,
      data: { animation: "HistoryAnim" }
   },
]
// children: routesSection
// component:NavigationComponent
const routes: Routes = [
   {
      path: '',
      component: NavigationComponent,
      children: routesSection,
      canActivate: [AuthGuard],
      canActivateChild: [AuthGuard]
   },
   { path: "login", component: LoginComponent },
   { path: "sale-detail/:id", component: SaleDetailComponent, canActivate: [AuthGuard] },
   { path: "**", component: NotFoundComponent }
];

@NgModule({
   imports: [RouterModule.forRoot(routes)],
   exports: [RouterModule]
})
export class AppRoutingModule { }
