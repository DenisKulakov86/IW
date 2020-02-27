import { Pipe, PipeTransform } from '@angular/core';
import { Store, Select, Selector } from '@ngxs/store';
import { SaleState } from 'src/app/store/state/sale.state';
import { Observable, combineLatest } from 'rxjs';
import { Sale } from 'src/app/models/sale.model';
import { NameProductsSate } from 'src/app/store/state/name-products.state';
import { map, tap } from 'rxjs/operators';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  @Select(SaleState.select) select$: Observable<Sale>;
  @Select(NameProductsSate.names) names$: Observable<string[]>

  constructor(private store: Store) { }

  transform(value: string): any {

    return combineLatest(this.select$.pipe(map(s => s.productList.map(p => p.name))), this.names$)
      .pipe(
        // tap(([busy, allname])=>console.log("busy", busy, "allname", allname)),
        map(([busyName, names]) => names.filter(n => !busyName.includes(n) || n.toLocaleUpperCase().includes(value.trim().toLocaleUpperCase()))),
        // tap((freename)=>console.log("freename", freename, "value", value)),
        map(names => names.filter(n => n.includes(value.trim()))),
        // tap(console.log),
      )
  }
}
