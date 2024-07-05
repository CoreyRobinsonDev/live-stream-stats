import Resp from "./classes/resp";
import { chat } from "./routes/chat";
import { colors } from "./util/colors";

const PORT: number = process.env.PORT 
	? Number(process.env.PORT)
	: 8080 as const;
export const MAX_TIMEOUT: number = 10_000 as const;
export const LAUNCH_CONFIG = {
	args: ["--no-sandbox", "--disable-setuid-sandbox"],
	defaultViewport: { width: 1980, height: 1024 },
	slowMo: 100,
};

const server = Bun.serve({
	hostname: "0.0.0.0",
	port: PORT,
	async fetch(req, server) {
		const url = new URL(req.url);
		const ip = server.requestIP(req);
		const [_, platform, action, ...actionArgs] = url.pathname.split("/");

		console.log(`${colors.yellow}${req.method}${colors.reset} - ${colors.bold}${url.pathname}${colors.reset}\t\t:${ip?.address}`);

		switch(platform) {
		case "kick":
			switch(action) {
			case "chat":
				return await chat.kick(actionArgs[0]);
			default:
				return new Resp(400, "Invalid action").build();
			}	
		case "twitch":
		case "youtube":
		default:
			return new Resp(400, "Invalid platform").build();

		}
	}
})


console.log(`Listening on ${colors.red}${colors.bold}${server.url}${colors.reset}`);
