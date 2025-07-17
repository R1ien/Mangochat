let localStream = null;
let isCalling = false;
let isMuted = false;

const callBtn = document.getElementById("callBtn");
const micStatus = document.getElementById("micStatus");
const callInterface = document.getElementById("callInterface");
const muteBtn = document.getElementById("muteBtn");
const hangupBtn = document.getElementById("hangupBtn");
const notifDiv = document.getElementById("notif");

// Fonction pour mettre à jour le statut du micro
function updateMicStatus() {
  micStatus.textContent = localStream && !isMuted ? "🎤 Micro : prêt" : "🎤 Micro : coupé / non prêt";
}

// Demander le micro au clic sur "Appeler"
callBtn.addEventListener("click", async () => {
  if (!partner) {
    notifDiv.textContent = "❗ Pas de partenaire pour appeler.";
    return;
  }
  if (isCalling) {
    notifDiv.textContent = "❗ Tu es déjà en appel.";
    return;
  }

  try {
    notifDiv.textContent = "⌛ Demande d'accès au micro...";
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    notifDiv.textContent = "✅ Micro capturé, appel lancé !";
    isCalling = true;
    isMuted = false;

    updateMicStatus();
    callInterface.style.display = "block";

    // Ici, tu peux ajouter la logique WebRTC pour démarrer l’appel

  } catch (err) {
    notifDiv.textContent = "❌ Micro non autorisé ou erreur : " + err.message;
  }
});

// Bouton mute/unmute
muteBtn.addEventListener("click", () => {
  if (!localStream) return;

  isMuted = !isMuted;
  localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
  muteBtn.textContent = isMuted ? "🔈 Unmute" : "🔇 Mute";
  updateMicStatus();
});

// Bouton raccrocher
hangupBtn.addEventListener("click", () => {
  if (!isCalling) return;

  // Arrêter tous les tracks audio
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  isCalling = false;
  isMuted = false;
  callInterface.style.display = "none";
  micStatus.textContent = "🎤 Micro : non prêt";
  notifDiv.textContent = "📞 Appel terminé.";

  // Ici, tu peux ajouter la logique WebRTC pour fermer la connexion
});
