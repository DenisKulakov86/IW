import * as moment from "moment";


export interface HistorySatateModel {
  start: moment.Moment;
  end: moment.Moment;
  view: moment.unitOfTime.DurationConstructor;

  dialogPeriod: string[];
  currentPeriod: number;

  dialogView: string[];
  currentView: number;
  reverse: boolean;
}

export interface ProductHistory {
  name: string;
  count: number;
  total: number;
}

export default interface HistorySales {
    date: string;
    discount: number;
    numSales:number;
    products: {
      name: string;
      count: number;
      total: number;
    }[]
  }