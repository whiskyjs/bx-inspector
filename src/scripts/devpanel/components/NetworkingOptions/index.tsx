import "./style.scss";

import React, {ReactElement, PureComponent, ChangeEvent} from "react";
import {Instance} from "mobx-state-tree";
import {observer} from "mobx-react";
import {debounce} from "lodash";

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

    constructor(props: NetworkingOptionsProps) {
        super(props);

        this.setWebsocketUrl = debounce(this.setWebsocketUrl, 1000);
        this.setGraphqlPath = debounce(this.setGraphqlPath, 1000);
    }

    public render(): ReactElement {
        const networking = this.getContextData();

        return (
            <form className="networking-options">
                <div className="row">
                    <div className="col-xs-4">
                        <div className="row">
                            <div className="col-xs-12">
                                <label className="form-group form-group--first">
                                    <span
                                        className="form-group__label"
                                    >
                                        Путь к GraphQL-серверу:
                                    </span>
                                    <input
                                        className="form-group__input"
                                        type="text"
                                        value={networking.graphqlPath}
                                        onChange={this.setGraphqlPath}
                                    />
                                </label>
                                <label className="form-group">
                                    <span
                                        className="form-group__label"
                                    >
                                        URL прокси-сервера:
                                    </span>
                                    <input
                                        className="form-group__input"
                                        type="text"
                                        value={networking.websocketUrl}
                                        onChange={this.setWebsocketUrl}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    protected setWebsocketUrl = (e: ChangeEvent<HTMLInputElement>): void => {
        this.getContextData().setWebsocketUrl(e.target.value);
    };

    protected setGraphqlPath = (e: ChangeEvent<HTMLInputElement>): void => {
        this.getContextData().setGraphqlPath(e.target.value);
    };

    protected getContextData(): Instance<typeof CommonSettings>["networking"] {
        return (this.context as Instance<typeof SettingsStore>).common.networking;
    }
}
