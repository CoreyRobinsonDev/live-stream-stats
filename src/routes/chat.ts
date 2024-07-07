import { colors } from "../util/colors";
import { StatusCode, type MsgContext } from "../util/types";
import type { Page } from "puppeteer";

export const chat = {
	kick,
	twitch,
	youtube
}

async function kick(page: Page): Promise<[MsgContext[], StatusCode | undefined]> {
	if (await page.$(".chat-entry > div") === null) {
		return [[], StatusCode.NotFound]; 
	};

	try {
		let messages: MsgContext[] = await page.$$eval(".chat-entry > div", (opts) => {
			return opts.map((opt) => ({
				// badges: opt.getElementsByClassName("chat-message-identity")
				// 	.item(0)
				// 	?.getElementsByTagName("svg"),
				username: opt.getElementsByClassName("chat-entry-username").item(0)?.innerHTML ?? "",
				text: opt.getElementsByClassName("chat-entry-content").item(0)?.innerHTML,
				emote: opt.getElementsByClassName("chat-emote-container").item(0)?.getElementsByTagName("div").item(0)?.innerHTML
			}));
		});

		return [messages, undefined]; 
	} catch (e: any) {
		console.error(`${colors.red}ERROR${colors.reset} - ${colors.bold}${e.message}${colors.reset}`);
		return [[], StatusCode.ServerError]; 
	}
}

async function twitch() {}
async function youtube() {}
