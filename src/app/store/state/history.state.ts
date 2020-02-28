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
import { Sale } from "src/app/models/sale.model";

export interface productHistory {
  name: string;
  count: number;
  total: number;
}

export interface HistorySale {
  title: string;
  discount: number;
  products: productHistory[];
}

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
    start: moment(),
    end: moment(),
    view: "day",
    dialogPeriod: [
      "За последнию неделю",
      "За последный месяц",
      "За последный год",
      "Другое"
    ],
    selectPeriod: 0,
    dialogView: ["День", "Месяц", "Год"],
    selectView: 0,
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

  static getValue(param: keyof HistorySatateModel) {
    return createSelector(
      [HistorySatate],
      (state: HistorySatateModel) => state[param]
    );
  }
  // HistoryTable
  @Selector([HistorySatate, SaleState.sales])
  static getHistory(state: HistorySatateModel, sales: Sale[]): History | any {
    let historys = [];
    let date = state.start.clone();
    if (state.start.isAfter(state.end)) return [];

    while (date.isSameOrBefore(state.end, state.view)) {
      let sales = filter(date, state.view);
      let history: HistorySale = {
        title: date
          .locale("ru")
          .format(
            state.view == "day"
              ? "D MMMM YYYY"
              : state.view == "month"
              ? "MMMM YYYY"
              : "YYYY"
          ),
        discount: sales.reduce((acc, s) => (acc += s.discount), 0),
        products: calcProducts(sales)
      };
      historys.push(history);
      date.add(1, state.view);
    }


    function filter(
      date: moment.Moment,
      unit: moment.unitOfTime.DurationConstructor
    ): Sale[] {
      return sales.filter(s => date.isSame(s.timestamp, unit));
    }

    function calcProducts(sales: Sale[]): productHistory[] {
      return sales.reduce((acc, s) => {
        s.productList.forEach(p => {
          let prod = acc.find(prod => prod.name === p.name);
          // console.log("acc: ", acc, "   prod: ", prod, "    name: ", p.name);
          if (!prod)
            acc.push({
              name: p.name,
              count: p.count,
              total: p.count * p.price
            });
          else {
            prod.count += p.count;
            prod.total += p.count * p.price;
          }
        });
        return acc;
      }, []);
    }
    
    if (!state.reverse) historys = historys.reverse();
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
