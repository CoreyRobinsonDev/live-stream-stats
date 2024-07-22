export type Message = {
    id: string,
    username: string,
    userColor: string[],
    userBadges?: string[],
    text?: string,
    emotes?: string[],
    reply?: string,
}

export type User = {
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
