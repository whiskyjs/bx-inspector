import React, {Fragment, ReactElement} from "react";

export function render(anything: Optional<Renderable>, extraProps: GenericObject = {}): Optional<ReactElement> {
    if (!anything) {
        return undefined;
    }

    const element = typeof anything === "function"
        ? anything()
        : anything;

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

export function blocks(pairs: RenderBlocks): JSX.Element {
    const result = pairs.reduce((acc: Optional<ReactElement>[], pair: RenderBlock) => {
        if (pair[0]) {
            return [...acc, render(pair[1])];
        }

        return acc;
    }, [] as Optional<ReactElement>[]);

    return (<Fragment>
        {result}
    </Fragment>);
}
