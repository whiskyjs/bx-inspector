const templates = require("./templates");
const {strip, replace, indent} = require("./functions");

module.exports = {
    "query-response": (typeInfo, getTypeScriptType) => {
        let counter = 0;

        const fieldDefinitions = Object.keys(typeInfo.fields).map((fieldId,) => {
            const field = typeInfo.fields[fieldId];

            if (!field.arguments.length) {
                return false;
            }

            return indent(4, counter++) + `${field.name}: ${getTypeScriptType(field.typeInfo, "MobX")};`;
        }).filter(block => block).join("\n");

        if (!fieldDefinitions) {
            return "";
        }

        return replace(strip(templates["query-response"]).trimStart(), {
            "TypeName": typeInfo.name,
            "// Fields": fieldDefinitions,
        });
    },
};
