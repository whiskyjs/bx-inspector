import "./style.scss";

import React, {ReactElement, PureComponent} from "react";
import {Instance, isAlive} from "mobx-state-tree";
import {observer} from "mobx-react";
import {debounce, findIndex} from "lodash";

import {Tab, TablessMouseEvent, TabMouseEvent, Tabs} from "@common/components/Tabs";
import {EditorChangeData, PHPEditor, PHPEditors} from "@common/stores/panel";
import {Editor} from "@devpanel/components/Editor";

// eslint-disable-next-line
export interface PHPConsoleEditorsProps {
    editors: Instance<typeof PHPEditors>;
}

// eslint-disable-next-line
export interface PHPConsoleEditorsState {
    activeTab: string;
}

@observer
export class PHPConsoleEditors extends PureComponent<PHPConsoleEditorsProps, PHPConsoleEditorsState> {
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
        }, 500);

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
                    onTabClick={this.onTabClick}
                    canCloseTabs={editors.tabs.length > 1}
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

        this.setState({
            activeTab: editors.tabs[editors.tabs.length > prevTabindex
                ? prevTabindex
                : editors.tabs.length - 1].uuid,
        });
    };

    protected onTabAddClick: TablessMouseEvent = () => {
        const {editors} = this.props;

        this.setState({
            activeTab: editors.addTab(),
        });
    };

    protected onTabClick: TabMouseEvent = (e, tabId) => {
        this.setState({
            activeTab: tabId,
        });
    };

    protected getEditorPanel = (tab: Instance<typeof PHPEditor>): Renderable => {
        return (): ReactElement => (<Editor
            key={tab.uuid}
            onChange={(data): void => this.setEditorContents(tab, data)}
            value={tab.contents}
            viewState={tab.viewState}
        />);
    }
}
