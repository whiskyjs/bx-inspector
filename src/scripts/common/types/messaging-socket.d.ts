interface SocketCallbacks {
    getId: () => string;
    onMessage?: {
        [action: string]: (message: ProxyMessage, replyWith: (data?: JsonMap) => void) => void;
    };
}

interface AttachMessage {
    action: "attach";
    uuid: string;
}

interface AttachMessageResponse {
    action: "attach";
    uuid: string;
}

type ProxyMessage = AttachMessage;

type ProxyMessageResponse = AttachMessageResponse;

interface SendMessage {
    (message: ProxyMessage): ProxyMessageResponse;
}

interface SendAttachMessage extends SendMessage {
    (message: AttachMessage): AttachMessageResponse;
}
