import { HistorySatateModel } from 'src/app/models/history.model';

export class SetHistory<T = HistorySatateModel> {
  static readonly type = "[History] Set History";
  constructor(public key: keyof T , public value: T[keyof T]) {}
}
export class ToggleReverse {
    static readonly type = "[History] Toggle Reverse";
    constructor() {}
  }

export class SetPeriod {
  static readonly type = "[History] Set Period";
  constructor(public value: number) {}
}
export class SetView {
  static readonly type = "[History] Set View";
  constructor(public value: number) {}
}
