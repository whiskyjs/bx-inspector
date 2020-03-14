import "./style.scss";

import React, {ChangeEvent, PureComponent, ReactElement} from "react";

export interface FilterChangeEventHandler {
    (e: ChangeEvent<HTMLInputElement>): void;
}

export interface FilterProps {
    value: string;
    onChange: FilterChangeEventHandler;
}

export class Filter extends PureComponent<FilterProps> {
    public render(): ReactElement {
        const {value, onChange} = this.props;

        return (<div className="filter">
            <input
                type="text"
                value={value}
                className="filter__input"
                onChange={onChange}
            />
        </div>);
    }
}
