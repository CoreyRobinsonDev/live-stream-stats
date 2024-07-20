import type { ServerWebSocket } from "bun";
import type { Page } from "puppeteer";
import type { User } from "../util/types";

export class Channel {
	page: Page | undefined;
	lastMsgIds: string[] = [];
	users: ServerWebSocket<User>[] = [];

	constructor(user: ServerWebSocket<User>) {
		this.page = undefined;
		this.users = [user];
	}

	addPage(page: Page) {
		this.page = page;
	}
	removeUser(user: ServerWebSocket<User>) {
		this.users = this.users.filter((u) => u.data.id !== user.data.id);
	}
}
