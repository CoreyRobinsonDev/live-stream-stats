import type { MsgContext } from "../util/types";

export default class Resp {
	#info = "";
	#status = 200;
	#messages: MsgContext[] | undefined; 
	constructor(status?: number, info?: string, messages?: MsgContext[]) {
		if (status) this.#status = status;
		if (info) this.#info = info;
		if (messages) this.#messages = messages;
	}

	addMsg(username: string, text?: string, emote?: string) {
		if (!this.#messages)
			this.#messages = [];
		this.#messages.push({
			username,
			text,
			emote
		});
		return this;
	}

	setMsgs(msgs: MsgContext[]) {
		this.#messages = msgs;
		return this;
	}

	setStatus(status: number) {
		this.#status = status;
		return this;
	}

	setInfo(info: string) {
		this.#info = info;
		return this;
	}

	build() {
		return Response.json(
			{ 
				status: this.#status,
				info: this.#info,
				numberOfMessages: this.#messages?.length,
				messages: this.#messages
			},
			{ status: this.#status }
		)
	}
}
