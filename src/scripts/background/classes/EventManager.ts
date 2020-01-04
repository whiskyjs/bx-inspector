import {browser, Runtime, WebNavigation} from "webextension-polyfill-ts";
import {find, remove, filter} from "lodash";

import {Singleton} from "@std/base/Singleton";

import {backgroundStore} from "@background/state";
import {defaultPanel} from "@common/state/panel";
import {PanelStore} from "@common/stores/panel";

import metaInfo from "package.json";
import {Settings} from "@common/stores/background";

export class EventManager extends Singleton {
    protected panelConnections: Array<RuntimeConnection> = [];

    public listen(): void {
        this.handleConnections();
        this.handleBrowserEveents();
    }

    protected handleConnections(): void {
        browser.runtime.onConnect.addListener((port) => {
            console.log("onConnect()", port);

            if (port.name !== metaInfo.name) {
                return;
            }

            const extensionListener = (message: RuntimeMessage): void => {
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
                                backgroundStore.setSiteData(connection.hostname, PanelStore.create(defaultPanel));
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
                        backgroundStore.setSettings(Settings.create(message.data));

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
        const onBeforeNavigate = (data: WebNavigation.OnBeforeNavigateDetailsType) => {
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

        const onNavigationEnd = (data: WebNavigation.OnCompletedDetailsType) => {
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

    protected postMessage(port: Runtime.Port, message: RuntimeMessage) {
        port.postMessage(message);
    }
}
