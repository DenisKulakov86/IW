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
import { SignIn, SignOut, SetUser } from "../actions/auth.actions";
import { from } from "rxjs";
import * as firebase from "firebase/app";
import { AuthenticationService } from "src/app/service/auth.service";
import { Router } from "@angular/router";
import { NgZone } from "@angular/core";
import { tap } from "rxjs/operators";
export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  somethingCustom?: string;
}
@State<User>({
  name: "Auth",
  defaults: null
})
export class AuthState implements NgxsAfterBootstrap {
  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private actions: Actions
  ) {}
  ngxsAfterBootstrap(ctx: StateContext<User>) {}
  ngxsOnInit(ctx: StateContext<User>) {
    this.actions
      .pipe(ofActionDispatched(SignOut))
      .subscribe(() => this.router.navigate(["/login"]));
    this.actions
      .pipe(ofActionSuccessful(SignIn))
      .subscribe(() => this.router.navigate(["/"]));
  }

  @Selector()
  static user(state: User) {
    console.log("Selector user", state);

    return state;
  }

  @Selector()
  static isSignedIn(state: User) {
    return !!state;
  }


  @Action(SignIn)
  signIn(ctx: StateContext<User>) {
    return from(this.auth.googleSignin()).pipe(
      tap(
        ({
          user: { uid, email, photoURL, displayName }
        }: firebase.auth.UserCredential) => {
          ctx.setState({ uid, email, photoURL, displayName });
        }
      )
    );
  }
  @Action(SignOut)
  signOut(ctx: StateContext<User>) {
    return from(this.auth.signOut()).pipe(tap(() => ctx.setState(null)));
  }
}
