import styles from "./static/Home.module.css";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import Header from "../components/Header";
import CreateProjectModal from "../components/CreateProjectModal";
import {
  collection,
  query as fsQuery,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  arrayRemove,
  setDoc,
  serverTimestamp,
  documentId,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function Home() {
  const user = useStore((s) => s.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    setErr("");

    const q = fsQuery(
      collection(db, "projects"),
      where("members", "array-contains", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setErr(error.code || "Failed to load projects");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const createProject = async ({ title, description, deadline }) => {
    setErr("");
    if (!user?.uid) return;

    const projectRef = doc(collection(db, "projects"));

    const payload = {
      title,
      description: description || "",
      deadline: deadline || null,
      ownerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
    };

    await setDoc(projectRef, payload); 
  };

  const deleteProject = async (projectId) => {
    setErr("");
    try {
      await deleteDoc(doc(db, "projects", projectId));
    } catch (e) {
      console.error(e);
      setErr(e.code || e.message);
    }
  };

  const leaveProject = async (projectId) => {
    setErr("");
    try {
      await updateDoc(doc(db, "projects", projectId), {
        members: arrayRemove(user.uid),
      });
    } catch (e) {
      console.error(e);
      setErr(e.code || e.message);
    }
  };

  return (
    <div className={styles.container}>
      <Header showProfile showBell/>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <h1>Welcome, {user?.username}</h1>
          <button onClick={() => setOpenCreate(true)}>+ Create project</button>
        </div>

        <CreateProjectModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreate={createProject}
        />

        {loading && <p>Loading projects…</p>}
        {err && <p className="error">{err}</p>}

        {!loading && !err && projects.length === 0 && (
          <p>No projects yet. Create your first one</p>
        )}

        <div className={styles.projects}>
          {projects.map((p) => {
            const isOwner = p.ownerId === user.uid;
            return (
              <div key={p.id} className={styles.projectCard}>
                <div className={styles.projectTop}>
                  <h2 className={styles.projectTitle}>
                    {p.title}
                  </h2>
                  <span className={styles.badge}>
                    {isOwner ? "Owner" : "Member"}
                  </span>
                </div>

                {p.description && <p className={styles.desc}>{p.description}</p>}
                {p.deadline && <p className={styles.desc}>Deadlne: {p.deadline}</p>}
                <div className={styles.projectActions}>
                  <button onClick={() => navigate(`/project/${p.id}`)}>Open</button>
                  {isOwner ? (
                    <button onClick={() => deleteProject(p.id)}>
                      Delete project
                    </button>
                  ) : (
                    <button onClick={() => leaveProject(p.id)}>
                      Leave project
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;