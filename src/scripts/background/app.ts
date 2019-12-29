import "@background/state";

import {App as StdApp} from "@std/app";

import {EventManager} from "@background/classes/EventManager";

export class App extends StdApp {
    constructor() {
        super();

        this.handlePanelEvents();

    }

    protected handlePanelEvents(): void {
        const manager: EventManager = EventManager.getInstance();

        manager.listen();
    }
}
