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
import { SignIn, SignOut } from "../actions/auth.actions";
import { from } from "rxjs";
import * as firebase from "firebase/app";
import { Router } from "@angular/router";
import { tap } from "rxjs/operators";
import { User, UserSateModel } from 'src/app/models/user.model';

@State<UserSateModel>({
  name: "user",
  defaults: {
    user: null,
  }
})
export class AuthState implements NgxsAfterBootstrap {
  constructor(
    private router: Router,
    private actions: Actions,
    private afAuth: AngularFireAuth
  ) { }
  ngxsAfterBootstrap(ctx: StateContext<UserSateModel>) { }
  ngxsOnInit(ctx: StateContext<UserSateModel>) {
    this.actions
      .pipe(ofActionDispatched(SignOut))
      .subscribe(() => this.router.navigate(["/login"]));
    this.actions
      .pipe(ofActionSuccessful(SignIn))
      .subscribe(() => this.router.navigate(["/"]));
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
    return from(this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()))
      .pipe(tap(({ user }) => patchState({ user: this.getUserFromState(user) })))
  }

  // @Action(SignIn)
  // signInAnonymously({ patchState }: StateContext<UserSateModel>) {
  //   return from(this.afAuth.auth.signInAnonymously())
  //     .pipe(tap(({ user }) => patchState({ user: this.getUserFromState(user) })))
  // }

  @Action(SignOut)
  signOut({ patchState, setState }: StateContext<UserSateModel>) {
    return from(this.afAuth.auth.signOut())
      .pipe(tap(() => patchState({ user: null })))
  }
  getUserFromState(user: firebase.User): User | null {
    if (user)
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        somethingCustom: null
      }
    else
      return null;

  }
}
