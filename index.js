const express = require('express');
const app = express();
const Pusher = require('pusher');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pusher = new Pusher({
  appId: "2023592",
  key: "21da0af69d3d1b97e425",
  secret: "3de0052ed5c986f11bed",
  cluster: "eu",
  useTLS: true
});

app.post('/message', (req, res) => {
  const { from, to, text } = req.body;
  const channelName = getChatChannel(from, to);
  pusher.trigger(channelName, 'new-message', { from, text });
  res.sendStatus(200);
});

app.post('/invite', (req, res) => {
  const { from, to } = req.body;
  const channel = "invite_" + to;
  pusher.trigger(channel, "chat-invite", { from });
  res.sendStatus(200);
});

app.post('/accept', (req, res) => {
  const { from, to } = req.body;
  const fromChannel = "invite_" + from;
  const toChannel = "invite_" + to;
  const chatChannel = getChatChannel(from, to);
  pusher.trigger(fromChannel, "chat-accepted", { from: to });
  pusher.trigger(toChannel, "chat-accepted", { from });
  pusher.trigger(chatChannel, "user-left", { message: `✅ Conversation acceptée !` });
  res.sendStatus(200);
});

app.post('/quit', (req, res) => {
  const { from, to } = req.body;
  const channelName = getChatChannel(from, to);
  pusher.trigger(channelName, 'user-left', { message: `🚪 ${from} a quitté la conversation.` });
  res.sendStatus(200);
});

function getChatChannel(a, b) {
  return "chat_" + [a, b].sort().join("_");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur démarré sur le port", PORT);
});
