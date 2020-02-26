import { Injectable, OnInit } from "@angular/core";
import {
  AngularFireDatabase,
  AngularFireList,
  SnapshotAction,
  AngularFireAction
} from "@angular/fire/database";
import { Observable, of, Subject, combineLatest } from "rxjs";
import { Sale } from "../models/sale.model";
import { Store, Select } from "@ngxs/store";
import { AuthState } from "../store/state/auth.state";
import { AuthenticationService } from "./auth.service";
import {
  take,
  filter,
  map,
  switchMap,
  tap,
  withLatestFrom,
  startWith
} from "rxjs/operators";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";

@Injectable({ providedIn: "root" })
export class FireDataBaseService {
  //books$: AngularFireList<string[]>;
  salesRef$: Observable<AngularFireList<Sale>>;
  salesRef: AngularFireList<Sale>;
  sales$: Observable<Sale[]>;
  private date$: Subject<void>;
  private uid$: Observable<string>;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth
  ) {
    this.date$ = new Subject();
    this.uid$ = this.afAuth.authState.pipe(
      filter(u => !!u),
      map(({ uid }) => uid)
    );
    // this.uid$.subscribe(
    //   uid => (this.salesRef = this.db.list<Sale>(`${uid}/sale`))
    // );

    this.afAuth.authState.pipe(filter(u => !!u)).subscribe(({ uid }) => {
      this.salesRef = this.db.list<Sale>(`${uid}/sale`);
    });

    this.salesRef$ = this.uid$.pipe(
      map(uid => this.db.list<Sale>(`${uid}/sale`))
    );

    this.sales$ = this.salesRef$
      .pipe(
        switchMap(ref=> ref.snapshotChanges()),
        map(changes =>
          changes.map((c): Sale => ({ id: c.payload.key, ...c.payload.val() }))
        )
      );

    // this.sales$ = combineLatest(
    //   this.date$.pipe(startWith(null)),
    //   this.uid$
    // ).pipe(
    //   switchMap(([, uid]) =>
    //     this.db
    //       .list<Sale>(`${uid}/sale`, ref => {
    //         console.log("REF !!!", ref);
    //         return ref;
    //       })
    //       .snapshotChanges()
    //   ),
    //   map(changes =>
    //     changes.map((c): Sale => ({ id: c.payload.key, ...c.payload.val() }))
    //   )
    // );
  }

  // getBooks() {
  //   return this.books$.valueChanges();
  // }
  getSales() {
    this.date$.next();
    //return this.sales$
    // return this.salesRef.pipe(map(db => db.snapshotChanges()));
  }

  addSale(sale: Sale) {
    return this.salesRef$.pipe(
      take(1),
      map(ref => ref.push(sale))
    );
    // let user = this.store.selectSnapshot(AuthState.user);
    // return this.db.list<Sale>(`${user.uid}/sale`).push(sale);
  }
  remove() {
    // return this.books$.remove();
  }
  createSales() {
    // this.db.list("sales").push("sale 1");
  }
}
