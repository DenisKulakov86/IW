import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from "@angular/router";
import { tap, map } from "rxjs/operators";
import { Store } from "@ngxs/store";
import { AuthState } from "../store/state/auth.state";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private store: Store, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let isSignedIn = this.store.selectSnapshot(AuthState.isSignedIn);
    if (!isSignedIn) {
      this.router.navigate(["/login"]);
      return false;
    } else return true;
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
