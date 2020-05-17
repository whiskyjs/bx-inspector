import "./style.scss";

import React, {ChangeEvent, MouseEvent, PureComponent, ReactElement, RefObject} from "react";
import {cast, Instance} from "mobx-state-tree";
import {observer} from "mobx-react";
import {capitalize} from "lodash";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {browser} from "webextension-polyfill-ts";

import {PanelStoreContext, runtimePanelStore} from "@devpanel/state";
import {Editor} from "@devpanel/components/Editor";
import {Client} from "@common/graphql/client";

import {App} from "@devpanel/app";
import {EventMonitor as EventMonitorType, ModuleName, ModuleNameList, PanelStore} from "@common/stores/panel";
import {Action, ActionMouseEvent, ActionType, Toolbar} from "@common/components/Toolbar";
import {Modal, ModalButtons, ModalMouseEvent} from "@common/components/Modal";
import * as MobX from "@common/types/graphql-models";
import {Accordion, AccordionTab} from "@common/components/Accordion";
import {Filter, FilterChangeEventHandler} from "@common/components/Filter";
import {setCookie} from "@devpanel/inspect";
import {EVENT_MONITOR_COOKIE} from "@common/constants";

// eslint-disable-next-line
export interface EventMonitorProps {
}

// eslint-disable-next-line
export interface EventMonitorState {
    isEventModalOpen: boolean;
    isSubscriptionActive: boolean;
    filterValue: string;
    eventLog: string;
}

@observer
export class EventMonitor extends PureComponent<EventMonitorProps, EventMonitorState> {
    public static contextType = PanelStoreContext;

    protected editor: RefObject<Editor>;

    public constructor(props: EventMonitorProps) {
        super(props);

        this.editor = React.createRef<Editor>();
    }

    componentDidUpdate(): void {
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        if (!this.editor.current) {
            return;
        }

        /*
        const editor = this.editor.current.getEditor();
        const model = editor.getModel() as editor.ITextModel;
        const lastLineNumber = model.getLineCount();

        editor.revealLine(lastLineNumber);
        editor.setSelection({
            startColumn: 1,
            endColumn: 1,
            startLineNumber: lastLineNumber,
            endLineNumber: lastLineNumber,
        });
         */
    }

    public componentDidMount(): void {
        this.scrollToBottom();
    }

    protected onSubscribeClick: ActionMouseEvent = (e) => {
        e.stopPropagation();

        runtimePanelStore.eventMonitor.setEventModalOpen(true);
    };

    protected onClearLogClick: ActionMouseEvent = (e) => {
        e.stopPropagation();

        runtimePanelStore.eventMonitor.setEventLog("");
    };

    protected onUnsubscribeClick: ActionMouseEvent = async (e) => {
        e.stopPropagation();

        const app = App.getInstance() as App;
        const client = Client.createClient({
            app,
        });

        try {
            // noinspection JSUnusedLocalSymbols
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const result = await client.inspectEventsUnsubscribe(
                app.getId(),
            );

            runtimePanelStore.eventMonitor.setSubscriptionActive(false);

            browser.devtools.inspectedWindow.eval(setCookie(EVENT_MONITOR_COOKIE, ""));
        } finally {
            client.cancelRequestsActive();
        }
    };

    public render(): ReactElement {
        const {isEventModalOpen, isSubscriptionActive, eventLog} = runtimePanelStore.eventMonitor;

        return (
            <div className="event-monitor">
                <Toolbar>
                    <Action
                        id="subscribe"
                        type={ActionType.Button}
                        title="Подписаться"
                        onActionClick={this.onSubscribeClick}
                    />
                    <Action
                        id="unsubscribe"
                        type={ActionType.Button}
                        title="Отписаться"
                        enabled={isSubscriptionActive}
                        onActionClick={this.onUnsubscribeClick}
                    />
                    <Action
                        id="clear-log"
                        type={ActionType.Button}
                        title="Очистить"
                        onActionClick={this.onClearLogClick}
                    />
                </Toolbar>
                <Editor
                    ref={this.editor}
                    readOnly={true}
                    value={eventLog}
                />
                <Modal
                    className="modal--event-monitor"
                    title="Доступные события"
                    visible={isEventModalOpen}
                    buttons={[ModalButtons.OK, ModalButtons.Cancel]}
                    onBackdropClick={this.doCloseOptions}
                    onButtonClick={this.onModalButtonClick}
                >
                    {this.renderEventModal()}
                </Modal>
            </div>
        );
    }

    // eslint-disable-next-line
    protected doCloseOptions: ModalMouseEvent = (e) => {
        runtimePanelStore.eventMonitor.setEventModalOpen(false);
    };

    protected getContextData(): Instance<typeof EventMonitorType> {
        return (this.context as Instance<typeof PanelStore>).eventMonitor;
    }

    protected onModalButtonClick = (e: MouseEvent<HTMLElement>, type: ModalButtons): void => {
        runtimePanelStore.eventMonitor.setEventModalOpen(false);
        runtimePanelStore.eventMonitor.setSubscriptionActive(true);

        if (type === ModalButtons.OK) {
            // noinspection JSIgnoredPromiseFromCall
            this.onEventModalSubscribeClick();
        }
    };

    protected onEventModalSubscribeClick = async (): Promise<any> => {
        const {events} = this.getContextData();

        const app = App.getInstance() as App;
        const client = Client.createClient({
            app,
        });

        try {
            // noinspection JSUnusedLocalSymbols
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const result = await client.inspectEventsSubscribe(
                app.getId(),
                cast<Instance<typeof MobX.ModuleEventSetInput>>(events),
            );

            browser.devtools.inspectedWindow.eval(setCookie(EVENT_MONITOR_COOKIE, "1"));
        } finally {
            client.cancelRequestsActive();
        }
    };

    protected setTabOpen = (e: MouseEvent<HTMLElement>, tabId: string): void => {
        const {eventModal} = this.getContextData();
        // TODO: Строгая типизация для tabId (render-props, Parameters<T>). Или выпилить standalone-табы.
        const moduleName = tabId as ModuleName;

        e.preventDefault();

        eventModal.setTabOpen(moduleName, !eventModal.openTabs.includes(moduleName));
    };

    protected onFilterChange: FilterChangeEventHandler = (e) => {
        const {eventModal} = this.getContextData();

        if (e.target.value) {
            ModuleNameList.forEach(module => eventModal.setTabOpen(module));
        }

        runtimePanelStore.eventMonitor.setFilterValue(e.target.value);
    };

    protected renderEventModal(): ReactElement {
        return (<div className="event-options">
            <Filter
                value={runtimePanelStore.eventMonitor.filterValue}
                onChange={this.onFilterChange}
            />

            {this.renderEvents()}
        </div>);
    }

    protected renderEvents(): Optional<ReactElement> {
        const {openTabs} = this.getContextData().eventModal;

        const moduleList = ModuleNameList.reduce((acc, module) => {
            const moduleEvents = this.renderModuleEvents(module);

            if (!moduleEvents) {
                return acc;
            }

            return [...acc, <AccordionTab
                key={module}
                id={module}
                title={module}
                open={openTabs.includes(module)}
            >
                {moduleEvents}
            </AccordionTab>];
        }, [] as ReactElement[]);

        return (<Accordion
            onTabClick={this.setTabOpen}
        >
            {moduleList}
        </Accordion>);
    }

    protected checkModuleEvent(e: ChangeEvent<HTMLInputElement>, module: ModuleName, eventName: string): void {
        const {setEventChecked, events} = this.getContextData();

        setEventChecked(
            module,
            eventName,
            !events[module] || events[module] && !events[module]!.includes(eventName)
        );
    }

    protected isEventChecked(module: ModuleName, eventName: string): boolean {
        const events = this.getContextData().events;

        return Array.isArray(events[module]) && events[module]!.includes(eventName);
    }

    protected renderModuleEvents(module: ModuleName): Optional<ReactElement> {
        const {filterValue} = runtimePanelStore.eventMonitor;

        const eventList = this.getModuleEventNames(module).reduce((acc, eventName: string) => {
            if (filterValue && !eventName.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())) {
                return acc;
            }

            return [...acc, this.renderModuleEvent(module, eventName)];
        }, [] as ReactElement[]);

        if (!eventList.length) {
            return undefined;
        }

        return (<div className="module-events">
            {eventList}
        </div>);
    }

    protected renderModuleEvent(module: ModuleName, eventName: string): ReactElement {
        const events = this.getContextData().events;

        return (<div
            className="module-events__event"
            key={eventName}
        >
            <label
                htmlFor={eventName}
                className="module-events__event-label"
            >
                <span
                    className="module-events__event-label-text"
                >
                    {eventName}
                </span>
                <input
                    className="module-events__event-input"
                    id={eventName}
                    onChange={((e): void => this.checkModuleEvent(e, module, eventName))}
                    type="checkbox"
                    checked={events[module] && events[module]!.includes(eventName)}
                />
            </label>
        </div>);
    }

    /**
     * TODO: Более типобезопасный способ извлечения названий событий из моделей.
     *
     * @param {string} module
     */
    protected getModuleEventNames(module: ModuleName): ReadonlyArray<string> {
        return MobX[
            `Module${capitalize(module)}EventsValues` as keyof typeof MobX
        ] as ReadonlyArray<string>;
    }
}
