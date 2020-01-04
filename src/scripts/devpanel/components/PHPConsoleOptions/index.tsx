import "./style.scss";

import React, {ReactElement, PureComponent} from "react";
import {Instance} from "mobx-state-tree";
import {observer} from "mobx-react";
import {debounce} from "lodash";

import {Editor} from "@devpanel/components/Editor";
import {SettingsStoreContext} from "@devpanel/state";
import {Settings} from "@common/stores/background";
import {Tab, Tabs} from "@common/components/Tabs";
import {EditorChangeData} from "@common/stores/panel";

// eslint-disable-next-line
export interface PHPConsoleOptionsProps {
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
            const phpConsole = (this.context as Instance<typeof Settings>).phpConsole;

            phpConsole.setTabContents(type, data);
        }, 500);
    }

    public render(): ReactElement {
        const {prologue, epilogue} = (this.context as Instance<typeof Settings>).phpConsole;

        return (
            <div className="php-console-options">
                <Tabs>
                    <Tab
                        id="prologue"
                        title="Пролог"
                        panel={<Editor
                            value={prologue.contents}
                            viewState={prologue.viewState}
                            onChange={(data): void => this.setEditorContents("prologue", data)}
                            key="prologue"
                        />}
                    />
                    <Tab
                        id="epilogue"
                        title="Эпилог"
                        panel={<Editor
                            onChange={(data): void => this.setEditorContents("epilogue", data)}
                            value={epilogue.contents}
                            viewState={epilogue.viewState}
                            key="epilogue"
                        />}
                    />
                </Tabs>
            </div>
        );
    }
}
