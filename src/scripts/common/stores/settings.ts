import {types} from "mobx-state-tree";

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

export const NetworkingSettings = types.model("NetworkingSettings", {
    endpoint: types.optional(types.string, "/bitrix/tools/wjs_api_graphql.php"),
}).actions(() => {
    return {};
});

export const CommonSettings = types.model("CommonSettings", {
    networking: types.optional(NetworkingSettings, {}),
}).actions(() => {
    return {};
});

export const SettingsStore = types.model("SettingsStore", {
    phpConsole: types.optional(PHPConsoleSettings, {}),
    common: types.optional(CommonSettings, {}),
});
