import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { Select, Store } from "@ngxs/store";
import { NameProductsSate } from "src/app/store/state/name-products.state";
import { MatInput } from "@angular/material/input";
import { MyErrorStateMatcher } from "../../default.error-matcher";
import { AddNameProduct } from 'src/app/store/actions/name-products.action';

@Component({
  selector: "app-form-products",
  templateUrl: "./form-products.component.html",
  styleUrls: ["./form-products.component.scss"]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormProductsComponent implements OnInit {
  @Input() formGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  constructor(private store: Store) {}

  ngOnInit() {
  }
  get name() {
    return this.formGroup.get("name");
  }
  get count() {
    return this.formGroup.get("count");
  }
  get price() {
    return this.formGroup.get("price");
  }
  onChange(ctr: FormControl, value) {
    ctr.setValue(+ctr.value + value);
    ctr.markAsDirty();
  }
  clear(ctr: FormControl) {
    ctr.reset();
  }

  checkShowAddBtn(value:string, names:string[]){
    return !~names.findIndex(n=> n.trim() === value.trim())

  }

  handleInput(ev: KeyboardEvent) {
    let nativeInput: HTMLInputElement = ev.target as HTMLInputElement;
    if (ev.code === "Enter") nativeInput.blur();
  }

  setName(name: string) {
    this.name.setValue(name);
  }
  addName(str){
    this.store.dispatch(new AddNameProduct(str));
  }

  contError() {
    return this.count.hasError("min") || this.count.hasError("required")
      ? "Кол-во меньше 1"
      : "";
  }
  priceError() {
    return this.price.hasError("min") || this.price.hasError("required")
      ? "Цена меньше 1"
      : "";
  }
  nameError() {
    return this.name.hasError("minlength") || this.name.hasError("required")
      ? "Имя меньше 3 символов"
      : "";
  }
}
