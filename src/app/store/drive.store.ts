import { Injectable } from "@angular/core";
import { Subject, MonoTypeOperatorFunction, Observable, from, merge, of, concat, forkJoin } from 'rxjs';
import { filter, exhaustMap, map, startWith, mapTo, tap, scan, catchError, publishReplay, refCount, switchMap, switchAll, first, mergeMap } from 'rxjs/operators';
import { FileService, MIME_TYPE_FOLDER } from '../service/google-gapi/file.service';


type FileList = gapi.client.drive.FileList;
export type File = gapi.client.drive.File;
export type Response<T> = gapi.client.Response<T>;
export interface Action {
    type: EDriveActions,
    payload?: any
}

export interface IBreadcrumbs {
    id: string;
    name: string;
}

interface IDriveState {
    filesList: Response<FileList> | Object;
    file: Response<File> | Object;
    error: any;
    loading: boolean;
    breadcrumbs: IBreadcrumbs[]
}

const defaultListState: IDriveState = {
    filesList: null,
    file: null,
    error: null,
    loading: false,
    breadcrumbs: []
}

export enum EDriveActions {
    list = '[DriveStore] Get List',
    listSuccess = '[DriveStore] Get List Success',
    listNavigateTo = '[DriveStore] Navigate List',
    listNavigateToSuccess = '[DriveStore] Navigate List Success',
    listClear = '[DriveStore] List Clear',
    listError = '[DriveStore] Get List failed',

    file = '[DriveStore] Get File',
    fileSuccess = '[DriveStore] Get File Success',
    fileError = '[DriveStore] Get File failed',

    fileNew = '[DriveStore] New File',

    fileUpd = '[DriveStore] Updata File',
    fileUpdSuccess = '[DriveStore] Updata File Success',
    fileUpdError = '[DriveStore] Updata File Failed ',

    delete = '[DriveStore] Delete',
    deleteSuccess = '[DriveStore] Delete Success',
    deleteError = '[DriveStore] Delete Failed',

    createFolder = '[DriveStore] Create Folder',
    createFolderSuccess = '[DriveStore] Create Folder Success',
    createFolderError = '[DriveStore] Create Folder Failed',

    createFile = '[DriveStore] Create File',
    createFileSuccess = '[DriveStore] Create File Success',
    createFileError = '[DriveStore] Create File Failed',
}

function ofType<T extends Action>(type: EDriveActions): MonoTypeOperatorFunction<T> {
    return filter(_ => type === _.type);
}

@Injectable({
    providedIn: "root"
})
export class DriveStore {

    constructor(private fileService: FileService) { }

    /**
    * Actions
    */
    private actions$: Subject<Action> = new Subject();

    /**
    * Effects
    */

    private _list$: Observable<Action> = this.actions$.pipe(
        ofType(EDriveActions.list),
        exhaustMap((a) => from(this.fileService.list(a.payload)).pipe(
            map((payload) => ({
                type: EDriveActions.listSuccess,
                payload,
            })),
            catchError(erorr => of({
                type: EDriveActions.listError,
                payload: erorr,
            }))
        ))
    );
    private _navigateTo: Observable<Action> = this.actions$.pipe(
        ofType(EDriveActions.listNavigateTo),
        switchMap(() => this.breadcrumbs$.pipe(first())),
        map((bc): Action => {
            this.list({
                id: bc.length ? bc.slice(-1)[0].id : "root"
            });
            return {
                type: EDriveActions.listNavigateToSuccess
            }
        })
    );

    private _delete$: Observable<Action> = this.actions$.pipe(
        ofType(EDriveActions.delete),
        mergeMap((a) => from(this.fileService.delete(a.payload)).pipe(
            map(payload => ({
                type: EDriveActions.deleteSuccess,
                payload
            })),
            catchError(erorr => of({
                type: EDriveActions.deleteError,
                payload: erorr,
            }))
        )),
        // tap(() => this.list())

    );

    private _createFolder$: Observable<Action> = this.actions$.pipe(
        ofType(EDriveActions.createFolder),
        mergeMap((a) => from(this.fileService.createFolder(a.payload)).pipe(
            map(payload => ({
                type: EDriveActions.createFolderSuccess,
                payload
            })),
            catchError(erorr => of({
                type: EDriveActions.createFolderError,
                payload: erorr,
            }))
        ))
    )

    private _createFile$: Observable<Action> = this.actions$.pipe(
        ofType(EDriveActions.createFile),
        mergeMap((a) => from(this.fileService.createFile(a.payload)).pipe(
            map(payload => ({
                type: EDriveActions.createFileSuccess,
                payload
            })),
            catchError(erorr => of({
                type: EDriveActions.createFileError,
                payload: erorr,
            }))
        ))
    )


    private _file$: Observable<Action> = this.actions$.pipe(
        ofType(EDriveActions.file),
        exhaustMap(a =>{
            return forkJoin(
                from(this.fileService.file({ id: a.payload.id })),
                from(this.fileService.file({ id: a.payload.id, alt: "media" }))
            ).pipe(
                map(([info, media]) => {
                    // console.log("info", info, "mrdia", media);
                    info.body = media.body;
                    return {
                        type: EDriveActions.fileSuccess,
                        payload: info
                    }
                }),
                catchError(erorr => of({
                    type: EDriveActions.fileError,
                    payload: erorr,
                }))

            )
        }
        )
    );

    private _updFile$: Observable<Action> = this.actions$.pipe(
        ofType(EDriveActions.fileUpd),
        exhaustMap((a) => from(this.fileService.updateFile(a.payload)).pipe(
            map((payload) => ({
                type: EDriveActions.fileUpdSuccess,
                payload: payload
            })),
            catchError(erorr => of({
                type: EDriveActions.fileUpdError,
                payload: erorr,
            }))

        ))
    );
    /**
    * Dispatcher
    */
    private dispatcher$: Observable<Action> = merge(
        this.actions$,
        this._list$,
        this._navigateTo,
        this._delete$,
        this._createFolder$,
        this._createFile$,
        this._file$,
        this._updFile$
    )
    /**
    * State Reducer
    */
    stateDrive$: Observable<IDriveState> = this.dispatcher$.pipe(
        startWith(defaultListState),
        scan((state: IDriveState, action: Action) => {
            console.log(action.type, '[state]', state);
            return this.reducer(state, action);
        }),
        // tap(state => console.log('[DRIVE new state] ', state)),
        publishReplay(1),
        refCount(),
    )
    reducer(state: IDriveState, action: Action): IDriveState {
        switch (action.type) {
            case EDriveActions.list:
                // console.log(action.payload.id,  (state.file as Response<File>).result.id);
                // if (state.filesList) {
                // state.filesList = null;
                let file: File =
                    (state.filesList && (state.filesList as Response<FileList>).result.files.find(f => f.id === action.payload.id))
                // || 
                //    ( state.file && (state.file as Response<File>).result.id === action.payload.id ? state.file : null)

                if (file && !state.breadcrumbs.find(bc => bc.id === file.id && bc.name === file.name)) {
                    state.breadcrumbs.push({ id: file.id, name: file.name })
                }
                // }
                return {
                    ...state,
                    error: null,
                    loading: true,
                };
            case EDriveActions.listSuccess:
                return { ...state, filesList: action.payload, loading: false };

            // case EFileActions.fileError:
            case EDriveActions.listError:
                return { ...state, error: action.payload, loading: false }
            case EDriveActions.listClear:
                return defaultListState;

            case EDriveActions.listNavigateTo:
                return { ...state, breadcrumbs: state.breadcrumbs.slice(0, -1) };
            case EDriveActions.listNavigateToSuccess:
                return { ...state };
            case EDriveActions.fileUpd:
            case EDriveActions.file:
                return { ...state, file: { result: { name: action.payload.name }, body: JSON.stringify(action.payload.data, null, 2) }, error: null, loading: true };

            case EDriveActions.delete:
            case EDriveActions.createFolder:
            case EDriveActions.createFile:

                return { ...state, error: null, loading: true };

            case EDriveActions.createFolderSuccess:
            case EDriveActions.createFileSuccess:
            case EDriveActions.deleteSuccess:
            case EDriveActions.fileUpdSuccess:
                this.list();
                return { ...state, loading: false }

            case EDriveActions.fileSuccess:
                return { ...state, file: action.payload, loading: false }

            case EDriveActions.createFolderError:
            case EDriveActions.createFileError:
            case EDriveActions.deleteError:
            case EDriveActions.fileError:
            case EDriveActions.fileUpdError:
                return { ...state, error: action.payload, loading: false }

            case EDriveActions.fileNew:
                return { ...state, file: { result: { name: "" }, body: "" } };

            default: return { ...state }
        }
    }

    /**
    * Selectors
    */
    list$: Observable<File[]> = this.stateDrive$.pipe(map(state => state.filesList ? (<Response<FileList>>state.filesList).result.files : []));

    // file$: Observable<string> = this.stateDrive$.pipe(map(state => state.file ? (state.file as Response<File>).body : ""));
    file$: Observable<Response<File>> = this.stateDrive$.pipe(map(state => (state.file as Response<File>)));

    loading$: Observable<boolean> = this.stateDrive$.pipe(map(state => state.loading));

    breadcrumbs$: Observable<IBreadcrumbs[]> = this.stateDrive$.pipe(map(state => state.breadcrumbs));


    /**
    * Actions
    */
    //    list(file: File | IBreadcrumbs = { id: "root", name: "root" }) {
    list({ id = "root", q = `'${id}' in parents and trashed = false` } = {}) {
        this.dispatch({ type: EDriveActions.list, payload:  q  });
    }
    listClear() {
        this.dispatch({ type: EDriveActions.listClear });
    }
    navigateTo() {
        this.dispatch({ type: EDriveActions.listNavigateTo });
    }
    file(id) {
        this.dispatch({ type: EDriveActions.file, payload: { id } });
    }
    fileNew() {
        this.dispatch({ type: EDriveActions.fileNew });
    }
    updataFile({ id, name = "new file", data = {} }) {
        this.dispatch({ type: EDriveActions.fileUpd, payload: { id, name, data } });
    }

    delete(id) {
        this.dispatch({ type: EDriveActions.delete, payload: id });
    }
    createFolder({ name = "New Folder", mimeType = MIME_TYPE_FOLDER, parents = [] }) {
        this.dispatch({ type: EDriveActions.createFolder, payload: { name, mimeType, parents } })
    }
    createFile({ name = "new File", data = {} }: { name: string, data: Object }) {

        this.dispatch({ type: EDriveActions.createFile, payload: { name, data } })
    }

    private dispatch(action: Action): void {
        this.actions$.next(action);
    }

   
}