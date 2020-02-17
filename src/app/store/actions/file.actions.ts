
export class GetFileList {
    static readonly type = '[File] Get List';
}

export class GetFile {
    static readonly type = '[File] Get File';
    constructor(public id: any) { }
}
export class GetBodyFile {
    static readonly type = '[File] Get Body File';
    constructor(public id: any) { }
}

export class CreateFile {
    static readonly type = '[File] Create File'
    constructor(public name: string, public data?: Object) { }
}
export class UpdateFile {
    static readonly type = '[File] Updata File'
    constructor(public id: any, public name?: string, public data?: Object) { }
}
export class DeleteFile{
    static readonly type = '[File] Delete  File'
    constructor(public id:any){}
}