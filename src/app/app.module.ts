import { BrowserModule } from "@angular/platform-browser";
import { NgModule, LOCALE_ID, APP_INITIALIZER } from "@angular/core";

import { NgxsModule, Store } from "@ngxs/store";
import { NgxsLoggerPluginModule } from "@ngxs/logger-plugin";
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { NgxsStoragePluginModule } from "@ngxs/storage-plugin";

import { registerLocaleData } from "@angular/common";
import localeRu from "@angular/common/locales/ru";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NavigationComponent } from "./components/navigation/navigation.component";
import { MaterialModule } from "./material/material.module";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { HistoryComponent } from "./components/history/history.component";
import { SaleListComponent } from "./components/sale-list/sale-list.component";
import { DriveViewerComponent } from "./components/drive-viewer/drive-viewer.component";
import { ConnectFormControlDirective } from "./components/drive-viewer/connect-form.directive";
import { OverlayContainer } from "@angular/cdk/overlay";
import { ThemeService } from "./service/theme.service";
import { ModalDialogComponent } from "./components/drive-viewer/modal-diolog/modal-diolog.component";
import { ConnectFormGroupDirective } from "./components/sale-list/sale-detail/connect-form-group.directive";
import { SettingComponent } from "./components/setting/setting.component";
import { FileListComponent } from "./components/setting/file-list/file-list.component";
import { FileState } from "./store/state/file.state";
import { LoginComponent } from "./components/login/login.component";
import { SaleState } from "./store/state/sale.state";
import { AuthState } from "./store/state/auth.state";
import { GapiService } from "./service/google-gapi/gapi.service";
import { environment } from "src/environments/environment";
import { SaleDetailComponent } from "./components/sale-list/sale-detail/sale-detail.component";
import { HttpClientModule } from "@angular/common/http";
import { SearchPipe } from "./components/sale-list/form-products/search.pipe";
import { FormProductsComponent } from "./components/sale-list/form-products/form-products.component";
import { NameProductsSate } from "./store/state/name-products.state";
import { ConfigState } from "./store/state/config.state";
import { pairwise } from "rxjs/operators";
import { HistoryModalDialogComponent } from "./components/history/history-modal-dialog/history-modal-dialog.component";
import { TableHistoryComponent } from "./components/history/table-history/table-history.component";
import { SelectorComponent } from "./components/history/selector/selector.component";
import { FlyDirective } from "./components/fly.directive";
import { HistorySatate } from "./store/state/history.state";
import { ConnectControlDirective } from './components/history/selector/connect-form-control.directive';

// the second parameter 'ru' is optional
registerLocaleData(localeRu, "ru");

export function initGapi(gapiService: GapiService) {
  return environment.gooleDrive ? () => gapiService.initGapi() : () => {};
}
export function noop() {
  return function() {};
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    SaleListComponent,
    NotFoundComponent,
    HistoryComponent,
    DriveViewerComponent,
    ModalDialogComponent,
    ConnectFormControlDirective,
    ConnectFormGroupDirective,
    ConnectControlDirective,
    SettingComponent,
    FileListComponent,
    LoginComponent,
    SaleDetailComponent,
    SearchPipe,
    FormProductsComponent,
    HistoryModalDialogComponent,
    TableHistoryComponent,
    SelectorComponent,
    FlyDirective
  ],
  entryComponents: [ModalDialogComponent, HistoryModalDialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // NgxsModule.forRoot(states, { developmentMode: !environment.production }),
    NgxsModule.forRoot(
      [
        FileState,
        NameProductsSate,
        SaleState,
        AuthState,
        ConfigState,
        HistorySatate
      ],
      {
        developmentMode: !environment.production,
        selectorOptions: {
          suppressErrors: false,
          injectContainerState: false
        }
      }
    ),
    // NgxsLoggerPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot({
      key: [ConfigState, HistorySatate]
    }),
    !environment.production ? NgxsReduxDevtoolsPluginModule.forRoot() : []
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initGapi,
      deps: [GapiService],
      multi: true
    },
    { provide: LOCALE_ID, useValue: "ru" }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  overlayTheme: string[] = [];
  constructor(overlayContainer: OverlayContainer, private store: Store) {
    store.select(ConfigState.theme).subscribe(theme => {
      this.overlayTheme.forEach(t =>
        overlayContainer.getContainerElement().classList.remove(t)
      );
      this.overlayTheme = theme.split(" ");
      this.overlayTheme.forEach(t =>
        overlayContainer.getContainerElement().classList.add(t)
      );
    });
  }
}
