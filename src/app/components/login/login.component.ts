import { Component, OnInit, OnDestroy } from "@angular/core";
import { Store, Select } from "@ngxs/store";
import { SignIn } from "src/app/store/actions/auth.actions";
import { AuthState } from "src/app/store/state/auth.state";
import { Observable } from 'rxjs';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  @Select(AuthState.isSignedIn) isSignedIn$: Observable<boolean>;


  constructor(private store: Store) {}

  ngOnInit() {}
  signin() {
    this.store.dispatch(new SignIn());
  }
}
