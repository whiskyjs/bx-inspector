const {stripImports, replaceAll, indent} = require("./functions");

const template = `
import {Instance} from "mobx-state-tree";
import * as MobX from "@common/types/mobx-graphql";

export interface TypeNameFieldNameParams {
    // Arguments 
}
`;

module.exports = {
    queryFieldArgs: (field, typeInfo, getTypeScriptType) => {
        if (!field.arguments.length) {
            return "";
        }

        return replaceAll(stripImports(template).trimStart(), {
            "FieldName": field.name.charAt(0).toUpperCase() + field.name.slice(1),
            "TypeName": typeInfo.name,
            "// Arguments": field.arguments.reduce((acc, argument, index) => {
                return [...acc,
                    indent(4, index) + `${argument.name}: ${getTypeScriptType(argument.typeInfo, "MobX")};`,
                ];
            }, []).join("\n")
        });
    },
};
