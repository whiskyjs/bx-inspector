import "./style.scss";

import React, {ReactElement, PureComponent, RefObject} from "react";
import SplitPane from "react-split-pane";

import {PHPConsoleResults} from "@devpanel/components/PHPConsoleResults";
import {PHPConsoleEditors} from "@devpanel/components/PHPConsoleEditors";
import {PanelStoreContext} from "@devpanel/state";
import {Instance} from "mobx-state-tree";
import {PanelStore, PHPConsole as PHPConsoleType} from "@common/stores/panel";

// eslint-disable-next-line
export interface PHPConsoleProps {
}

// eslint-disable-next-line
export interface PHPConsoleState {
}

export class PHPConsole extends PureComponent<PHPConsoleProps, PHPConsoleState> {
    public static contextType = PanelStoreContext;

    protected editors: RefObject<PHPConsoleEditors> = React.createRef<PHPConsoleEditors>();

    protected results: RefObject<PHPConsoleResults> = React.createRef<PHPConsoleResults>();

    public constructor(props: PHPConsoleProps) {
        super(props);
    }

    public render(): ReactElement {
        const {editors, results} = this.getContextData();

        return (
            <div className="php-console">
                <SplitPane
                    split="vertical"
                    minSize={0}
                    defaultSize={window.innerWidth / 2}
                >
                    <div className="php-console__results">
                        <PHPConsoleResults
                            ref={this.results}
                            results={results}
                        />
                    </div>
                    <div className="php-console__editors">
                        <PHPConsoleEditors
                            ref={this.editors}
                            editors={editors}
                            setActiveResultValue={this.setActiveResultValue}
                        />
                    </div>
                </SplitPane>
            </div>
        );
    }

    protected getContextData(): Instance<typeof PHPConsoleType> {
        return (this.context as Instance<typeof PanelStore>).phpConsole;
    }

    protected setActiveResultValue = (output: string, result: string): void => {
        const {results} = this.getContextData();

        if (!this.results.current) {
            throw new Error("Компонент PHPConsoleResults недоступен.");
        }

        results.setTabContents(this.results.current.getActiveTab(), {
            contents: output,
            message: result,
        });
    };
}
