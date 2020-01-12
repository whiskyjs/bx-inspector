import React from "react";
import ReactDOM from "react-dom";
import {browser} from "webextension-polyfill-ts";
import uuid from "uuid";

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

import {RuntimeMessageHandler} from "@devpanel/messaging/runtime";
import {ProxyMessageHandler} from "@devpanel/messaging/socket";

export class App extends StdApp implements PanelApp {
    protected runtimeMessageHandler: RuntimeMessageHandler;

    protected proxyMessageHandler: ProxyMessageHandler;

    protected uuid: string = uuid.v4();

    protected pageInfo?: GenericPageInfo;

    constructor() {
        super();

        this.runtimeMessageHandler = new RuntimeMessageHandler(this.getStores(), {
            onConnect: this.onConnect,
            onDisconnect: this.onDisconnect,
            onMessage: this.onMessage,
            getPageInfo: this.getPageInfo,
        });

        this.proxyMessageHandler = new ProxyMessageHandler(this.getStores(), {
            getId: this.getId,
        });

        this.setDOMEventHandlers();
    }

    protected onConnect: RuntimeCallbacks["onConnect"] = () => {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPageInfo();
    };

    protected onDisconnect: RuntimeCallbacks["onDisconnect"] = () => {
        this.proxyMessageHandler.disconnectFromProxy();
    };

    protected onMessage: RuntimeCallbacks["onMessage"] = (port, message) => {
        switch (message.action) {
            case "navigation-end": {
                const url = new URL(message.url);

                if (url.hostname !== this.pageInfo?.hostname) {
                    // noinspection JSIgnoredPromiseFromCall
                    this.fetchPageInfo();
                }

                break;
            }
        }
    };

    protected setDOMEventHandlers(): void {
        document.addEventListener("DOMContentLoaded", () => {
            ReactDOM.render(
                <PanelStoreContext.Provider value={panelStore}>
                    <SettingsStoreContext.Provider value={settingsStore}>
                        <FlagStoreContext.Provider value={flagStore}>
                            <DevPanel/>
                        </FlagStoreContext.Provider>
                    </SettingsStoreContext.Provider>
                </PanelStoreContext.Provider>,
                document.getElementById("content-root")
            );
        });
    }

    protected async fetchPageInfo(): Promise<Optional<GenericPageInfo>> {
        try {
            this.pageInfo = await this.getInspectedPageData();
            this.runtimeMessageHandler.setHostname(this.pageInfo.hostname);
        } catch {
            console.log("Невозможно получить информацию о странице.");
        }

        return this.pageInfo;
    }

    protected getInspectedPageData(): Promise<GenericPageInfo> {
        return new Promise<GenericPageInfo>((resolve) => {
            browser.devtools.inspectedWindow.eval(getGenericPageInfo, (data: GenericPageInfo) => {
                resolve(data);
            });
        });
    }

    public getStores(): PanelStoreSet {
        return {
            flags: flagStore,
            settings: settingsStore,
            panel: panelStore,
        }
    }

    public getId = (): string => {
        return this.uuid;
    };

    public getPageInfo = (): Optional<GenericPageInfo> => {
        return this.pageInfo;
    };
}
