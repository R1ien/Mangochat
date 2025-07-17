let localStream = null;
let isCalling = false;
let isMuted = false;

const callBtn = document.getElementById("callBtn");
const micStatus = document.getElementById("micStatus");
const callInterface = document.getElementById("callInterface");
const muteBtn = document.getElementById("muteBtn");
const hangupBtn = document.getElementById("hangupBtn");
const notifDiv = document.getElementById("notif");

// Variables globales
let peerConnection = null; // objet WebRTC (à initialiser après acceptation)
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }; // STUN basique

// On étend la fonction callBtn pour envoyer une invitation d'appel au partenaire
callBtn.addEventListener("click", () => {
  if (!partner) {
    notifDiv.textContent = "❗ Pas de partenaire pour appeler.";
    return;
  }
  if (isCalling) {
    notifDiv.textContent = "❗ Tu es déjà en appel.";
    return;
  }
  // Envoi demande d'appel via Pusher (signaling)
  fetch("/call-request", {  // tu devras créer cette route serveur qui forward l'event Pusher
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: myName, to: partner })
  });
  notifDiv.textContent = "📞 Invitation d'appel envoyée à " + partner;
});

// Réception de demande d'appel
const callInviteChannel = pusher.subscribe("call-invite_" + myName);
callInviteChannel.bind("call-request", async data => {
  const accept = confirm(`${data.from} t'appelle. Accepter ?`);
  if (!accept) {
    // Refuser = envoie signal de refus
    fetch("/call-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: myName, to: data.from, accept: false })
    });
    return;
  }
  // Accepter
  notifDiv.textContent = "📞 Appel accepté, préparation...";
  await startCall(true); // true = c’est le receveur qui démarre la connexion
  // Envoie signal d’acceptation pour que l’appelant commence aussi
  fetch("/call-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: myName, to: data.from, accept: true })
  });
});

// Réception réponse à l’appel
const callResponseChannel = pusher.subscribe("call-response_" + myName);
callResponseChannel.bind("call-response", async data => {
  if (!data.accept) {
    notifDiv.textContent = "❌ Appel refusé par " + data.from;
    return;
  }
  notifDiv.textContent = "📞 Appel accepté par " + data.from + ", préparation...";
  await startCall(false); // false = appelant démarre la connexion
});

// Fonction de démarrage de l’appel (simplifiée ici)
async function startCall(isReceiver) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    updateMicStatus();
    callInterface.style.display = "block";
    isCalling = true;
    isMuted = false;

    // Création de la connexion WebRTC
    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Ici tu dois gérer icecandidate, offer, answer, etc avec ton serveur

    // Pour test rapide, on écoute l'audio distant et on l’ajoute si jamais tu ajoutes la piste distante
    peerConnection.ontrack = event => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play();
    };

    // Pour la suite : exchange offer/answer via signaling serveur

  } catch (err) {
    notifDiv.textContent = "❌ Erreur lors de l'accès au micro : " + err.message;
  }
}

// Boutons mute / raccro ne changent pas
muteBtn.onclick = () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
  muteBtn.textContent = isMuted ? "🔈 Unmute" : "🔇 Mute";
  updateMicStatus();
};

hangupBtn.onclick = () => {
  if (!isCalling) return;
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  isCalling = false;
  isMuted = false;
  callInterface.style.display = "none";
  micStatus.textContent = "🎤 Micro : non prêt";
  notifDiv.textContent = "📞 Appel terminé.";

  // Ici tu peux envoyer un signal à l'autre que t'as raccroché
};
