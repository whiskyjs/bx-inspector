import {Instance, types} from "mobx-state-tree";
import uuid from "uuid";

import * as MobX from "@common/types/graphql-models";

export const PHPEditor = types
    .model("PHPEditor", {
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

export const PHPEditors = types
    .model("PHPEditors", {
        tabs: types.array(PHPEditor),
    })
    .actions((self) => {
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

export const PHPResult = types
    .model("PHPResult", {
        uuid: types.optional(types.string, () => uuid.v4()),
        title: types.optional(types.string, () => "Результат"),
        contents: types.optional(types.string, ""),
        message: types.optional(types.string, ""),
    })
    .actions((self) => {
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

export const PHPResults = types
    .model("PHPResults", {
        tabs: types.array(PHPResult),
    })
    .actions((self) => {
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

export const PHPConsole = types
    .model("PHPConsole", {
        editors: PHPEditors,
        results: PHPResults,
    });

export type ModuleName = Extract<keyof typeof MobX.ModuleEventSetInput.properties, string>;

export const ModuleNameList: ModuleName[] =
    Object.getOwnPropertyNames(MobX.ModuleEventSetInput.properties) as ModuleName[];

export const ModuleNameListModel = types.array(types.enumeration(ModuleNameList));

const EventModal = types
    .model("EventModal", {
        openTabs: types.optional(ModuleNameListModel, []),
    })
    .actions((self) => {
        return {
            setTabOpen(tabId: ModuleName, open = true): void {
                const tabIndex = self.openTabs.indexOf(tabId);

                if (open && !~tabIndex) {
                    self.openTabs.push(tabId);
                } else if (!open && ~tabIndex) {
                    self.openTabs.splice(tabIndex, 1);
                }
            },
        };
    });

// Монитор событий
export const EventMonitor = types
    .model("EventMonitor", {
        events: MobX.ModuleEventSetInput,
        eventModal: EventModal,
    })
    .actions((self) => {
        return {
            setEventChecked(tabId: ModuleName, eventName: string, checked = true): void {
                if (!self.events[tabId]) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    self.events[tabId] = [];
                }

                const tabIndex = self.events[tabId]!.indexOf(eventName);

                if (checked && !~tabIndex) {
                    self.events[tabId]!.push(eventName);
                } else if (!checked && ~tabIndex) {
                    self.events[tabId]!.splice(tabIndex, 1);
                }
            },
        };
    });

export const PanelStore = types
    .model("PanelStore", {
        phpConsole: PHPConsole,
        eventMonitor: EventMonitor,
    });
