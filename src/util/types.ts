export type MsgContext = {
    badges?: string[],
    username: string,
    text?: string,
    emote?: string
}

export type WebSocketData = {
    id: number,
    ip: string,
    channelId: string,
    platform: string,
    action: string,
    streamer: string
}

export enum StatusCode {
    Success = 1000,
    ServerError = 1011,
    BadRequest = 4000,
    NotFound = 4001,
}

