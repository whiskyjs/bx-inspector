import "./style.scss";

import React, {PureComponent, ReactElement} from "react";
import {Instance, isAlive} from "mobx-state-tree";
import {observer} from "mobx-react";
import {debounce, findIndex} from "lodash";
import {editor, KeyCode, KeyMod} from "monaco-editor";
import {toast} from "react-toastify";

import {Tab, TablessMouseEvent, TabMouseEvent, Tabs} from "@common/components/Tabs";
import {PHPEditor, PHPEditors} from "@common/stores/panel";
import {Editor} from "@devpanel/components/Editor";
import {FlagStoreContext} from "@devpanel/state";
import {FlagStore} from "@common/stores/flags";
import {Client as GraphClient} from "@common/graphql/client";

import {App} from "@devpanel/app";

// eslint-disable-next-line
export interface PHPConsoleEditorsProps {
    editors: Instance<typeof PHPEditors>;
    setActiveResultValue: (output: string, result: string) => void;
}

// eslint-disable-next-line
export interface PHPConsoleEditorsState {
    activeTab: string;
}

@observer
export class PHPConsoleEditors extends PureComponent<PHPConsoleEditorsProps, PHPConsoleEditorsState> {
    public static contextType = FlagStoreContext;

    protected setEditorContents: (
        tab: Instance<typeof PHPEditor>,
        data: EditorChangeData
    ) => void;

    constructor(props: PHPConsoleEditorsProps) {
        super(props);

        this.setEditorContents = debounce((tab, data): void => {
            const {editors} = this.props;

            if (isAlive(tab)) {
                editors.setTabContents(tab.uuid, data);
            }
        }, 0);

        this.state = {
            activeTab: props.editors.tabs[0].uuid,
        };
    }

    public render(): ReactElement {
        const {editors} = this.props;
        const {activeTab} = this.state;

        return (
            <div className="php-console-editors">
                <Tabs
                    activeTab={activeTab}
                    canAddTabs={true}
                    canCloseTabs={editors.tabs.length > 1}
                    onTabClick={this.onTabClick}
                    onTabMouseUp={this.onTabMouseUp}
                    onTabCloseClick={this.onTabCloseClick}
                    onTabAddClick={this.onTabAddClick}
                >
                    {editors.tabs.map(tab => {
                        return (<Tab
                            key={tab.uuid}
                            id={tab.uuid}
                            title={tab.title}
                            panel={this.getEditorPanel(tab)}
                        />);
                    })}
                </Tabs>
            </div>
        );
    }

    protected onTabCloseClick: TabMouseEvent = (e, tabId) => {
        const {editors} = this.props;
        const prevTabindex = findIndex(editors.tabs, (tab) => {
            return tab.uuid === tabId;
        });

        editors.deleteTab(tabId);

        this.setActiveTab(editors.tabs[editors.tabs.length > prevTabindex
            ? prevTabindex
            : editors.tabs.length - 1].uuid);
    };

    protected onTabAddClick: TablessMouseEvent = () => {
        const {editors} = this.props;

        this.setActiveTab(editors.addTab());
    };

    protected onTabClick: TabMouseEvent = (e, tabId) => {
        this.setActiveTab(tabId);
    };

    protected onTabMouseUp: TabMouseEvent = (e, tabId) => {
        const {editors} = this.props;

        if ((e.button === 1) && (editors.tabs.length > 1)) {
            this.onTabCloseClick(e, tabId);
        }
    };

    protected setActiveTab(tabId: string): void
    {
        this.setState({
            activeTab: tabId,
        });
    }


    protected getEditorPanel = (tab: Instance<typeof PHPEditor>): ReactElement => {
        return (<Editor
            key={tab.uuid}
            onChange={(data): void => this.setEditorContents(tab, data)}
            value={tab.contents}
            viewState={tab.viewState}
            actions={this.getActions(tab.uuid)}
        />);
    };

    // eslint-disable-next-line
    protected getActions(tabId: string): ReadonlyArray<editor.IActionDescriptor> {
        return [{
            id: "wjs.evaluate",
            label: "Evaluate",

            keybindings: [
                KeyMod.CtrlCmd | KeyCode.Enter,
            ],

            run: async (editor: editor.ICodeEditor): Promise<void> => {
                const {setActiveResultValue} = this.props;

                const client = GraphClient.createClient({
                    app: App.getInstance() as App,
                });

                try {
                    try {
                        const result = await client.inspectEvaluate(editor.getValue());

                        if (result) {
                            setActiveResultValue(result.output!, result.result!);
                        }
                    } catch (e) {
                        toast.error(e.message, {
                            position: "bottom-center",
                            hideProgressBar: true,
                            closeButton: false,
                            autoClose: 2000,
                        });
                    }
                } finally {
                    client.cancelRequestsActive();
                }
            }
        }];
    }

    protected getContextData(): Instance<typeof FlagStore> {
        return this.context as Instance<typeof FlagStore>;
    }


    public getActiveTab(): string {
        const {activeTab} = this.state;

        return activeTab;
    }
}
