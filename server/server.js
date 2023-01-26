const CONSTANTS = require('./consts');

const tmi = require('tmi.js');

const badWords = require("bad-words");
const express = require("express");

import config from "../config.json";

const badWordsFilter = new badWords();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let data = {
  message: "default"
};

function determineEmoji(msg) {
  // courtesy of https://medium.com/reactnative/emojis-in-javascript-f693d0eb79fb
  return CONSTANTS.EMOJI_MATCH_REGEX.test(msg);
}

function determineLink(str) {
  // TODO: implement this
  return false;
}

function determineBotMessage(user) {
  user = user.toLowerCase()

  return config.bots.includes(user);
}

function updateData(newData) {
  user = newData.user;
  msg = newData.message;

  if (determineEmoji(msg)) return;
  if (determineLink(msg)) return;
  if (determineBotMessage(user)) return;

  data.message = badWordsFilter.clean(newData.message);
  console.log(data);
  io.emit('data', data);
}

server.listen(CONSTANTS.PORT, () => {
  console.log(`Server running on port ${CONSTANTS.PORT}`);
});

const client = new tmi.Client({
  connection: {reconnect: true},
  channels: config.channels
});

client.connect();

client.on('message', async (channel, context, message) => {
  console.log('channel', {
    channel,
    user: context.username,
    message
  });

  updateData({ message: message });
});