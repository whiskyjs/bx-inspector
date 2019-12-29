import {Instance, types} from "mobx-state-tree";
import {EditorChangeData, PanelStore} from "@common/stores/panel";

export const PHPFixedEditor = types.model("PHPFixedEditor", {
    contents: types.optional(types.string, "<?php\n\n"),
    viewState: types.optional(types.string, ""),
});

export const PHPConsoleSettings = types.model("PHPConsoleSettings", {
    prologue: types.optional(PHPFixedEditor, {}),
    epilogue: types.optional(PHPFixedEditor, {}),
}).actions((self) => {
    return {
        setTabContents(type: "prologue" | "epilogue", data: EditorChangeData): boolean {
            const {contents, viewState} = data;

            if (contents) {
                self[type].contents = contents;
            }

            if (viewState) {
                self[type].viewState = JSON.stringify(viewState);
            }

            return true;
        },
    };
});

export const Settings = types.model("Settings", {
    phpConsole: types.optional(PHPConsoleSettings, {}),
});

export const BackgroundStore = types.model("BackgroundStore", {
    sites: types.optional(types.map(PanelStore), {}),
    settings: types.optional(Settings, {}),
}).actions((self) => {
    return {
        setSiteData(hostname: string, data: Instance<typeof PanelStore>): void {
            self.sites.set(hostname, data);
        },
        setSettings(data: Instance<typeof Settings>): void {
            self.settings = data;
        }
    };
});
