const express = require('express');
const Pusher = require('pusher');

const app = express();
app.use(express.json());

const pusher = new Pusher({
  appId: '2023592',
  key: '21da0af69d3d1b97e425',
  secret: '3de0052ed5c986f11bed',
  cluster: 'eu',
  useTLS: true,
});

app.post('/send-invite', (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).send('Missing parameters');

  pusher.trigger(`private-chat-${to}`, 'invite', {
    from,
    to,
  }).then(() => {
    res.send('Invitation envoyée');
  }).catch(err => {
    res.status(500).send('Erreur serveur');
  });
});

app.listen(3000, () => {
  console.log('Serveur lancé sur le port 3000');
});
