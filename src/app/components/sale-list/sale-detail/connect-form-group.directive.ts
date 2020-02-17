import { Directive, Input, } from '@angular/core';
import { FormGroupDirective, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Sale } from '../../../models/sale.model';
@Directive({
  selector: '[appConnectFormGroup]'
})
export class ConnectFormGroupDirective {



  @Input("appConnectFormGroup")
  set data(value: Sale) {
    
    // console.log(value);
    if (!value) return;
    this.arrayProduct.clear();
    value.productList.forEach((_, i) => {
      this.arrayProduct.push(this.fb.group({
        name: ["", [Validators.required, Validators.minLength(3)]],
        count: ["0", [Validators.required, Validators.min(1)]],
        price: ["0", [Validators.required, Validators.min(1)]]
      }))
    });
    this.formGroup.form.patchValue(value, {
      emitEvent: false,
      // onlySelf: true,
    });
    this.formGroup.form.markAsPristine();
    this.formGroup.form.markAsUntouched();
  }
  constructor(private readonly formGroup: FormGroupDirective, private fb: FormBuilder) {
  }

  get arrayProduct(): FormArray {
    return this.formGroup.form.get("productList") as FormArray;
  }

}
