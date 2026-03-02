import { db } from "../firebase/config.js";
import { doc, getDoc } from "firebase/firestore";
import { useStore } from "./useStore.js";

export default async function getFirestoreInfo(user) {
  if (!user) return;
  const userDoc = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDoc);
  if (userSnap.exists()) {
    useStore.getState().setUser(userSnap.data());
  }
}