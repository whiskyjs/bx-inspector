const args = require("./query-field-args")["query-field-args"];
const request = require("./query-request")["query-request"];
const response = require("./query-response")["query-response"];

module.exports = {
    "query-type": (typeInfo, getTypeScriptType) => {
        const addLine = (line) => line ? line + "\n" : line;

        return [
            addLine(Object.keys(typeInfo.fields).map(fieldId => {
                const block = args(typeInfo.fields[fieldId], typeInfo, getTypeScriptType);
                return block ? block : false;
            }).filter(block => block).join("\n")),

            addLine(request(typeInfo)),

            addLine(response(typeInfo, getTypeScriptType)),
        ];
    },
};
