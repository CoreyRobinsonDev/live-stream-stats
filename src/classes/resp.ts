import { colors } from "../util/colors";
import type { Message } from "../util/types";

export default class Resp {
	#info = "";
	#status = 200;
	#messages: Message[] | undefined; 
	constructor(status?: number, info?: string, messages?: Message[]) {
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

	setMsgs(msgs: Message[]) {
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
		if (this.#status === 200) {
			console.log(`${colors.green}SUCCESS${colors.reset} - ${colors.bold}${this.#info}${colors.reset}`);
		} else {
			console.log(`${colors.red}ERROR${colors.reset} - ${colors.bold}${this.#info}${colors.reset}`);
		}
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
