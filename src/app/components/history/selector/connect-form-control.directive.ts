import { Directive, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormControlDirective, FormGroupDirective } from '@angular/forms';
@Directive({
  selector: '[appConnectControl]'
})
export class ConnectControlDirective {



  @Input("appConnectControl")
  set data(value) {
    if (!value) return;
    this.formControl.form.patchValue(value, {emitEvent: false});
    this.formControl.form.markAsPristine();
    this.formControl.form.markAsUntouched();
  }
  constructor(private readonly formControl: FormControlDirective) {
  }

}
