import { THEME } from '../state/config.state';

export class ToggleDarkTheme {
    static readonly type = '[Config] Toggle Dark Theme';
}

export class SetTheme {
    static readonly type = '[Config] Set Theme';
    constructor(public theme:THEME){}
}




