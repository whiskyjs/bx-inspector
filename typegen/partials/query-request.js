const templates = require("./templates");
const {strip, replace, indent} = require("./functions");

module.exports = {
    "query-request": (typeInfo) => {
        let counter = 0;

        const fieldDefinitions = Object.keys(typeInfo.fields).map((fieldId) => {
            const field = typeInfo.fields[fieldId];
            const PascalFieldName = field.name.charAt(0).toUpperCase() +
                field.name.slice(1).replace(/_([a-z])/g, (matches) => {
                    return matches[1].toUpperCase();
                });

            if (!field.arguments.length) {
                return false;
            }

            return indent(4, counter++) + `${field.name}: ${`${typeInfo.name}${PascalFieldName}Params`};`;
        }).filter(block => block).join("\n");

        if (!fieldDefinitions) {
            return "";
        }

        return replace(strip(templates["query-request"]).trimStart(), {
            "TypeName": typeInfo.name,
            "// Fields": fieldDefinitions,
        });
    },
};

