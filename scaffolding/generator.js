const {parse} = require("graphql/language");
const {resolve} = require("path");
const fs = require("fs");

const partials = require("./partials");

class Generator {
    constructor({input, output, outputTs}) {
        this.typeOrder = [
            "EnumTypeDefinition",
            "ObjectTypeDefinition",
        ];
        this.skipDefinitions = [
            "SchemaDefinition",
        ];
        this.scalarTypesMobX = {
            "String": "types.string",
            "Float": "types.number",
            "Integer": "types.integer",
            "Boolean": "types.boolean",
            "ID": "types.string",
        };
        this.scalarTypesTs = {
            "String": "string",
            "Float": "number",
            "Integer": "number",
            "Boolean": "boolean",
            "ID": "string",
        };

        this.inputPath = input;
        this.outputPath = output;
        this.outputPathTs = outputTs;

        this.blocks = [];
        this.blocksTs = [];
        this.enumTypes = {};
        this.objectTypes = {};

        this.modifiersMobX = {
            "optional": (type, defaultValue) => `types.optional(${type}, ${defaultValue})`,
            "maybe": (type) => `types.maybe(${type})`,
            "array": (type) => `types.array(${type})`,
            "late": (type) => `types.late((): IAnyModelType => ${type})`,
        };
        this.modifiersTs = {
            optional: (type) => `Optional<${type}>`,
            array: (type) => `Array<${type}>`,
            instance: (object) => `Instance<typeof ${object}>`,
        };

        const schema = parse(fs.readFileSync(this.inputPath, "utf-8"));

        this.definitions = this.reindexSchema(schema);

        this.getMobXType = this.getMobXType.bind(this);
        this.getTypescriptType = this.getTypescriptType.bind(this);
    }

    generate() {
        Object.keys(this.definitions).forEach((category) => {
            Object.keys(this.definitions[category]).forEach((typeName) => {
                return this.resolveType(typeName, this.definitions[category][typeName]);
            });
        });

        return this;
    }

    resolveType(type, definition) {
        switch (definition.kind) {
            case "EnumTypeDefinition": {
                if (!definition) {
                    definition = this.definitions[definition.kind][type];
                }

                return this.resolveEnumType(definition);
            }
            case "ObjectTypeDefinition":
            case "InputObjectTypeDefinition": {
                if (!definition) {
                    definition = this.definitions[definition.kind][type];
                }

                return this.resolveObjectType(definition);
            }
            default: {
                return false;
            }
        }
    }

    reindexSchema(schema) {
        const result = {};

        for (const definition of schema.definitions) {
            if (this.skipDefinitions.includes(definition.kind)) {
                continue;
            }

            if (typeof result[definition.kind] === "undefined") {
                result[definition.kind] = {};
            }

            result[definition.kind][definition.name.value] = definition;
        }

        return Object.keys(result).sort((a, b) => {
            return ~this.typeOrder.indexOf(a) < ~this.typeOrder.indexOf(b);
        }).reduce((acc, definitionType) => ({...acc, [definitionType]: result[definitionType]}), {});
    }

    save() {
        for (const enumTypeName of Object.keys(this.enumTypes)) {
            this.blocks.push(partials.enumType(this.enumTypes[enumTypeName]));
        }

        for (const objectTypeName of Object.keys(this.objectTypes)) {
            this.blocks.push(partials.objectType(this.objectTypes[objectTypeName], this.getMobXType));
        }

        fs.writeFileSync(resolve(__dirname + "/../", this.outputPath),
            partials.imports(this.blocks), {
                encoding: "utf-8",
                flag: "w",
            });

        fs.writeFileSync(resolve(__dirname + "/../", this.outputPathTs),
            partials.importsTs(this.blocksTs), {
                encoding: "utf-8",
                flag: "w",
            });
    }

    resolveEnumType(definition) {
        if (typeof this.enumTypes[definition.name.value] === "undefined") {
            const values = definition.values.reduce((acc, value) => [...acc, value.name.value], []);

            this.enumTypes[definition.name.value] = {
                name: definition.name.value,
                values: values,
            };
        }

        return this.enumTypes[definition.name.value];
    }

    resolveObjectType(definition, context = []) {
        if (typeof this.objectTypes[definition.name.value] === "undefined") {
            const lateTypes = [];

            const fields = definition.fields.reduce((acc, value) => {
                const typeInfo = this.getFieldTypeInfo(
                    value.type,
                    [...context, definition.name.value]
                );

                if (typeInfo.modifiers.includes("late")) {
                    lateTypes.push(typeInfo.name);
                } else if (lateTypes.includes(typeInfo.name)) {
                    typeInfo.late = true
                }

                const args = this.getFieldArguments(value.arguments);

                return {
                    ...acc, [value.name.value]: {
                        name: value.name.value,
                        arguments: args,
                        typeInfo,
                    }
                };
            }, {});

            this.objectTypes[definition.name.value] = {
                name: definition.name.value,
                fields: fields,
            };
        }

        this.buildQueryTypes(this.objectTypes[definition.name.value]);

        return this.objectTypes[definition.name.value];
    }

    getTypeInfo(type, modifiers = []) {
        if (type.kind === "NamedType") {
            return {
                name: type.name.value,
                modifiers,
            };
        } else {
            return this.getTypeInfo(type.type, [...modifiers, type.kind])
        }
    }

    getFieldTypeInfo(fieldType, context = []) {
        const typeInfo = this.getTypeInfo(fieldType);

        const isObjectType = typeof this.definitions["ObjectTypeDefinition"][typeInfo.name] !== "undefined";
        const isKnownObjectType = typeof this.objectTypes[typeInfo.name] !== "undefined";

        if (isObjectType && !isKnownObjectType) {
            const definition = this.definitions["ObjectTypeDefinition"][typeInfo.name]
                || this.definitions["InputObjectTypeDefinition"][typeInfo.name];

            if (!definition) {
                throw new Error(`Определение объектного типа ${typeInfo.name} не найдено в схеме.`);
            }

            if (context.length < 2) {
                const lookaheadTypeInfo = this.resolveObjectType(definition, context);

                Object.keys(lookaheadTypeInfo.fields).forEach((fieldName) => {
                    const field = lookaheadTypeInfo.fields[fieldName];

                    if ((field.typeInfo.name === context[0]) && field.typeInfo.late) {
                        typeInfo.late = true;
                    }
                });
            } else {
                typeInfo.late = true;
            }
        }

        return typeInfo;
    }

    getFieldArguments(args) {
        if (Array.isArray(args) && args.length) {
            return args.map((argument) => {
                return {
                    name: argument.name.value,
                    typeInfo: this.getTypeInfo(argument.type),
                };
            });
        }

        return [];
    }

    getMobXType(typeInfo) {
        let typeName = typeof this.scalarTypesMobX[typeInfo.name] !== "undefined"
            ? this.scalarTypesMobX[typeInfo.name]
            : typeInfo.name;

        [...typeInfo.modifiers, "NamedType"].reverse().forEach((modifier) => {
            let isNullable = true;

            switch (modifier) {
                case "ListType":
                    typeName = this.modifiersMobX.array(typeName);
                    break;
                case "NonNullType":
                    isNullable = false;
                    break;
                case "NamedType":
                    if (typeInfo.late) {
                        typeName = this.modifiersMobX.late(typeName);
                    }
                    break;
            }

            if (isNullable) {
                typeName = this.modifiersMobX.maybe(typeName);
            }
        });

        return typeName;
    }

    getTypescriptType(typeInfo, namespace) {
        let modifiers = [...typeInfo.modifiers, "NamedType"];
        let typeName;

        if (typeof this.scalarTypesTs[typeInfo.name] !== "undefined") {
            typeName = this.scalarTypesTs[typeInfo.name];
        } else {
            typeName = typeInfo.name;

            if (namespace) {
                typeName = `${namespace}.${typeName}`;
            }

            modifiers.push("InstanceType");
        }

        modifiers.reverse().forEach((modifier) => {
            let isNullable = true;

            switch (modifier) {
                case "ListType":
                    typeName = this.modifiersTs.array(typeName);
                    break;
                case "NonNullType":
                    isNullable = false;
                    break;
                case "InstanceType":
                    typeName = this.modifiersTs.instance(typeName);
                    isNullable = false;
                    break;
            }

            if (isNullable) {
                typeName = this.modifiersTs.optional(typeName);
            }
        });

        return typeName;
    }

    buildQueryTypes(typeInfo) {
        this.blocksTs.push(...partials.queryType(
            typeInfo,
            this.getTypescriptType,
        ));
    }
}

module.exports = {
    Generator,
};
