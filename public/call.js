console.log("📞 Module d’appel chargé !");

async function startMicro() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("✅ Micro activé !");
  } catch (err) {
    console.error("❌ Erreur micro :", err);
  }
}

startMicro()
