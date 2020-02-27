export class GetNameProducts {
    static readonly type = '[Name Products] Get Name Products';
}

export class AddNameProduct {
    static readonly type = '[Name Products] Add Name Product';
    constructor(public name: string){}
}