import ApolloClient, {DocumentNode, InMemoryCache} from "apollo-boost";
import {Instance} from "mobx-state-tree";

import {InspectEvaluate, InspectEvaluateOutbound} from "@common/types/queries/inspect/evaluate";
import {InspectEvaluateParams} from "@common/types/graphql-types";

import {InspectEventsSubscribe, InspectEventsSubscribeOutbound} from "@common/types/mutations/inspect/events/subscribe";
import {MutationInspectEventsSubscribeParams} from "@common/types/graphql-types";

// eslint-disable-next-line max-len
import {InspectEventsUnsubscribe, InspectEventsUnsubscribeOutbound} from "@common/types/mutations/inspect/events/unsubscribe";
import {MutationInspectEventsUnsubscribeParams} from "@common/types/graphql-types";

import {PHPHelper} from "@common/graphql/helpers/php";
import * as MobX from "@common/types/graphql-models";

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
                uri: `${pageInfo?.protocol}//${pageInfo?.hostname}${settingsStore.common.networking.graphqlPath}`,
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

    public async inspectEvaluate(source: string): Promise<InspectEvaluateOutbound["inspect"]["evaluate"]> {
        const result = await this.query<InspectEvaluateOutbound, InspectEvaluateParams>(InspectEvaluate, {
            language: "PHP",
            source: PHPHelper.stripWhitespacePhpTags(source),
        });

        return result?.inspect?.evaluate;
    }

    // eslint-disable-next-line max-len
    public async inspectEventsSubscribe(clientId: string, events: Instance<typeof MobX.ModuleEventSetInput>): Promise<InspectEventsSubscribeOutbound["inspectEventsSubscribe"]> {
        // eslint-disable-next-line max-len
        const result = await this.mutate<InspectEventsSubscribeOutbound, MutationInspectEventsSubscribeParams>(InspectEventsSubscribe, {
            clientId: clientId,
            // TODO: Подумать, можно ли изящнее
            events,
        });

        return result.inspectEventsSubscribe;
    }

    // eslint-disable-next-line max-len
    public async inspectEventsUnsubscribe(clientId: string): Promise<InspectEventsUnsubscribeOutbound["inspectEventsUnsubscribe"]> {
        // eslint-disable-next-line max-len
        const result = await this.mutate<InspectEventsUnsubscribeOutbound, MutationInspectEventsUnsubscribeParams>(InspectEventsUnsubscribe, {
            clientId: clientId,
        });

        return result.inspectEventsUnsubscribe;
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

    protected async mutate<R, V extends GenericObject>(mutation: DocumentNode, variables: V): Promise<R>
    {
        this.setRequestActive();

        const result = await this.client.mutate<R, V>({
            mutation,
            variables,
        });

        return result.data as R;
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
