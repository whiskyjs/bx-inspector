import "@background/state";

import {App as StdApp} from "@std/app";

import {browser, Runtime, WebNavigation} from "webextension-polyfill-ts";
import {applySnapshot} from "mobx-state-tree";
import {find, remove, filter} from "lodash";

import metaInfo from "package.json";

import {backgroundStore, flagStore} from "@background/state";
import {defaultPanelStore} from "@common/state/panel";
import {PanelStore} from "@common/stores/panel";
import {SettingsStore} from "@common/stores/settings";

export class App extends StdApp {
    protected panelConnections: Array<RuntimeConnection> = [];

    constructor() {
        super();

        this.handleConnections();
        this.handleBrowserEveents();
    }

    protected handleConnections(): void {
        browser.runtime.onConnect.addListener((port) => {
            console.log("onConnect()", port);

            if (port.name !== metaInfo.name) {
                return;
            }

            const extensionListener = async (message: RuntimeMessage): Promise<void> => {
                console.log("Got message:", message);

                switch (message.action) {
                    case "connect": {
                        this.panelConnections.push({
                            tabId: message.tabId,
                            port,
                            hostname: undefined,
                        });

                        this.postMessage(port, {
                            action: "set-settings",
                            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                            // @ts-ignore
                            data: backgroundStore.settings.toJSON(),
                        });

                        break;
                    }

                    case "set-hostname": {
                        const connection = find(this.panelConnections, (connection) => {
                            return connection.port === port;
                        });

                        if (connection && (connection.hostname !== message.hostname)) {
                            connection.hostname = message.hostname;

                            if (!backgroundStore.sites.has(connection.hostname)) {
                                backgroundStore.setSiteData(connection.hostname, PanelStore.create(defaultPanelStore));
                            }

                            this.postMessage(port, {
                                action: "set-host-data",
                                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                                // @ts-ignore
                                data: backgroundStore.sites.get(connection.hostname).toJSON(),
                            });
                        }

                        break;
                    }

                    case "propagate-host-data": {
                        console.log("All connections:", this.panelConnections);

                        backgroundStore.setSiteData(message.hostname, PanelStore.create(message.data));

                        const connections = filter(this.panelConnections, (connection) => {
                            return (connection.hostname === message.hostname) && (connection.tabId !== message.tabId);
                        });

                        console.log("Other tabs of the same host:", connections);

                        if (Array.isArray(connections) && connections.length) {
                            for (const connection of connections) {
                                this.postMessage(connection.port, {
                                    action: "set-host-data",
                                    data: message.data,
                                });
                            }
                        }

                        break;
                    }

                    case "propagate-settings": {
                        backgroundStore.setSettings(SettingsStore.create(message.data));

                        const connections = filter(this.panelConnections, (connection) => {
                            return connection.tabId !== message.tabId;
                        });

                        console.log("Other tabs:", connections);

                        if (Array.isArray(connections) && connections.length) {
                            for (const connection of connections) {
                                this.postMessage(connection.port, {
                                    action: "set-settings",
                                    data: message.data,
                                });
                            }
                        }

                        break;
                    }

                    case "propagate-flags": {
                        applySnapshot(flagStore, message.data);

                        const connections = filter(this.panelConnections, (connection) => {
                            return connection.tabId !== message.tabId;
                        });

                        console.log("Other tabs:", connections);

                        if (Array.isArray(connections) && connections.length) {
                            for (const connection of connections) {
                                this.postMessage(connection.port, {
                                    action: "set-flags",
                                    data: message.data,
                                });
                            }
                        }

                        break;
                    }
                }
            };

            port.onMessage.addListener(extensionListener);

            port.onDisconnect.addListener((port) => {
                console.log("onDisconnect()");

                const connection = find(this.panelConnections, (connection) => {
                    return connection.port === port;
                });

                if (connection) {
                    console.log("onDisconnect(). Deleting connection:", connection);

                    remove(this.panelConnections, (connection) => {
                        return connection.port === port;
                    });
                }

                port.onMessage.removeListener(extensionListener);
            });
        });
    }

    protected handleBrowserEveents(): void {
        const onBeforeNavigate = (data: WebNavigation.OnBeforeNavigateDetailsType): void => {
            const connection = find(this.panelConnections, (connection) => {
                return connection.tabId === data.tabId;
            });

            if (connection) {
                this.postMessage(connection.port, {
                    action: "navigation-start",
                    url: data.url,
                });
            }
        };

        const onNavigationEnd = (data: WebNavigation.OnCompletedDetailsType): void => {
            const connection = find(this.panelConnections, (connection) => {
                return connection.tabId === data.tabId;
            });

            if (connection) {
                this.postMessage(connection.port, {
                    action: "navigation-end",
                    url: data.url,
                });
            }
        };

        browser.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate);
        browser.webNavigation.onCompleted.addListener(onNavigationEnd);
        browser.webNavigation.onErrorOccurred.addListener(onNavigationEnd);
    }

    protected postMessage(port: Runtime.Port, message: RuntimeMessage): void {
        port.postMessage(message);
    }
}
