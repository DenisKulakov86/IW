import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef,
  ChangeDetectorRef
} from "@angular/core";

import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription, of, iif, Observable, fromEvent, Subject } from "rxjs";
import {
  map,
  filter,
  debounceTime,
  distinctUntilChanged,
  delay,
  refCount,
  pluck,
  publishReplay,
  mergeMap,
  takeUntil,
  take,
  switchMap,
  tap,
  mapTo,
  catchError,
  switchMapTo
} from "rxjs/operators";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  FormGroupDirective,
  NgForm
} from "@angular/forms";
import { Store, Select } from "@ngxs/store";
import { SaleState } from "src/app/store/state/sale.state";
import { Sale, Product } from "src/app/models/sale.model";
import {
  ChangeSale,
  NewSale,
  SaveSale
  // SelectSale
} from "src/app/store/actions/sale.actions";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MyErrorStateMatcher } from "../../default.error-matcher";
import { ComponentCanDeactivate } from "src/app/guard/sale-detail.exit.guard";
import { Title } from "@angular/platform-browser";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { SaleDetailModalDialogComponent } from "./sale-detail-modal-dialog/sale-detail-modal-dialog.component";

export class ErrorStateDiscount implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    let formInvalid = !!(form && form.invalid && (form.dirty || form.touched));
    let controlInvalid = !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
    return formInvalid || controlInvalid;
  }
}
@Component({
  selector: "app-sale-detail",
  templateUrl: "./sale-detail.component.html",
  styleUrls: ["./sale-detail.component.scss"]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleDetailComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild("formRef", { static: false }) formRef: FormGroupDirective;
  @Select(SaleState.loading) loading$: Observable<boolean>;
  @Select(SaleState.saved) saved$: Observable<boolean>;
  // saved: boolean;

  title: string = "Новая продажа";
  date: number;

  formSale: FormGroup;
  formNewProduct: FormGroup;

  matcher = new ErrorStateDiscount();

  isShodow$: Observable<boolean>;

  destroy$: Subject<any> = new Subject();

  get discount() {
    return this.formSale.get("discount");
  }
  get arrayProductControl(): FormArray {
    return this.formSale.get("productList") as FormArray;
  }
  // @HostListener('scroll',["$event"])
  // onScroll(e,){
  //   console.log((this.el.nativeElement as HTMLElement ).scrollTop, e );

  // }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private activeRoute: ActivatedRoute,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private titleServise: Title,
    private location: Location,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    /**
     * Set Title
     */
    this.activeRoute.paramMap
      .pipe(
        pluck("params", "id"),
        map(id => (isNaN(+id) ? "Новая продажа" : "Продажа N " + id))
      )
      .subscribe(title => {
        this.title = title;
        this.titleServise.setTitle(title);
      });
    /**
     * CREATE FORM SALE
     */

    this.formSale = this.fb.group(
      {
        discount: ["", [Validators.min(0)]],
        productList: this.fb.array([])
      },
      {
        validators: this.formValidator
        // asyncValidators: this.asuncFormValidator
      }
    );

    this.store.selectOnce(SaleState.select).subscribe(s => {
      this.date = Number(s.timestamp);
      let lenght = s.productList.length || 0;
      while (lenght--) {
        this.arrayProductControl.push(this.createFormProduct());
      }
      this.formSale.patchValue(s);
    });

    this.formSale.valueChanges
      .pipe(
        filter(_ => this.formSale.valid),
        debounceTime(300),
        distinctUntilChanged(
          (v1, v2) => JSON.stringify(v1) === JSON.stringify(v2)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(value => this.store.dispatch(new ChangeSale(value)));

    /**
     * NEW PRODUCT  FORM
     */
    this.formNewProduct = this.createFormProduct();

    /**
     * Shodow Header
     */
    this.isShodow$ = fromEvent(document.body, "scroll").pipe(
      map((ev: Event) => (ev.target as HTMLElement).scrollTop),
      map(top => (top > 10 ? true : false)),
      distinctUntilChanged()
    );
    /**
     *
     */
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  asyncFormValidator(control: FormControl) {
    return of({ AsyncInvalidForm: true }).pipe(delay(1000));
  }

  goBack() {
    this.router.navigate(["/sale-list"]);
  }

  save() {
    return this.store.dispatch(new SaveSale());
  }

  add() {
    let form = this.createFormProduct();
    form.patchValue(this.formNewProduct.value);
    this.arrayProductControl.push(form);
    this.formNewProduct.reset();
  }

  delete(i: number) {
    this.arrayProductControl.removeAt(i);
  }

  formValidator(control: FormControl) {
    let value = control.value as Sale;
    let discount = control.get("discount");

    let diff =
      value.productList.reduce((s, p) => (s += p.price * p.count), 0) -
      value.discount;
    if (diff <= 0) {
      discount.setErrors({ invalidDiscount: true });
      return { invalidDiscount: true };
    }
    discount.setErrors(null);
    return null;
  }

  discountError() {
    return this.discount.hasError("min")
      ? "Скидка меньше 0"
      : this.discount.hasError("invalidDiscount")
      ? "Скидка больше цены"
      : "";
  }

  onChange(control: FormControl, addVal) {
    control.setValue(+control.value + addVal);
    control.markAsDirty();
  }

  clearValue(control: FormControl) {
    control.setValue(0);
    control.markAsDirty();
  }

  exit() {
    if (this.formSale.invalid && this.formSale.dirty) {
      let dialogRef = this.dialog.open(SaleDetailModalDialogComponent, {
        minWidth: "200px",
        data: "Данны не верны. Выход будет без сохранения!",
        panelClass: "no-padding"
      });
      return dialogRef.afterClosed();
    }

    let saved = this.store.selectSnapshot(SaleState.saved);
    if (!saved) {
      let dialogRef = this.dialog.open(SaleDetailModalDialogComponent, {
        minWidth: "200px",
        data: "Сохранить изменения?",
        panelClass: "no-padding"
      });
      return dialogRef.afterClosed().pipe(
        switchMap(result => {
          return result ? this.save().pipe(mapTo(true)) : of(true);
        })
      );
    } else {
      return true;
    }
  }

  createFormProduct() {
    let form = this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        count: ["", [Validators.required, Validators.min(1)]],
        price: ["", [Validators.required, Validators.min(1)]]
      },
      {
        validators: Validators.required
      }
    );
    //form.patchValue(product);
    return form;
  }

  test(el: MatExpansionPanel) {
    let nativEl: HTMLElement = document.querySelector(
      `[aria-controls=${el.id}]`
    );
    let bottom = nativEl.getBoundingClientRect().bottom;
    console.log("[test SALE DETAIL]", Math.min(0, bottom) * -1);

    // nativEl.scrollBy(0, Math.min(0, bottom) * -1);
    // nativEl.scrollIntoView();
    // window.scrollBy(0, 20);
  }
}
