import {Runtime} from "webextension-polyfill-ts";
import {Instance} from "mobx-state-tree";

import {PanelStore} from "@common/stores/panel";
import {SettingsStore} from "@common/stores/settings";
import {FlagStore} from "@common/stores/flags";

declare global {
    interface RuntimeCallbacks {
        onConnect?: (port: Runtime.Port) => void;
        onDisconnect?: (port: Runtime.Port) => void;
        onMessage?: (port: Runtime.Port, message: RuntimeMessage) => void;
        getPageInfo: () => Optional<GenericPageInfo>;
    }

    interface RuntimeConnection {
        tabId: number;
        hostname?: string;
        port: Runtime.Port;
    }

    interface ConnectMessage {
        action: "connect";
        tabId: number;
    }

    interface ConnectMessage {
        action: "connect";
        tabId: number;
    }

    interface SetHostnameMessage {
        action: "set-hostname";
        hostname: string;
    }

    interface SetHostDataMessage {
        action: "set-host-data";
        data: Instance<typeof PanelStore>;
    }

    interface PropagateHostDataMessage {
        action: "propagate-host-data";
        tabId: number;
        hostname: string;
        data: Instance<typeof PanelStore>;
    }

    interface SetSettingsMessage {
        action: "set-settings";
        data: Instance<typeof SettingsStore>;
    }

    interface PropagateSettingsMessage {
        action: "propagate-settings";
        tabId: number;
        data: Instance<typeof SettingsStore>;
    }

    interface SetFlagsMessage {
        action: "set-flags";
        data: Instance<typeof FlagStore>;
    }

    interface PropagateFlagsMessage {
        action: "propagate-flags";
        tabId: number;
        data: Instance<typeof FlagStore>;
    }

    interface NavigationStartMessage {
        action: "navigation-start";
        url: string;
    }

    interface NavigationEndMessage {
        action: "navigation-end";
        url: string;
    }

    type RuntimeMessage = ConnectMessage
        | SetHostnameMessage
        | SetHostDataMessage
        | PropagateHostDataMessage
        | SetSettingsMessage
        | PropagateSettingsMessage
        | SetFlagsMessage
        | PropagateFlagsMessage
        | NavigationStartMessage
        | NavigationEndMessage;

    interface GenericPageInfo {
        origin: string;
        protocol: string;
        hostname: string;
        pathname: string;
        href: string;
        encoding: string;

        sessId: string;
        language: string;
    }
}
