// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Stockage en mémoire des pseudos (à remplacer par une vraie base en prod)
const users = {};

// Config Pusher (mets tes clés ici)
const pusher = new Pusher({
  appId: 'ton_app_id_ici',
  key: '21da0af69d3d1b97e425',          // ta clé pusher
  secret: 'ton_secret_ici',             // ton secret pusher
  cluster: 'eu',
  useTLS: true,
});

// Endpoint pour sauvegarder un pseudo
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

// Endpoint pour vérifier si un pseudo existe (utile pour invitation)
app.get('/check-pseudo/:pseudo', (req, res) => {
  const pseudo = req.params.pseudo;
  if (users[pseudo]) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
});

// Endpoint d'authentification Pusher (pour canaux privés)
app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const userPseudo = req.body.user_pseudo; // envoi le pseudo côté client dans la requête auth

  // Vérifie que le canal correspond au user
  if (channel === `private-chat-${userPseudo}` && users[userPseudo]) {
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
