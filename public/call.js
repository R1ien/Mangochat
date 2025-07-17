let localStream = null;
let partner = localStorage.getItem("partnerCode"); // adapte si besoin

const micStatus = document.getElementById("micStatus");
const callBtn = document.getElementById("callBtn");

callBtn.addEventListener("click", async () => {
  if (!partner) {
    alert("Pas de partenaire sélectionné !");
    return;
  }
  
  // Si micro déjà autorisé, on démarre direct
  if (localStream) {
    startCall();
    return;
  }

  // Sinon on demande l'autorisation micro ici (dans le clic)
  try {
    micStatus.textContent = "🎤 Demande d'accès au micro...";
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    micStatus.textContent = "🎤 Micro : prêt ✅";
    console.log("Micro autorisé et stream prêt");
    startCall();
  } catch (err) {
    micStatus.textContent = "🎤 Micro : non autorisé ❌";
    alert("Tu dois autoriser l'accès au micro pour utiliser la fonction appel.");
    console.error("Erreur micro :", err);
  }
});

function startCall() {
  alert("Appel démarré (à coder la connexion WebRTC ici) avec " + partner);
  console.log("📞 Appel démarré avec " + partner);
}
