import { Sale } from "src/app/models/sale.model";
import {
  State,
  NgxsOnInit,
  StateContext,
  Store,
  Action,
  Selector,
  createSelector,
  NgxsAfterBootstrap
} from "@ngxs/store";
import {
  patch,
  removeItem,
  updateItem,
  append,
  iif,
  insertItem
} from "@ngxs/store/operators";
import { from, of, empty, Observable } from "rxjs";
import {
  pluck,
  tap,
  filter,
  switchMap,
  map,
  mergeMap,
  catchError,
  take,
  retry,
  delay
} from "rxjs/operators";
import { AuthState } from "./auth.state";
import {
  GetSales,
  SetBaseInfo,
  DeleteBaseInfo,
  DeleteSale,
  ChangeSale,
  UploadSales,
  GetSale,
  NewSale,
  SaveSale,
  AddSale,
  SetSales
} from "../actions/sale.actions";
import { File } from "../../models/file.model";
import { SalesService } from "src/app/service/sales.service";

import * as moment from "moment";
import { FireDataBaseService } from "src/app/service/firedatabase";
import {
  AngularFireDatabase,
  AngularFireList,
  SnapshotAction
} from "@angular/fire/database";
import { AngularFireAuth } from '@angular/fire/auth';

function saveSales(ctx: StateContext<SaleStateModel>) {
  let sales = ctx.getState().sales;
  localStorage.setItem("mockSales", JSON.stringify({ sales }));
}

function insertOrUpdateSale(id: any, loadedSale?: Sale) {
  return iif<Sale[]>(
    sales => sales.some(s => s.id == id),
    updateItem(sale => sale.id == id, patch(loadedSale)),
    append([loadedSale])
  );
}

export interface SaleStateModel {
  sales: Sale[];
  error: any;
  select: Sale;
  loading: boolean;
}

@State<SaleStateModel>({
  name: "sales",
  defaults: {
    sales: [],
    error: null,
    loading: false,
    select: null,
  }
})
export class SaleState implements NgxsOnInit, NgxsAfterBootstrap {
  // salesRef$: Observable<AngularFireList<Sale>>;
  // sales$: Observable<SnapshotAction<Sale>[]>;
  saleRef: AngularFireList<Sale>
  constructor(
    private db: AngularFireDatabase,
    private store: Store,
  ) { }
  ngxsOnInit(ctx: StateContext<SaleStateModel>) {
    console.log("ngxsOnInit");
    let salesRef$ = this.store.select(AuthState.user)
      .pipe(map(user => user ? this.db.list<Sale>(`${user.uid}/sale`) : null));

    salesRef$.subscribe(ref => this.saleRef = ref)

    salesRef$.pipe(
      switchMap((ref) => ref ? ref.snapshotChanges() : empty()),
      map(change => change.map((c): Sale => ({ ...c.payload.val(), id: c.key, }))),
    )
      .subscribe(sales => {
        ctx.dispatch(new SetSales(sales))
      });



    // this.store.select(SaleState.loading).subscribe(console.log)

  }

  ngxsAfterBootstrap(ctx: StateContext<SaleStateModel>) {
    console.log("ngxsAfterBootstrap");
  }

  @Action(SetSales)
  setSales(ctx: StateContext<SaleStateModel>, { sales }: SetSales) {
    ctx.patchState({ sales, loading: false });
  }

  @Action(GetSales)
  getSales(ctx: StateContext<SaleStateModel>) {
    //this.db.getSales();
  }


  @Action(DeleteSale)
  deleteSale(ctx: StateContext<SaleStateModel>, { id }: DeleteSale) {

    this.saleRef.remove(id);
    // ctx.setState(
    //   patch({
    //     sales: removeItem<Sale>(s => s.id === id)
    //   })
    // );
    // saveSales(ctx);
    //do api
  }

  @Action(NewSale)
  newSale(ctx: StateContext<SaleStateModel>) {
    let newSale: Sale = {
      discount: 0,
      productList: [],
      timestamp: null,
      id: null
    };
    ctx.patchState({ select: newSale });
  }
  @Action(GetSale)
  getSale(ctx: StateContext<SaleStateModel>, { id }: GetSale) {
    let state = ctx.getState();
    let sale = state.sales.find(s => s.id == id);
    ctx.patchState({ select: sale });
  }
  @Action(ChangeSale)
  changeSale(
    ctx: StateContext<SaleStateModel>,
    { sale: { discount, productList } }: ChangeSale
  ) {
    ctx.setState(
      patch({
        select: patch({
          discount,
          productList
        })
      })
    );
  }
  @Action(SaveSale)
  saveSale(ctx: StateContext<SaleStateModel>) {
    let select = ctx.getState().select;
    if (!select.productList.length) {
      // if (!select.id) return;
      // else this.store.dispatch(new DeleteSale(select.id));
    } else {
      if (!select.id) {
        let id = Math.max(...ctx.getState().sales.map(s => s.id), 0) + 1;
        select = {
          ...select,
          timestamp: moment().valueOf(),
          id
        };
      }
      ctx.setState(
        patch({
          sales: insertOrUpdateSale(select.id, select)
        })
      );
    }
  }

  @Action(AddSale)
  addSale(ctx: StateContext<SaleStateModel>) {
    let sale = ctx.getState().select;
    // return this.db.addSale({
    //   ...sale
    //   // timestamp: moment().valueOf()
    // });
    // return from(this.db.addSale(sale)).pipe(
    //   tap(res => console.log("Add Sale", res))
    // );
  }
  @Selector()
  static loading(state: SaleStateModel) {
    return state.loading;
  }
  @Selector()
  static error(state: SaleStateModel) {
    return state.error;
  }

  @Selector()
  static sales(state: SaleStateModel) {
    return state.sales;
  }
  @Selector()
  static select(state: SaleStateModel) {
    return state.select;
  }

  static getSaleByDate(
    dateFrom: moment.Moment,
    dateTo: moment.Moment = dateFrom
  ) {
    return createSelector([SaleState], (state: SaleStateModel) => {
      return state.sales
        ? state.sales.filter(s =>
          moment(s.timestamp).isBetween(dateFrom, dateTo, "day", "[]")
        )
        : [];
    });
  }
  static getSaleById(id: number) {
    return createSelector([SaleState], (state: SaleStateModel) => {
      return state.sales && state.sales.find(s => s.id === id);
    });
  }
}
