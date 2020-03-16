import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, ofActionDispatched, ofActionSuccessful } from "@ngxs/store";
import { NewSale, GetSale } from "../store/actions/sale.actions";
import { merge } from "rxjs";
import {
  SignOut,
  SignIn,
  SignInAnonymously,
  SignInEmail
} from "../store/actions/auth.actions";

@Injectable({
  providedIn: "root"
})
export class RouterHandlerService {
  constructor(private router: Router, private actions$: Actions) {
    /**
     * SALE NAVIGATION
     */
    actions$.pipe(ofActionDispatched(NewSale)).subscribe(() => {
      router.navigate(["/sale-detail", "new-sale"]);
    });
    actions$.pipe(ofActionDispatched(GetSale)).subscribe(({ id, indx }) => {
      router.navigate(["/sale-detail", indx]);
    });

    /**
     * LogIn LogOut NAVIGATION
     */
    this.actions$
      .pipe(ofActionDispatched(SignOut))
      .subscribe(() => this.router.navigate(["/login"]));
    this.actions$
      .pipe(ofActionSuccessful(SignIn))
      .subscribe(() => this.router.navigate(["/"]));

    this.actions$
      .pipe(ofActionSuccessful(SignInAnonymously))
      .subscribe(() => this.router.navigate(["/"]));

    this.actions$
      .pipe(ofActionSuccessful(SignInEmail))
      .subscribe(() => this.router.navigate(["/"]));
  }
}
