function replace(str, map) {
    const result = new RegExp(Object.keys(map).join("|"), "gi");

    return str.replace(result, match => map[match]);
}


function indent(indent, index = true) {
    if (!index) {
        return "";
    }

    return " ".repeat(indent);
}

function strip(partial) {
    return partial.replace(/^import.+$/gm, "");
}

module.exports = {
    replace,
    indent,
    strip,
};
