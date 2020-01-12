import "./style.scss";

import cn from "classnames";
import React, {PureComponent, ReactElement, MouseEvent, Fragment} from "react";
import ReactDOM from "react-dom";
import uuid from "uuid";

export interface ModalMouseEvent {
    (e: MouseEvent<HTMLElement>): void;
}

export interface ModalButtonMouseEvent {
    (e: MouseEvent<HTMLElement>, type: ModalButtons, index: number): void;
}

export enum ModalButtons {
    OK = "ОК",
    Cancel = "Отмена",
}

export interface ModalProps {
    title?: string;
    buttons?: ReadonlyArray<ModalButtons>;
    visible: boolean;
    children: any;
    onBackdropClick?: ModalMouseEvent;
    onButtonClick?: ModalButtonMouseEvent;
}

export class Modal extends PureComponent<ModalProps> {
    protected static defaultProps = {};

    protected containerNode: HTMLElement;

    protected contentRoot: HTMLElement;

    protected modalRoot: HTMLElement;

    constructor(props: ModalProps) {
        super(props);

        this.modalRoot = document.getElementById("modal-root")!;
        this.contentRoot = document.getElementById("content-root")!;

        this.containerNode = document.createElement("div");
        this.containerNode.id = uuid.v4();
        document.body.appendChild(this.containerNode);
    }

    componentDidMount(): void {
        this.modalRoot.appendChild(this.containerNode);
    }

    componentWillUnmount(): void {
        this.modalRoot.removeChild(this.containerNode);
    }

    public render(): ReactElement | null {
        const {visible} = this.props;

        if (!visible) {
            this.setContentBlur(false);

            return null;
        }

        this.setContentBlur(true);

        return ReactDOM.createPortal(
            this.renderPortalContents(),
            this.containerNode,
        );
    }

    protected renderPortalContents(): ReactElement {
        const {onBackdropClick} = this.props;

        return (<Fragment>
            <div
                className="modal-backdrop"
            />
            <div
                className="modal-container"
                onClick={onBackdropClick}
            >
                <div
                    className="modal"
                    onClick={this.onModalClick}
                >
                    {this.renderHeader()}
                    {this.renderBody()}
                    {this.renderFooter()}
                </div>
            </div>
        </Fragment>)
    }

    renderHeader(): ReactElement | null {
        const {title} = this.props;

        if (!title) {
            return null;
        }

        return (<div className="modal__header">
            {title}
        </div>)
    }

    renderFooter(): ReactElement | null {
        const {buttons} = this.props;

        if (!buttons) {
            return null;
        }

        return (<div className="modal__footer">
            {buttons.map((type, index) => {
                return (<a
                    href="#"
                    key={index}
                    className={cn(
                        "modal__footer-button",
                        `modal__footer-button--${type}`
                    )}
                    onClick={(e): void => this.onButtonClick(e, type, index)}
                >
                    {type}
                </a>);
            })}
        </div>)
    }

    protected setContentBlur(blur = true): void {
        if (blur) {
            this.contentRoot.classList.add("blur-content");
        } else {
            this.contentRoot.classList.remove("blur-content");
        }
    }

    protected renderBody(): ReactElement {
        return (<div className="modal__body">
            {this.props.children}
        </div>)
    }

    protected onModalClick = (event: MouseEvent<HTMLElement>): void => {
        event.stopPropagation();
    };

    protected onButtonClick: ModalButtonMouseEvent = (event, type, index) => {
        const {onButtonClick} = this.props;

        event.preventDefault();

        if (onButtonClick) {
            onButtonClick(event, type, index)
        }
    }
}
