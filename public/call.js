let localStream;
let peerConnection;
const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

// 🔊 Élément audio pour écouter la voix de l'autre
const remoteAudio = new Audio();
remoteAudio.autoplay = true;

// 1. Obtenir le micro
async function initMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("🎤 Micro prêt !");
  } catch (e) {
    console.error("Erreur micro :", e);
  }
}

// 2. Créer la connexion
function createPeerConnection(partnerName) {
  peerConnection = new RTCPeerConnection(config);

  // Ajoute ton micro dans la connexion
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // Quand tu reçois un flux distant (voix de l’autre)
  peerConnection.ontrack = event => {
    const [stream] = event.streams;
    remoteAudio.srcObject = stream;
  };

  // Quand on obtient un candidat ICE (truc réseau)
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      sendSignal(partnerName, { type: "ice", candidate: event.candidate });
    }
  };
}

// 3. Fonction pour envoyer des signaux via Pusher
function sendSignal(to, data) {
  fetch("/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, from: localStorage.getItem("myCode"), data })
  });
}
