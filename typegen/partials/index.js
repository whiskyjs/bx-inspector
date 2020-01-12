const fs = require("fs");
const {resolve} = require("path");

module.exports = fs.readdirSync(__dirname).reduce((acc, file) => {
    const partial = file.replace(/\..+$/, "");

    if (fs.lstatSync(resolve(__dirname, file)).isFile()) {
        return {...acc, [partial]: require(`./${partial}`)[partial]};
    }

    return acc;
}, {});
