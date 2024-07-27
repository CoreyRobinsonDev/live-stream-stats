import { executablePath } from "puppeteer";
import puppeteer from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page, type PuppeteerLaunchOptions } from "puppeteer";

import ServerMeta from "../classes/serverMeta";

////////////
export const DEBUG: boolean = false;
////////////

export const serverMeta: ServerMeta = new ServerMeta();
export const PORT: number = process.env.PORT 
	? Number(process.env.PORT)
	: 8080 as const;
const MAX_TIMEOUT: number = 10_000 as const;
//const USER_AGENT: string = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" as const;

export let LAUNCH_CONFIG: PuppeteerLaunchOptions;
if (DEBUG) {
    LAUNCH_CONFIG = {
	args: ["--no-sandbox", "--disable-setuid-sandbox"],
	defaultViewport: { width: 1980, height: 1024 },
	slowMo: 50,
	headless: false,
	executablePath: executablePath()
    };
} else {
    LAUNCH_CONFIG = {
	args: ["--no-sandbox", "--disable-setuid-sandbox"],
	defaultViewport: { width: 1980, height: 1024 },
	slowMo: 50,
	executablePath: executablePath()
    };
}

puppeteer.use(stealthPlugin());
export const BROWSER: Browser = await puppeteer.launch(LAUNCH_CONFIG);


export function delay(timeInMs: number) {
    return new Promise((resolve) => {
	    setTimeout(resolve, timeInMs)
    })
}

export function getChildrenOfCollection(collection: HTMLCollectionOf<Element> | undefined): Element[] {
    if (collection === undefined) return [];
    let elements: Element[] = [];

    for (let i = 0; collection.item(i) !== null && collection.item(i) !== undefined; i++) {
	elements.push(collection.item(i)!);
    }
    return elements;
}

export async function goto(browser: Browser, site: string): Promise<[Page]> {
    const page = await browser.newPage();
    //await page.setUserAgent(USER_AGENT);
    page.setDefaultTimeout(MAX_TIMEOUT);
    await page.goto(site, {
	    waitUntil: "networkidle2"
    });

    return [page];
}
