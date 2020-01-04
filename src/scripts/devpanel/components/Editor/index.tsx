import "./style.scss";

import React, {ReactElement, PureComponent, KeyboardEvent} from "react";
import {editor} from "monaco-editor";
import MonacoEditor from "react-monaco-editor";
import {collect} from "@common/functions";
import {debounce} from "lodash";
import {EditorChangeData} from "@common/stores/panel";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorProps {
    defaultValue?: string;
    value?: string;
    viewState?: string;
    onChange?: (data: EditorChangeData) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorState {
}

export class Editor extends PureComponent<EditorProps, EditorState> {
    protected static defaultProps = {
        defaultValue: "<?php\n\n",
    };

    protected editor?: editor.IStandaloneCodeEditor;

    protected options?: editor.IEditorOptions;

    protected onDoubleShift: Function;

    protected onSaveEditorState?: Function;

    protected editorChangeData: EditorChangeData = {};

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    protected shiftIsDown: boolean = false;

    constructor(props: EditorProps) {
        super(props);

        this.options = {
            selectOnLineNumbers: true,
            automaticLayout: true,
        };

        this.onDoubleShift = collect(() => {
            this.editor && this.editor.trigger("Editor", "editor.action.quickCommand", {});
        }, 2, 200);

        this.onSaveEditorState = debounce(() => {
            if (this.props.onChange && Object.keys(this.editorChangeData).length) {
                this.props.onChange(this.editorChangeData);
                this.editorChangeData = {};
            }
        }, 100);
    }

    protected editorDidMount = (editor: editor.IStandaloneCodeEditor): void => {
        const {viewState} = this.props;

        this.editor = editor;

        if (viewState) {
            editor.restoreViewState(JSON.parse(viewState));
        }

        editor.onDidChangeCursorPosition(this.onDidChangeCursorPosition);
    };

    public componentDidUpdate(): void {
        const {viewState} = this.props;

        if (this.editor && viewState) {
            this.editor.restoreViewState(JSON.parse(viewState));
        }
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
        const {defaultValue, value} = this.props;

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
                <div className="editor__footer"></div>
            </div>
        );
    }
}
