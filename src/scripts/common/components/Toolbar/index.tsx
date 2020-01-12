import "./style.scss";

import React, {Children, MouseEvent, PureComponent, ReactElement} from "react";
import classNames from "classnames";

export enum ActionType {
    Button,
    Switch,
}

export interface ActionMouseEvent {
    (e: MouseEvent<HTMLElement>, actionId: string): void;
}

export interface ActionProps {
    id: string;
    title: string;
    enabled?: boolean;
    type?: ActionType;
    onActionClick?: ActionMouseEvent;
    checked?: boolean;
}

export class Action extends PureComponent<ActionProps> {
    protected static defaultProps = {
        enabled: true,
        checked: false,
        type: ActionType.Button,
    };

    constructor(props: ActionProps) {
        super(props);

        this.state = {
            checked: false,
        };
    }

    public render(): ReactElement {
        const {title, id, enabled, checked, onActionClick} = this.props;

        return (<div
            className={classNames(
                "toolbar__action", {
                    "toolbar__action--disabled": !enabled,
                    "toolbar__action--checked": checked,
                })}
            onClick={(e): void => onActionClick && onActionClick(e, id)}
            title={title}
        >
            <span className="toolbar__action-content">
                {title}
            </span>
        </div>);
    }
}

export interface ToolbarProps {
    children?: any;
    className?: string;
}

export class Toolbar extends PureComponent<ToolbarProps> {
    protected static getActions(props: ToolbarProps): Array<Action> {
        const {children} = props;

        if (!children) {
            return [];
        }

        return Array.isArray(children)
            ? children
            : [children];
    }

    constructor(props: ToolbarProps) {
        super(props);
    }

    public render(): ReactElement {
        const {className} = this.props;

        return (<div className={classNames("toolbar", className)}>
            {this.renderActions()}
        </div>);
    }

    protected renderActions(): ReactElement {
        return (<React.Fragment>
            {Children.map(Toolbar.getActions(this.props), (action: Action) => {
                return (
                    <Action
                        {...action.props}
                    />
                );
            })}
        </React.Fragment>);
    }
}
