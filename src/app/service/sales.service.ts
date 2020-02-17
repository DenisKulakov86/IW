import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, tap, delay, switchMapTo, take, mapTo } from 'rxjs/operators';
import { of, Observable, throwError } from 'rxjs';
import { Sale } from '../models/sale.model';



export interface IUser {
    id?: string
    name: string;
    age: number;
    nikname?: string;
}


const ID_BASE = "-LzaGoezWBQZ3WxQqScQ"

@Injectable({ providedIn: "root" })
export class SalesService {
    // static url = "https://quickstart-1564505516527.firebaseio.com/users"
    // static url2 = "https://test-with-auth.firebaseio.com/test";
    static url = "https://irksweekend.firebaseio.com/sales";
    static localUrl = "/assets/data/sales.json";
    constructor(private http: HttpClient) { }
    create(obj: any) {
        // return this.http.post<any>(`${SalesService.url}/${user.name}.json`, user)
        return this.http.post<any>(`${SalesService.url}.json`, obj)
    }
    getSales() {
        return this.http.get<{ sales: Sale[] }>(`${SalesService.localUrl}`)
            .pipe(
                // delay(1000),
                // switchMapTo(throwError('Something wrong!')),
            )
    }
    getSale(id: any) {
        // времменно
        // return this.getSales().pipe(
        //     map(httpSale => httpSale.sales.find(s => s.id == id)),
        // )
    }


    get(): Observable<any> {
        return this.http.get<IUser>(`${SalesService.url}.json`)
            .pipe(
                // tap(console.log.bind(this)),
                map((body) =>
                    Object.keys(body).map((key): IUser => {
                        let obj = body[key];
                        return {
                            id: Object.keys(obj)[0],
                            name: key,
                            ...obj[Object.keys(obj)[0]],
                        }
                    })
                ),
                catchError(err => {
                    console.log("error", err);
                    return of([]);
                })
            )
    }
    delete() {
        return this.http.delete(`${SalesService.url}/${ID_BASE}.json`)
    }

    edit(sale: any) {
        return this.http.put(`${SalesService.url}/${ID_BASE}/3.json`, sale);
    }
    update(sale: any) {
        return this.http.patch(`${SalesService.url}/${ID_BASE}/4.json`, sale);

    }
}