const callBtn = document.getElementById("callBtn");
const API_URL = "https://mangochat.onrender.com";

callBtn.onclick = async () => {
  console.log("Bouton appeler cliqué");

  if (!partner) {
    console.log("Pas de partenaire défini");
    alert("Invitez quelqu’un avant d’appeler !");
    return;
  }

  console.log("Demande d'appel à", partner);

  try {
    const res = await fetch(API_URL + "/call-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: myName, to: partner })
    });

    if (!res.ok) throw new Error("Erreur serveur");
    notif("Demande d'appel envoyée à " + partner);
    console.log("Demande envoyée OK");
  } catch (err) {
    console.error("Erreur en envoyant la demande d'appel", err);
    notif("Erreur lors de l'envoi de la demande");
  }
};
