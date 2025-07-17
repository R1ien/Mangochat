let localStream = null;
let isMuted = false;

const callBtn = document.getElementById("callBtn");
const muteBtn = document.getElementById("muteBtn");
const hangupBtn = document.getElementById("hangupBtn");
const callArea = document.getElementById("callArea");
const status = document.getElementById("status");

callBtn.addEventListener("click", async () => {
  try {
    // Demande la permission micro au clic
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    status.textContent = "Appel en cours...";
    callArea.style.display = "block";
    callBtn.style.display = "none";

    // Ici tu peux lancer ta connexion WebRTC avec localStream
    console.log("Stream audio obtenu", localStream);
  } catch (err) {
    alert("Micro non autorisé ou erreur : " + err.message);
  }
});

muteBtn.addEventListener("click", () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks()[0].enabled = !isMuted;
  muteBtn.textContent = isMuted ? "🔇 Micro coupé" : "🔈 Couper le micro";
});

hangupBtn.addEventListener("click", () => {
  if (!localStream) return;
  localStream.getTracks().forEach(track => track.stop());
  localStream = null;
  isMuted = false;
  status.textContent = "Appel terminé";
  callArea.style.display = "none";
  callBtn.style.display = "inline-block";
});
