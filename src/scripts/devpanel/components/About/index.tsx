import "./style.scss";
import metaInfo from "package.json";

import React, {ReactElement, PureComponent} from "react";

export class About extends PureComponent {
    public render(): ReactElement {
        return (
            <div className="about">
                {metaInfo.name} / {metaInfo.version}
            </div>
        );
    }
}
