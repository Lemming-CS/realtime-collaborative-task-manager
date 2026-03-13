import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import Header from "../components/Header";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTasksModal from "../components/EditTasksModal";
import InviteMemberModal from "../components/ InviteMemberModal";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
  documentId,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import styles from "./static/Project.module.css";
import defaultUser from "../assets/defaultUser.png";

function Project() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const me = useStore((s) => s.user);

  const [project, setProject] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [err, setErr] = useState("");
  const [openInvite, setOpenInvite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [collabs, setCollabs] = useState([]);

  const collabsById = useMemo(() => {
    const m = new Map();
    collabs.forEach((u) => m.set(u.uid, u));
    return m;
  }, [collabs]);

  useEffect(() => {
    let alive = true;

    async function loadProject() {
      if (!me?.uid || !projectId) return;

      setLoadingProject(true);
      setErr("");

      try {
        const ref = doc(db, "projects", projectId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          if (alive) {
            setErr("Project not found");
            setAllowed(false);
          }
          return;
        }

        const data = { id: snap.id, ...snap.data() };
        const members = Array.isArray(data.members) ? data.members : [];

        if (!members.includes(me.uid)) {
          if (alive) {
            setAllowed(false);
            navigate("/", { replace: true });
          }
          return;
        }

        if (alive) {
          setProject(data);
          setIsOwner(data.ownerId === me.uid);
          setAllowed(true);
        }
      } catch (e) {
        console.error(e);
        if (alive) setErr(e.code || e.message);
      } finally {
        if (alive) setLoadingProject(false);
      }
    }

    loadProject();
    return () => {
      alive = false;
    };
  }, [me?.uid, projectId, navigate]);

  useEffect(() => {
    let alive = true;

    async function loadCollabs() {
      if (!project?.members || project.members.length === 0) {
        if (alive) setCollabs([]);
        return;
      }

      try {
        const uids = project.members;
        const chunks = [];
        for (let i = 0; i < uids.length; i += 10)
          chunks.push(uids.slice(i, i + 10));

        const all = [];
        for (const chunk of chunks) {
          const q = query(
            collection(db, "users"),
            where(documentId(), "in", chunk),
          );
          const snap = await getDocs(q);
          snap.docs.forEach((d) => all.push({ uid: d.id, ...d.data() }));
        }

        const map = new Map(all.map((u) => [u.uid, u]));
        const ordered = uids.map((uid) => map.get(uid)).filter(Boolean);

        if (alive) setCollabs(ordered);
      } catch (e) {
        console.error(e);
        if (alive) setCollabs([]);
      }
    }

    loadCollabs();
    return () => {
      alive = false;
    };
  }, [project?.members?.join(",")]);

  useEffect(() => {
    if (!allowed || !projectId) return;

    const q = query(
      collection(db, "projects", projectId, "tasks"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (e) => {
        console.error(e);
        setErr(e.code || e.message);
      },
    );

    return () => unsub();
  }, [allowed, projectId]);

  const deleteTask = async (taskId) => {
    setErr("");
    try {
      await deleteDoc(doc(db, "projects", projectId, "tasks", taskId));
    } catch (e) {
      console.log(e.message);
      setErr(e.code || e.message);
    }
  };

  const statusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "to do" || s === "todo") return styles.statusTodo;
    if (s === "in progress") return styles.statusProgress;
    if (s === "done") return styles.statusDone;
    return styles.statusTodo;
  };

  if (loadingProject) {
    return (
      <div className={styles.page}>
        <Header showHome showProfile />
        <p className={styles.muted}>Loading project…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className={styles.page}>
        <Header showHome showProfile />
        <p className="error">{err}</p>
      </div>
    );
  }

  if (!allowed || !project) return null;

  return (
    <>
      <Header showHome showProfile showBell />
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <p className={styles.eyebrow}>Project workspace</p>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{project.title}</h1>
              <span className={styles.roleBadge}>
                {isOwner ? "Owner" : "Member"}
              </span>
            </div>

            {project.description && (
              <p className={styles.desc}>{project.description}</p>
            )}
            {project.deadline && (
              <p className={styles.projectMeta}>Deadline: {project.deadline}</p>
            )}

            {isOwner && (
              <button
                className={styles.inviteBtn}
                onClick={() => setOpenInvite(true)}
              >
                + Add collaborator
              </button>
            )}

            <InviteMemberModal
              open={openInvite}
              onClose={() => setOpenInvite(false)}
              project={{ ...project, id: projectId }}
            />

            <div className={styles.collabBlock}>
              <h3 className={styles.collabTitle}>Collaborators</h3>

              <div className={styles.collabList}>
                {collabs.map((u) => (
                  <button
                    key={u.uid}
                    type="button"
                    className={styles.collabItem}
                    onClick={() => navigate(`/profile/${u.uid}`)}
                    title={`Open ${u.username}'s profile`}
                  >
                    <img
                      className={styles.collabAvatar}
                      src={u.profilePicture || defaultUser}
                      alt={u.username}
                    />
                    <span className={styles.collabName}>
                      {u.username || u.uid.slice(0, 6)}
                      {u.uid === me.uid ? " (you)" : ""}
                      {u.uid === project.ownerId ? " • owner" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.heroSide}>
            <CreateTaskModal
              projectId={projectId}
              members={project.members || []}
            />
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tasks</h2>
          <p className={styles.sectionSub}>
            Track progress, assignments, and deadlines.
          </p>
        </div>

        <div className={styles.taskGrid}>
          {tasks.map((t) => (
            <div key={t.id} className={styles.taskCard}>
              <div className={styles.taskHead}>
                <div className={styles.taskTitleBlock}>
                  <h3 className={styles.taskTitle}>{t.title}</h3>
                  <span
                    className={`${styles.statusChip} ${statusClass(t.status)}`}
                  >
                    {t.status || "To Do"}
                  </span>
                </div>

                <EditTasksModal
                  projectId={projectId}
                  task={t}
                  members={project.members || []}
                />
              </div>

              {t.description && (
                <p className={styles.taskDesc}>{t.description}</p>
              )}

              <div className={styles.metaRow}>
                {t.assignedTo && (
                  <span className={styles.metaPill}>
                    <span className={styles.metaLabel}>Assigned</span>
                    <button
                      type="button"
                      className={styles.assigneeBtn}
                      onClick={() => navigate(`/profile/${t.assignedTo}`)}
                      title="Open assignee profile"
                    >
                      <img
                        className={styles.assigneeAvatar}
                        src={
                          collabsById.get(t.assignedTo)?.profilePicture ||
                          defaultUser
                        }
                        alt="assignee"
                      />
                      {collabsById.get(t.assignedTo)?.username ||
                        t.assignedTo.slice(0, 6)}
                    </button>
                  </span>
                )}

                <span className={styles.metaPill}>
                  <span className={styles.metaLabel}>Priority</span>
                  <span>{t.priority || "Normal"}</span>
                </span>

                {t.deadline?.toDate && (
                  <span className={styles.metaPill}>
                    <span className={styles.metaLabel}>Deadline</span>
                    <span>{t.deadline.toDate().toLocaleDateString()}</span>
                  </span>
                )}
              </div>
              <button
                className={styles.dangerBtn}
                onClick={() => deleteTask(t.id)}
              >
                Delete Task
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Project;
