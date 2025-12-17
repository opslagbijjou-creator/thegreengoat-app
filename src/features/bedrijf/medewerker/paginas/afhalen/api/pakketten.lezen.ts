import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../../shared/firebase/client";

export type PakketDoc = {
  barcode: string;
  voornaam: string;
  achternaam: string;
  status: "ingescand" | "afgehaald";
};

export async function leesPakket(barcode: string): Promise<PakketDoc | null> {
  const ref = doc(db, "pakketten", barcode.trim());
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as any;

  return {
    barcode: data.barcode ?? barcode,
    voornaam: data.voornaam ?? "",
    achternaam: data.achternaam ?? "",
    status: data.status ?? "ingescand"
  };
}