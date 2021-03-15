require("dotenv").config();
const { loggerInfo, loggerError } = require("./utils/logging.js");
const { checkPermissions } = require("./utils/permissions");
const { sendRulesReaction, addRole } = require("./commands/react-role");
const { addIdea, getIdeas, deleteIdea } = require("./commands/agenda");
const { addTodo, getTodo, deleteTodo } = require("./commands/todo");
const { sendMessage, sendDM } = require("./commands/message");
const { setStream, stopStream } = require("./commands/stream");
const { sendCommands } = require("./commands/help");
const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("!help", { type: "LISTENING" });
});

client.on("message", async (msg) => {
  const message = msg.content.toLowerCase();

  if (message.startsWith("!help")) sendCommands(msg);

  if (message.startsWith("!addidea")) {
    if (checkPermissions(msg, "Officers")) addIdea(msg);
  }

  if (message.startsWith("!addtodo")) {
    const messageDetails = message.substr(message.indexOf(" ") + 1);
    const team = messageDetails.split(" ")[0];
    if (checkPermissions(msg, team)) addTodo(msg, messageDetails);
  }

  if (message.startsWith("!ideas")) {
    if (checkPermissions(msg, "Officers")) getIdeas(msg);
  }

  if (message.startsWith("!todo")) {
    const team = message.substr(message.indexOf(" ") + 1);
    if (checkPermissions(msg, team)) getTodo(msg, team);
  }

  if (message.startsWith("!removeidea")) {
    if (checkPermissions(msg, "Officers")) deleteIdea(msg);
  }

  if (message.startsWith("!removetodo")) {
    const messageDetails = message.substr(message.indexOf(" ") + 1);
    const team = messageDetails.split(" ")[0];
    if (checkPermissions(msg, team)) deleteTodo(msg, messageDetails);
  }

  if (message.startsWith("!rules")) {
    if (checkPermissions(msg, "Officers")) sendRulesReaction(msg);
  }

  if (message.startsWith("!message")) {
    if (checkPermissions(msg, "Officers")) sendMessage(msg, client);
  }

  if (message.startsWith("!setstream")) {
    if (checkPermissions(msg, "Officers")) setStream(client, msg);
  }

  if (message.startsWith("!stopstream")) {
    if (checkPermissions(msg, "Officers")) stopStream(client, msg);
  }

  //HIDDEN COMMANDS
  if (message.startsWith("!pizza")) {
    const author = msg.author.username + "#" + msg.author.discriminator;
    try {
      msg.react("🍕");
      loggerInfo(author + " requested pizza");
    } catch (e) {
      loggerError(author + " could not request pizza ;-;", e);
    }
  }

  if (message.startsWith("!barsha")) {
    msg.react("🅱️");
    content = message.substr(message.indexOf(" ") + 1);
    content = content.split(" ");
    content.forEach(function (part, index, content) {
      content[index] = "🅱️" + content[index].substring(1);
    });
    msg.channel.send(content.slice(0, content.length).join(" "));
    msg.delete({ timeout: 1000 });
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  try {
    addRole(reaction, user);
  } catch (e) {
    loggerError(
      user.username + "#" + user.discriminator + " was not given role Member",
      e
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
