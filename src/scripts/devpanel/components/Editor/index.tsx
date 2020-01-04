import "./style.scss";

import React, {Component, KeyboardEvent, ReactElement} from "react";
import {editor} from "monaco-editor";
import MonacoEditor from "react-monaco-editor";
import {debounce} from "lodash";
import {shallowEqual} from "@babel/types";

import {blocks, collect} from "@common/functions";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorProps {
    defaultValue?: string;
    value?: string;
    viewState?: string;
    message?: string;
    onChange?: (data: EditorChangeData) => void;
    actions?: ReadonlyArray<editor.IActionDescriptor>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorState {
}

export class Editor extends Component<EditorProps, EditorState> {
    protected static defaultProps = {
        defaultValue: "",
    };

    protected editor?: editor.IStandaloneCodeEditor;

    protected options?: editor.IEditorOptions;

    protected onDoubleShift: Function;

    protected onSaveEditorState?: Function;

    protected editorChangeData: EditorChangeData = {};

    // eslint-disable-next-line
    protected active: boolean = false;

    protected activityTimeout?: NodeJS.Timeout;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    protected shiftIsDown: boolean = false;

    constructor(props: EditorProps) {
        super(props);

        this.options = {
            selectOnLineNumbers: true,
            automaticLayout: true,
        };

        this.state = {};

        this.onDoubleShift = collect(() => {
            this.editor && this.editor.trigger("Editor", "editor.action.quickCommand", {});
        }, 2, 200);

        this.onSaveEditorState = debounce(() => {
            if (this.props.onChange && Object.keys(this.editorChangeData).length) {
                this.props.onChange(this.editorChangeData);
                this.editorChangeData = {};
            }
        }, 500);
    }

    protected editorDidMount = (editor: editor.IStandaloneCodeEditor): void => {
        const {viewState, actions} = this.props;

        this.editor = editor;

        if (viewState) {
            editor.restoreViewState(JSON.parse(viewState));
        }

        if (actions) {
            actions.forEach(action => editor.addAction({
                ...action,
                run: (() => action.run(editor))
            }));
        }

        editor.onDidChangeCursorPosition(this.onDidChangeCursorPosition);
    };

    public componentDidUpdate(): void {
        const {viewState} = this.props;

        if (this.editor && viewState) {
            this.editor.restoreViewState(JSON.parse(viewState));
        }
    }

    public shouldComponentUpdate(
        nextProps: Readonly<EditorProps>,
        nextState: Readonly<EditorState>
    ): boolean {
        return !this.active
            && (!shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state));
    }

    protected onKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
        if (e.key === "Shift") {
            if (this.editor && this.editor.hasTextFocus() && !this.shiftIsDown) {
                this.onDoubleShift(e);
            }

            this.shiftIsDown = true;
        }
    };

    protected onKeyUp = (e: KeyboardEvent<HTMLElement>): void => {
        if (e.key === "Shift") {
            this.shiftIsDown = false;
        }
    };

    protected onChange = ((contents: string): void => {
        this.active = true;

        if (this.activityTimeout) {
            clearTimeout(this.activityTimeout);
        }

        this.activityTimeout = setTimeout(() => {
            this.active = false;
        }, 2000);

        if (this.onSaveEditorState && this.editor) {
            if ((typeof contents !== "undefined") && contents) {
                Object.assign(this.editorChangeData, {
                    contents,
                    viewState: this.editor.saveViewState() || undefined,
                });

                this.onSaveEditorState();
            }
        }
    });

    protected onDidChangeCursorPosition = ((): void => {
        if (this.onSaveEditorState && this.editor) {
            Object.assign(this.editorChangeData, {
                viewState: this.editor.saveViewState() || undefined,
            });

            this.onSaveEditorState();
        }
    });

    public render(): ReactElement {
        const {defaultValue, value, message} = this.props;

        return (
            <div className="editor">
                <div className="editor__header"></div>
                <div
                    className="editor__input"
                    onKeyDown={this.onKeyDown}
                    onKeyUp={this.onKeyUp}
                >
                    <MonacoEditor
                        language="php"
                        defaultValue={defaultValue}
                        value={value}
                        options={this.options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />
                </div>
                <div className="editor__footer">
                    {blocks([
                        [!!message, <>Результат: {message}</>]
                    ])}
                </div>
            </div>
        );
    }
}
