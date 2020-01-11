const {queryFieldArgs} = require("./query-field-args");
const {queryRequest} = require("./query-request");
const {queryResponse} = require("./query-response");

module.exports = {
    queryType: (typeInfo, getTypeScriptType) => {
        const addLine = (line) => line ? line + "\n" : line;

        return [
            addLine(Object.keys(typeInfo.fields).map(fieldId => {
                const block = queryFieldArgs(typeInfo.fields[fieldId], typeInfo, getTypeScriptType);
                return block ? block : false;
            }).filter(block => block).join("\n")),

            addLine(queryRequest(typeInfo)),

            addLine(queryResponse(typeInfo, getTypeScriptType)),
        ];
    },
};
