import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  ChangeDetectorRef
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription, of, iif, Observable, fromEvent } from "rxjs";
import {
  map,
  find,
  switchMap,
  pairwise,
  startWith,
  tap,
  filter,
  take,
  debounceTime,
  distinctUntilChanged,
  delay,
  timeout,
  catchError,
  share,
  publish,
  refCount,
  switchAll,
  pluck,
  publishReplay,
  takeWhile,
  shareReplay,
  mergeMap,
  distinct
} from "rxjs/operators";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  FormGroupDirective,
  AbstractControl
} from "@angular/forms";
import { Store, Select } from "@ngxs/store";
import { SaleState } from "src/app/store/state/sale.state";
import { Sale } from "src/app/models/sale.model";
import {
  ChangeSale,
  DeleteSale,
  GetSales,
  NewSale,
  SaveSale,
  AddSale,
  SelectSale
} from "src/app/store/actions/sale.actions";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MyErrorStateMatcher } from "../../default.error-matcher";

@Component({
  selector: "app-sale-detail",
  templateUrl: "./sale-detail.component.html",
  styleUrls: ["./sale-detail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("formRef", { static: false }) formRef: FormGroupDirective;
  @Select(SaleState.loading) loading$: Observable<boolean>;

  title$: Observable<string>;
  sale$: Observable<Sale>;
  date$: Observable<number>;

  formSale: FormGroup;
  formNewProduct: FormGroup;
  subscription: Subscription = new Subscription();
  matcher = new MyErrorStateMatcher();

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
  isShodow$: Observable<boolean>;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store,
    private activeRoute: ActivatedRoute,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isShodow$ = fromEvent(document.body, "scroll").pipe(
      map((ev: Event) => (ev.target as HTMLElement).scrollTop),
      map(top => (top > 10 ? true : false)),
      distinctUntilChanged()
      // tap(console.log)
    );
    // .subscribe(v => console.log(v))

    this.title$ = this.activeRoute.paramMap.pipe(
      pluck("params", "id"),
      map(id => (isNaN(+id) ? "Новая продажа" : "Продажа N " + id))
    );

    this.sale$ = this.activeRoute.queryParamMap.pipe(
      pluck("params", "id"),
      mergeMap(id =>
        id === undefined
          ? this.store.dispatch(new NewSale())
          : this.store.dispatch(new SelectSale(id))
      ),
      mergeMap(() => this.store.selectOnce(SaleState.select)),
      publishReplay(1),
      refCount()
    );
    this.date$ = this.sale$.pipe(pluck("timestamp"));

    this.formSale = this.fb.group(
      {
        discount: ["0", [Validators.min(0)]],
        productList: this.fb.array([])
      },
      {
        validators: this.formValidator
        // asyncValidators: this.asuncFormValidator
      }
    );

    this.formNewProduct = this.createFormProduct();

    this.subscription.add(
      this.formSale.valueChanges
        .pipe(
          filter(_ => this.formSale.valid),
          debounceTime(300),
          distinctUntilChanged((v1, v2) => JSON.stringify(v1) === JSON.stringify(v2))
        )
        .subscribe(value => this.store.dispatch(new ChangeSale(value)))
    );
  }

  asyncFormValidator(control: FormControl) {
    return of({ AsyncInvalidForm: true }).pipe(delay(1000));
  }

  createFormProduct(): FormGroup {
    return this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        count: ["", [Validators.required, Validators.min(1)]],
        price: ["", [Validators.required, Validators.min(1)]]
      },
      {
        validators: Validators.required
      }
    );
  }
  ngAfterViewInit() {
    // this.formSale.statusChanges.subscribe(v => {
    //   this.formSale.get('discount').markAllAsTouched();
    // });
  }
  goBack() {
    this.router.navigate(["sale-list"]);
  }

  save() {
    this.store.dispatch(new SaveSale())
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  formValidator(control: FormGroup) {
    let value = control.value as Sale;
    let discount = control.get("discount");

    let diff = value.productList.reduce((s, p) => (s += p.price * p.count), 0) - value.discount;
    if (diff <= 0) {
      discount.setErrors({ invalidDiscount: true });
      return { invalidDiscount: true };
    }
    if (discount.hasError("invalidDiscount")) discount.setErrors(null);
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
