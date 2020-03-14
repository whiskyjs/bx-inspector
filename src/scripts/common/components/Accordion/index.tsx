import "./style.scss";

import React, {Children, MouseEvent, PureComponent, ReactElement} from "react";
import cn from "classnames";

export interface TabMouseEvent {
    (e: MouseEvent<HTMLElement>, tabId: string): void;
}

export interface TablessMouseEvent {
    (e: MouseEvent<HTMLElement>): void;
}

export interface AccordionTabProps {
    id: string;
    title: string;
    open?: boolean;
    onTabClick?: TabMouseEvent;
    onTabMouseUp?: TabMouseEvent;
}

export class AccordionTab extends PureComponent<AccordionTabProps> {
    protected static defaultProps = {
        open: false,
    };

    constructor(props: AccordionTabProps) {
        super(props);
    }

    protected onTabClick: TablessMouseEvent = (e) => {
        const {id, onTabClick} = this.props;

        e.stopPropagation();

        if (onTabClick) {
            onTabClick(e, id);
        }
    };

    public render(): ReactElement {
        const {id, children, title, open, onTabMouseUp} = this.props;

        return (<div
            className={cn(
                "accordion__tab", {
                    "accordion__tab--open": open,
                })}
            onMouseUp={(e): void => onTabMouseUp && onTabMouseUp(e, id)}
        >
            <div
                className={cn("accordion__tab-header", {
                    "accordion__tab-header--open": open,
                })}
                onClick={this.onTabClick}
            >
                {title}
            </div>
            <div
                className={cn("accordion__tab-contents", {
                    "accordion__tab-contents--open": open,
                })}
            >
                {children}
            </div>
        </div>);
    }
}

export interface AccordionProps {
    children?: any;
    className?: string;
    onTabClick?: TabMouseEvent;
    onTabMouseUp?: TabMouseEvent;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AccordionState {
}

export class Accordion extends PureComponent<AccordionProps, AccordionState> {
    protected static defaultProps = {
        canCloseTabs: false,
        canAddTabs: false,
    };

    protected static getTabs(props: AccordionProps): Array<AccordionTab> {
        const {children} = props;

        if (!children) {
            return [];
        }

        return Array.isArray(children)
            ? children
            : [children];
    }

    public render(): ReactElement {
        const {className} = this.props;

        return (<div className={cn("accordion", className)}>
            {this.renderTabs()}
        </div>);
    }

    protected renderTabs(): ReactElement {
        const {onTabClick, onTabMouseUp} = this.props;

        return (<div className="accordion__tabs">
            <React.Fragment>
                {Children.map(Accordion.getTabs(this.props), (tab: AccordionTab) => {
                    return (
                        <AccordionTab
                            {...tab.props}
                            onTabClick={onTabClick}
                            onTabMouseUp={onTabMouseUp}
                        />
                    );
                })}
            </React.Fragment>
        </div>);
    }
}

