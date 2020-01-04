const {replaceAll, indent, stripImports} = require("./functions");

const template = `
import {types} from "mobx-state-tree";

export const ObjectTypeName = types
    .model("ObjectTypeName", {
        "ObjectTypeFieldName": "ObjectTypeFieldType",
    });
`;

module.exports = {
    objectType: (typeInfo, composeFieldMobXType) => {
        return replaceAll(stripImports(template), {
            "ObjectTypeName": typeInfo.name,
            // eslint-disable-next-line quotes
            '"ObjectTypeFieldName": "ObjectTypeFieldType",': Object.keys(typeInfo.fields).map((fieldId, index) => {
                const field = typeInfo.fields[fieldId];

                // eslint-disable-next-line max-len
                let fieldDefinition = "";

                if (field.typeInfo.late) {
                    fieldDefinition += indent(8, index++)
                        + "// eslint-disable-next-line @typescript-eslint/no-use-before-define\n";
                }

                fieldDefinition += indent(8, index)
                    + `"${field.name}": ${composeFieldMobXType(field.typeInfo)},`;

                return fieldDefinition;
            }).join("\n"),
        })
    },
};
