import "./style.scss";

import React, {ReactElement, PureComponent} from "react";

import {PHPConsoleOptions} from "@devpanel/components/PHPConsoleOptions";
import {Tab, Tabs} from "@common/components/Tabs";

// eslint-disable-next-line
export interface OptionsProps {
}

// eslint-disable-next-line
export interface OptionsState {
}

export class Options extends PureComponent<OptionsProps, OptionsState> {
    public render(): ReactElement {
        return (
            <div className="options">
                <Tabs>
                    <Tab
                        id="php-console"
                        title="Консоль PHP"
                        panel={<PHPConsoleOptions/>}
                    />
                </Tabs>
            </div>
        );
    }
}
