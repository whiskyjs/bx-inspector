const {Generator} = require("./generator");
const config = require("../scaffolding.config");

const generator = new Generator(config);
generator.generate().save();
