import { Injectable } from "@angular/core";

import { Product, Sale } from "../models/sale.model";
import { Store, Select } from "@ngxs/store";

let namesProduct = [
  "Свинтус. Премиум-издание",
  "Челюсти",
  "Запретная пустыня",
  "Война Полов",
  "Золото",
  "Экивоки. Зима",
  "Экивоки Космос",
  "Хугермугер",
  "Экивоки. Лето",
  "Статуи",
  "Экивоки",
  "Делириум",
  "Имаджинариум 5 лет",
  "Тик Так Бумм Карточная",
  "Нефариус",
  "Жирафометр",
  "Тараканы в холодильнике",
  "Сундук приключений",
  "Свинтус Делюкс"
];

@Injectable({
  providedIn: "root"
})
export class GeneratorBase {
  constructor(private store: Store) {}
  *genDate(from: Date, to: Date = new Date()) {
    while (from.getTime() <= to.getTime()) {
      yield from;
      from.setDate(from.getDate() + 1);
    }
  }

  id: number = 1;
  randomProduct(): Product {
    return {
      name: this.randomName(),
      count: this.random(1, 5),
      price: this.random(1, 5) * 1000
    };
  }
  genereteSale(from: Date, to: Date = new Date()) {
    let sales: Sale[] = [];
    let id = 1;
    for (let date of this.genDate(from, to)) {
      let countSales = this.random(0, 10);
      while (countSales--) {
        this.names = [];
        let productList: Product[] = Array.from(
          { length: this.random(1, 3) },
          () => this.randomProduct()
        );
        let sale: Sale = {
          discount: this.random(1, 3) * 100,
          productList,
          timestamp: date.getTime(),
          id: id++
        };
        sales.push(sale);
      }
    }
    this.valid(sales);
    return { sales };
  }

  private valid(sales: Sale[]) {
    sales.forEach(s => {
      s.productList.forEach(p => {
        let prod = s.productList.filter(pp => pp.name === p.name);
        if (prod.length > 1) console.log(s.id);
      });
    });
  }

  private random(from: number, to: number): number {
    let rand = from + Math.random() * (to - from + 1);
    return Math.floor(rand);
  }
  names = [];
  private randomName() {
    if (this.names.length === namesProduct.length) {
      this.names = [];
    }
    let freeNames = namesProduct.filter(v => !~this.names.indexOf(v));
    let freeName = freeNames[this.random(0, freeNames.length - 1)];
    this.names.forEach(n => {
      if (this.names.includes(freeName)) {
        console.log("compare");
      }
    });
    this.names.push(freeName);
    return freeName;
  }
}
