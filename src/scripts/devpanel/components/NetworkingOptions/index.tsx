import "./style.scss";

import React, {ReactElement, PureComponent} from "react";
import {Instance} from "mobx-state-tree";
import {observer} from "mobx-react";

import {SettingsStoreContext} from "@devpanel/state";
import {CommonSettings, SettingsStore} from "@common/stores/settings";

// eslint-disable-next-line
export interface NetworkingOptionsProps {
}

// eslint-disable-next-line
export interface NetworkingOptionsState {
}

@observer
export class NetworkingOptions extends PureComponent<NetworkingOptionsProps, NetworkingOptionsState> {
    public static contextType = SettingsStoreContext;

    public render(): ReactElement {
        const {networking} = this.getContextData();

        return (
            <form className="networking-options">
                <div className="row">
                    <div className="col-xs-4">
                        <div className="row">
                            <div className="col-xs-12">
                                <label className="form-group">
                                    <span
                                        className="form-group__label"
                                    >
                                        Путь к GraphQL-серверу:
                                    </span>
                                    <input
                                        disabled
                                        className="form-group__input"
                                        type="text"
                                        value={networking.endpoint}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    protected getContextData(): Instance<typeof CommonSettings> {
        return (this.context as Instance<typeof SettingsStore>).common;
    }
}
