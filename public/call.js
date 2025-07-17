const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const callBtn = document.getElementById("callBtn");
const hangupBtn = document.getElementById("hangupBtn");
const muteBtn = document.getElementById("muteBtn");
const notif = document.getElementById("notif");

let localStream = null;
let peerConnection = null;
let isMuted = false;

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

async function startLocalStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    notif.textContent = "Micro et caméra OK, prêt à appeler !";
    notif.style.display = "block";
  } catch (err) {
    notif.textContent = "Erreur accès micro/caméra : " + err.message;
    notif.style.display = "block";
  }
}

async function startCall() {
  if (!localStream) {
    notif.textContent = "Erreur : pas de flux local, demande le micro/caméra d'abord.";
    notif.style.display = "block";
    return;
  }

  peerConnection = new RTCPeerConnection(servers);

  // Ajoute tous les tracks audio+vidéo au peer
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  // Quand on reçoit le flux distant, on le met dans la vidéo
  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
  };

  // Ici tu dois gérer l’échange SDP / ICE avec ton backend (signaling)
  // Pour l’instant on fait juste un log, tu compléteras plus tard
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      console.log("Nouveau ICE candidate", event.candidate);
      // Envoie la candidate au partenaire via signaling (backend)
    }
  };

  // Création offre SDP et envoi au partenaire (à coder avec signaling)
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  notif.textContent = "Offre créée, à envoyer au partenaire via signaling.";
  notif.style.display = "block";
}

function toggleMute() {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks()[0].enabled = !isMuted;
  muteBtn.textContent = isMuted ? "Unmute 🔈" : "Mute 🔇";
}

function hangupCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  remoteVideo.srcObject = null;
  notif.textContent = "Appel terminé.";
  notif.style.display = "block";
}

callBtn.addEventListener("click", startCall);
muteBtn.addEventListener("click", toggleMute);
hangupBtn.addEventListener("click", hangupCall);

// Démarre la capture dès le chargement pour demander la permission micro/cam
startLocalStream();
