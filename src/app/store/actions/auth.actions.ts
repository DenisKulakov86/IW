import { User } from 'src/app/models/user.model'

export class SignIn {
    static readonly type = "[Auth] SignIn"
}
export class SetUser {
    static readonly type = "[Auth] Set User"
    constructor(public user: User | null){}
}

export class SignOut {
    static readonly type = "[Auth] SignOut"
}
