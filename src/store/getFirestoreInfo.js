import { db } from "../firebase/config.js";
import { doc, getDoc } from "firebase/firestore";
import { useStore } from "./useStore.js";

export default async function getFirestoreInfo(firebaseUser) {
  if (!firebaseUser?.uid) return;

  const setUser = useStore.getState().setUser;

  const userDoc = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(userDoc);
  if (!snap.exists()) return;

  const data = snap.data();

  const createdAtMs =
    data.createdAt?.toMillis ? data.createdAt.toMillis() : null;

  const safe = { ...data };
  delete safe.createdAt;

  setUser({
    uid: firebaseUser.uid,
    ...safe,
    createdAtMs,
  });
}
