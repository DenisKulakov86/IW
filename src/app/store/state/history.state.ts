import {
  State,
  Select,
  createSelector,
  Action,
  StateContext,
  Store,
  Selector
} from "@ngxs/store";
import * as moment from "moment";
import {
  SetHistory,
  SetPeriod,
  ToggleReverse,
  SetView
} from "../actions/history.action";
import { from, of, Observable, zip } from "rxjs";
import {
  switchMap,
  switchMapTo,
  map,
  take,
  groupBy,
  mergeMap,
  reduce,
  filter,
  tap
} from "rxjs/operators";
import { SaleState } from "./sale.state";
import { Sale, Product } from "src/app/models/sale.model";
import HistorySales, {
  HistorySatateModel,
  ProductHistory
} from "src/app/models/history.model";
import * as _ from "lodash";

@State<HistorySatateModel>({
  name: "history",
  defaults: {
    start: moment(),
    //.startOf("month"),
    end: moment(),
    view: "day",
    dialogPeriod: [
      "За последнию неделю",
      "За последный месяц",
      "За последный год",
      "Другое"
    ],
    currentPeriod: 3,
    dialogView: ["День", "Месяц", "Год"],
    currentView: 0,
    reverse: false
  }
})
export class HistorySatate {
  constructor(private store: Store) {}

  ngxsOnInit(ctx: StateContext<HistorySatateModel>) {
    // moment.locale('ru');
    let state = ctx.getState();
    let newState = { ...state };
    newState.start = moment(state.start);
    newState.end = moment(state.end);
    ctx.patchState(newState);
  }

  static getValue<T extends keyof HistorySatateModel>(param: T) {
    return createSelector(
      [HistorySatate],
      (state: HistorySatateModel): HistorySatateModel[T] => state[param]
    );
  }

  @Selector([HistorySatate, SaleState.sales])
  static getHistory(state: HistorySatateModel, sales: Sale[]): HistorySales[] {
    let start = state.start,
      end = state.end,
      view = state.view,
      reverse = state.reverse;

    let historys: HistorySales[];

    const predicat = (s: Sale) =>
      moment(s.timestamp).isBetween(start, end, "day", "[]");

    const iterateeView = (s: Sale) => {
      let strFormat =
        view === "day" ? "D MMMM YYYY" : view == "month" ? "MMMM YYYY" : "YYYY";
      return moment(s.timestamp)
        .locale("ru")
        .format(strFormat);
    };

    //let startCount, endCount;

    //startCount = Date.now();

    const calcProductsByDate = (products: Product[]) => {
      return _(products).reduce((acc, p) => {
          acc[0] += p.count;
          acc[1] += p.count * p.price;
          return acc;
        },
        [0, 0]
      );
    };

    const calcSalesByDate = (sales: Sale[]): ProductHistory[] => {
      return _(sales)
        .reduce((acc, s) => acc.concat(s.productList), _<Product>([]))
        .groupBy(p => p.name)
        .toPairs()
        .map(([name, products]) => {
          let [count, total] = calcProductsByDate(products);
          return { name, count, total };
        })
        .value();
    };

    historys = _(sales)
      .filter(predicat)
      .orderBy(["timestamp"], "asc")
      .groupBy(iterateeView)
      .toPairs()
      .map(
        ([date, sales]): HistorySales => {
          let numSales = sales.length;
          let products = calcSalesByDate(sales);
          let discount: number = _(sales).reduce((acc, s) => acc + s.discount, 0);
          return { date, discount, numSales, products };
        }
      )
      .value();

    //endCount = Date.now();
    //console.log("time select historyLodash: ", endCount - startCount);
    return reverse ? historys.reverse() : historys;
  }

  @Action(SetHistory)
  setHistory(
    { patchState }: StateContext<HistorySatateModel>,
    { key, value }: SetHistory
  ) {
    patchState({
      [String(key)]: value
    });
  }

  @Action(ToggleReverse)
  toggleReverse({ getState, patchState }: StateContext<HistorySatateModel>) {
    let reverse = getState().reverse;
    patchState({ reverse: !reverse });
  }

  @Action(SetView)
  selectView(
    { patchState }: StateContext<HistorySatateModel>,
    { value }: SetPeriod
  ) {
    switch (value) {
      case 0:
        patchState({ view: "day", currentView: value });
        break;
      case 1:
        patchState({ view: "month", currentView: value });
        break;
      case 2:
        patchState({ view: "year", currentView: value });
        break;
    }
  }

  @Action(SetPeriod)
  selectPeriod(
    { patchState }: StateContext<HistorySatateModel>,
    { value }: SetPeriod
  ) {
    switch (value) {
      case 0:
        patchState({
          start: moment().startOf("week"),
          end: moment(),
          currentPeriod: value
        });
        break;
      case 1:
        patchState({
          start: moment().startOf("month"),
          end: moment(),
          currentPeriod: value
        });

        break;
      case 2:
        patchState({
          start: moment().startOf("year"),
          end: moment(),
          currentPeriod: value
        });
        break;
      case 3:
        patchState({
          start: moment(),
          end: moment(),
          currentPeriod: value
        });
        break;
    }
  }
}

//** RXJS */
/*
	 let startCountRXJS, endCountRXJS;
    let historyRXJS;
    const keySelectorByView = (s: Sale) => {
      let strFormat =
        view === "day" ? "D MMMM YYYY" : view == "month" ? "MMMM YYYY" : "YYYY";
      return moment(s.timestamp)
        .locale("ru")
        .format(strFormat);
    };
    const predicatFilterSale = (s: Sale) =>
      moment(s.timestamp).isBetween(start, end, "day", "[]");
    startCountRXJS = Date.now();

    interface calcProduct {
      name: string;
      count: number;
      total: number;
    }

    from(
      sales.slice().sort((a, b) =>
        reverse
          ? Number(a.timestamp) - Number(b.timestamp)
          : Number(b.timestamp) - Number(a.timestamp)
      )
    )
      .pipe(
        filter(predicatFilterSale),
        groupBy(keySelectorByView),
        mergeMap((salesByDate$, i) => {
          let calcDiscount$ = salesByDate$.pipe(
            reduce((acc, s: Sale) => acc + s.discount, 0)
          );
          let calcProduct$ = salesByDate$.pipe(
            reduce((acc: Product[], s: Sale) => [...acc, ...s.productList], []),
            switchMap(pl => from(pl)),
            groupBy(p => p.name),
            mergeMap(products$ => {
              let calcProduct$ = products$.pipe(
                reduce(
                  (acc: calcProduct, p: Product) => {
                    acc.count += p.count;
                    acc.total += p.count * p.price;
                    return acc;
                  },
                  {
                    name: products$.key,
                    count: 0,
                    total: 0
                  }
                )
              );
              return calcProduct$;
            }),
            reduce((acc: calcProduct[], p) => [...acc, p], [])
          );

          return zip(calcDiscount$, calcProduct$).pipe(
            map(([calcDiscount, calcProduct]) => ({
              date: salesByDate$.key,
              discount: calcDiscount,
              products: calcProduct
            }))
          );
        }),
        reduce((acc: any, s) => [...acc, s], [])
      )
      .pipe(
        tap(s => {
          endCountRXJS = Date.now();
          console.log(
            "time select historyRXJS: ",
            endCountRXJS - startCountRXJS,
            s
          );
        })
      )
      .subscribe(sales => (historyRXJS = sales));
*/
//return historyRXJS;

//====================
