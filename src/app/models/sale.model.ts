import { Moment } from 'moment';

export interface SaleStateModel {
    sales: Sale[];
    error: any;
    select: Sale;
    loading: boolean;
  }

export interface SaleList {
    id: any;
    total: number;
    count: number;
  }


export interface Product {
    name: string,
    price: number,
    count: number
    // constructor(

    // ) { }
    // get total() {
    //     return this.price * this.count
    // }
    // static create({ name, price, count }) {
    //     return new Product(name, price, count);
    // }
}

export interface Sale {
    discount: number,
    productList: Product[],
    timestamp?: number | string,
    id?: any,
    // constructor(
    //     public discount: number,
    //     public productList: Product[],
    //     public timestamp: number,
    //     public id?: any,
    // ) {
    //     if (typeof timestamp != 'undefined' && isNaN(timestamp)) throw "timestamp error type  NaN";
    //     this.productList = productList.map(p => Product.create(p));
    // }
    // get date() {
    //     return new Date(this.timestamp);
    // }
    // set date(d: Date) {
    //     this.timestamp = d.valueOf();
    // }
    // get total() {
    //     return this.productList.reduce((sum, p) => sum += p.total, 0) - this.discount;
    // }
    // get count() {
    //     return this.productList.length;
    // }

    //     static create({ discount = 0, productList = [], timestamp = Date.now(), id = 0 } = {}) {
    //     return new Sale(discount, productList, timestamp, id);
    // }
}
