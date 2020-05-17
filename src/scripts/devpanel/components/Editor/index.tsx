import "./style.scss";

import React, {Component, ReactElement} from "react";

import AceEditor, {IAceOptions, IEditorProps, ICommand} from "react-ace";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

import {debounce} from "lodash";
import {shallowEqual} from "@babel/types";

import {blocks} from "@common/functions";
import cn from "classnames";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorProps {
    defaultValue?: string;
    value?: string;
    viewState?: string;
    readOnly?: boolean;
    message?: string;
    onChange?: (data: EditorChangeData) => void;
    actions?: ReadonlyArray<ICommand>;
    uuid: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorState {
}

export class Editor extends Component<EditorProps, EditorState> {
    protected static defaultProps = {
        defaultValue: "",
        readOnly: false,
    };

    protected editor?: IEditorProps;

    protected options: IAceOptions;

    protected onSaveEditorState?: Function;

    protected editorChangeData: EditorChangeData = {};

    // eslint-disable-next-line
    protected active: boolean = false;

    protected activityTimeout?: NodeJS.Timeout;

    constructor(props: EditorProps) {
        super(props);

        this.options = {
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
        };
        this.state = {};

        this.onSaveEditorState = debounce(() => {
            if (this.props.onChange && Object.keys(this.editorChangeData).length) {
                this.props.onChange(this.editorChangeData);
                this.editorChangeData = {};
            }
        }, 500);
    }

    protected onEditorLoad = (editor: IEditorProps): void => {
        const {viewState, actions} = this.props;

        this.editor = editor;

        if (viewState) {
            this.setViewState(viewState);
        }

        if (actions) {
            actions.forEach(action => editor.commands!.addCommand(action));
        }
    };

    public componentDidUpdate(): void {
        const {viewState} = this.props;

        if (this.editor && viewState) {
            this.setViewState(viewState);
        }
    }

    public shouldComponentUpdate(
        nextProps: Readonly<EditorProps>,
        nextState: Readonly<EditorState>
    ): boolean {
        return !this.active
            && (!shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state));
    }

    protected onChange = ((contents: string): void => {
        this.active = true;

        if (this.activityTimeout) {
            clearTimeout(this.activityTimeout);
        }

        this.activityTimeout = setTimeout(() => {
            this.active = false;
        }, 2000);

        if (this.onSaveEditorState) {
            if ((typeof contents !== "undefined") && contents) {
                Object.assign(this.editorChangeData, {
                    contents,
                    viewState: this.getViewState(),
                });

                this.onSaveEditorState();
            }
        }
    });

    protected onSelectionChange = ((): void => {
        if (this.onSaveEditorState && this.editor) {
            Object.assign(this.editorChangeData, {
                viewState: this.getViewState(),
            });

            this.onSaveEditorState();
        }
    });

    protected getViewState(): EditorViewState {
        const session = this.editor!.session;

        return {
            selection: session.selection.toJSON(),
        };
    }

    protected setViewState(viewState: string): void {
        const session = this.editor!.session;
        const state = JSON.parse(viewState);

        session.selection.fromJSON(state.selection);
    }

    public render(): ReactElement {
        const {defaultValue, value, message, readOnly, uuid} = this.props;

        return (
            <div className="editor">
                <div className="editor__header"/>
                <div
                    className={cn("editor__input", {
                        "editor__input--readonly": readOnly,
                    })}
                >
                    <AceEditor
                        name={uuid}
                        mode="php"
                        theme="github"
                        height="100%"
                        width="100%"
                        defaultValue={defaultValue}
                        value={value}
                        setOptions={this.options}
                        onLoad={this.onEditorLoad}
                        onSelectionChange={this.onSelectionChange}
                        onCursorChange={this.onSelectionChange}
                        onChange={this.onChange}
                    />,
                </div>
                <div className="editor__footer">
                    {blocks([
                        [!!message, <>Результат: {message}</>]
                    ])}
                </div>
            </div>
        );
    }

    public getEditor(): IAceOptions {
        if (!this.editor) {
            throw new Error("Ошибка - этот код никогда не должен выполняться.");
        }

        return this.editor;
    }
}
