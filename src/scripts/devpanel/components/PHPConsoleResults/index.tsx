import "./style.scss";

import React, {ReactElement, PureComponent} from "react";
import {Tab, TablessMouseEvent, TabMouseEvent, Tabs} from "@common/components/Tabs";
import {Instance} from "mobx-state-tree";
import {PHPResult, PHPResults} from "@common/stores/panel";
import {observer} from "mobx-react";
import {Editor} from "@devpanel/components/Editor";

// eslint-disable-next-line
export interface PHPConsoleResultsProps {
    results: Instance<typeof PHPResults>;
}

// eslint-disable-next-line
export interface PHPConsoleResultsState {
}

@observer
export class PHPConsoleResults extends PureComponent<PHPConsoleResultsProps, PHPConsoleResultsState> {
    public render(): ReactElement {
        const {results} = this.props;

        return (
            <div className="php-console-results">
                <Tabs
                    canAddTabs={true}
                    activeTab={results.activeTab}
                    canCloseTabs={results.tabs.length > 1}
                    onTabClick={this.onTabClick}
                    onTabCloseClick={this.onTabCloseClick}
                    onTabAddClick={this.onTabAddClick}
                >
                    {results.tabs.map(tab => {
                        return (<Tab
                            key={tab.uuid}
                            id={tab.uuid}
                            title={tab.title}
                            panel={this.getResultPanel(tab)}
                        />);
                    })}
                </Tabs>
            </div>
        );
    }

    protected onTabCloseClick: TabMouseEvent = (e, tabId) => {
        const {results} = this.props;

        results.deleteTab(tabId);
    };

    protected onTabAddClick: TablessMouseEvent = () => {
        const {results} = this.props;

        results.setActiveTab(results.addTab());
    };

    protected onTabClick: TabMouseEvent = (e, tabId) => {
        const {results} = this.props;

        results.setActiveTab(tabId);
    };

    protected getResultPanel = (tab: Instance<typeof PHPResult>): Renderable => {
        return (): ReactElement => (<Editor
            key={tab.uuid}
            value={tab.contents}
        />);
    }
}
