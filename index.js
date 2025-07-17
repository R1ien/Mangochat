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

  // Envoie à chacun l'acceptation
  pusher.trigger(fromChannel, "chat-accepted", { from: to });
  pusher.trigger(toChannel, "chat-accepted", { from });

  // Envoie un message de début de conversation
  pusher.trigger(chatChannel, "chat-started", { message: `✅ Conversation acceptée !` });

  res.sendStatus(200);
});

app.post('/leave', (req, res) => {
  const { from, to } = req.body;
  const channelName = getChatChannel(from, to);
  pusher.trigger(channelName, 'user-left', { message: `🚪 ${from} a quitté la conversation.` });
  res.sendStatus(200);
});

app.post("/signal", (req, res) => {
  const { from, to, data } = req.body;

  if (!from || !to || !data) {
    return res.status(400).json({ error: "Données incomplètes." });
  }

  pusher.trigger("signal_" + to, "signal", {
    from,
    data
  });

  res.status(200).json({ success: true });
});

function getChatChannel(a, b) {
  return "chat_" + [a, b].sort().join("_");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur démarré sur le port", PORT);
});

// Demande d'appel
app.post('/call-request', (req, res) => {
  const { from, to } = req.body;
  pusher.trigger("call-invite_" + to, "call-request", { from });
  res.sendStatus(200);
});

// Réponse à l'appel (accepté ou refusé)
app.post('/call-response', (req, res) => {
  const { from, to, accept } = req.body;
  pusher.trigger("call-invite_" + to, "call-response", { from, accept });
  res.sendStatus(200);
});

// Offre WebRTC (SDP offer)
app.post('/webrtc-offer', (req, res) => {
  const { from, to, offer } = req.body;
  pusher.trigger("call-invite_" + to, "webrtc-offer", { from, offer });
  res.sendStatus(200);
});

// Réponse WebRTC (SDP answer)
app.post('/webrtc-answer', (req, res) => {
  const { from, to, answer } = req.body;
  pusher.trigger("call-invite_" + to, "webrtc-answer", { from, answer });
  res.sendStatus(200);
});

// ICE candidates
app.post('/webrtc-ice-candidate', (req, res) => {
  const { from, to, candidate } = req.body;
  pusher.trigger("call-invite_" + to, "webrtc-ice-candidate", { from, candidate });
  res.sendStatus(200);
});
