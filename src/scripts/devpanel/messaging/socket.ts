import io from "socket.io-client";
import {observe} from "mobx";

export class ProxyMessageHandler {
    protected socket?: SocketIOClient.Socket;

    protected stores: GenericStoreSet;

    protected callbacks: SocketCallbacks;

    constructor(stores: PanelStoreSet, callbacks: SocketCallbacks) {
        this.stores = stores;
        this.callbacks = callbacks;

        observe(this.stores.settings.common.networking, (data) => {
            if ((data.name !== "websocketUrl") || (data.type !== "update")) {
                return;
            }

            const {newValue, oldValue} = data;

            if (newValue.storedValue === oldValue.storedValue) {
                return;
            }

            this.disconnectFromProxy();
            this.connectToProxy(newValue.storedValue);
        });

        this.connectToProxy(this.stores.settings.common.networking.websocketUrl);
    }

    public connectToProxy = (url: string): void => {
        this.socket = io(url);

        const attach = (): void => {
            this.socket?.emit("attach", {
                uuid: this.callbacks.getId(),
            }, (...data: any[]) => {
                console.log("Successfully attached to server.", data);
            });
        };

        this.socket.on("connect", () => {
            console.log("Successfully connected to server.");

            attach();
        });

        if (this.callbacks.onMessage) {
            // eslint-disable-next-line no-restricted-syntax
            for (const action in this.callbacks.onMessage) {
                this.callbacks.onMessage![action as SocketAction].forEach((fn) => {
                    this.socket?.on(action, fn);
                });
            }
        }
    };

    public addMessageListener(action: string, fn: SocketMessageHandler): void {
        this.socket?.on(action, fn);
    }

    public removeMessageListener(action: string, fn: SocketMessageHandler): void {
        this.socket?.off(action, fn);
    }

    public disconnectFromProxy = (): void => {
        if (this.socket) {
            if (this.socket.connected) {
                this.socket.disconnect();
            }

            delete this.socket;
        }
    };
}
