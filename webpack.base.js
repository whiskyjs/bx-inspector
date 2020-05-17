const {resolve} = require("path");
const webpack = require("webpack");
const fs = require("fs");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ExtraWatchWebpackPlugin = require("extra-watch-webpack-plugin");
const NunjucksWebpackPlugin = require("nunjucks-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const config = {
    context: resolve(__dirname, "src"),

    entry: {
        "devtools": [
            "./devtools.ts",
        ],
        "devpanel": [
            "./devpanel.ts",
        ],
        "background": [
            "./background.ts",
        ],
    },

    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                use: "url-loader?limit=15000",
            },
            {
                test: /\.svg$/,
                loader: "url-loader?limit=65536&mimetype=image/svg+xml&name=fonts/[name].[ext]",
            },
            {
                test: /\.woff$/,
                loader: "url-loader?limit=65536&mimetype=application/font-woff&name=fonts/[name].[ext]",
            },
            {
                test: /\.woff2$/,
                loader: "url-loader?limit=65536&mimetype=application/font-woff2&name=fonts/[name].[ext]",
            },
            {
                test: /\.[ot]tf$/,
                loader: "url-loader?limit=65536&mimetype=application/octet-stream&name=fonts/[name].[ext]",
            },
            {
                test: /\.eot$/,
                loader: "url-loader?limit=65536&mimetype=application/vnd.ms-fontobject&name=fonts/[name].[ext]",
            },
            {
                test: /\.[tj]sx?$/,
                use: [
                    {
                        loader: "babel-loader",
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    },
                    {
                        loader: "sass-loader",
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: "graphql-tag/loader",
            }
        ],
    },

    output: {
        filename: "js/[name].js",
    },

    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    enforce: true,
                    chunks: "all"
                }
            }
        }
    },

    plugins: [
        new CleanWebpackPlugin({
            root: resolve(__dirname, "."),
            verbose: true,
            dry: false,
            cleanStaleWebpackAssets: false,
        }),

        new CopyWebpackPlugin(
            [
                {
                    from: resolve("./src/assets"),
                    to: resolve("./dist/"),
                },
            ]
        ),

        new ExtraWatchWebpackPlugin({
            dirs: ["src/pages"],
        }),

        new MiniCssExtractPlugin({
            filename: "css/[name].css",
            chunkFilename: "css/[id].css",
        }),

        new NunjucksWebpackPlugin({
            templates: fs.readdirSync(resolve(__dirname, "./src/pages"))
                .reduce((acc, file) => {
                    const matches = file.match(/^([a-zA-Z0-9][a-zA-Z0-9_-]+)\.njk/);

                    if (matches) {
                        return [...acc, {
                            from: `./src/pages/${file}`,
                            to: `./${matches[1]}.html`,
                        }];
                    }

                    return acc;
                }, []),

            writeToFileEmit: true,

            configure: {},
        }),

        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
        }),

        // new BundleAnalyzerPlugin(),
    ],

    resolve: {
        modules: [
            "node_modules",
            ".",
        ],

        alias: {
            "@devtools": resolve(__dirname, "src/scripts/devtools"),
            "@devpanel": resolve(__dirname, "src/scripts/devpanel"),
            "@background": resolve(__dirname, "src/scripts/background"),
            "@common": resolve(__dirname, "src/scripts/common"),
            "@std": resolve(__dirname, "src/scripts/std"),
            "@styles": resolve(__dirname, "src/styles"),
        },

        extensions: [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".json", ".graphql"],
    },
};

module.exports = config;
