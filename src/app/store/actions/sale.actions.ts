import { File } from "../../models/file.model";
import { Sale, Product } from "src/app/models/sale.model";


export class SetSales {
  static readonly type = "[Sale] Set Sales";
  constructor (public sales: Sale[]){}
}

export class DeleteSale {
  static readonly type = "[Sale] Delete Sale";
  constructor(public id: any) {}
}

// export class SelectSale {
//   static readonly type = "[Sale] Select Sale";
//   constructor(public id: any) {}
// }

export class NewSale {
  static readonly type = "[Sale] New Sale";
}

export class GetSale {
  static readonly type = "[Sale] Get Sale by ID";
  constructor(public id: any, public indx: number) {}
}



export class SaveSale {
  static readonly type = "[Sale] Save Sale";
}
export class AddSale {
  static readonly type = "[Sale] Add Sale";
}
export class UpdateSale {
  static readonly type = "[Sale] Update Sale";
}

export class ChangeSale {
  static readonly type = "[Sale] Change Sale";
  constructor(public sale: Sale) {}
}
