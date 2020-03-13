import { Component, OnInit, OnDestroy } from "@angular/core";
import { Store, Select } from "@ngxs/store";
import { SignIn, SignInAnonymously } from "src/app/store/actions/auth.actions";
import { AuthState } from "src/app/store/state/auth.state";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  @Select(AuthState.isSignedIn) isSignedIn$: Observable<boolean>;

  loading = false;
  constructor(private store: Store) {}

  ngOnInit() {}
  signin() {
    this.loading = true;
    this.store
      .dispatch(new SignIn())
      .pipe(take(1))
      .subscribe(_ => (this.loading = false));
  }
  signInAnonymously() {
    this.store.dispatch(new SignInAnonymously());
  }
}
