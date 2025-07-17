const notifDiv = document.getElementById("notif");
const callBtn = document.getElementById("callBtn");
const callInterface = document.getElementById("callInterface");
const muteBtn = document.getElementById("muteBtn");
const hangupBtn = document.getElementById("hangupBtn");
const micStatus = document.getElementById("micStatus");

let localStream = null;
let peerConnection = null;
let isCalling = false;
let isMuted = false;

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Bouton appeler : envoie la demande d'appel
callBtn.addEventListener("click", () => {
  if (!partner) {
    notifDiv.textContent = "❗ Pas de partenaire pour appeler.";
    return;
  }
  if (isCalling) {
    notifDiv.textContent = "❗ Tu es déjà en appel.";
    return;
  }
  fetch("/call-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: myName, to: partner }),
  });
  notifDiv.textContent = `📞 Invitation d'appel envoyée à ${partner}`;
});

// Réception d'une demande d'appel
const callInviteChannel = pusher.subscribe("call-invite_" + myName);
callInviteChannel.bind("call-request", async (data) => {
  const accept = confirm(`${data.from} t'appelle. Accepter ?`);
  if (!accept) {
    await fetch("/call-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: myName, to: data.from, accept: false }),
    });
    return;
  }
  notifDiv.textContent = "📞 Appel accepté, préparation...";
  await startCall(true);
  await fetch("/call-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: myName, to: data.from, accept: true }),
  });
});

// Réception de la réponse à l'appel
const callResponseChannel = pusher.subscribe("call-response_" + myName);
callResponseChannel.bind("call-response", async (data) => {
  if (!data.accept) {
    notifDiv.textContent = `❌ Appel refusé par ${data.from}`;
    return;
  }
  notifDiv.textContent = `📞 Appel accepté par ${data.from}, préparation...`;
  await startCall(false);
});

// Fonction démarrant la capture micro + interface appel
async function startCall(isReceiver) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    micStatus.textContent = "🎤 Micro : prêt";
    callInterface.style.display = "block";
    isCalling = true;
    isMuted = false;

    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play();
    };

    // Ici, il faudra gérer icecandidate, offer/answer plus tard
  } catch (err) {
    notifDiv.textContent = `❌ Erreur micro : ${err.message}`;
  }
}

// Bouton mute/unmute
muteBtn.onclick = () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
  muteBtn.textContent = isMuted ? "🔈 Unmute" : "🔇 Mute";
  micStatus.textContent = isMuted ? "🎤 Micro : coupé" : "🎤 Micro : actif";
};

// Bouton raccrocher
hangupBtn.onclick = () => {
  if (!isCalling) return;
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
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
};
