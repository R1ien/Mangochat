const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');

const app = express();
app.use(cors());
app.use(express.json());

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
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

app.use(express.static('public'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
