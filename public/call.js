const API_URL = "https://mangochat.onrender.com"; // ← remplace par ton URL Render

const notif = msg => {
  const n = document.getElementById("notif");
  n.textContent = msg;
  n.style.display = "block";
  setTimeout(() => n.style.display = "none", 5000);
};

const callBtn = document.getElementById("callBtn");
const callInterface = document.getElementById("callInterface");
const muteBtn = document.getElementById("muteBtn");
const hangupBtn = document.getElementById("hangupBtn");

let localStream = null;
let pc = null;
let isMuted = false;

const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// Assume myName et partner sont déjà définis dans ton code principal (pseudo et la personne invitée)

callBtn.onclick = async () => {
  if (!partner) return notif("Invitez quelqu'un d'abord.");

  notif("Demande d'appel envoyée...");
  try {
    await fetch(API_URL + "/call-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: myName, to: partner })
    });
  } catch (e) {
    notif("Erreur en envoyant la demande d'appel.");
    console.error(e);
  }
};

// ** Pusher : écoute les événements d’appel **

const callChannel = pusher.subscribe("call-invite_" + myName);

callChannel.bind("call-request", async data => {
  if (!confirm(`📞 ${data.from} t'appelle. Tu acceptes ?`)) {
    // Refuser
    await fetch(API_URL + "/call-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: myName, to: data.from, accept: false })
    });
    return;
  }

  // Accepter l'appel
  partner = data.from;
  notif("Appel accepté. Initialisation...");

  await fetch(API_URL + "/call-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: myName, to: partner, accept: true })
  });

  startCall(true); // true = tu es celui qui reçoit l'appel
});

callChannel.bind("call-response", data => {
  if (data.accept) {
    notif("Appel accepté par " + data.from);
    startCall(false); // false = tu es l’initiateur
  } else {
    notif("Appel refusé par " + data.from);
  }
});

callChannel.bind("webrtc-offer", async data => {
  if (!pc) startCall(true);
  await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // Envoie la réponse
  fetch(API_URL + "/webrtc-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: myName, to: partner, answer: pc.localDescription })
  });
});

callChannel.bind("webrtc-answer", async data => {
  await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
});

callChannel.bind("webrtc-ice-candidate", async data => {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  } catch (e) {
    console.warn("Erreur ajout ICE candidate", e);
  }
});

// ** Fonctions WebRTC **

async function startCall(isReceiver) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    document.getElementById("micStatus").textContent = "🎤 Micro : prêt";
  } catch (e) {
    notif("Micro non autorisé ou erreur : " + e.message);
    return;
  }

  pc = new RTCPeerConnection(configuration);

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.onicecandidate = event => {
    if (event.candidate) {
      fetch(API_URL + "/webrtc-ice-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: myName, to: partner, candidate: event.candidate })
      });
    }
  };

  pc.ontrack = event => {
    // Ici tu peux diffuser l'audio reçu, par exemple dans un <audio> caché :
    let remoteAudio = document.getElementById("remoteAudio");
    if (!remoteAudio) {
      remoteAudio = document.createElement("audio");
      remoteAudio.id = "remoteAudio";
      remoteAudio.autoplay = true;
      document.body.appendChild(remoteAudio);
    }
    remoteAudio.srcObject = event.streams[0];
  };

  callInterface.style.display = "block";

  if (!isReceiver) {
    // Initiateur : crée et envoie l’offre
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    fetch(API_URL + "/webrtc-offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: myName, to: partner, offer: pc.localDescription })
    });
  }
}

muteBtn.onclick = () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks()[0].enabled = !isMuted;
  muteBtn.textContent = isMuted ? "🔈 Unmute" : "🔇 Mute";
};

hangupBtn.onclick = () => {
  if (pc) {
    pc.close();
    pc = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }
  callInterface.style.display = "none";
  notif("Appel terminé");
};

