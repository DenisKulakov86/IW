
import { State, Action, StateContext, Selector, Actions } from "@ngxs/store";
import { patch, removeItem } from '@ngxs/store/operators';
import { FileService } from 'src/app/service/google-gapi/file.service';
import { GetFileList, GetFile, CreateFile, DeleteFile, UpdateFile, GetBodyFile } from '../actions/file.actions';
import { File } from '../../models/file.model';
import { from, pipe } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';
import { isPromise } from '@angular/compiler/src/util';

export interface FileStateModel {
    files: File[]
    selectedFile: File,
    body: string
}

@State<FileStateModel>({
    name: "FileStore",
    defaults: {
        files: [],
        selectedFile: null,
        body: ""
    }
})
export class FileState {
    constructor(private fileService: FileService) { }

    @Action(GetFileList, { cancelUncompleted: true })
    async getList(ctx: StateContext<FileStateModel>) {
        const list = await this.fileService.list(`mimeType ='application/json' and trashed = false`);
        ctx.patchState({
            files: list.result.files
        })
    }

    @Action(GetFile, { cancelUncompleted: true })
    async getFile(ctx: StateContext<FileStateModel>, { id }: GetFile) {
        const state = ctx.getState();
        let file = state.files.find(f => f.id === id);
        if (!file) {
            let httpFile = await this.fileService.file(id);
            file = httpFile.result;
        }
        ctx.patchState({ selectedFile: file })
    }
    @Action(GetBodyFile, { cancelUncompleted: true })
    getBodyFile(ctx: StateContext<FileStateModel>, { id }: GetFile) {

        return ctx.dispatch(new GetFile(id)).pipe(
            mergeMap(() => from(this.fileService.file(id, "media"))),
            tap((response: gapi.client.Response<gapi.client.drive.File>) => {
                ctx.patchState({ body: response.body })
            })
        )
    }


    @Action(DeleteFile)
    deleteFile(ctx: StateContext<FileStateModel>, { id }: DeleteFile) {
        return from(this.fileService.delete(id)).pipe(
            tap(() => {
                ctx.setState(
                    patch({
                        files: removeItem<File>(f => f.id === id)
                    })
                );
            })
            //tap(() => ctx.dispatch(new GetFileList())),
            // mergeMap(() => ctx.dispatch(new GetFileList()))
        );
    }

    @Action(CreateFile)
    createFile(ctx: StateContext<FileStateModel>, { name, data }: CreateFile) {

        return from(this.fileService.createFile(name, data)).pipe(
            mergeMap(() => ctx.dispatch(new GetFileList()))
        );
        // await this.fileService.createFile(name, data);
        // return ctx.dispatch(new GetFileList());
    }

    @Action(UpdateFile)
    updateFile(ctx: StateContext<FileStateModel>, { id, name, data }: UpdateFile) {

        return from(this.fileService.updateFile({ id, name, data })).pipe(
            mergeMap(() => ctx.dispatch(new GetFileList()))
        );
        // await this.fileService.createFile(name, data);
        // return ctx.dispatch(new GetFileList());
    }
    @Selector()
    static file(state: FileStateModel) {
        return state.selectedFile;
    }

    @Selector()
    static list(state: FileStateModel) {
        return state.files;
    }
    @Selector()
    static body(state: FileStateModel) {
        return state.files;
    }
}