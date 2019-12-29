import React from "react";
import ReactDOM from "react-dom";
import {browser, Runtime} from "webextension-polyfill-ts";
import {applySnapshot, onSnapshot} from "mobx-state-tree";

import {App as StdApp} from "@std/app";

import {DevPanel} from "@devpanel/components/DevPanel";
import {getGenericPageInfo} from "@devpanel/inspect";
import {PanelStoreContext, panelStore} from "@devpanel/state";
import {SettingsStoreContext, settingsStore} from "@devpanel/state";

import metaInfo from "package.json";

export class App extends StdApp {
    protected port?: Runtime.Port;

    protected propagateStores = true;

    protected pageInfo?: GenericPageInfo;

    constructor() {
        super();

        // noinspection JSIgnoredPromiseFromCall
        this.connectToCore();
        this.setStoreEventHandlers();
        this.setEventHandlers();
    }

    private setEventHandlers(): void {
        document.addEventListener("DOMContentLoaded", () => {
            ReactDOM.render(
                <PanelStoreContext.Provider value={panelStore}>
                    <SettingsStoreContext.Provider value={settingsStore}>
                        <DevPanel/>
                    </SettingsStoreContext.Provider>
                </PanelStoreContext.Provider>,
                document.getElementById("devpanel")
            );
        });
    }

    private async connectToCore(): Promise<boolean> {
        this.port = browser.runtime.connect(undefined, {
            name: metaInfo.name,
        });

        this.port.onMessage.addListener(this.onPortMessage);

        this.port.postMessage({
            action: "connect",
            tabId: browser.devtools.inspectedWindow.tabId,
        });

        this.pageInfo = await this.getInspectedPageData();

        this.port.postMessage({
            action: "set-hostname",
            hostname: this.pageInfo.hostname,
        });

        return true;
    }

    private onPortMessage = (message: RuntimeMessage): void => {
        console.log("DevPanel. Got message:", message);

        switch (message.action) {
            case "set-host-data":
                this.setPropagateStores(false);
                applySnapshot(panelStore, message.data);
                this.setPropagateStores(true);
                break;
            case "set-settings":
                this.setPropagateStores(false);
                applySnapshot(settingsStore, message.data);
                this.setPropagateStores(true);
                break;
        }
    };

    private getInspectedPageData(): Promise<GenericPageInfo> {
        return new Promise<GenericPageInfo>((resolve) => {
            browser.devtools.inspectedWindow.eval(getGenericPageInfo, (data: GenericPageInfo) => {
                resolve(data);
            });
        });
    }

    private setStoreEventHandlers(): void {
        onSnapshot(panelStore, (snapshot) => {
            console.log(browser.devtools.inspectedWindow.tabId, "handleStoreSnapshots()", "onSnapshot()");

            if (this.propagateStores) {
                this.port?.postMessage({
                    action: "propagate-host-data",
                    tabId: browser.devtools.inspectedWindow.tabId,
                    hostname: this.pageInfo?.hostname,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    data: snapshot,
                })
            }
        });

        onSnapshot(settingsStore, (snapshot) => {
            console.log(browser.devtools.inspectedWindow.tabId, "handleStoreSnapshots()", "onSnapshot()");

            if (this.propagateStores) {
                this.port?.postMessage({
                    action: "propagate-settings",
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
}
