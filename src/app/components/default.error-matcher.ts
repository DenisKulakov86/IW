import { ErrorStateMatcher } from "@angular/material/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  AbstractControl
} from "@angular/forms";

export class MyErrorStateMatcher implements ErrorStateMatcher {
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
    return controlInvalid;
  }
}

function getControlName(c: AbstractControl): string | null {
  const formGroup = c.parent.controls;
  return Object.keys(formGroup).find(name => c === formGroup[name]) || null;
}
