const express = require("express");
const Pusher = require("pusher");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const pusher = new Pusher({
  appId: "2023592",
  key: "21da0af69d3d1b97e425",
  secret: "3de0052ed5c986f11bed",
  cluster: "eu",
  useTLS: true,
});

// Route pour envoyer l'invitation d'appel
app.post("/call-request", (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).send("Missing from/to");
  pusher.trigger("call-invite_" + to, "call-request", { from });
  res.sendStatus(200);
});

// Route pour envoyer la réponse à l'appel
app.post("/call-response", (req, res) => {
  const { from, to, accept } = req.body;
  if (!from || !to || typeof accept !== "boolean") return res.status(400).send("Missing data");
  pusher.trigger("call-response_" + to, "call-response", { from, accept });
  res.sendStatus(200);
});

app.use(express.static("public")); // sert ton dossier public (avec index.html + call.js)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
