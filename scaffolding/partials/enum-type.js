const {replaceAll, indent, stripImports} = require("./functions");

const template = `
import {types} from "mobx-state-tree";

export const EnumTypeName = types.enumeration("EnumTypeName", [
    "EnumTypeValue",
]);
`;

module.exports = {
    enumType: (typeInfo) => {
        return replaceAll(stripImports(template), {
            "EnumTypeName": typeInfo.name,
            // eslint-disable-next-line quotes
            '"EnumTypeValue",': typeInfo.values.map((value, index) => {
                return indent(4, index) + `"${value}",`
            }).join("\n"),
        })
    },
};
