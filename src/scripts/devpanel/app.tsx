import React from "react";
import ReactDOM from "react-dom";
import {browser} from "webextension-polyfill-ts";
import uuid from "uuid";
import {omit} from "lodash";

import {App as StdApp} from "@std/app";

import {DevPanel} from "@devpanel/components/DevPanel";
import {getGenericPageInfo} from "@devpanel/inspect";

import {
    panelStore,
    settingsStore,
    flagStore,
    PanelStoreContext,
    SettingsStoreContext,
    FlagStoreContext,
    runtimePanelStore
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
            getId: this.getId,
            onConnect: this.onConnect,
            onDisconnect: this.onDisconnect,
            onMessage: this.onMessage,
            getPageInfo: this.getPageInfo,
        });

        this.proxyMessageHandler = new ProxyMessageHandler(this.getStores(), {
            getId: this.getId,
            onMessage: {
                "remote:event": [this.onRemoteEvent],
            },
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

    /**
     * TODO: Переделать на DI.
     */
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
            this.runtimeMessageHandler.setHostData(
                this.pageInfo.hostname,
                this.pageInfo.protocol.replace(/[^a-z]/, "")
            );
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

    public getPageInfo = (): Optional<GenericPageInfo> => {
        return this.pageInfo;
    };

    public getId = (): string => {
        return this.uuid;
    };

    /**
     * TODO: Вынести в отдельный классы/классы.
     *
     * @param message
     */
    private onRemoteEvent: SocketMessageHandler = (message) => {
        if (message.action !== "remote:event") {
            return;
        }

        const str = JSON.stringify({
            time: (new Date(message.time * 1000)).toLocaleTimeString(),
            ...omit(message, ["time"], ["action"]),
        }, null, 4);

        runtimePanelStore.eventMonitor.appendToEventLog(str);
    };

    public addMessageListener(action: SocketAction, fn: SocketMessageHandler): void {
        this.proxyMessageHandler.addMessageListener(action, fn);
    }

    public removeMessageListener(action: SocketAction, fn: SocketMessageHandler): void {
        this.proxyMessageHandler.removeMessageListener(action, fn);
    }
}
