import React from "react";

import {PanelStore} from "@common/stores/panel";
import {defaultPanel} from "@common/state/panel";
import {Settings} from "@common/stores/background";
import {defaultSettings} from "@common/state/settings";

export const panelStore = PanelStore.create(defaultPanel);
export const settingsStore = Settings.create(defaultSettings);

export const PanelStoreContext = React.createContext(panelStore);
export const SettingsStoreContext = React.createContext(settingsStore);
