const {stripImports, replaceAll, indent} = require("./functions");

const template = `
import {Instance} from "mobx-state-tree";
import * as MobX from "@common/types/mobx-graphql";

export interface TypeNameResponse {
    // Fields
}
`;

module.exports = {
    queryResponse: (typeInfo, getTypeScriptType) => {
        const fieldDefinitions = Object.keys(typeInfo.fields).map((fieldId, index) => {
            const field = typeInfo.fields[fieldId];

            if (!field.arguments.length) {
                return false;
            }

            return indent(4, index) + `${field.name}: ${getTypeScriptType(field.typeInfo, "MobX")};`;
        }).filter(block => block).join("\n");

        if (!fieldDefinitions) {
            return "";
        }

        return replaceAll(stripImports(template).trimStart(), {
            "TypeName": typeInfo.name,
            "// Fields": fieldDefinitions,
        });
    },
};

