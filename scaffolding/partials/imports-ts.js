const {replaceAll} = require("./functions");

const template = `
import {Instance} from "mobx-state-tree";

import * as MobX from "@common/types/graphql-models";

// Types
`;

module.exports = {
    importsTs: (definitions) => {
        return replaceAll(template.trimStart(), {
            "// Types": definitions
                .join("")
                // .split(/\n/)
                // .map((line, index) => indent(4, index) + line)
                // .join("\n")
                .trim(),
        });
    },
};
