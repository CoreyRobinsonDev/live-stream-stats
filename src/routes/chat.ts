import puppeteer from "puppeteer";

import Resp from "../classes/resp";
import { colors } from "../util/colors";
import { MAX_TIMEOUT } from "../main";
import type { MsgContext } from "../util/types";

export const chat = {
	kick,
	twitch,
	youtube
}

async function kick(streamer: string) {
	const res = new Resp();

	const browser = await puppeteer.launch({
		slowMo: 160,
	});

	const page = await browser.newPage();
	await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36");
	page.setDefaultTimeout(MAX_TIMEOUT);

	try {
		const site = `https://kick.com/${streamer}/chatroom`;

		await page.goto(site, {
			waitUntil: "networkidle2"
		});
		await page.setViewport({width: 1080, height: 1024});


		let messages: MsgContext[] = [];
		while (messages.length < 30) {
			messages = await page.$$eval(".chat-entry > div", (opts) => {
				return opts.map((opt) => ({
					username: opt.getElementsByClassName("chat-entry-username").item(0)?.innerHTML ?? "",
					text: opt.getElementsByClassName("chat-entry-content").item(0)?.innerHTML,
					emote: opt.getElementsByClassName("chat-emote-container").item(0)?.getElementsByTagName("div").item(0)?.innerHTML
				}));
			});
		}

		res.setMsgs(messages);
	} catch (e: any) {
		console.error(`${colors.red}ERROR${colors.reset} - ${colors.bold}${e.message}${colors.reset}`);
		await browser.close();
		return res
			.setStatus(500)
			.setInfo(e.message)
			.build();
	}
	await browser.close();
	return res.build();
}

async function twitch() {}
async function youtube() {}
