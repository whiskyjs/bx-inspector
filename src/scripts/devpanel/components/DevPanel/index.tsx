import "./style.scss";

import React, {ReactElement} from "react";

import {PHPConsole} from "@devpanel/components/PHPConsole";
import {About} from "@devpanel/components/About";
import {Options} from "@devpanel/components/Options";

import {Tab, Tabs} from "@common/components/Tabs";

// eslint-disable-next-line
export interface DevPanelProps {
}

// eslint-disable-next-line
export interface DevPanelState {
}

export class DevPanel extends React.PureComponent<DevPanelProps, DevPanelState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            activeTab: "php-console",
        }
    }

    public render(): ReactElement {
        return (
            <Tabs>
                <Tab
                    id="php-console"
                    title="Консоль PHP"
                    panel={<PHPConsole/>}
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
            </Tabs>
        );
    }
}
