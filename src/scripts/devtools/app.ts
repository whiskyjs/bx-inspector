import {browser} from "webextension-polyfill-ts";

import {App as StdApp} from "@std/app";

export class App extends StdApp {
    constructor() {
        super();

        browser.devtools.panels.create(
            "BX-Inspector",
            "icon.png",
            "devpanel.html"
        ).then(() => {
            // Не делаем ничего
        });
    }
}
