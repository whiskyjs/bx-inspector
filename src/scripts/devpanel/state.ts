import React from "react";

import {PanelStore} from "@common/stores/panel";
import {SettingsStore} from "@common/stores/settings";
import {FlagStore} from "@common/stores/flags";
import {RuntimePanelStore} from "@common/stores/runtime-panel";
import {defaultPanelStore} from "@common/state/panel";
import {defaultSettings} from "@common/state/settings";
import {defaultFlagStore} from "@common/state/flags";
import {defaultRuntimePanelStore} from "@common/state/runtime-panel";

export const panelStore = PanelStore.create(defaultPanelStore);
export const PanelStoreContext = React.createContext(panelStore);

export const settingsStore = SettingsStore.create(defaultSettings);
export const SettingsStoreContext = React.createContext(settingsStore);

export const flagStore = FlagStore.create(defaultFlagStore);
export const FlagStoreContext = React.createContext(flagStore);

export const runtimePanelStore = RuntimePanelStore.create(defaultRuntimePanelStore);
