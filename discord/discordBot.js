const config = require("../config");
const { Client, Intents } = require("discord.js");
const DiscorJS = require("discord.js");
const API = require("./bot_api");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const PREFIX = "/";
const LOG_CHANNEL_ID = "928283533087240192";

const express = require("express");
const app = express();
const port = require("./config").PORT;

client.login(config.DISCORD_BOT_TOKEN).catch((err) => {
  console.log(err);
});

function format_log(err, user, command, options, createdAt) {
  let op = "";
  if (options) {
    op = `${options.map((options) => {
      return `\nname: ${options.name} value: ${options.value}`;
    })}`;
  } else {
    op = "\nno option";
  }
  return `error: ${err}\nuser: ${user}\ncreated at: ${createdAt}\ncommand: ${command}\noptions: [${op}\n]`;
}
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  await interaction.deferReply({ ephemeral: true });

  switch (commandName) {
    case "price":
      {
        const result = await API.getPrice(options.getString("game_name"));
        if (result.err) {
          interaction.editReply({
            content: "Sorry, this command is temporarily unavailable",
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
      }
      break;

    case "best_seller":
      {
        const result = await API.getBSellers();
        if (result.err || result.data.length < 1) {
          interaction.editReply({
            content: "Sorry, this command is temporarily unavailable",
            ephemeral: true,
          });
          let err = format_log(
            err,
            interaction.user.tag,
            commandName,
            null,
            interaction.createdAt
          );
          console.log(err);
          client.channels.get(LOG_CHANNEL_ID).send(err);
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

    case "preorder":
      {
        const result = await API.getPreorders();
        if (result.err || result.data.length < 1) {
          interaction.editReply({
            content: "Sorry, this command is temporarily unavailable",
            ephemeral: true,
          });
          let err = format_log(
            err,
            interaction.user.tag,
            commandName,
            null,
            interaction.createdAt
          );
          console.log(err);
          client.channels.get(LOG_CHANNEL_ID).send(err);
        } else {
          let content = result.data.map((games) => {
            return `\n${games.g_name} - $${games.g_price} - ${games.g_publishdate}`;
          });
          interaction.editReply({
            content: `I found these${content}`,
            ephemeral: true,
          });
        }
      }
      break;

    default:
      interaction.reply({
        content: "Sorry, the command is not available now",
        ephemeral: true,
      });
      break;
  }
});
//https://discord.com/developers/docs/interactions/application-commands
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

  commands?.create({
    name: "best_seller",
    description: "get best sell game",
  });

  commands?.create({
    name: "preorder",
    description: "get preorder game",
  });
});
app.all("/",(req,res,next)=>{
  next()
})
app.use((error, req, res, next) => {
  console.error(error);
  return res.status(error.status || 500).json({
    error: error.message || `Unknown Error!`,
    status: error.status,
  });
});

app.listen(port, () => {
  console.log(`App listen on port http://localhost:${port}`);
});