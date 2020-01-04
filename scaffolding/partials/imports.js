const {replaceAll} = require("./functions");

const template = `
import {IAnyModelType, types} from "mobx-state-tree";

// Types
`;

module.exports = {
    imports: (definitions) => {
        return replaceAll(template.trimStart(), {
            "// Types": definitions.map((block) => block.trim()).join("\n\n"),
        });
    },
};
