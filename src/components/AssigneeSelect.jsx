import { useEffect, useState } from "react";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { db } from "../firebase/config";
import defaultUser from "../assets/defaultUser.png";

const EMPTY_MEMBER_IDS = [];

export default function AssigneeSelect({ membersUids, value, onChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const uids = Array.isArray(membersUids) ? membersUids : EMPTY_MEMBER_IDS;

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!uids.length) {
        if (alive) setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const chunks = [];
        for (let i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));

        const all = [];
        for (const chunk of chunks) {
          const q = query(collection(db, "users"), where(documentId(), "in", chunk));
          const snap = await getDocs(q);
          snap.docs.forEach((d) => all.push({ uid: d.id, ...d.data() }));
        }

        const map = new Map(all.map((u) => [u.uid, u]));
        const ordered = uids.map((id) => map.get(id)).filter(Boolean);

        if (alive) setUsers(ordered);
      } catch (e) {
        console.error(e);
        if (alive) setUsers([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [uids]);

  const selectedUser = users.find((u) => u.uid === value);

  return (
    <div>
      <label style={{ display: "block", marginBottom: 6, opacity: 0.9 }}>
        Assigned to
      </label>


      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || "")}
        disabled={loading}
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.uid} value={u.uid}>
            {u.username || u.uid.slice(0, 6)}
          </option>
        ))}
      </select>

      {selectedUser && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, opacity: 0.95 }}>
          <img
            src={selectedUser.profilePicture || defaultUser}
            alt={selectedUser.username}
            style={{ width: 28, height: 28, borderRadius: "50%" }}
          />
          <span>{selectedUser.username || selectedUser.uid}</span>
        </div>
      )}

      {!loading && uids.length === 0 && (
        <p style={{ marginTop: 8, opacity: 0.75, fontSize: 13 }}>
          No collaborators to assign (only you in the project).
        </p>
      )}
    </div>
  );
}
