export const defaultSettings = {
    phpConsole: {
        prologue: {
            contents: "<?php\n\n",
            viewState: "",
        },
        epilogue: {
            contents: "<?php\n\n",
            viewState: "",
        },
    },
    common: {
        networking: {
            graphqlPath: "/bitrix/tools/wjs_api_graphql.php",
            websocketUrl: "http://segfault.pro:34567/subscriber/",
        }
    }
};
