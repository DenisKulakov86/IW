import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { SignIn } from 'src/app/store/actions/auth.actions';
import { AuthState } from 'src/app/store/state/auth.state';
import { switchMap, filter, tap, pluck } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  @Select(AuthState.isSignedIn) isSignedIn$: Observable<boolean>

  sub: Subscription

  constructor(private store: Store, private router: Router) { }

  ngOnInit() { }
  signin() {
    this.sub = this.store.dispatch(new SignIn())
      .pipe(
        switchMap(() => this.isSignedIn$),
        filter(v => v)
      )
      .subscribe(v => this.router.navigate(["/"]))
  }
  ngOnDestroy(){
    if(this.sub) this.sub.unsubscribe();
  }
}
