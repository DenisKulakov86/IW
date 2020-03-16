import { State, StateContext, Store, Action, NgxsOnInit, Selector } from '@ngxs/store';
import { AuthState } from './auth.state';
import { filter, tap, map, switchMap } from 'rxjs/operators';
import { GetNameProducts, AddNameProduct } from '../actions/name-products.action';
import { NameProductsModel, NameProducts } from 'src/app/models/name-products.model';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { empty } from 'rxjs';




@State<NameProductsModel>({
    name: "nameProducts",
    defaults: {
        names: [],
        loading: false,
        error: null
    },
})
export class NameProductsSate implements NgxsOnInit {
    nameProductsRef: AngularFireList<string>
    constructor(
        private db: AngularFireDatabase,
        private store: Store,
    ) {

    }
    ngxsOnInit(ctx: StateContext<NameProductsModel>) {
        let nameProductsRef$ = this.store.select(AuthState.user)
            .pipe(map(user => user ? this.db.list<string>(`${user.uid}/nameproducts`) : null));

        nameProductsRef$.subscribe(ref => this.nameProductsRef = ref);

        nameProductsRef$.pipe(
            switchMap((ref) => {
                if (ref) {
                    ctx.patchState({ loading: true });
                    return ref.snapshotChanges()
                } else {
                    return empty()
                }
            }),
            map(change => change.map((c): NameProducts => ({ name: c.payload.val(), id: c.key, }))),
            // switchMap(() => throwError("something Error"))
        )
            .subscribe(
                names => ctx.patchState({ names, loading: false, error: null }),
                error => ctx.patchState({ error, loading: false })
            );
    }

    @Action(AddNameProduct)
    AddNameProduct(ctx: StateContext<NameProductsModel>, { name }: AddNameProduct) {
        this.nameProductsRef.push(name);
    }

    @Selector()
    static names(state: NameProductsModel) {
        return state.names.map(n => n.name);
    }

}