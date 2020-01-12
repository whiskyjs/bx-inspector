const templates = require("./templates");
const {replace, indent, strip} = require("./functions");

module.exports = {
    "enum-type": (typeInfo) => {
        return replace(strip(templates["enum-type"]), {
            "EnumTypeName": typeInfo.name,
            // eslint-disable-next-line quotes
            '"EnumTypeValue",': typeInfo.values.map((value, index) => {
                return indent(4, index) + `"${value}",`
            }).join("\n"),
        })
    },
};
