import {browser, Runtime} from "webextension-polyfill-ts";
import {applySnapshot, Instance, onSnapshot} from "mobx-state-tree";

import {SettingsStore} from "@common/stores/settings";
import {FlagStore} from "@common/stores/flags";
import {PanelStore} from "@common/stores/panel";

import metaInfo from "package.json";

export class RuntimeMessageHandler {
    protected port?: Runtime.Port;

    protected propagateStores = true;

    protected stores: PanelStoreSet;

    protected callbacks: RuntimeCallbacks;

    constructor(stores: PanelStoreSet, callbacks: RuntimeCallbacks) {
        this.stores = stores;
        this.callbacks = callbacks;

        // noinspection JSIgnoredPromiseFromCall
        this.connectToCore();
        this.setStoreEventHandlers();
    }

    protected async connectToCore(): Promise<void> {
        this.port = browser.runtime.connect(undefined, {
            name: metaInfo.name,
        });

        this.port.onMessage.addListener(this.onPortMessage);
        this.port.onDisconnect.addListener(this.onPortDisconnect);

        this.port.postMessage({
            action: "connect",
            tabId: browser.devtools.inspectedWindow.tabId,
            tabUuid: this.callbacks.getId(),
        });

        if (typeof this.callbacks.onConnect === "function") {
            this.callbacks.onConnect(this.port);
        }
    }

    protected onPortMessage = (message: RuntimeMessage): void => {
        switch (message.action) {
            case "set-host-data": {
                this.setPropagateStores(false);
                applySnapshot(this.stores.panel, message.data);
                this.setPropagateStores(true);
                break;
            }
            case "set-settings": {
                this.setPropagateStores(false);
                applySnapshot(this.stores.settings, message.data);
                this.setPropagateStores(true);
                break;
            }
            case "set-flags": {
                this.setPropagateStores(false);
                applySnapshot(this.stores.flags, message.data);
                this.setPropagateStores(true);
                break;
            }
        }

        if (this.port && (typeof this.callbacks.onMessage === "function")) {
            this.callbacks.onMessage(this.port, message);
        }
    };

    protected setStoreEventHandlers(): void {
        onSnapshot(this.stores.panel, (snapshot: Instance<typeof PanelStore>) => {
            if (this.propagateStores) {
                const pageInfo = this.callbacks.getPageInfo();

                if (pageInfo) {
                    this.postMessage(this.port, {
                        action: "propagate-host-data",
                        tabId: browser.devtools.inspectedWindow.tabId,
                        hostname: pageInfo.hostname!,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                        // @ts-ignore
                        data: snapshot,
                    });
                }
            }
        });

        onSnapshot(this.stores.settings, (snapshot: Instance<typeof SettingsStore>) => {
            if (this.propagateStores) {
                this.postMessage(this.port, {
                    action: "propagate-settings",
                    tabId: browser.devtools.inspectedWindow.tabId,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    data: snapshot,
                })
            }
        });

        onSnapshot(this.stores.flags, (snapshot: Instance<typeof FlagStore>) => {
            if (this.propagateStores) {
                this.postMessage(this.port, {
                    action: "propagate-flags",
                    tabId: browser.devtools.inspectedWindow.tabId,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    data: snapshot,
                })
            }
        });
    }

    public setPropagateStores(propagate = true): void {
        this.propagateStores = propagate;
    }

    public setHostData(hostname: string, schema: string): void {
        if (this.port) {
            this.port.postMessage({
                action: "set-hostname",
                hostname,
                schema,
            });
        }
    }

    protected postMessage(port: Optional<Runtime.Port>, message: RuntimeMessage): void {
        port!.postMessage(message);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onPortDisconnect = (port: Runtime.Port): void => {
        if (typeof this.callbacks.onDisconnect === "function") {
            this.callbacks.onDisconnect(port);
        }
    };
}
