import {Instance, types} from "mobx-state-tree";
import uuid from "uuid";

export const PHPEditor = types.model("PHPEditor", {
    uuid: types.optional(types.string, () => uuid.v4()),
    title: types.optional(types.string, () => "Редактор"),
    contents: types.optional(types.string, "<?php\n\n"),
    viewState: types.optional(types.string, ""),
    message: types.optional(types.string, ""),
}).actions((self) => {
    return {
        setContents(data: EditorChangeData): void {
            const {contents, viewState, message} = data;

            if (Object.prototype.hasOwnProperty.call(data, "contents")) {
                self.contents = contents || "";
            }

            if (Object.prototype.hasOwnProperty.call(data, "viewState")) {
                self.viewState = JSON.stringify(viewState);
            }

            if (Object.prototype.hasOwnProperty.call(data, "message")) {
                self.message = message || "";
            }
        },
    };
});

export const PHPEditors = types.model("PHPEditors", {
    tabs: types.array(PHPEditor),
}).actions((self) => {
    return {
        addTab(tab?: Instance<typeof PHPEditor>): string {
            if (!tab) {
                tab = PHPEditor.create();
            }

            self.tabs.push(tab);

            return tab.uuid;
        },
        deleteTab(tabId: string): boolean {
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                self.tabs.splice(tabIndex, 1);

                return true;
            }

            return false;
        },
        setTabContents(tabId: string, data: EditorChangeData): boolean {
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                self.tabs[tabIndex].setContents(data);

                return true;
            }

            return false;
        },
    };
});

export const PHPResult = types.model("PHPResult", {
    uuid: types.optional(types.string, () => uuid.v4()),
    title: types.optional(types.string, () => "Результат"),
    contents: types.optional(types.string, ""),
    message: types.optional(types.string, ""),
}).actions((self) => {
    return {
        setContents(data: EditorChangeData): void {
            const {contents, message} = data;

            if (Object.prototype.hasOwnProperty.call(data, "contents")) {
                self.contents = contents || "";
            }

            if (Object.prototype.hasOwnProperty.call(data, "message")) {
                self.message = message || "";
            }
        },
    };
});

export const PHPResults = types.model("PHPResults", {
    tabs: types.array(PHPResult),
}).actions((self) => {
    return {
        addTab(tab?: Instance<typeof PHPResult>): string {
            if (!tab) {
                tab = PHPResult.create();
            }

            self.tabs.push(tab);

            return tab.uuid;
        },
        deleteTab(tabId: string): boolean {
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                self.tabs.splice(tabIndex, 1);

                return true;
            }

            return false;
        },
        setTabContents(tabId: string, data: EditorChangeData): boolean {
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                self.tabs[tabIndex].setContents(data);

                return true;
            }

            return false;
        },
    };
});

export const PHPConsole = types.model("PHPConsole", {
    editors: PHPEditors,
    results: PHPResults,
});

export const PanelStore = types.model("PanelStore", {
    phpConsole: PHPConsole,
}).actions(() => {
    return {};
});
