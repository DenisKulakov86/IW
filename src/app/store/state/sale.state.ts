import { Sale, SaleStateModel } from "src/app/models/sale.model";
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
import { from, of, empty, Observable, throwError } from "rxjs";
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
  delay,
  switchMapTo
} from "rxjs/operators";
import { AuthState } from "./auth.state";
import {
  DeleteSale,
  ChangeSale,
  NewSale,
  SaveSale,
  AddSale,
  SetSales,
  // SelectSale,
  UpdateSale,
  GetSale
} from "../actions/sale.actions";

import * as moment from "moment";
import {
  AngularFireDatabase,
  AngularFireList,
  SnapshotAction
} from "@angular/fire/database";
import { AngularFireAuth } from "@angular/fire/auth";

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

@State<SaleStateModel>({
  name: "sales",
  defaults: {
    sales: [],
    error: null,
    loading: false,
    select: null,
    saved: true
  }
})
export class SaleState implements NgxsOnInit, NgxsAfterBootstrap {
  saleRef: AngularFireList<Sale>;
  constructor(private db: AngularFireDatabase, private store: Store) {}
  ngxsOnInit(ctx: StateContext<SaleStateModel>) {
    let salesRef$ = this.store
      .select(AuthState.user)
      .pipe(
        map(user => (user ? this.db.list<Sale>(`${user.uid}/sale`) : null))
      );

    salesRef$.subscribe(ref => (this.saleRef = ref));

    salesRef$
      .pipe(
        switchMap(ref => {
          if (ref) {
            ctx.patchState({ loading: true });
            return ref.snapshotChanges();
          } else {
            return empty();
          }
        }),
        map(change =>
          change.map((c): Sale => ({ ...c.payload.val(), id: c.key }))
        )
        // switchMap(() => throwError("something Error"))
      )
      .subscribe(
        sales => ctx.dispatch(new SetSales(sales)),
        error => ctx.patchState({ error, loading: false })
      );
  }

  ngxsAfterBootstrap(ctx: StateContext<SaleStateModel>) {}

  @Action(SetSales)
  setSales(ctx: StateContext<SaleStateModel>, { sales }: SetSales) {
    ctx.patchState({ sales, loading: false, error: null });
  }

  // @Action(SelectSale)
  // getSales(ctx: StateContext<SaleStateModel>, { id }: SelectSale) {
  //   let sales = ctx.getState().sales;
  //   let select = sales.find(s => s.id === id);
  //   ctx.patchState({ select, saved: true });
  // }

  @Action(DeleteSale)
  deleteSale(ctx: StateContext<SaleStateModel>, { id }: DeleteSale) {
    ctx.patchState({ loading: true });
    this.saleRef.remove(id);
  }

  @Action(NewSale)
  newSale(ctx: StateContext<SaleStateModel>) {
    ctx.patchState({
      select: {
        discount: 0,
        productList: []
      },
      saved: true
    });
  }

  @Action(GetSale)
  getSales(ctx: StateContext<SaleStateModel>, { id }: GetSale) {
    let sales = ctx.getState().sales;
    let select = sales.find(s => s.id === id);
    ctx.patchState({ select, saved: true });
  }

  @Action(ChangeSale)
  changeSale(
    ctx: StateContext<SaleStateModel>,
    { sale: { discount, productList } }: ChangeSale
  ) {
    ctx.setState(
      patch({
        select: patch({
          discount: Number(discount),
          productList
        }),
        saved: Boolean(false)
      })
    );
  }
  @Action(SaveSale)
  saveSale(ctx: StateContext<SaleStateModel>) {
    let select = ctx.getState().select;
    let dispatcher: Observable<any>;
    if (select.id) {
      dispatcher = ctx.dispatch(new UpdateSale());
    } else {
      dispatcher = ctx.dispatch(new AddSale());
    }
    return dispatcher.pipe(tap(_ => ctx.patchState({ saved: true })));

    // this.saleRef.push(select).then(r => console.log())
    // ctx.setState(
    //   patch({
    //     sales: insertOrUpdateSale(select.id, select)
    //   })
    // );
  }

  @Action(AddSale)
  addSale(ctx: StateContext<SaleStateModel>) {
    let select = ctx.getState().select;
    let sale: Sale = {
      ...select,
      timestamp: moment()
        .startOf("d")
        .valueOf()
    };
    return from(this.saleRef.push(sale)).pipe(
      tap(ref => ctx.patchState({ select: { ...sale, id: ref.key } }))
    );
  }

  @Action(UpdateSale)
  updateSale(ctx: StateContext<SaleStateModel>) {
    let select = ctx.getState().select;
    return from(this.saleRef.update(select.id, select));
  }

  /**
   * Selectors 
   */

  @Selector()
  static loading(state: SaleStateModel) {
    return state.loading;
  }
  @Selector()
  static saved(state: SaleStateModel) {
    return state.saved;
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
    return createSelector([SaleState.sales], (sales: Sale[]) => {
      let resSales = sales.filter(s =>
        moment(s.timestamp).isBetween(dateFrom, dateTo, "day", "[]")
      );
      return resSales;
    });
  }
  static getSaleById(id: number) {
    return createSelector([SaleState], (state: SaleStateModel) => {
      return state.sales && state.sales.find(s => s.id === id);
    });
  }
}
