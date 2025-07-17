let localStream = null;
let isCalling = false;

const callBtn = document.getElementById("callBtn"); // Ton bouton Appeler
const notif = document.getElementById("notif");

callBtn.addEventListener("click", async () => {
  if (isCalling) {
    notif.textContent = "Tu es déjà en appel.";
    return;
  }
  if (!partner) {
    notif.textContent = "Pas de partenaire pour appeler.";
    return;
  }

  try {
    notif.textContent = "Demande d'accès au micro...";
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    notif.textContent = "Micro capturé, lancement de l'appel...";
    isCalling = true;

    // Ici tu peux lancer ta logique WebRTC, créer PeerConnection, envoyer offer etc.

  } catch (err) {
    notif.textContent = "Micro non autorisé ou erreur : " + err.message;
  }
});
