import React, {Fragment, ReactElement} from "react";

export function render(element: Optional<ReactElement>, extraProps: GenericObject = {}): Optional<ReactElement> {
    if (!element) {
        return undefined;
    }

    if (Object.keys(extraProps).length) {
        return React.createElement(element.type, {
            ...element.props,
            ...extraProps
        });
    }

    return element;
}

export function collect(f: Function, n: number, ms: number): Function {
    let counter = 0;
    let timeoutId: NodeJS.Timeout;

    const reset = (): void => {
        counter = 0;
        clearTimeout(timeoutId);
    };

    return (...args: any): void => {
        counter++;

        if (counter === n) {
            f(...args);
            reset();
        } else if (counter === 1) {
            timeoutId = setTimeout(reset, ms);
        }
    };
}

export function blocks(pairs: Array<[Optional<boolean>, Optional<ReactElement>]>): JSX.Element {
    const result = pairs.reduce((acc: Optional<ReactElement>[], pair: [Optional<boolean>, Optional<ReactElement>]) => {
        if (pair[0]) {
            return [...acc, render(pair[1])];
        }

        return acc;
    }, [] as Optional<ReactElement>[]);

    return (<Fragment>
        {result}
    </Fragment>);
}
