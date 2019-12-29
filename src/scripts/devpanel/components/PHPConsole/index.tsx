import "./style.scss";

import React, {ReactElement, PureComponent} from "react";
import SplitPane from "react-split-pane";

import {PHPConsoleResults} from "@devpanel/components/PHPConsoleResults";
import {PHPConsoleEditors} from "@devpanel/components/PHPConsoleEditors";
import {PanelStoreContext} from "@devpanel/state";
import {Instance} from "mobx-state-tree";
import {PanelStore} from "@common/stores/panel";

// eslint-disable-next-line
export interface PHPConsoleProps {
}

// eslint-disable-next-line
export interface PHPConsoleState {
}

export class PHPConsole extends PureComponent<PHPConsoleProps, PHPConsoleState> {
    public static contextType = PanelStoreContext;

    public render(): ReactElement {
        const {editors, results} = (this.context as Instance<typeof PanelStore>).phpConsole;

        return (
            <div className="php-console">
                <SplitPane split="vertical" minSize={0} defaultSize={window.innerWidth / 2}>
                    <div className="php-console__results">
                        <PHPConsoleResults
                            results={results}
                        />
                    </div>
                    <div className="php-console__editors">
                        <PHPConsoleEditors
                            editors={editors}
                        />
                    </div>
                </SplitPane>
            </div>
        );
    }
}
