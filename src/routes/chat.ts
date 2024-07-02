import puppeteer from "puppeteer";

import Resp from "../classes/resp";
import { colors } from "../util/colors";
import { delay } from "../util/common";
import { TIMEOUT } from "../main";

export const chat = {
	kick,
	twitch,
	youtube
}

async function kick(streamer: string) {
	const res = new Resp();

	const browser = await puppeteer.launch({
		headless: false, 
		slowMo: 160,
	});


	const page = await browser.newPage();
	page.setDefaultTimeout(TIMEOUT);

	try {
		const site = `https://kick.com/${streamer}/chatroom`;

		await page.goto(site);
		await page.setViewport({width: 1080, height: 1024});

		await page.waitForSelector(".chat-entry > div");
		await delay(8000);
		const messages = await page.$$eval(".chat-entry > div", (opts) => {
			return opts.map((opt) => ({
				username: opt.getElementsByClassName("chat-entry-username").item(0)?.innerHTML ?? "",
				text: opt.getElementsByClassName("chat-entry-content").item(0)?.innerHTML,
				emote: opt.getElementsByClassName("chat-emote-container").item(0)?.getElementsByTagName("div").item(0)?.innerHTML
			}));
		});

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

async function twitch(url: URL) {}
async function youtube(url: URL) {}
