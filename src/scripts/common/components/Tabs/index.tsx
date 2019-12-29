import "./style.scss";

import React, {Children, MouseEvent, PureComponent, ReactElement} from "react";
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

export type TabChild = ReactElement<TabProps>;

export interface TabsProps {
    activeTab?: string;
    canCloseTabs?: boolean | ((tab: ReactElement<TabProps>) => boolean);
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
            return Object.assign(state, {
                activeTab: activeTabProps,
                previousTab: activeTabState,
            });
        }

        return state;
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

    protected onTabClick: TabMouseEvent = (e, tabId): void => {
        const {activeTab} = this.state;

        this.setState({
            activeTab: tabId,
            previousTab: activeTab,
        });
    };

    protected renderHeaders(): ReactElement {
        const {children, canAddTabs, onTabClick, onTabMouseDown, onTabCloseClick, onTabAddClick} = this.props;
        const {activeTab} = this.state;

        return (<div className="tabs__tab-headers clearfix">
            <React.Fragment>
                {Children.map(children || [], (tab: ReactElement) => {
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

    protected isTabClosable(tab: ReactElement<TabProps>): boolean {
        const {children, canCloseTabs, onTabCloseClick} = this.props;

        if (!children) {
            return false;
        }

        if (typeof canCloseTabs === "boolean") {
            return (typeof onTabCloseClick === "function") && canCloseTabs;
        } else if (typeof canCloseTabs === "function") {
            return (typeof onTabCloseClick === "function") && canCloseTabs(tab);
        }

        return !Array.isArray(children) || (children.length > 1);
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
        const {children} = this.props;

        if (!tabId || !children) {
            return undefined;
        }

        if (Array.isArray(children)) {
            return children.find((tab: TabChild) => {
                return tab.props.id === tabId;
            });
        }

        return (children.props.id === tabId
            ? children
            : undefined);
    }

    protected getFirstTab(): Optional<Tab> {
        const {children} = this.props;

        if (!children) {
            return undefined;
        }

        if (Array.isArray(children)) {
            return children[0];
        } else {
            return children;
        }
    }
}

