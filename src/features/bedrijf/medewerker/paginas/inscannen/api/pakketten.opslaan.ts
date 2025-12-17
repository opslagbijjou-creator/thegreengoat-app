import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../../../../shared/firebase/client";

export type PakketInvoer = {
  barcode: string;
  voornaam: string;
  achternaam: string;
  aangemaaktDoorUid: string;
  aangemaaktDoorEmail: string | null;
};

export async function slaPakketOp(input: PakketInvoer) {
  const barcode = input.barcode.trim();
  if (!barcode) throw new Error("Geen barcode.");

  const ref = doc(db, "pakketten", barcode);
  const bestaand = await getDoc(ref);

  if (bestaand.exists()) {
    throw new Error("Deze barcode bestaat al in het systeem.");
  }

  await setDoc(ref, {
    barcode,
    voornaam: input.voornaam.trim(),
    achternaam: input.achternaam.trim(),
    status: "ingescand",
    aangemaaktOp: serverTimestamp(),
    laatstGewijzigdOp: serverTimestamp(),
    aangemaaktDoorUid: input.aangemaaktDoorUid,
    aangemaaktDoorEmail: input.aangemaaktDoorEmail ?? null
  });
}