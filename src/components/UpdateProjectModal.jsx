import { useState, useEffect } from "react";
import styles from "./static/UpdateProjectModal.module.css";

export default function UpdateProjectModal({ open, onClose, onUpdate, project, onCreate }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
          if (project) {
            setTitle( project.title || "");
            setDescription( project.description || "");
            let date = null;
            try {
              if (project.deadline) {
               date = new Date(project.deadline)
              }
              else {
                setDeadline("")
              }
            }
            catch (e) {
              setDeadline("");
            }
            if (date) {
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, "0");
              const dd = String(date.getDate()).padStart(2, "0");
              setDeadline(`${yyyy}-${mm}-${dd}`);
            }
          }
          else {
            setTitle("");
            setDeadline("");
            setDescription("");
          }
    }, [open, project]);

    if (!open) return null;

    const submit = async (e) => {
      e.preventDefault();

      const data = {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline || null
      };

      if (project) {
        await onUpdate(data, project);
      } else {
        await onCreate(data);
      }

      onClose();
    };

    return (
            <div className={styles.overlay} onMouseDown={onClose}>
            <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
                <h2>{project ? "Edit project" : "Create project"}</h2>

                <form onSubmit={submit} className={styles.form}>
                <label>
                    Title
                    <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Project Title"
                    autoFocus
                    />
                </label>

                <label>
                    Description
                    <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    />
                </label>

                <label>
                    Deadline
                    <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    />
                </label>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.actions}>
                    <button type="button" className={styles.secondary} onClick={onClose}>
                      Cancel
                    </button>
                <button type="submit">
                  {saving ? "Saving..." : project ? "Save" : "Create"}
                </button>
                </div>
                </form>
            </div>
        </div>
    );
    }