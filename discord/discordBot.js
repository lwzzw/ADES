const config = require("../config");
const { Client, Intents } = require("discord.js");
const API = require("./bot_api");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const PREFIX = "/";
const LOG_CHANNEL_ID = "928283533087240192";

client.login(config.DISCORD_BOT_TOKEN).catch((err) => {
  console.log(err);
});

client.on("message", async (message) => {
  try {
    console.log(message.content);
    const MESSAGE = message.content.trim();
    if (message.author.bot || !MESSAGE.startsWith(PREFIX)) return;
    if (message.channel.type === "dm" || true) {
      const [CMD_NAME, ...args] = MESSAGE.substring(PREFIX.length).split(/\s+/);
      console.log(CMD_NAME);
      switch (CMD_NAME.toUpperCase()) {
        case "PRICE":
          const result = await API.getPrice(args.join(" "));
          if (result.err) {
            message.reply("Sorry, this feature is temporarily unavailable");
            console.log(result.err);
            client.channels.get(LOG_CHANNEL_ID).send(result.err);
          } else {
            if (result.data.length < 1) {
              message.reply(
                `Sorry, I can't find any game call ${args.join(" ")}`
              );
            } else {
              result.data.forEach((item) => {
                message.reply(`${item.g_name} - $${item.g_price}`);
              });
            }
          }
          break;

        default:
          break;
      }
    }
  } catch (err) {
    console.log(err);
    message.reply("Sorry, this feature is temporarily unavailable");
    client.channels.cache
      .get(LOG_CHANNEL_ID)
      .send(err.message + " " + message.content);
  }
});

client.on("ready", () => {
  console.log("The bot is login");
});
