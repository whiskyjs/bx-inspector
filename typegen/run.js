const {Generator} = require("./generator");
const config = require("../.typegen.config");

const generator = new Generator(config);
generator.generate().save();
