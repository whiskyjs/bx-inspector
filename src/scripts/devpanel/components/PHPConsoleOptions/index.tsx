import "./style.scss";

import React, {ReactElement, PureComponent} from "react";
import {Instance} from "mobx-state-tree";
import {observer} from "mobx-react";
import {debounce} from "lodash";

import {PHPConsoleSettings, PHPFixedEditor, Settings} from "@common/stores/background";
import {Tab, Tabs} from "@common/components/Tabs";
import {Editor} from "@devpanel/components/Editor";
import {SettingsStoreContext} from "@devpanel/state";
import {EditorChangeData} from "@common/stores/panel";

// eslint-disable-next-line
export interface PHPConsoleOptionsProps {
    prologue: Instance<typeof PHPFixedEditor>;
    epilogue: Instance<typeof PHPFixedEditor>;
}

// eslint-disable-next-line
export interface PHPConsoleOptionsState {
}

@observer
export class PHPConsoleOptions extends PureComponent<PHPConsoleOptionsProps, PHPConsoleOptionsState> {
    public static contextType = SettingsStoreContext;

    protected setEditorContents: (
        tab: "prologue" | "epilogue",
        data: EditorChangeData
    ) => void;

    constructor(props: PHPConsoleOptionsProps) {
        super(props);

        this.setEditorContents = debounce((type, data): void => {
            const phpConsole = this.getStoreFromContext();

            phpConsole.setTabContents(type, data);
        }, 500);
    }

    public render(): ReactElement {
        const {prologue, epilogue} = this.getStoreFromContext();

        return (
            <div className="php-console-options">
                <Tabs>
                    <Tab
                        id="prologue"
                        title="Пролог"
                        panel={(): ReactElement => (<Editor
                            value={prologue.contents}
                            viewState={prologue.viewState}
                            onChange={(data): void => this.setEditorContents("prologue", data)}
                            key="prologue"
                        />)}
                    />
                    <Tab
                        id="epilogue"
                        title="Эпилог"
                        panel={(): ReactElement => (<Editor
                            onChange={(data): void => this.setEditorContents("epilogue", data)}
                            value={epilogue.contents}
                            viewState={epilogue.viewState}
                            key="epilogue"
                        />)}
                    />
                </Tabs>
            </div>
        );
    }

    protected getStoreFromContext(): Instance<typeof PHPConsoleSettings> {
        return (this.context as Instance<typeof Settings>).phpConsole;
    }
}
