import "./style.scss";

import React, {ReactElement, PureComponent} from "react";
import {Tab, TablessMouseEvent, TabMouseEvent, Tabs} from "@common/components/Tabs";
import {Instance} from "mobx-state-tree";
import {PHPResult, PHPResults} from "@common/stores/panel";
import {observer} from "mobx-react";
import {Editor} from "@devpanel/components/Editor";
import {findIndex} from "lodash";

// eslint-disable-next-line
export interface PHPConsoleResultsProps {
    results: Instance<typeof PHPResults>;
}

// eslint-disable-next-line
export interface PHPConsoleResultsState {
    activeTab: string;
}

@observer
export class PHPConsoleResults extends PureComponent<PHPConsoleResultsProps, PHPConsoleResultsState> {
    constructor(props: PHPConsoleResultsProps) {
        super(props);

        this.state = {
            activeTab: props.results.tabs[0].uuid,
        };
    }

    public render(): ReactElement {
        const {results} = this.props;
        const {activeTab} = this.state;

        return (
            <div className="php-console-results">
                <Tabs
                    activeTab={activeTab}
                    canAddTabs={true}
                    canCloseTabs={results.tabs.length > 1}
                    onTabClick={this.onTabClick}
                    onTabMouseUp={this.onTabMouseUp}
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
        const prevTabindex = findIndex(results.tabs, (tab) => {
            return tab.uuid === tabId;
        });

        results.deleteTab(tabId);

        this.setState({
            activeTab: results.tabs[results.tabs.length > prevTabindex
                ? prevTabindex
                : results.tabs.length - 1].uuid,
        });
    };

    protected onTabAddClick: TablessMouseEvent = () => {
        const {results} = this.props;

        this.setState({
            activeTab: results.addTab(),
        });
    };

    protected onTabClick: TabMouseEvent = (e, tabId) => {
        this.setState({
            activeTab: tabId,
        });
    };

    protected onTabMouseUp: TabMouseEvent = (e, tabId) => {
        const {results} = this.props;

        if ((e.button === 1) && (results.tabs.length > 1)) {
            this.onTabCloseClick(e, tabId);
        }
    };

    protected getResultPanel = (tab: Instance<typeof PHPResult>): ReactElement => {
        return <Editor
            key={tab.uuid}
            uuid={tab.uuid}
            readOnly={true}
            message={tab.message}
            value={tab.contents}
        />;
    };

    public getActiveTab(): string {
        const {activeTab} = this.state;

        return activeTab;
    }
}
