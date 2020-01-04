import {ReactElement} from "react";
import {Instance} from "mobx-state-tree";
import {Runtime} from "webextension-polyfill-ts";

import {App} from "@std/app";
import {PanelStore} from "@common/stores/panel";
import {Settings} from "@common/stores/background";

declare global {
    interface Window {
        App: App;
        config: JsonMap;
    }

    type GenericObject = {
        [key: string]: any;
    };

    type Optional<T> = T | undefined;

    type Renderable = ReactElement | (() => ReactElement);
    type RenderBlock = [Optional<boolean>, Optional<Renderable>];
    type RenderBlocks = Array<RenderBlock>;

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
        data: Instance<typeof Settings>;
    }

    interface PropagateSettingsMessage {
        action: "propagate-settings";
        tabId: number;
        data: Instance<typeof Settings>;
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
        | NavigationStartMessage
        | NavigationEndMessage;

    interface GenericPageInfo {
        origin: string;
        hostname: string;
        pathname: string;
        href: string;
        encoding: string;

        sessId: string;
        language: string;
    }
}

