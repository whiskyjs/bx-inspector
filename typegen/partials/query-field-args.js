const templates = require("./templates");
const {strip, replace, indent} = require("./functions");

module.exports = {
    "query-field-args": (field, typeInfo, getTypeScriptType) => {
        if (!field.arguments.length) {
            return "";
        }

        return replace(strip(templates["query-field-args"]).trimStart(), {
            "FieldName": field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/_([a-z])/g, (matches) => {
                return matches[1].toUpperCase();
            }),
            "TypeName": typeInfo.name,
            "// Arguments": field.arguments.reduce((acc, argument, index) => {
                return [...acc,
                    indent(4, index) + `${argument.name}: ${getTypeScriptType(argument.typeInfo, "MobX")};`,
                ];
            }, []).join("\n")
        });
    },
};
