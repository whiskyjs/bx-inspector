import "./style.scss";

import React, {PureComponent, ReactElement} from "react";
import {cast, Instance} from "mobx-state-tree";

import {PanelStoreContext} from "@devpanel/state";
import {Editor} from "@devpanel/components/Editor";
import {Client} from "@common/graphql/client";
import {App} from "@devpanel/app";

import {PanelStore} from "@common/stores/panel";
import {Action, ActionMouseEvent, ActionType, Toolbar} from "@common/components/Toolbar";
import {Modal, ModalButtons, ModalMouseEvent} from "@common/components/Modal";
import * as MobX from "@common/types/graphql-models";

// eslint-disable-next-line
export interface EventMonitorProps {
}

// eslint-disable-next-line
export interface EventMonitorState {
    isOptionsOpen: boolean;
    isSubscriptionActive: boolean;
}

export class EventMonitor extends PureComponent<EventMonitorProps, EventMonitorState> {
    public static contextType = PanelStoreContext;

    public constructor(props: EventMonitorProps) {
        super(props);

        this.state = {
            isOptionsOpen: false,
            isSubscriptionActive: false,
        };
    }

    protected onSubscribeClick: ActionMouseEvent = (e) => {
        e.stopPropagation();

        const {isSubscriptionActive} = this.state;

        if (!isSubscriptionActive) {
            this.setState({
                isOptionsOpen: true,
            });
        } else {
            this.setState({
                isSubscriptionActive: false,
            });
        }
    };

    protected onOptionsClick: ActionMouseEvent = (e) => {
        e.stopPropagation();

        this.setState({
            isOptionsOpen: true,
        });
    };

    public render(): ReactElement {
        const {isOptionsOpen, isSubscriptionActive} = this.state;

        return (
            <div className="event-monitor">
                <Toolbar>
                    <Action
                        id="subscribe"
                        type={ActionType.Switch}
                        title="Подписаться"
                        checked={isSubscriptionActive}
                        onActionClick={this.onSubscribeClick}
                    />
                    <Action
                        id="select"
                        type={ActionType.Button}
                        title="Опции..."
                        enabled={isSubscriptionActive}
                        onActionClick={this.onOptionsClick}
                    />
                </Toolbar>
                <Editor/>
                <Modal
                    title="Доступные события"
                    visible={isOptionsOpen}
                    buttons={[ModalButtons.OK, ModalButtons.Cancel]}
                    onBackdropClick={this.doCloseOptions}
                    onButtonClick={this.onModalButtonClick}
                >
                    {this.renderEvents()}
                </Modal>
            </div>
        );
    }

    // eslint-disable-next-line
    protected doCloseOptions: ModalMouseEvent = (e) => {
        this.setState({
            isOptionsOpen: false,
        });
    };

    protected getContextData(): Instance<typeof PanelStore> {
        return (this.context as Instance<typeof PanelStore>);
    }

    protected onModalButtonClick = async (): Promise<any> => {
        this.setState({
            isOptionsOpen: false,
        });

        const app = App.getInstance() as App;
        const client = Client.createClient({
            app,
        });

        try {
            const result = await client.inspectEventsSubscribe(
                app.getId(),
                cast<Instance<typeof MobX.ModuleEventSetTypeInput>>({
                    main: ["OnPageStart"],
                    iblock: ["OnBeforeIBlockElementUpdate"],
                })
            );

            console.log(result);
        } finally {
            client.cancelRequestsActive();
        }
    };

    /**
     * Грязный хардкод.
     *
     * TODO: Добавить рефлексию или генерацию данных для рантайма.
     */
    protected renderEvents() {
        return (<div className="event-monitor-events">
            <div
                className="event-monitor-events__event-category"
            >
                <div className="event-monitor-events__event-category-title">
                    main
                </div>

                <div className="event-monitor-events__event-category-list">
                    <label>
                        <input
                            type="checkbox"
                        />
                        OnPageStart
                    </label>
                </div>
            </div>
            <div
                className="event-monitor-events__event-category"
            >
                <div className="event-monitor-events__event-category-title">
                    iblock
                </div>

                <div className="event-monitor-events__event-category-list">
                    <label>
                        <input
                            type="checkbox"
                        />
                        OnBeforeIBlockElementUpdate
                    </label>
                </div>
            </div>
        </div>);
    }
}
