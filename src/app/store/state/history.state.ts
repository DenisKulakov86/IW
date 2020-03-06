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
  Param,
  SetHistory,
  SelectPeriod,
  ToggleReverse,
  SelectView
} from "../actions/history.action";
import { from, of } from "rxjs";
import { switchMap, switchMapTo, map } from "rxjs/operators";
import { SaleState } from "./sale.state";
import { HistoryTable } from "src/app/components/history/table-history/table-history.component";
import { Sale, Product } from "src/app/models/sale.model";
import HistorySales from 'src/app/models/history.model';
import * as _ from 'lodash';

export interface productHistory {
  name: string;
  count: number;
  total: number;
}

// export interface HistorySale {
//   title: string;
//   discount: number;
//   products: productHistory[];
// }

export interface HistorySatateModel {
  start: moment.Moment;
  end: moment.Moment;
  view: moment.unitOfTime.DurationConstructor;

  dialogPeriod: string[];
  selectPeriod: number;

  dialogView: string[];
  selectView: number;
  reverse: boolean;
}

@State<HistorySatateModel>({
  name: "History",
  defaults: {
    start: moment([2020, 2, 1]),
    end: moment(),
    view: "day",
    dialogPeriod: [
      "За последнию неделю",
      "За последный месяц",
      "За последный год",
      "Другое"
    ],
    selectPeriod: 3,
    dialogView: ["День", "Месяц", "Год"],
    selectView: 0,
    reverse: false
  }
})
export class HistorySatate {
  constructor(private store: Store) { }

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
  static getHistory(state: HistorySatateModel, sales: Sale[]): History | any {

    // _.groupBy()
    let historys = [];
    // let date = state.start.clone();
    // if (state.start.isAfter(state.end)) return [];

    // while (date.isSameOrBefore(state.end, state.view)) {
    //   let sales = filter(date, state.view);
    //   let history: HistorySales = {
    //     date: date
    //       .locale("ru")
    //       .format(
    //         state.view == "day"
    //           ? "D MMMM YYYY"
    //           : state.view == "month"
    //             ? "MMMM YYYY"
    //             : "YYYY"
    //       ),
    //     discount: sales.reduce((acc, s) => (acc += s.discount), 0),
    //     products: calcProducts(sales)
    //   };
    //   historys.push(history);
    //   date.add(1, state.view);
    // }


    // function filter(
    //   date: moment.Moment,
    //   unit: moment.unitOfTime.DurationConstructor
    // ): Sale[] {
    //   return sales.filter(s => date.isSame(s.timestamp, unit));
    // }

    // function calcProducts(sales: Sale[]): productHistory[] {
    //   // debugger;
    //   let res = sales
    //     .reduce((acc, s) => [...acc, ...s.productList], [])
    //     .reduce((acc: productHistory[], cur: Product) => {

    //       let item = acc.find(p => p.name === cur.name);
    //       if(item){
    //         item.total += cur.price * cur.count
    //         item.count += cur.count;
    //         return acc
    //       }
    //       else  {
    //         return [...acc, {name: cur.name, count: cur.count, total: cur.count * cur.price}]
    //       }
    //     }, [])
    //   return res;
    // }

    // if (!state.reverse) historys = historys.reverse();
    return historys;
  }

  @Action(SetHistory)
  setHistory(
    { patchState, getState }: StateContext<HistorySatateModel>,
    { key, value }: SetHistory
  ) {
    const state = getState();
    let newState = {};
    newState = { ...state };
    newState[key] = value;
    patchState(newState);
  }

  @Action(ToggleReverse)
  toggleReverse({ getState, patchState }: StateContext<HistorySatateModel>) {
    let reverse = getState().reverse;
    patchState({ reverse: !reverse });
  }

  @Action(SelectView)
  selectView(
    { patchState }: StateContext<HistorySatateModel>,
    { value }: SelectPeriod
  ) {
    switch (value) {
      case 0:
        patchState({ view: "day", selectView: value });
        break;
      case 1:
        patchState({ view: "month", selectView: value });
        break;
      case 2:
        patchState({ view: "year", selectView: value });
        break;
    }
  }

  @Action(SelectPeriod)
  selectPeriod(
    { patchState }: StateContext<HistorySatateModel>,
    { value }: SelectPeriod
  ) {
    switch (value) {
      case 0:
        patchState({
          start: moment().startOf("week"),
          end: moment(),
          selectPeriod: value
        });
        break;
      case 1:
        patchState({
          start: moment().startOf("month"),
          end: moment(),
          selectPeriod: value
        });

        break;
      case 2:
        patchState({
          start: moment().startOf("year"),
          end: moment(),
          selectPeriod: value
        });
        break;
      case 3:
        patchState({
          start: moment(),
          end: moment(),
          selectPeriod: value
        });
        break;
    }
  }
}
