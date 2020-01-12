const templates = require("./templates");
const {replace} = require("./functions");

module.exports = {
    "imports-ts": (definitions) => {
        return replace(templates["imports-ts"].trimStart(), {
            "// Types": definitions
                .join("")
                // .split(/\n/)
                // .map((line, index) => indent(4, index) + line)
                // .join("\n")
                .trim(),
        });
    },
};
