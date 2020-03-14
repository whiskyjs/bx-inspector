type SocketAction = "attach" | "remote:event";

interface SocketMessageHandler {
    (message: ProxyMessage, replyWith: (data?: JsonMap) => void): void;
}

interface SocketCallbacks {
    getId: () => string;
    onMessage?: {
        [K in SocketAction]?: SocketMessageHandler[];
    };
}

interface SocketMessage {
    action: SocketAction;
}

interface AttachMessage extends SocketMessage {
    action: "attach";
    uuid: string;
}

interface AttachMessageResponse extends SocketMessage {
    action: "attach";
    uuid: string;
}

interface RemoteEventMessage extends SocketMessage {
    action: "remote:event";
    module: string;
    event: string;
    args: Record<any, any>;
    time: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RemoteEventMessageResponse extends SocketMessage {
    action: "remote:event";
}

type ProxyMessage = AttachMessage | RemoteEventMessage;

type ProxyMessageResponse = AttachMessageResponse | RemoteEventMessageResponse;
