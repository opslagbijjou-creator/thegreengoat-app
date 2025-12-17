import { signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../../shared/firebase/client";

export async function loginMetEmail(email: string, wachtwoord: string) {
  // ✅ blijft ingelogd na refresh
  await setPersistence(auth, browserLocalPersistence);

  const res = await signInWithEmailAndPassword(auth, email, wachtwoord);
  return res.user;
}

export async function logout() {
  await signOut(auth);
}