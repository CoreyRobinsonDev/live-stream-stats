import Resp from "./classes/resp";
import { chat } from "./routes/chat";
import { colors } from "./util/colors";
import { StatusCode, type User } from "./util/types";
import { goto } from "./util/common";
import ServerMeta from "./classes/serverMeta";
import { DEBUG } from "..";

const PORT: number = process.env.PORT 
	? Number(process.env.PORT)
	: 8080 as const;

const serverMeta = new ServerMeta();

const server = Bun.serve<User>({
	hostname: "0.0.0.0",
	port: PORT,
	async fetch(req, server) {
		const url = new URL(req.url);
		const [_, platform, streamer, action] = url.pathname.split("/");
		return server.upgrade(req, {
			data: {
				id:  serverMeta.userId(),
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

			serverMeta.addUser(req);
			serverMeta.list();
			if (serverMeta.channels.get(req.data.channelId)!.users.length > 1) return

			switch(req.data.platform) {
			case "kick":
				switch(req.data.action) {
				case "chat":
					const site = `https://kick.com/${req.data.streamer}/chatroom`;
					const [browser, page] = await goto(site);
					serverMeta.channels.get(req.data.channelId)?.addPage(page);

					while (serverMeta.channels.has(req.data.channelId)) {
						let [msg, err] = await chat.kick(serverMeta.channels.get(req.data.channelId)!);
						if (err) {
							switch (err) {
							case StatusCode.NotFound:
								let message = `Streamer ${req.data.streamer} Not Found or Offline`;
								serverMeta.closeChannel(
									req.data.channelId, 
									StatusCode.NotFound,
									message
								);
								break;
							default:
								serverMeta.closeChannel(
									req.data.channelId, 
									StatusCode.ServerError,
									"Unexpected Server Error"
								);
							}	
							break;
						}
						if (DEBUG) {
							console.log(server.publish(req.data.channelId, JSON.stringify(msg)));
						} else {
							server.publish(
								req.data.channelId, 
								JSON.stringify(msg)
							);
						}
					}
					browser.close();
					break;
				default:
					serverMeta.printErr("Invalid Action");
					req.close(StatusCode.BadRequest, "Invalid Action");
				}	
				break;
			case "twitch": break;
			case "youtube": break;
			default:
				serverMeta.printErr("Invalid Platform");
				req.close(StatusCode.BadRequest, "Invalid Platform");
			}
		},
		message(req) {
			req.close();
		},
		close(req) {
			serverMeta.removerUser(req);
			serverMeta.list();
		}
	}
})


console.log(`Listening on ${colors.red}${colors.bold}${server.url}${colors.reset}`);
