const config = require('../config')
const { Client, Intents } = require('discord.js')
const DiscorJS = require('discord.js')
const API = require('./bot_api')
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})
const PREFIX = '/'
const LOG_CHANNEL_ID = '928283533087240192'// this is the log channel let discord bot log the error

// to deploy on heroku we need this
const express = require('express')
const app = express()
const port = process.env.PORT || 8080// either heroku declare the port or use 8080
//

// put the discord bot online
client.login(config.DISCORD_BOT_TOKEN).catch((err) => {
  console.log(err)
})

// format the message when an error occur
function format_log (err, user, command, options, createdAt) {
  let op = ''
  if (options) {
    op = `${options.map((options) => {
      return `\nname: ${options.name} value: ${options.value}`
    })}`
  } else {
    op = '\nno option'
  }
  return `error: ${err}\nuser: ${user}\ncreated at: ${createdAt}\ncommand: ${command}\noptions: [${op}\n]`
}

// received the command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return// return if the command is not a standard command

  const { commandName, options } = interaction

  await interaction.deferReply({ ephemeral: true })// reply the user to avoid timeout problem ephemeral is declare to let only the user who send this command can see the reply

  switch (commandName) {
    case 'price':
      {
        const result = await API.getPrice(options.getString('game_name'))// get the result from database using the options that user pass in
        if (result.err) {
          interaction.editReply({
            content: 'Sorry, this command is temporarily unavailable',
            ephemeral: true
          })
          const err = format_log(
            err,
            interaction.user.tag,
            commandName,
            [{ name: 'game_name', value: options.getString('game_name') }],
            interaction.createdAt
          )
          console.log(err)
          client.channels.get(LOG_CHANNEL_ID).send(err)// log the error to specify channel
        } else {
          if (result.data.length < 1) {
            interaction.editReply({
              content: `Sorry, I can't find any game call ${options.getString(
                'game_name'
              )}`,
              ephemeral: true
            })
          } else {
            const content = result.data.map((games) => {
              return `\n${games.g_name} - $${games.g_price}`
            })
            interaction.editReply({
              content: `I found these${content}`,
              ephemeral: true
            })
          }
        }
      }
      break

    case 'best_seller':
      {
        const result = await API.getBSellers()// get the result from database
        if (result.err || result.data.length < 1) {
          interaction.editReply({
            content: 'Sorry, this command is temporarily unavailable',
            ephemeral: true
          })
          const err = format_log(
            err,
            interaction.user.tag,
            commandName,
            null,
            interaction.createdAt
          )
          console.log(err)
          client.channels.get(LOG_CHANNEL_ID).send(err)// log the error to specify channel
        } else {
          const content = result.data.map((games) => {
            return `\n${games.g_name} - $${games.g_price}`
          })
          interaction.editReply({
            content: `I found these${content}`,
            ephemeral: true
          })
        }
      }
      break

    case 'preorder':
      {
        const result = await API.getPreorders()// get the result from database
        if (result.err || result.data.length < 1) {
          interaction.editReply({
            content: 'Sorry, this command is temporarily unavailable',
            ephemeral: true
          })
          const err = format_log(
            err,
            interaction.user.tag,
            commandName,
            null,
            interaction.createdAt
          )
          console.log(err)
          client.channels.get(LOG_CHANNEL_ID).send(err)// log the error to specify channel
        } else {
          const content = result.data.map((games) => {
            return `\n${games.g_name} - $${games.g_price} - ${games.g_publishdate}`
          })
          interaction.editReply({
            content: `I found these${content}`,
            ephemeral: true
          })
        }
      }
      break

    default:// default reply if command not found
      interaction.reply({
        content: 'Sorry, the command is not available now',
        ephemeral: true
      })
      break
  }
})
// https://discord.com/developers/docs/interactions/application-commands
// when the bot is ready declare the command if the command not exist
client.on('ready', () => {
  console.log('The bot is login')

  const commands = client.application?.commands

  commands?.create({
    name: 'price',
    description: 'get price',
    options: [// user need enter the option
      {
        name: 'game_name',
        description: 'The name of the game you want to search',
        required: true,
        type: DiscorJS.Constants.ApplicationCommandOptionTypes.STRING
      }
    ]
  })

  commands?.create({
    name: 'best_seller',
    description: 'get best sell game'
  })

  commands?.create({
    name: 'preorder',
    description: 'get preorder game'
  })
})

// use for deploying on heroku
app.use((error, req, res, next) => {
  console.error(error)
  return res.status(error.status || 500).json({
    error: error.message || 'Unknown Error!',
    status: error.status
  })
})

// listen to heroku
app.listen(port, () => {
  console.log(`App listen on port http://localhost:${port}`)
})
