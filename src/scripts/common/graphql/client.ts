import ApolloClient, {DocumentNode, InMemoryCache} from "apollo-boost";

import {QueryEvaluate, QueryEvaluateOutbound} from "@common/types/graphql-queries";
import {QueryEvaluateParams, QueryResponse} from "@common/types/graphql-types";

import {PHPHelper} from "@common/graphql/helpers/php";

export interface ClientOptions {
    endpointUri?: string;
    app?: PanelApp;
}

export class Client {
    protected client: ApolloClient<InMemoryCache>;

    protected app?: PanelApp;

    public static createClient(options: ClientOptions): Client {
        const {endpointUri, app} = options;

        let client: ApolloClient<InMemoryCache>;

        if (endpointUri) {
            client = new ApolloClient({
                uri: endpointUri,
            });
        } else if (!endpointUri && app) {
            const pageInfo = app.getPageInfo();
            const settingsStore = app.getStores().settings;

            client = new ApolloClient({
                uri: `${pageInfo?.protocol}//${pageInfo?.hostname}${settingsStore.common.networking.endpoint}`,
            });
        } else {
            throw new Error("Невозможно создать клиент: не определен URI сервера.");
        }

        return new Client(client, app);
    }

    protected constructor(apolloClient: ApolloClient<InMemoryCache>, app?: PanelApp) {
        this.client = apolloClient;
        this.app = app;
    }

    public async evaluatePhp(source: string): Promise<{}> {
        const result = await this.query<QueryEvaluateOutbound, QueryEvaluateParams>(QueryEvaluate, {
            language: "PHP",
            source: PHPHelper.stripWhitespacePhpTags(source),
        });

        return result.evaluate!;
    }

    public cancelRequestsActive(): void {
        if (this.app) {
            const flagStore = this.app.getStores().flags;

            flagStore.requests.setActive(false);
        }
    }

    protected async query<R, V extends GenericObject>(query: DocumentNode, variables: V): Promise<R>
    {
        this.setRequestActive();

        const result = await this.client.query<R, V>({
            query,
            variables,
        });

        return result.data;
    }

    protected setRequestActive(): void {
        if (this.app) {
            const flagStore = this.app.getStores().flags;

            if (!flagStore.requests.active) {
                flagStore.requests.setActive();
            } else {
                throw new Error("Невозможно выполнить запрос, пока активно другое сетевое действие.");
            }
        }
    }
}
