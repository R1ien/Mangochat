const notif = document.getElementById("notif");
const localVideo = document.getElementById("localVideo");

async function startLocalStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    notif.textContent = "Micro autorisé ✅";
    notif.style.display = "block";
    // Si tu veux afficher la vidéo (ici non), tu mets : localVideo.srcObject = stream;
  } catch (err) {
    notif.textContent = "Erreur micro : " + err.message;
    notif.style.display = "block";
  }
}

window.addEventListener("load", () => {
  startLocalStream();
});
