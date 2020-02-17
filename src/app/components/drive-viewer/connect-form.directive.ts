import { Directive, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormControlDirective, FormGroupDirective } from '@angular/forms';
@Directive({
  selector: '[appConnectFormControl]'
})
export class ConnectFormControlDirective {



  @Input("appConnectFormControl")
  set data(value) {
    if (!value) return;
    this.formControl.form.patchValue(value);
    this.formControl.form.markAsPristine();
    this.formControl.form.markAsUntouched();
  }
  constructor(private readonly formControl: FormGroupDirective) {
  }

}
