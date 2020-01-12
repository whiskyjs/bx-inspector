const fs = require("fs");
const {resolve} = require("path");

module.exports = fs.readdirSync(__dirname).reduce((acc, file) => {
    if (fs.lstatSync(resolve(__dirname, file)).isFile()) {
        return {...acc, [file.replace(/\..+$/, "")]: fs.readFileSync(resolve(__dirname, `./${file}`), "utf-8")};
    }

    return acc;
}, {});

