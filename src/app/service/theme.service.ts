import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { publishReplay, refCount, delay, finalize, shareReplay, multicast, publish } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _darkTheme = new BehaviorSubject<boolean>(true);
  private _theme = new Subject<string>();
  get isDarkTheme() {

    return this._darkTheme.asObservable();
    // .pipe(
    //   publishReplay(1),
    //   refCount()
    // )
  }
  get theme() {
    return this._theme.asObservable();
  }
  constructor() { }

  setDarkTheme(isDarkTheme: boolean): void {
    this._darkTheme.next(isDarkTheme);
  }
  setTheme(theme: string): void {
    this._theme.next(theme);
  }
}
