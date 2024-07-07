import type { ServerWebSocket } from "bun";
import Resp from "./classes/resp";
import { chat } from "./routes/chat";
import { colors } from "./util/colors";
import { StatusCode, type WebSocketData } from "./util/types";
import { goto } from "./util/common";

export let channels = new Map<string, number[]>();
const idRange = 1_000_000;
const PORT: number = process.env.PORT 
	? Number(process.env.PORT)
	: 8080 as const;

const server = Bun.serve<WebSocketData>({
	hostname: "0.0.0.0",
	port: PORT,
	async fetch(req, server) {
		const url = new URL(req.url);
		const [_, platform, streamer, action] = url.pathname.split("/");
		return server.upgrade(req, {
			data: {
				id: Math.floor(Math.random() * idRange),
				ip: server.requestIP(req)?.address,
				channelId: url.pathname,
				platform,
				action,
				streamer
			}
		}) ? undefined : new Resp(500, "WebSocket Upgrade Failed").build();
	},
	websocket: {
		perMessageDeflate: true,
		async open(req) {
			console.log(`${colors.yellow}${req.data.id}${colors.reset} - ${colors.bold}${req.data.channelId}${colors.reset}`);

			req.subscribe(req.data.channelId);
			if (channels.has(req.data.channelId)) {
				channels.get(req.data.channelId)!.push(req.data.id);
			} else {
				channels.set(req.data.channelId, [req.data.id]);
			}
			for (const [channel, ids] of channels.entries()) {
				console.log(`${channel}: ${ids.length}`);
			}
			switch(req.data.platform) {
			case "kick":
				switch(req.data.action) {
				case "chat":
					if (channels.get(req.data.channelId)!.length > 1) {
					}
					const site = `https://kick.com/${req.data.streamer}/chatroom`;
					const [browser, page] = await goto(site);

					while (channels.has(req.data.channelId)) {
						let [msg, err] = await chat.kick(page);
						if (err) {
							switch (err) {
							case StatusCode.NotFound:
								console.error(`${colors.yellow}${req.data.id}${colors.reset} - ${colors.red}ERROR${colors.reset} - ${colors.bold}"${req.data.streamer}" Not Found or Offline${colors.reset}`);
								req.close(StatusCode.NotFound, `Streamer ${req.data.streamer} Not Found or Offline`);
								break;
							default:
								console.error(`${colors.yellow}${req.data.id}${colors.reset} - ${colors.red}ERROR${colors.reset} - ${colors.bold}Unexpected Server Error${colors.reset}`);
								req.close(StatusCode.ServerError, "Unexpected Server Error");
							}	
							break;
						}
						server.publish(req.data.channelId, JSON.stringify(msg));
					}
					browser.close();
					break;
				default:
					console.error(`${colors.yellow}${req.data.id}${colors.reset} - ${colors.red}ERROR${colors.reset} - ${colors.bold}Invalid Action${colors.reset}`);
					req.close(StatusCode.BadRequest, "Invalid Action");
				}	
				break;
			case "twitch": break;
			case "youtube": break;
			default:
				console.error(`${colors.yellow}${req.data.id}${colors.reset} - ${colors.red}ERROR${colors.reset} - ${colors.bold}Invalid Platform${colors.reset}`);
				req.close(StatusCode.BadRequest, "Invalid Platform");
			}
		},
		message(req) {
			req.close();
		},
		close(req) {
			req.unsubscribe(req.data.channelId);
			channels.set(
				req.data.channelId,
				channels
					.get(req.data.channelId)!
					.filter((id) => id !== req.data.id)
			);
			for (const [channel, ids] of channels.entries()) {
				console.log(`${channel}: ${ids.length}`);
			}
			if (channels.get(req.data.channelId)?.length === 0) 
				channels.delete(req.data.channelId);
		}
	}
})


console.log(`Listening on ${colors.red}${colors.bold}${server.url}${colors.reset}`);
