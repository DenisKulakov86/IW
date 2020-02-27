export interface NameProductsModel {
    names: NameProducts[];
    loading: boolean;
    error: any;
}

export interface NameProducts{
    name: string;
    id?:any
}