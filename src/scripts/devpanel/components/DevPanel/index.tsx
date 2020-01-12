import "./style.scss";

import React, {ReactElement} from "react";
import {Instance} from "mobx-state-tree";
import classNames from "classnames";
import {observer} from "mobx-react";
import {ToastContainer} from "react-toastify";

import {PHPConsole} from "@devpanel/components/PHPConsole";
import {About} from "@devpanel/components/About";
import {Options} from "@devpanel/components/Options";
import {EventMonitor} from "@devpanel/components/EventMonitor";
import {Tab, Tabs} from "@common/components/Tabs";

import {FlagStoreContext} from "@devpanel/state";
import {FlagStore} from "@common/stores/flags";

// eslint-disable-next-line
export interface DevPanelProps {
}

// eslint-disable-next-line
export interface DevPanelState {
}

@observer
export class DevPanel extends React.PureComponent<DevPanelProps, DevPanelState> {
    public static contextType = FlagStoreContext;

    constructor(props: {}) {
        super(props);
    }

    public render(): ReactElement {
        const {requests} = this.getContextData();

        return (<React.Fragment>
            <Tabs
                className={classNames("dev-panel", {
                    "dev-panel--disabled": requests.active,
                })}
            >
                <Tab
                    id="php-console"
                    title="Консоль PHP"
                    panel={<PHPConsole/>}
                />
                <Tab
                    id="event-monitor"
                    title="Монитор событий"
                    panel={<EventMonitor/>}
                />
                <Tab
                    id="options"
                    title="Настройки"
                    panel={<Options/>}
                />
                <Tab
                    id="about"
                    title="О расширении"
                    panel={<About/>}
                />
            </Tabs>,
            <ToastContainer/>
        </React.Fragment>);
    }

    protected getContextData(): Instance<typeof FlagStore> {
        return this.context as Instance<typeof FlagStore>;
    }
}
