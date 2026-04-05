import styles from "./static/Home.module.css";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import Header from "../components/Header";
import UpdateProjectModal from "../components/UpdateProjectModal";
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
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function useProjectsFeed(userId) {
  const [feed, setFeed] = useState({
    userId: null,
    projects: [],
    error: "",
  });

  useEffect(() => {
    if (!userId) return;

    const q = fsQuery(
      collection(db, "projects"),
      where("members", "array-contains", userId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setFeed({
          userId,
          projects: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          error: "",
        });
      },
      (error) => {
        console.error(error);
        setFeed({
          userId,
          projects: [],
          error: error.code || "Failed to load projects",
        });
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    projects: feed.userId === userId ? feed.projects : [],
    loading: Boolean(userId) && feed.userId !== userId,
    error: feed.userId === userId ? feed.error : "",
  };
}

function Home() {
  const user = useStore((s) => s.user);
  const userId = user?.uid ?? null;
  const [openCreate, setOpenCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const {
    projects,
    loading: loadingProjects,
    error: projectsError,
  } = useProjectsFeed(userId);

  const errorMessage = actionError || projectsError;

  const createProject = async ({ title, description, deadline }) => {
    setActionError("");
    if (!user?.uid) return;
    if (title.length < 1) {
      setActionError("Please provide a title");
      return;
    }
    const projectRef = doc(collection(db, "projects"));

    const payload = {
      title,
      description: description || "",
      deadline: deadline || null,
      ownerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(projectRef, payload);
      setOpenCreate(false);
      setEditingProject(null);
    }
    catch (e) {
      setActionError(e.message || e.error);
    }
  };

  const updateProject = async ({ title, description, deadline }, project) => {
    setActionError("");
    if (!user?.uid) return;

    const projectRef = doc(db, "projects", project.id);
    const payload = {
      title,
      description: description || "",
      deadline: deadline || null,
    };
    try {
      await updateDoc(projectRef, payload);
      setOpenCreate(false);
      setEditingProject(null);
    } catch (e) {
      if (e.message == "Missing or insufficient permissions.") {
        setActionError("Only owner could edit the project");
      } else {
        setActionError(e.message || e.error);
      }
    }
  };

  const deleteProject = async (projectId) => {
    setActionError("");
    try {
      await deleteDoc(doc(db, "projects", projectId));
    } catch (e) {
      console.error(e);
      setActionError(e.code || e.message);
    }
  };

  const leaveProject = async (projectId) => {
    setActionError("");
    try {
      await updateDoc(doc(db, "projects", projectId), {
        members: arrayRemove(user.uid),
      });
    } catch (e) {
      console.error(e);
      setActionError(e.code || e.message);
    }
  };

  return (
    <div className={styles.container}>
      <Header showProfile showBell />

      <div className={styles.content}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Dashboard</p>
            <h1 className={styles.heading}>Welcome, {user?.username}</h1>
            <p className={styles.subheading}>
              Manage your projects, collaborators, and tasks in real time.
            </p>
          </div>

          <button
            className={styles.primaryCta}
            onClick={() => {
              setEditingProject(null);
              setOpenCreate(true);
            }}
          >
            + Create project
          </button>
        </div>

        {openCreate && (
          <UpdateProjectModal
            key={editingProject?.id || "create"}
            onClose={() => {
              setEditingProject(null);
              setOpenCreate(false);
            }}
            onCreate={createProject}
            onUpdate={updateProject}
            project={editingProject}
          />
        )}

        {loadingProjects && <p className={styles.infoText}>Loading projects…</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}

        {!loadingProjects && !errorMessage && projects.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No projects yet</h3>
            <p>Create your first project to start collaborating.</p>
          </div>
        )}

        <div className={styles.projects}>
          {projects.map((p) => {
            const isOwner = p.ownerId === user.uid;

            return (
              <div key={p.id} className={styles.projectCard}>
                <div className={styles.projectTop}>
                  <div className={styles.projectTitleWrap}>
                    <h2 className={styles.projectTitle}>{p.title}</h2>
                    <span className={styles.badge}>
                      {isOwner ? "Owner" : "Member"}
                    </span>
                  </div>
                </div>

                {p.description && (
                  <p className={styles.desc}>{p.description}</p>
                )}

                {p.deadline && (
                  <p className={styles.metaLine}>
                    <span className={styles.metaLabel}>Deadline</span>
                    <span>{p.deadline}</span>
                  </p>
                )}

                <div className={styles.projectActions}>
                  <div className={styles.topRowButtons}>
                    <button
                      className={styles.openBtn}
                      onClick={() => navigate(`/project/${p.id}`)}
                    >
                      Open
                    </button>
                    {isOwner && (
                      <button
                        className={styles.openBtn}
                        onClick={() => {
                          setEditingProject(p);
                          setOpenCreate(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {isOwner ? (
                    <button
                      className={styles.dangerBtn}
                      onClick={() => deleteProject(p.id)}
                    >
                      Delete project
                    </button>
                  )  : (
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => leaveProject(p.id)}
                      >
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
