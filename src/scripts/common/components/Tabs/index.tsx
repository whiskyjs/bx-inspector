import "./style.scss";

import React, {Children, MouseEvent, PureComponent, ReactElement} from "react";
import {find, findIndex} from "lodash";
import classNames from "classnames";
import {blocks, render} from "@common/functions";

export type TabMouseEvent = (e: MouseEvent<HTMLElement>, tabId: string) => void;

export type TablessMouseEvent = (e: MouseEvent<HTMLElement>) => void;

export interface TabProps {
    id: string;
    title: string;
    active?: boolean;
    closable?: boolean;
    onTabClick?: TabMouseEvent;
    onTabMouseDown?: TabMouseEvent;
    onTabCloseClick?: TabMouseEvent;
    panel: Renderable;
}

export class Tab extends PureComponent<TabProps> {
    protected static defaultProps = {
        active: false,
        closable: false
    };

    public render(): ReactElement {
        const {id, title, active, closable, onTabClick, onTabMouseDown, onTabCloseClick} = this.props;

        return (<div
            className={classNames(
                "tabs__tab-header", {
                    "tabs__tab-header--active": active,
                    "tabs__tab-header--closable": closable,
                })}
            onClick={(e): void => onTabClick && onTabClick(e, id)}
            onMouseDown={(e): void => onTabMouseDown && onTabMouseDown(e, id)}
        >
            {blocks([
                [closable, (<div
                    key="close"
                    className="tabs__tab-header-close"
                    onClick={(e): void => onTabCloseClick && onTabCloseClick(e, id)}
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
    onTabClick?: TabMouseEvent;
    onTabMouseDown?: TabMouseEvent;
    onTabCloseClick?: TabMouseEvent;
    onTabAddClick?: TablessMouseEvent;
}

export interface TabsState {
    activeTab?: string;
    previousTab?: string;
    inTransition: boolean;
}

export class Tabs extends PureComponent<TabsProps, TabsState> {
    protected static defaultProps = {
        canCloseTabs: false,
        canAddTabs: false,
    };

    public static getDerivedStateFromProps(props: TabsProps, state: TabsState): TabsState {
        const {activeTab: activeTabProps} = props;
        const {activeTab: activeTabState} = state;

        if (activeTabProps && (activeTabProps !== activeTabState)) {
            Object.assign(state, {
                activeTab: activeTabProps,
                previousTab: activeTabState,
            });
        } else if (!activeTabProps) {
            const {activeTab: prevActiveTab} = state;
            const tabs = Tabs.getTabs(props);

            if (!tabs) {
                Object.assign(state, {
                    activeTab: undefined,
                });
            } else {
                const currentTabIndex = findIndex(tabs, (child: Tab) => {
                    return child.props.id === prevActiveTab;
                });

                if (!~currentTabIndex || (currentTabIndex >= tabs.length)) {
                    Object.assign(state, {
                        activeTab: tabs[tabs.length - 1].props.id,
                    })
                }
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
            previousTab: undefined,
            inTransition: false,
        };
    }

    public render(): ReactElement {
        return (<div className="tabs">
            {this.renderHeaders()}
            {this.renderPanel()}
        </div>);
    }

    protected onTabClick: TabMouseEvent = ({target}, tabId): void => {
        const {activeTab} = this.state;

        if ((target instanceof HTMLElement) && target.matches(".tabs__tab-header-close")) {
            return;
        }

        this.setState({
            activeTab: tabId,
            previousTab: activeTab,
        });
    };

    protected renderHeaders(): ReactElement {
        const {canAddTabs, onTabClick, onTabMouseDown, onTabCloseClick, onTabAddClick} = this.props;
        const {activeTab} = this.state;

        return (<div className="tabs__tab-headers clearfix">
            <React.Fragment>
                {Children.map(Tabs.getTabs(this.props), (tab: Tab) => {
                    return (
                        <Tab
                            {...tab.props}
                            active={activeTab === tab.props.id}
                            onTabClick={onTabClick || this.onTabClick}
                            onTabMouseDown={onTabMouseDown}
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

    protected getFirstTab(): Optional<Tab> {
        const tabs = Tabs.getTabs(this.props);

        if (!tabs) {
            return undefined;
        }

        return tabs[0];
    }
}

