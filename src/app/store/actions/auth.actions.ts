export class SignIn {
    static readonly type = "[Auth] SignIn"
}
export class SetUser {
    static readonly type = "[Auth] Set User"
    constructor(public user: firebase.User | null){}
}

export class SignOut {
    static readonly type = "[Auth] SignOut"
}
