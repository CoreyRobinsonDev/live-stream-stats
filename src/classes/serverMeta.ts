import type { ServerWebSocket } from "bun";
import type { StatusCode, User } from "../util/types";
import { colors } from "../util/colors";
import { Channel } from "./channel";

export default class ServerMeta {
	#atomicId = 0;
	channels = new Map<string, Channel>();

	userId() {
		return this.#atomicId++;
	}
	list() {
		for (const [channelId, channel] of this.channels.entries()) {
			console.log(`${channelId}: ${channel.users.length}`);
		}
	}
	addUser(user: ServerWebSocket<User>) {
		user.subscribe(user.data.channelId);
		if (this.channels.has(user.data.channelId)) {
			this.channels.get(user.data.channelId)!.users.push(user);
		} else {
			this.channels.set(user.data.channelId, new Channel(user));
		}
	}
	closeChannel(channelId: string, statusCode: StatusCode, message: string) {
		console.error(`${colors.red}ERROR${colors.reset} - ${colors.bold}${message}${colors.reset}`);
		const channel = this.channels.get(channelId);
		if (!channel) return;

		for (const req of channel.users) {
			req.close(statusCode, message);
		}
		this.channels.delete(channelId);
	}
	removerUser(user: ServerWebSocket<User>) {
		user.unsubscribe(user.data.channelId);
		const channel = this.channels.get(user.data.channelId);
		if (!channel) return;

		channel.removeUser(user);

		if (channel.users.length === 0) 
			this.channels.delete(user.data.channelId);
	}
	printErr(message: string) {
		console.error(`${colors.red}ERROR${colors.reset} - ${colors.bold}${message}${colors.reset}`);
	}
}
