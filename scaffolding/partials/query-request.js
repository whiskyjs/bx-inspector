const {stripImports, replaceAll, indent} = require("./functions");

const template = `
import {Instance} from "mobx-state-tree";
import * as MobX from "@common/types/mobx-graphql";

export interface TypeNameRequest {
    // Fields
}
`;

module.exports = {
    queryRequest: (typeInfo) => {
        const fieldDefinitions = Object.keys(typeInfo.fields).map((fieldId, index) => {
            const field = typeInfo.fields[fieldId];
            const PascalFieldName = field.name.charAt(0).toUpperCase() + field.name.slice(1);

            if (!field.arguments.length) {
                return false;
            }

            return indent(4, index) + `${field.name}: ${`${typeInfo.name}${PascalFieldName}Params`};`;
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

