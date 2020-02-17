import { Injectable, NgZone } from "@angular/core";
import { Observable, Subject, BehaviorSubject, ReplaySubject } from "rxjs";
import { Store } from '@ngxs/store';
import { InitSession } from 'src/app/store/actions/auth.actions';
import { resolve } from 'url';

const API_KEY: string = "AIzaSyCofOM8sRo0bZRPxjnZxabuOtjuK6xN48o";
const CLIENT_ID: string = "843806706192-trsuvvlpi50vohsul3imgjl20o7fnbuo.apps.googleusercontent.com";
const DISCOVERY_DOCS: string[] = [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];
const SCOPES: string = "https://www.googleapis.com/auth/drive";


@Injectable({
    providedIn: "root"
})
export class GapiService {
    constructor(private store: Store) { }

    initGapi() {
        return this.loadClient()
            .then(() => this.initClient(), (err) => {console.error("Loading Failed", err); throw err})
            .then(() => this.store.dispatch(new InitSession()), (err) => console.error("Init Client Failed", err))
    }
    loadClient(): Promise<any> {
        return new Promise((resolve, reject) => {
            gapi.load("client:auth2", {
                callback: resolve,
                onerror: reject,
                timeout: 1000, // 5 seconds.
                ontimeout: reject
            });
        });
    }
    initClient(): Promise<any> {
        let initObj = {
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        };
        return gapi.client.init(initObj)
    }
}
