import { State, StateContext, Store, Action, NgxsOnInit, Selector } from '@ngxs/store';
import { AuthState } from './auth.state';
import { filter, tap } from 'rxjs/operators';
import { GetNameProducts } from '../actions/name-products.action';
import { NameProductService } from 'src/app/service/name-products.service';


export interface NameProductsModel {
    names: string[]
}

@State<NameProductsModel>({
    name: "nameProducts",
    defaults: {
        names: []
    },
})
export class NameProductsSate implements NgxsOnInit {
    constructor(
        private store: Store,
        private nameProductsService: NameProductService
    ) { }
    ngxsOnInit(ctx: StateContext<NameProductsModel>) {
        // let sales = localStorage.getItem('mockSales');
        // ctx.patchState(JSON.parse(sales, (key, val) => {
        //     return key == "date" ? new Date(val) : val;
        // }))
        // this.store.select(AuthState.isSignedIn)
        //     .pipe(filter(isSignIn => isSignIn === true))
        //     .subscribe(() => {
        //         ctx.dispatch(new GetNameProducts());
        //     })
    }

    @Action(GetNameProducts)
    getNameProducts(ctx: StateContext<NameProductsModel>) {
        return this.nameProductsService.getNames()
            .pipe(
                tap(({ nameProducts }) => ctx.patchState({ names: nameProducts }))
            )
    }

    @Selector()
    static names(state: NameProductsModel) {
        return state.names;
    }

}