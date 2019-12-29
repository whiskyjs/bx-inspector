import {browser} from "webextension-polyfill-ts";

import {App as StdApp} from "@std/app";

export class App extends StdApp {
    constructor() {
        super();

        browser.devtools.panels.create(
            "My Panel",
            "icons/star.png",
            "devpanel.html"
        ).then(() => {
            // newPanel.onShown.addListener(initialisePanel);
            // newPanel.onHidden.addListener(unInitialisePanel);
        });
    }
}
