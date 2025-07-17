const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Servir les fichiers statiques (ton frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Stockage en mémoire des pseudos
const users = {};

// Tes routes API ici (même que précédemment)
app.post('/save-pseudo', (req, res) => {
  const { pseudo } = req.body;
  if (!pseudo || typeof pseudo !== 'string' || pseudo.length > 15) {
    return res.status(400).json({ error: 'Pseudo invalide' });
  }
  if (users[pseudo]) {
    return res.status(400).json({ error: 'Pseudo déjà pris' });
  }
  users[pseudo] = { pseudo };
  console.log(`Pseudo sauvegardé: ${pseudo}`);
  res.json({ success: true });
});

app.get('/check-pseudo/:pseudo', (req, res) => {
  const pseudo = req.params.pseudo;
  res.json({ exists: Boolean(users[pseudo]) });
});

app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const userPseudo = req.body.user_pseudo;

  if (channel === `private-chat-${userPseudo}` && users[userPseudo]) {
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

// Si aucune route ne correspond, renvoyer index.html (pour SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
