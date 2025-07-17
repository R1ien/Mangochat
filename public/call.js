const myCode = localStorage.getItem("myCode");
const partner = localStorage.getItem("partnerCode");

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
    body: JSON.stringify({
      from: myCode,
      to,
      data
    })
  });
}

const callBtn = document.getElementById("callBtn");
const callInterface = document.getElementById("callInterface");
const muteBtn = document.getElementById("muteBtn");
const hangupBtn = document.getElementById("hangupBtn");

let isMuted = false;

callBtn.onclick = async () => {
  if (!partner) {
    alert("Aucune personne avec qui appeler.");
    return;
  }

  await initMedia();
  createPeerConnection(partner);

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  sendSignal(partner, { type: "offer", sdp: offer });

  showCallUI();
};

muteBtn.onclick = () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks().forEach(track => (track.enabled = !isMuted));
  muteBtn.textContent = isMuted ? "🔈 Unmute" : "🔇 Mute";
};

hangupBtn.onclick = () => {
  if (peerConnection) peerConnection.close();
  peerConnection = null;
  localStream.getTracks().forEach(t => t.stop());
  localStream = null;
  hideCallUI();

  sendSignal(partner, { type: "hangup" });
};

function showCallUI() {
  callInterface.style.display = "block";
}

function hideCallUI() {
  callInterface.style.display = "none";
}

// Abonnement au canal de signal
const signalChannel = pusher.subscribe("signal_" + myCode);

signalChannel.bind("signal", async data => {
  const msg = data.data;

  if (msg.type === "offer") {
    await initMedia();
    createPeerConnection(data.from);

    await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendSignal(data.from, { type: "answer", sdp: answer });
    showCallUI();
  }

  if (msg.type === "answer") {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  }

  if (msg.type === "ice") {
    peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
  }

  if (msg.type === "hangup") {
    if (peerConnection) peerConnection.close();
    peerConnection = null;
    hideCallUI();
  }
});
