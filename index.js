const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');

const app = express();
app.use(cors());
app.use(express.json());

const pusher = new Pusher({
  appId: 'YOUR_APP_ID', // Mets ton appId ici
  key: '21da0af69d3d1b97e425',
  secret: 'YOUR_SECRET', // Mets ton secret ici
  cluster: 'eu',
  useTLS: true
});

function getChatChannel(a, b) {
  return 'chat_' + [a, b].sort().join('_');
}

app.post('/message', (req, res) => {
  const { from, to, text } = req.body;
  const channel = getChatChannel(from, to);
  pusher.trigger(channel, 'new-message', { from, text });
  res.sendStatus(200);
});

app.post('/invite', (req, res) => {
  const { from, to } = req.body;
  pusher.trigger("invite_" + to, "chat-invite", { from });
  res.sendStatus(200);
});

app.post('/accept', (req, res) => {
  const { from, to } = req.body;
  pusher.trigger("invite_" + to, "chat-accepted", { from });
  res.sendStatus(200);
});

app.use(express.static('public'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MangoChat serveur lancé sur http://localhost:${port}`);
});
