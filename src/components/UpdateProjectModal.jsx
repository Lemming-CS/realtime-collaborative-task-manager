import { useState } from "react";
import styles from "./static/UpdateProjectModal.module.css";

function formatDeadline(deadline) {
  if (!deadline) return "";

  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function UpdateProjectModal({
  onClose,
  onUpdate,
  project,
  onCreate,
}) {
  const isEditing = Boolean(project);
  const [title, setTitle] = useState(() => project?.title || "");
  const [description, setDescription] = useState(() => project?.description || "");
  const [deadline, setDeadline] = useState(() => formatDeadline(project?.deadline));
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const data = {
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || null,
    };
    setSaving(true);
    if (isEditing) {
      await onUpdate(data, project);
    } else {
      await onCreate(data);
    }
    setSaving(false);
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{isEditing ? "Edit project" : "Create project"}</h2>

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
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit">
              {saving ? "Saving..." : isEditing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
