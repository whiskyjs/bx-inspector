import {Instance, types} from "mobx-state-tree";
import uuid from "uuid";
import {editor} from "monaco-editor";

export interface EditorChangeData {
    contents?: string;
    viewState?: editor.ICodeEditorViewState;
}

export const PHPEditor = types.model("PHPEditor", {
    uuid: types.optional(types.string, () => uuid.v4()),
    title: types.optional(types.string, () => "Редактор"),
    contents: types.optional(types.string, "<?php\n\n"),
    viewState: types.optional(types.string, ""),
});

export const PHPEditors = types.model("PHPEditors", {
    tabs: types.array(PHPEditor),
    activeTab: types.string,
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

                if (tabIndex >= self.tabs.length) {
                    this.setActiveTab(self.tabs[self.tabs.length - 1].uuid);
                } else {
                    this.setActiveTab(self.tabs[tabIndex].uuid);
                }

                return true;
            }

            return false;
        },
        setActiveTab(tabId: string): boolean {
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                self.activeTab = tabId;

                return true;
            }

            return false;
        },
        setTabContents(tabId: string, data: EditorChangeData): boolean {
            const {contents, viewState} = data;
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                if (contents) {
                    self.tabs[tabIndex].contents = contents;
                }

                if (viewState) {
                    self.tabs[tabIndex].viewState = JSON.stringify(viewState);
                }

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
});

export const PHPResults = types.model("PHPResults", {
    tabs: types.array(PHPResult),
    activeTab: types.string,
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

                if (tabIndex >= self.tabs.length) {
                    this.setActiveTab(self.tabs[self.tabs.length - 1].uuid);
                } else {
                    this.setActiveTab(self.tabs[tabIndex].uuid);
                }

                return true;
            }

            return false;
        },
        setActiveTab(tabId: string): boolean {
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                self.activeTab = tabId;

                return true;
            }

            return false;
        },
        setTabContents(tabId: string, contents: string): boolean {
            const tabIndex = self.tabs.findIndex((tab) => tab.uuid === tabId);

            if (~tabIndex) {
                self.tabs[tabIndex].contents = contents;

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
