import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../shared/firebase/client";

let huidigeUser: User | null = null;
let authKlaar = false;

type Listener = () => void;
const listeners = new Set<Listener>();

export function startAuthToestand() {
  onAuthStateChanged(auth, (user) => {
    huidigeUser = user;
    authKlaar = true;
    listeners.forEach((fn) => fn());
  });
}

export function isAuthKlaar() {
  return authKlaar;
}

export function getHuidigeUser() {
  return huidigeUser;
}

export function onAuthUpdate(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}