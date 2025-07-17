// call.js complet prêt à coller

let localStream = null;
let partner = localStorage.getItem("partnerCode"); // Ou ta variable partenaire comme tu veux

// Demande d'autorisation micro dès le début
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then(stream => {
    localStream = stream;
    console.log("🎤 Micro prêt !");
    document.getElementById("micStatus").textContent = "🎤 Micro : prêt ✅";
  })
  .catch(err => {
    console.error("Erreur d'accès au micro:", err);
    alert("Tu dois autoriser l'accès au micro pour utiliser la fonction appel.");
    document.getElementById("micStatus").textContent = "🎤 Micro : non autorisé ❌";
  });

// Bouton Appeler
document.getElementById("callBtn").addEventListener("click", () => {
  if (!partner) {
    alert("Pas de partenaire sélectionné !");
    return;
  }
  if (!localStream) {
    alert("Le micro n'est pas prêt. Autorise-le puis recharge la page.");
    return;
  }
  startCall();
});

function startCall() {
  console.log("📞 Appel démarré avec " + partner);
  // Ici tu commenceras la logique WebRTC plus tard
  alert("C'est ici que tu démarres la connexion WebRTC.");
}

// Statut micro affiché dans HTML
// Tu dois avoir dans ton index.html :
// <p id="micStatus">🎤 Micro : en attente...</p>
