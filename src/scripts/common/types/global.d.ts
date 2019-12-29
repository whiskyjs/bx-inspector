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
        tabId: string;
        hostname?: string;
        port: Runtime.Port;
    }

    interface ConnectMessage {
        action: "connect";
        tabId: string;
    }

    interface ConnectMessage {
        action: "connect";
        tabId: string;
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
        tabId: string;
        hostname: string;
        data: Instance<typeof PanelStore>;
    }

    interface SetSettingsMessage {
        action: "set-settings";
        data: Instance<typeof Settings>;
    }

    interface PropagateSettings {
        action: "propagate-settings";
        tabId: string;
        data: Instance<typeof Settings>;
    }

    type RuntimeMessage = ConnectMessage
        | SetHostnameMessage
        | SetHostDataMessage
        | PropagateHostDataMessage
        | SetSettingsMessage
        | PropagateSettings;

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

