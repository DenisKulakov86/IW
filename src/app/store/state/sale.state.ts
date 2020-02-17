import { Sale } from 'src/app/models/sale.model';
import { State, NgxsOnInit, StateContext, Store, Action, Selector, createSelector } from '@ngxs/store';
import { patch, removeItem, updateItem, append, iif, insertItem } from '@ngxs/store/operators'
import { FileService } from 'src/app/service/google-gapi/file.service';
import { from, of, empty } from 'rxjs';
import { pluck, tap, filter, switchMap, map, mergeMap, catchError, take, retry } from 'rxjs/operators';
import { AuthState } from './auth.state';
import { GetSales, SetBaseInfo, DeleteBaseInfo, DeleteSale, ChangeSale, UploadSales, GetSale, NewSale, SaveSale } from '../actions/sale.actions';
import { File } from '../../models/file.model'
import { SalesService } from 'src/app/service/sales.service';

import * as moment from "moment";
import { Moment } from 'moment';


function saveSales(ctx: StateContext<SaleStateModel>) {
    let sales = ctx.getState().sales;
    localStorage.setItem('mockSales', JSON.stringify({ sales }));
}

function insertOrUpdateSale(id: any, loadedSale?: Sale) {
    console.log(loadedSale);
    return iif<Sale[]>(
        sales => sales.some(s => s.id == id),
        updateItem(sale => sale.id == id, patch(loadedSale)),
        append([loadedSale])
    )
}

export interface SaleStateModel {
    sales: Sale[];
    error: any,
    select: Sale,
    baseInfo: File,
    loading: boolean
}


@State<SaleStateModel>({
    name: "SaleStore",
    defaults: {
        sales: [],
        error: null,
        loading: false,
        select: null,
        baseInfo: null
    }
})
export class SaleState implements NgxsOnInit {
    constructor(
        private fileServise: FileService,
        private store: Store,
        private salesService: SalesService
    ) { }

    ngxsOnInit(ctx: StateContext<SaleStateModel>) {
        // let sales = localStorage.getItem('mockSales');
        // ctx.patchState(JSON.parse(sales, (key, val) => {
        //     return key == "date" ? new Date(val) : val;
        // }))
        this.store.select(AuthState.isSignedIn)
            .pipe(filter(isSignIn => isSignIn === true))
            .subscribe(() => {
                ctx.dispatch(new GetSales());
            })
    }

    @Action(GetSales)
    getSales(ctx: StateContext<SaleStateModel>) {
        ctx.patchState({ loading: true, error: null })
        return this.salesService.getSales().pipe(
            tap(
                ({ sales }) => ctx.patchState({ sales, loading: false }),
                err => ctx.patchState({ loading: false, error: err, sales: [] })
            ),
        )

        // let baseInfo: File = ctx.getState().baseInfo || JSON.parse(localStorage.getItem("baseInfo"))
        // if (!baseInfo) {
        //     return;
        // }

        // return from(this.fileServise.file(baseInfo.id, "media"))
        //     .pipe(
        //         pluck('result', 'sales'),
        //         map((sales) => (sales as Sale[]).map(s => (new Sale(s.id, s.timestamp, s.discount, s.productList)))),
        //         tap(sales => {
        //             console.log(sales);

        //             ctx.patchState({ sales, baseInfo })
        //         })
        //     )
    }
    @Action(UploadSales)
    uploadSales(ctx: StateContext<SaleStateModel>) {

    }

    @Action(SetBaseInfo)
    setBaseInfo(ctx: StateContext<SaleStateModel>, { baseInfo }: SetBaseInfo) {
        localStorage.setItem("baseInfo", JSON.stringify(baseInfo));
        ctx.patchState({ baseInfo });
        ctx.dispatch(new GetSales());
    }

    @Action(DeleteBaseInfo)
    deleteBaseInfo(ctx: StateContext<SaleStateModel>) {
        localStorage.removeItem("baseInfo");
        ctx.patchState({ baseInfo: null });
    }

    @Action(DeleteSale)
    deleteSale(ctx: StateContext<SaleStateModel>, { id }: DeleteSale) {
        ctx.setState(
            patch({
                sales: removeItem<Sale>(s => s.id === id)
            })
        )
        // saveSales(ctx);
        //do api
    }

    @Action(NewSale)
    newSale(ctx: StateContext<SaleStateModel>) {
        let newSale: Sale = {
            discount: 0,
            productList: [],
            timestamp: null,
            id: null
        }
        ctx.patchState({ select: newSale });
    }
    @Action(GetSale)
    getSale(ctx: StateContext<SaleStateModel>, { id }: GetSale) {
        let state = ctx.getState();
        let sale = state.sales.find(s => s.id == id)
        ctx.patchState({ select: sale });
    }
    @Action(ChangeSale)
    changeSale(ctx: StateContext<SaleStateModel>, { discount, productList }: ChangeSale) {
        ctx.setState(
            patch({
                select: patch({
                    discount,
                    productList
                })
            })
        )
    }
    @Action(SaveSale)
    saveSale(ctx: StateContext<SaleStateModel>) {
        let select = ctx.getState().select;
        if (!select.productList.length) {
            if (!select.id) return;
            else this.store.dispatch(new DeleteSale(select.id))
        }
        else {
            if (!select.id) {
                let id = Math.max(...ctx.getState().sales.map(s => s.id), 0) + 1;
                select = {
                    ...select,
                    timestamp: moment().valueOf(),
                    id
                }
            }
            ctx.setState(
                patch({
                    sales: insertOrUpdateSale(select.id, select)
                })
            );
        }
    }
    @Selector()
    static loading(state: SaleStateModel) {
        return state.loading;
    }
    @Selector()
    static error(state: SaleStateModel) {
        return state.error;
    }
    @Selector()
    static baseInfo(state: SaleStateModel) {
        return state.baseInfo;
    }
    @Selector()
    static sales(state: SaleStateModel) {
        return state.sales;
    }
    @Selector()
    static select(state: SaleStateModel) {

        return state.select;
    }


    static getSaleByDate(dateFrom: moment.Moment, dateTo: moment.Moment = dateFrom) {
        return createSelector(
            [SaleState],
            (state: SaleStateModel) => {
                return state.sales ? state.sales.filter(s => moment(s.timestamp).isBetween(dateFrom, dateTo, "day", '[]')) : [];
            }
        )
    }
    static getSaleById(id: number) {
        return createSelector(
            [SaleState],
            (state: SaleStateModel) => {
                return state.sales && state.sales.find(s => s.id === id)
            }
        )
    }
}
