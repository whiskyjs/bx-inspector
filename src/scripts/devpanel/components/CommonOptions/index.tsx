import "./style.scss";

import React, {ReactElement, PureComponent} from "react";

import {Tab, Tabs} from "@common/components/Tabs";
import {NetworkingOptions} from "@devpanel/components/NetworkingOptions";

// eslint-disable-next-line
export interface CommonOptionsProps {
}

// eslint-disable-next-line
export interface CommonOptionsState {
}

export class CommonOptions extends PureComponent<CommonOptionsProps, CommonOptionsState> {
    public render(): ReactElement {
        return (
            <div className="common-options">
                <Tabs>
                    <Tab
                        id="networking"
                        title="Подключение"
                        panel={<NetworkingOptions/>}
                    />
                </Tabs>
            </div>
        );
    }
}
