import { useState } from "react";
import styles from "./static/UpdateProjectModal.module.css";

function getInitialFormState(project) {
  if (!project) {
    return {
      title: "",
      description: "",
      deadline: "",
    };
  }

  let deadline = "";
  if (project.deadline) {
    const date = new Date(project.deadline);
    if (!Number.isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      deadline = `${yyyy}-${mm}-${dd}`;
    }
  }

  return {
    title: project.title || "",
    description: project.description || "",
    deadline,
  };
}

export default function UpdateProjectModal({
  open,
  onClose,
  onUpdate,
  project,
  onCreate,
}) {
  const initialFormState = getInitialFormState(project);
  const [title, setTitle] = useState(initialFormState.title);
  const [description, setDescription] = useState(initialFormState.description);
  const [deadline, setDeadline] = useState(initialFormState.deadline);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();

    const data = {
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || null,
    };
    setSaving(true);
    if (project) {
      await onUpdate(data, project);
    } else {
      await onCreate(data);
    }
    setSaving(false);
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
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
            >
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
