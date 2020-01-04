import {Instance, types} from "mobx-state-tree";

import {PanelStore} from "@common/stores/panel";
import {SettingsStore} from "@common/stores/settings";

export const BackgroundStore = types.model("BackgroundStore", {
    sites: types.optional(types.map(PanelStore), {}),
    settings: types.optional(SettingsStore, {}),
}).actions((self) => {
    return {
        setSiteData(hostname: string, data: Instance<typeof PanelStore>): void {
            self.sites.set(hostname, data);
        },
        setSettings(data: Instance<typeof SettingsStore>): void {
            self.settings = data;
        }
    };
});
