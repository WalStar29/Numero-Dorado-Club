import { setGlobalOptions } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();
const db = getFirestore();

setGlobalOptions({ maxInstances: 10 });

export const liberarNumerosVencidos = onSchedule("every 1 minutes", async () => {
  const ahora = Timestamp.now();
  const snapshot = await db.collection("estadoNumeros").get();

  const batch = db.batch();
  const logsRef = db.collection("logsLiberaciones");

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const estado = data.estado;
    const reservadoPor = data.reservadoPor;
    const timestamp = data.timestamp;

    if (
      estado === "reservado" &&
      reservadoPor &&
      timestamp &&
      timestamp instanceof Timestamp &&
      ahora.seconds - timestamp.seconds > 10
    ) {
      batch.update(doc.ref, {
        estado: "disponible",
        reservadoPor: null,
        timestamp: null
      });

      const logId = `${doc.id}_${ahora.toMillis()}`;
      batch.set(logsRef.doc(logId), {
        numero: doc.id,
        liberadoEn: ahora,
        reservadoPor,
        motivo: "Expiración automática (10s)"
      });

      console.log(`🔓 Número #${doc.id} liberado por expiración de 10s`);
    }
  });

  await batch.commit();
});
