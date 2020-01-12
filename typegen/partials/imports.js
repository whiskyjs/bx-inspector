const templates = require("./templates");
const {replace} = require("./functions");

module.exports = {
    "imports": (definitions) => {
        return replace(templates["imports"].trimStart(), {
            "// Types": definitions.map((block) => block.trim()).join("\n\n"),
        });
    },
};
