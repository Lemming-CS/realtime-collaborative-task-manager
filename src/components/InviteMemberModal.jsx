import { useEffect, useRef, useState } from "react";
import styles from "./static/InviteMemberModal.module.css";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

function InviteMemberModal({ open, onClose, project }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const skipNextSearchRef = useRef(false);
  const isOwner = project?.ownerId === auth.currentUser?.uid;

  useEffect(() => {
    if (!open) {
      setText("");
      setResults([]);
      setSelected(null);
      setMsg("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const run = async () => {
      setMsg("");

      const qRaw = text.trim().toLowerCase();
      if (!qRaw || qRaw.length < 2) {
        setResults([]);
        return;
      }
      if (skipNextSearchRef.current) {
        skipNextSearchRef.current = false;
        return;
      }
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          orderBy("usernameLower"),
          where("usernameLower", ">=", qRaw),
          where("usernameLower", "<", qRaw + "\uf8ff"),
          limit(8),
        );

        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.uid !== auth.currentUser?.uid);

        setResults(list);
      } catch (e) {
        console.error(e);
        setMsg(e.code || e.message);
      }
    };

    run();
  }, [text]);

  const choose = (u) => {
    setSelected({ uid: u.uid, username: u.username });
    setText(u.username);
    skipNextSearchRef.current = true;
    setResults([]);
  };

  const sendInvite = async () => {
    setMsg("");
    if (!isOwner) return setMsg("Only owner can invite");
    if (!selected?.uid) return setMsg("Choose a user from the list");
    if (project.members?.includes(selected.uid))
      return setMsg("User is already a member");

    setLoading(true);
    try {
      const inviteId = `${project.id}_${selected.uid}`;

      await setDoc(doc(db, "invites", inviteId), {
        projectId: project.id,
        projectTitle: project.title,
        inviterId: auth.currentUser.uid,
        inviterUsername: project.ownerUsername || "Owner",
        toUid: selected.uid,
        toUsername: selected.username,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMsg("Invite sent ✅");
      setSelected(null);
    } catch (e) {
      console.error(e);
      setMsg(e.code || e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2>Invite collaborator</h2>
          <button className={styles.x} onClick={onClose}>
            ✕
          </button>
        </div>

        <label className={styles.label}>Search username</label>
        <div className={styles.searchWrap}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="type at least 2 letters..."
            autoFocus
          />

          {results.length > 0 && (
            <div className={styles.dropdown}>
              {results.map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  className={styles.item}
                  onMouseDown={() => choose(u)}
                >
                  <span className={styles.name}>{u.username}</span>
                  <span className={styles.uid}>{u.uid.slice(0, 6)}...</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {msg && <p className={styles.msg}>{msg}</p>}

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button onClick={sendInvite} disabled={loading || !isOwner}>
            {loading ? "Sending..." : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default InviteMemberModal;
