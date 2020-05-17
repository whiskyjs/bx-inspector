import {Ace} from "ace-builds";

import {Instance} from "mobx-state-tree";

import {FlagStore} from "@common/stores/flags";
import {SettingsStore} from "@common/stores/settings";
import {PanelStore} from "@common/stores/panel";

declare global {
    interface PanelApp {
        getPageInfo(): Optional<GenericPageInfo>;
        getStores(): PanelStoreSet;
    }

    interface GenericStoreSet {
        flags: Instance<typeof FlagStore>;
        settings: Instance<typeof SettingsStore>;
    }

    interface PanelStoreSet extends GenericStoreSet {
        panel: Instance<typeof PanelStore>;
    }

    interface EditorViewState {
        scrollTop?: number;
        scrollLeft?: number;
        selection: Ace.SavedSelection | Ace.SavedSelection[];
    }

    interface EditorChangeData extends Object {
        contents?: string;
        viewState?: string;
        message?: string;
    }
}
