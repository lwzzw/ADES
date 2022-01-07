const config = require("../config");
const { Client, Intents } = require("discord.js");
const DiscorJS = require("discord.js");
const API = require("./bot_api");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const PREFIX = "/";
const LOG_CHANNEL_ID = "928283533087240192";

client.login(config.DISCORD_BOT_TOKEN).catch((err) => {
  console.log(err);
});

function format_log(err, user, command, options, createdAt) {
  return `error: ${err}\nuser: ${user}\ncreated at: ${createdAt}\ncommand: ${command}\noptions: [${options.map(
    (options) => {
      return `\nname: ${options.name} value: ${options.value}`;
    }
  )}\n]`;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  await interaction.deferReply();

  switch (commandName) {
    case "price":
      const result = await API.getPrice(options.getString("game_name"));
      if (result.err) {
        interaction.editReply({
          content: "Sorry, this feature is temporarily unavailable",
          ephemeral: true,
        });
        let err = format_log(
          err,
          interaction.user.tag,
          commandName,
          [{ name: "game_name", value: options.getString("game_name") }],
          interaction.createdAt
        );
        console.log(err);
        client.channels.get(LOG_CHANNEL_ID).send(err);
      } else {
        if (result.data.length < 1) {
          interaction.editReply({
            content: `Sorry, I can't find any game call ${options.getString(
              "game_name"
            )}`,
            ephemeral: true,
          });
        } else {
          let content = result.data.map((games) => {
            return `\n${games.g_name} - $${games.g_price}`;
          });
          interaction.editReply({
            content: `I found these${content}`,
            ephemeral: true,
          });
        }
      }
      break;

    default:
      break;
  }
});

client.on("ready", () => {
  console.log("The bot is login");

  let commands = client.application?.commands;

  commands?.create({
    name: "price",
    description: "get price",
    options: [
      {
        name: "game_name",
        description: "The name of the game you want to search",
        required: true,
        type: DiscorJS.Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });
});
