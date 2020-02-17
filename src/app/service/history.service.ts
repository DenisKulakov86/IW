import { Injectable, OnInit } from '@angular/core';
import * as moment from 'moment'
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export interface HistorySale{
    title:string;
    
}

@Injectable({ providedIn: "root" })
export class HistoryService implements OnInit {
    // private _dates: BehaviorSubject<moment.Moment[]> = new BehaviorSubject([]);
    private _start: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment());
    private _end: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment());

    set end(d: moment.Moment) {
        this._end.next(d);
    }
    get end() {
        return this._end.getValue();
    }
    set start(d: moment.Moment) {
        this._start.next(d);
    }
    get start() {
        return this._start.getValue();
    }
    // get dates() {
    //     return this._dates.asObservable();
    // }
    ngOnInit() {


        //this.crateDates(this._start, this._end);
    }
    days(): Observable<moment.Moment[]> {
        return this.dates("days")
        //.pipe(map(days => days.map(d => d.format("DD-MM-YYYY"))));
    }


    private dates(unit: moment.unitOfTime.DurationConstructor): Observable<moment.Moment[]> {
        return combineLatest(this._start, this._end)
            .pipe(
                map(([start, end]) => this.createDates(start, end, unit))
            );
    }

    private createDates(
        start: moment.Moment,
        end: moment.Moment,
        unit: moment.unitOfTime.DurationConstructor,
        // unitStart: moment.unitOfTime.DurationConstructor
    ) {

        let dates: moment.Moment[] = [];
        // let startOf = start.clone().startOf(unitStart);
        // let endOf = end.clone().endOf(unitStart);
        // console.log(`
        //     start ${start.format("DD-MM-YYYY")}\n
        //     end ${end.format("DD-MM-YYYY")}`);

        let date = start.clone();
        if (!start || !end) return [];
        if (start.isAfter(end)) return [];

        while (date.isSameOrBefore(end, unit)) {
            dates.push(date.clone());
            date.add(1, unit);
        }
        return dates;
    }

}