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
			return opts.map((opt) => {
				const chatHTML = opt.getElementsByTagName("span");	
				let user = {
					name: "",
					color: "",
				};
				let reply: string | undefined = undefined;
				let badges: string[] | undefined = undefined;
				let emotes: string[] | undefined = undefined;
				const text = opt.getElementsByClassName("chat-entry-content").item(0)?.innerHTML;
				const emotesHTML = opt.getElementsByClassName("chat-emote-container");

				user.name = chatHTML.item(0)?.getElementsByClassName("chat-entry-username").item(0)?.getAttribute("data-chat-entry-user") ?? "";
				user.color = chatHTML.item(0)?.getElementsByClassName("chat-entry-username").item(0)?.getAttribute("style") ?? "";
				const badgesHTML = chatHTML.item(0)?.getElementsByClassName("base-badge")

				if (opt?.getElementsByClassName("chat-message-identity").item(0)?.getElementsByTagName("img").item(0)) {
					badges = [opt!.getElementsByClassName("chat-message-identity").item(0)!.getElementsByTagName("img").item(0)!.getAttribute("src")?.replace("https://", "") ?? ""];
				}

				if (badgesHTML)
				for (let i = 0; i < badgesHTML.length; i++) {
					if (!badges) {
						badges = [
							badgesHTML.item(i)?.getElementsByTagName("div").item(0)?.innerHTML
							.replaceAll("\"", "'")
							.replaceAll("\n", "")
							.replaceAll("\t", "")?? ""]; 
					} else {
						badges.push(
							badgesHTML.item(i)?.getElementsByTagName("div").item(0)?.innerHTML
							.replaceAll("\"", "'")
							.replaceAll("\n", "")
							.replaceAll("\t", "")?? ""); 
					}
				}

				if (emotesHTML)
				for (let i = 0; i < emotesHTML.length; i++) {
					if (!emotes) { 
						emotes = [emotesHTML.item(i)?.getElementsByTagName("img").item(0)?.getAttribute("src")?.replace("https://", "") ?? ""];
					} else {
						emotes.push(emotesHTML.item(i)?.getElementsByTagName("img").item(0)?.getAttribute("src")?.replace("https://", "") ?? "");
					}
				}

				const id = (user.name.substring(0,3) + user.name[user.name.length - 1]) + (text ? text[0] + text[text.length - 1] + text[text.length / 2]: emotes ? emotes[0].substring(30,35) : "?");

				let color = user.color.substring(11, user.color.length - 2);

				return {
					id,
					reply,
					username: user.name.replace("-", "_"), 
					userColor: color.split(", "),
					userBadges: badges,
					text,
					emotes
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
