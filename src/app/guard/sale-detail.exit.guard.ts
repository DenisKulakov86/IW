import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
    exit: () => boolean | Observable<boolean>;
}

export class ExitSaleDetailGuard implements CanDeactivate<ComponentCanDeactivate> {

    canDeactivate(component: ComponentCanDeactivate):Observable<boolean>| boolean{
        return component.exit ? component.exit() : true;
    }
}