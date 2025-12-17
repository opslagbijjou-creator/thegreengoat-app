import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../shared/firebase/client";

export async function markeerAfgehaald(barcode: string, afgegevenDoorUid: string, afgegevenDoorEmail: string | null) {
  const ref = doc(db, "pakketten", barcode.trim());

  await updateDoc(ref, {
    status: "afgehaald",
    afgegevenOp: serverTimestamp(),
    laatstGewijzigdOp: serverTimestamp(),
    afgegevenDoorUid,
    afgegevenDoorEmail: afgegevenDoorEmail ?? null
  });
}