export interface User {
    uid: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    somethingCustom?: string;
}

export interface UserSateModel {
    user: User
}
