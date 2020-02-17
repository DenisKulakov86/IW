export class SignIn {
    static readonly type = "[Auth2] SignIn"
}

export class SignOut {
    static readonly type = "[Auth2] SignOut"
}
export class UpdateSigninStatus {
    static readonly type = '[Auth2] Update Signin Status';
    constructor(public isSignedIn: boolean) { }
}
export class InitSession{
    static readonly type = '[Auth2] Init Session gapi'
}