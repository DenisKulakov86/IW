import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, tap, map } from 'rxjs/operators';

@Injectable({ providedIn: "root" })
export class NameProductService {

    constructor(private http: HttpClient) { }
    static localUrl = "/assets/data/name-products.json";
    getNames() {
        return this.http.get<{ nameProducts: string[] }>(`${NameProductService.localUrl}`)
        // .pipe(
        //     // delay(1000), 
        //     tap(console.log),
        //     // map(({nameProducts}) => nameProducts)
        //     )
    }
}