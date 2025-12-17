import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../shared/firebase/client";

export async function loginMetEmail(email: string, wachtwoord: string) {
  const res = await signInWithEmailAndPassword(auth, email, wachtwoord);
  return res.user;
}