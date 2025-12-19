import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../../../../../../shared/firebase/client";

export type PakketResultaat = {
  barcode: string;
  voornaam?: string | null;
  achternaam?: string | null;
  adres?: string | null;
  status?: string | null;
  vervoerder?: string | null;
};

function clean(s: string) {
  return (s || "").trim();
}

export async function zoekPakketten(term: string): Promise<PakketResultaat[]> {
  const q = clean(term);
  if (!q) return [];

  const results = new Map<string, PakketResultaat>();

  // 1) exact barcode = docId
  const ref = doc(db, "pakketten", q);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as any;
    results.set(q, {
      barcode: q,
      voornaam: data.voornaam ?? null,
      achternaam: data.achternaam ?? null,
      adres: data.adres ?? null,
      status: data.status ?? null,
      vervoerder: data.vervoerder ?? null
    });
  }

  const col = collection(db, "pakketten");

  // 2) exact achternaam
  const qAch = query(col, where("achternaam", "==", q), limit(25));
  (await getDocs(qAch)).forEach((d) => {
    const data = d.data() as any;
    results.set(d.id, {
      barcode: data.barcode ?? d.id,
      voornaam: data.voornaam ?? null,
      achternaam: data.achternaam ?? null,
      adres: data.adres ?? null,
      status: data.status ?? null,
      vervoerder: data.vervoerder ?? null
    });
  });

  // 3) exact voornaam
  const qVn = query(col, where("voornaam", "==", q), limit(25));
  (await getDocs(qVn)).forEach((d) => {
    const data = d.data() as any;
    results.set(d.id, {
      barcode: data.barcode ?? d.id,
      voornaam: data.voornaam ?? null,
      achternaam: data.achternaam ?? null,
      adres: data.adres ?? null,
      status: data.status ?? null,
      vervoerder: data.vervoerder ?? null
    });
  });

  return Array.from(results.values());
}
