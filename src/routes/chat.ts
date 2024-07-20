import type { Channel } from "../classes/channel";
import { colors } from "../util/colors";
import { StatusCode, type Message } from "../util/types";

export const chat = {
	kick,
	twitch,
	youtube
}

async function kick(channel: Channel): Promise<[Message[], StatusCode | undefined]> {
	if (channel.page === undefined) {
		console.error(`${colors.red}ERROR${colors.reset} - ${colors.bold}channel.page is undefined${colors.reset}`);
		return [[], StatusCode.ServerError];
	}
	if (await channel.page.$(".chat-entry > div") === null) {
		return [[], StatusCode.NotFound]; 
	};

	try {
		let messagesFromSite: Message[] = await channel.page.$$eval(".chat-entry > div", (opts) => {
			return opts.filter((opt) => opt.getElementsByClassName("chat-entry-username").item(0)?.innerHTML).map((opt) => {
				// const username = opt.getElementsByClassName("chat-entry-username").item(0)!.innerHTML;
				// const text = opt.getElementsByClassName("chat-entry-content").item(0)?.innerHTML;
				const username = opt.getElementsByTagName("span").item(0)!.innerHTML;
				const text = opt.getElementsByTagName("span").item(2)?.innerHTML;
				const emote = opt.getElementsByTagName("span").item(3)?.innerHTML;

				const id = username.substring(0,5) + (text ? text[0] + text[text.length - 1] : 
					emote ? emote.substring(12,14) : "");

				return {
				// badges: opt.getElementsByClassName("chat-message-identity")
				// 	.item(0)
				// 	?.getElementsByTagName("svg"),
				id,
				username,
				text, 
				emote, 
			}
			});
		});

		let messages: Message[] = [];
		for (const msg of messagesFromSite) {
			if (channel.lastMsgIds.find((id) => id === msg.id)) continue;
			messages.push(msg);
		}

		channel.lastMsgIds = messagesFromSite.map((msg) => msg.id);

		return [messages, undefined]; 
	} catch (e: any) {
		console.error(`${colors.red}ERROR${colors.reset} - ${colors.bold}${e.message}${colors.reset}`);
		return [[], StatusCode.ServerError]; 
	}
}

async function twitch() {}
async function youtube() {}
