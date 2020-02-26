import { File } from "../../models/file.model";
import { Sale, Product } from "src/app/models/sale.model";
export class GetSales {
  static readonly type = "[Sale] Get Sales";
}

export class SetSales {
  static readonly type = "[Sale] Set Sales";
  constructor (public sales: Sale[]){}
}

export class UploadSales {
  static readonly type = "[Sale] Upload Sale";
}

export class SetBaseInfo {
  static readonly type = "[Sale] Set Base Info";
  constructor(public baseInfo: File) {}
}

export class DeleteBaseInfo {
  static readonly type = "[Sale] Delete Base Info";
}

export class DeleteSale {
  static readonly type = "[Sale] Delete Sale";
  constructor(public id: any) {}
}

export class GetSale {
  static readonly type = "[Sale] Get Sale";
  constructor(public id: any) {}
}

export class NewSale {
  static readonly type = "[Sale] New Sale";
}

export class SaveSale {
  static readonly type = "[Sale] Save Sale";
}
export class AddSale {
  static readonly type = "[Sale] Add Sale";
}

// export class ChangeSale {
//     static readonly type = '[Sale] Change Sale';
//     constructor(public id: number, public sale: Sale) {
//      }
// }

export class ChangeSale {
  static readonly type = "[Sale] Change Sale";
  constructor(public sale: Sale) {}
}
