import {
  State,
  Selector,
  StateContext,
  Action,
  Actions,
  ofActionDispatched,
  NgxsAfterBootstrap,
  ofActionSuccessful
} from "@ngxs/store";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  SignIn,
  SignOut,
  SignInAnonymously,
  SignInEmail
} from "../actions/auth.actions";
import { from, of } from "rxjs";
import * as firebase from "firebase/app";
import { Router } from "@angular/router";
import { tap, catchError } from "rxjs/operators";
import { User, UserSateModel } from "src/app/models/user.model";

@State<UserSateModel>({
  name: "auth",
  defaults: {
    user: null
  }
})
export class AuthState implements NgxsAfterBootstrap {
  constructor(
    private router: Router,
    private actions: Actions,
    private afAuth: AngularFireAuth
  ) {}
  ngxsAfterBootstrap(ctx: StateContext<UserSateModel>) {}
  ngxsOnInit(ctx: StateContext<UserSateModel>) {
    // this.afAuth.authState.subscribe((user: firebase.User) => {});
  }

  @Selector()
  static user(state: UserSateModel) {
    return state.user;
  }

  @Selector()
  static isSignedIn(state: UserSateModel) {
    return !!state.user;
  }

  @Action(SignIn)
  signIn({ patchState }: StateContext<UserSateModel>) {
    return from(
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    ).pipe(
      tap(({ user }) => patchState({ user: this.getUserFromState(user) })),
      catchError(err => of("ooops"))
    );
  }

  @Action(SignInAnonymously)
  signInAnonymously({ patchState }: StateContext<UserSateModel>) {
    return from(this.afAuth.auth.signInAnonymously()).pipe(
      tap(({ user }) => patchState({ user: this.getUserFromState(user) }))
    );
  }

  @Action(SignInEmail)
   signInEmail({ patchState }: StateContext<UserSateModel>) {
    // await this.afAuth.auth.createUserWithEmailAndPassword(
    //   "user@gmai.com",
    //   "123456"
    // );
    return from(
      this.afAuth.auth.signInWithEmailAndPassword("user@gmail.com", "123456")
    ).pipe(
      tap(({ user }) => patchState({ user: this.getUserFromState(user) }))
    );
  }

  @Action(SignOut)
  signOut({ patchState, setState }: StateContext<UserSateModel>) {
    return from(this.afAuth.auth.signOut()).pipe(
      tap(() => patchState({ user: null }))
    );
  }
  getUserFromState(user: firebase.User): User | null {
    if (user)
      return {
        uid: user.uid,
        email: user.email || "anonymous@mail.com",
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || "https://via.placeholder.com/100x100?text=A",
        somethingCustom: null
      };
    else return null;
  }
}
