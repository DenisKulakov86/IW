import * as moment from "moment";
import { HistorySatateModel } from '../state/history.state';

export type Param =
  | "dialogPeriod"
  | "selectPeriod"
  | "start"
  | "end"
  | "reverse";
export class SetHistory<T = HistorySatateModel> {
  static readonly type = "[History] Set History";
  constructor(public key: keyof T, public value: T[keyof T]) {}
}
export class ToggleReverse {
    static readonly type = "[History] Toggle Reverse";
    constructor() {}
  }

export class SelectPeriod {
  static readonly type = "[History] SelectPeriod";
  constructor(public value: number) {}
}
export class SelectView {
  static readonly type = "[History] Select View";
  constructor(public value: number) {}
}

// export class SetStart {
//   static readonly type = "[History] Set Start";
//   constructor(public value: moment.Moment) {}
// }

// export class SetEnd {
//   static readonly type = "[History] Set End";
//   constructor(public value: moment.Moment) {}
// }
