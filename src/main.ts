import puppeteer from "puppeteer";

import Resp from "./resp";
import { colors } from "./colors";

const PORT: number = process.env.PORT 
	? Number(process.env.PORT)
	: 8080 as const;
const TIMEOUT: number = 10_000 as const;

const server = Bun.serve({
	hostname: "localhost",
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		const res = new Resp();
		const platform = url.pathname
			.substring(1, url.pathname.indexOf("/", 2));
		const streamer = url.pathname
			.substring(url.pathname.indexOf("/", 2)+1);

		console.log(`${colors.blue}${req.method}${colors.reset} - ${colors.bold}${url.pathname}${colors.reset}`);
		switch(platform) {
		case "kick":
			const browser = await puppeteer.launch({
				headless: false, 
				slowMo: 160,
			});
			let messages: string[];


			const page = await browser.newPage();
			page.setDefaultTimeout(TIMEOUT);

			try {
				const site = `https://kick.com/${streamer}/chatroom`;

				await page.goto(site);
				await page.setViewport({width: 1080, height: 1024});

				await page.waitForSelector(".chat-entry");
				messages = await page.$$eval(".chat-entry", (opts) => {
					return opts.map((opt) => opt.innerHTML);
				});

				for (const msg of messages) {
					console.log(msg);
				}

			} catch (e: any) {
				console.error(`${colors.red}ERROR${colors.reset} - ${colors.bold}${e.message}${colors.reset}`);
				await browser.close();
				return res
					.setStatus(500)
					.setMessage(e.message)
					.build();
			}
			await browser.close();
			return res.build();
		default:
			return res
				.setStatus(404)
				.setMessage(`${platform} is not a valid streaming platform`)
				.build();
		}
	}
})

console.log(`Listening on ${colors.red}${colors.bold}${server.url}${colors.reset}`);
