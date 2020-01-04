import React from "react";
import ReactDOM from "react-dom";
import {browser, Runtime} from "webextension-polyfill-ts";
import {applySnapshot, Instance, onSnapshot} from "mobx-state-tree";

import {App as StdApp} from "@std/app";

import {DevPanel} from "@devpanel/components/DevPanel";
import {getGenericPageInfo} from "@devpanel/inspect";
import {
    panelStore,
    settingsStore,
    flagStore,
    PanelStoreContext,
    SettingsStoreContext,
    FlagStoreContext
} from "@devpanel/state";

import metaInfo from "package.json";

import {SettingsStore} from "@common/stores/settings";
import {FlagStore} from "@common/stores/flags";
import {PanelStore} from "@common/stores/panel";

export class App extends StdApp implements PanelApp {
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
                        <FlagStoreContext.Provider value={flagStore}>
                            <DevPanel/>
                        </FlagStoreContext.Provider>
                    </SettingsStoreContext.Provider>
                </PanelStoreContext.Provider>,
                document.getElementById("devpanel")
            );
        });
    }

    private async connectToCore(): Promise<void> {
        this.port = browser.runtime.connect(undefined, {
            name: metaInfo.name,
        });

        this.port.onMessage.addListener(this.onPortMessage);

        this.port.postMessage({
            action: "connect",
            tabId: browser.devtools.inspectedWindow.tabId,
        });

        this.fetchPageInfo();
    }

    protected async fetchPageInfo(): Promise<Optional<GenericPageInfo>> {
        try {
            this.pageInfo = await this.getInspectedPageData();

            if (this.port) {
                this.port.postMessage({
                    action: "set-hostname",
                    hostname: this.pageInfo.hostname,
                });
            }
        } catch {
            console.log("Невозможно получить информацию о странице.");
        }

        return this.pageInfo;
    }

    private onPortMessage = (message: RuntimeMessage): void => {
        switch (message.action) {
            case "set-host-data": {
                this.setPropagateStores(false);
                applySnapshot(panelStore, message.data);
                this.setPropagateStores(true);
                break;
            }
            case "set-settings": {
                this.setPropagateStores(false);
                applySnapshot(settingsStore, message.data);
                this.setPropagateStores(true);
                break;
            }
            case "set-flags": {
                this.setPropagateStores(false);
                applySnapshot(flagStore, message.data);
                this.setPropagateStores(true);
                break;
            }
            case "navigation-end": {
                const url = new URL(message.url);

                if (url.hostname !== this.pageInfo?.hostname) {
                    this.fetchPageInfo();
                }

                break;
            }
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
        onSnapshot(panelStore, (snapshot: Instance<typeof PanelStore>) => {
            if (this.propagateStores) {
                this.postMessage(this.port, {
                    action: "propagate-host-data",
                    tabId: browser.devtools.inspectedWindow.tabId,
                    hostname: this.pageInfo?.hostname!,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    data: snapshot,
                })
            }
        });

        onSnapshot(settingsStore, (snapshot: Instance<typeof SettingsStore>) => {
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

        onSnapshot(flagStore, (snapshot: Instance<typeof FlagStore>) => {
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

    protected postMessage(port: Optional<Runtime.Port>, message: RuntimeMessage): void {
        port!.postMessage(message);
    }

    public getPageInfo(): Optional<GenericPageInfo> {
        return this.pageInfo;
    }

    public getStores(): PanelStoreSet {
        return {
            flags: flagStore,
            settings: settingsStore,
            panel: panelStore,
        }
    }
}
