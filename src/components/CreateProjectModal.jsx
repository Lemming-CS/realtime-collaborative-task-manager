import { useState } from "react";
import styles from "./static/CreateProjectModal.module.css";
import { serverTimestamp } from "firebase/firestore";

export default function CreateProjectModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const t = title.trim();
    const d = description.trim();

    if (t.length < 3) return setError("Title must be at least 3 characters.");
    if (t.length > 60) return setError("Title is too long (max 60).");
    if (d.length > 500) return setError("Description is too long (max 500).");

    await onCreate({
      title: t,
      description: d,
      deadline: deadline ? deadline : null,
    });

    setTitle("");
    setDescription("");
    setDeadline("");
    onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <h2>Create project</h2>

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
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}