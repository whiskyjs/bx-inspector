import "./style.scss";

import React, {Children, MouseEvent, PureComponent, ReactElement} from "react";
import {find, findIndex} from "lodash";
import classNames from "classnames";
import {blocks, render} from "@common/functions";

export interface TabMouseEvent {
    (e: MouseEvent<HTMLElement>, tabId: string): void;
}

export interface TablessMouseEvent {
    (e: MouseEvent<HTMLElement>): void;
}

export interface TabProps {
    id: string;
    title: string;
    active?: boolean;
    closable?: boolean;
    onTabClick?: TabMouseEvent;
    onTabMouseUp?: TabMouseEvent;
    onTabCloseClick?: TabMouseEvent;
    panel: ReactElement;
}

export class Tab extends PureComponent<TabProps> {
    protected static defaultProps = {
        active: false,
        closable: false
    };

    constructor(props: TabProps) {
        super(props);
    }

    protected onTabCloseClick: TablessMouseEvent = (e) => {
        const {id, onTabCloseClick} = this.props;

        e.stopPropagation();

        if (onTabCloseClick) {
            onTabCloseClick(e, id);
        }
    };

    public render(): ReactElement {
        const {id, title, active, closable, onTabClick, onTabMouseUp} = this.props;

        return (<div
            className={classNames(
                "tabs__tab-header", {
                    "tabs__tab-header--active": active,
                    "tabs__tab-header--closable": closable,
                })}
            onClick={(e): void => onTabClick && onTabClick(e, id)}
            onMouseUp={(e): void => onTabMouseUp && onTabMouseUp(e, id)}
        >
            {blocks([
                [closable, (<div
                    key="close"
                    className="tabs__tab-header-close"
                    onClick={this.onTabCloseClick}
                />)]
            ])}

            {title}
        </div>);
    }
}

export interface TabsProps {
    activeTab?: string;
    canCloseTabs?: boolean | ((tab: Tab) => boolean);
    canAddTabs?: boolean;
    children?: any;
    className?: string;
    onTabClick?: TabMouseEvent;
    onTabMouseUp?: TabMouseEvent;
    onTabCloseClick?: TabMouseEvent;
    onTabAddClick?: TablessMouseEvent;
}

export interface TabsState {
    activeTab?: string;
    activeTabIndex: number;
}

export class Tabs extends PureComponent<TabsProps, TabsState> {
    protected static defaultProps = {
        canCloseTabs: false,
        canAddTabs: false,
    };

    public static getDerivedStateFromProps(props: TabsProps, state: TabsState): TabsState {
        const {activeTab: activeTabProps} = props;
        const {activeTab: activeTabState, activeTabIndex} = state;
        const tabs = Tabs.getTabs(props);

        if (activeTabProps && (activeTabProps !== activeTabState)) {
            state.activeTabIndex = findIndex(tabs, (child: Tab) => {
                return child.props.id === activeTabProps;
            });
            state.activeTab = activeTabProps;
        } else if (tabs) {
            const currentTabIndex = findIndex(tabs, (child: Tab) => {
                return child.props.id === activeTabState;
            });

            if (~currentTabIndex) {
                state.activeTabIndex = currentTabIndex;
                state.activeTab = tabs[currentTabIndex].props.id;
            } else if (~activeTabIndex) {
                state.activeTabIndex = activeTabIndex < tabs.length
                    ? activeTabIndex
                    : tabs.length - 1;
                state.activeTab = tabs[state.activeTabIndex].props.id;
            } else {
                state.activeTabIndex = 0;
                state.activeTab = tabs[0].props.id;
            }
        }

        return state;
    }

    protected static getTabs(props: TabsProps): Array<Tab> {
        const {children} = props;

        if (!children) {
            return [];
        }

        return Array.isArray(children)
            ? children
            : [children];
    }

    constructor(props: TabsProps) {
        super(props);

        const firstTab = this.getFirstTab();

        this.state = {
            activeTab: props.activeTab || (firstTab && firstTab.props.id),
            activeTabIndex: firstTab ? 0 : -1,
        };
    }

    public render(): ReactElement {
        const {className} = this.props;

        return (<div className={classNames("tabs", className)}>
            {this.renderHeaders()}
            {this.renderPanel()}
        </div>);
    }

    protected onTabClick: TabMouseEvent = ({target}, tabId): void => {
        if ((target instanceof HTMLElement) && target.matches(".tabs__tab-header-close")) {
            return;
        }

        this.setState({
            activeTab: tabId,
            activeTabIndex: this.getTabIndex(tabId),
        });
    };

    protected renderHeaders(): ReactElement {
        const {canAddTabs, onTabClick, onTabMouseUp, onTabCloseClick, onTabAddClick} = this.props;
        const {activeTab} = this.state;

        return (<div className="tabs__tab-headers">
            <React.Fragment>
                {Children.map(Tabs.getTabs(this.props), (tab: Tab) => {
                    return (
                        <Tab
                            {...tab.props}
                            active={activeTab === tab.props.id}
                            onTabClick={onTabClick || this.onTabClick}
                            onTabMouseUp={onTabMouseUp}
                            onTabCloseClick={onTabCloseClick || undefined}
                            closable={this.isTabClosable(tab)}
                        />
                    );
                })}
                {blocks([
                    [canAddTabs, (<div
                        key="add"
                        className="tabs__tab-header-add"
                        onClick={onTabAddClick}
                    />)]
                ])}
            </React.Fragment>
        </div>);
    }

    protected isTabClosable(tab: Tab): boolean {
        const {canCloseTabs, onTabCloseClick} = this.props;
        const tabs = Tabs.getTabs(this.props);

        if (!tabs) {
            return false;
        }

        if (typeof canCloseTabs === "boolean") {
            return (typeof onTabCloseClick === "function") && canCloseTabs;
        } else if (typeof canCloseTabs === "function") {
            return (typeof onTabCloseClick === "function") && canCloseTabs(tab);
        }

        return tabs.length > 1;
    }

    protected renderPanel(): ReactElement {
        const activeTab = this.getTab();

        return (<div className="tabs__tab_panels">
            <div
                className="tabs__tab_panel"
            >
                {render(activeTab?.props?.panel)}
            </div>
        </div>);
    }

    protected getTab(tabId: Optional<string> = this.state.activeTab): Optional<Tab> {
        const tabs = Tabs.getTabs(this.props);

        if (!tabId || !tabs) {
            return undefined;
        }

        return find(tabs, (tab: Tab) => {
            return tab.props.id === tabId;
        });
    }

    protected getTabIndex(tabId: Optional<string> = this.state.activeTab): number {
        const tabs = Tabs.getTabs(this.props);

        if (!tabId || !tabs) {
            return -1;
        }

        return findIndex(tabs, (tab: Tab) => {
            return tab.props.id === tabId;
        });
    }

    protected getFirstTab(): Optional<Tab> {
        const tabs = Tabs.getTabs(this.props);

        if (!tabs) {
            return undefined;
        }

        return tabs[0];
    }
}

