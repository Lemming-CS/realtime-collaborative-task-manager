# Realtime Collaborative Task Manager

🔗 **Live Demo:** https://realtime-collaborative-task-manager.vercel.app/

A real-time task tracking tool for small teams — built with React, Zustand, and Firebase.


---

## Features

- **Authentication** — Email/password login, Google & GitHub social login
- **User Profiles** — Edit username, password, and bio (stored in Firestore); delete account; public profile pages (`/profile/:uid`) showing profile picture, bio, and member-since date — accessible to any logged-in user and linkable from project collaborator lists
- **Projects** — Create, edit, and delete projects; invite team members
- **Tasks** — Create tasks with title, status, priority, and assignee
- **Real-time sync** — Task updates appear instantly for all project members via Firebase
- **Dark / Light mode** — Persisted UI theme preference
- **Toast notifications** — Global feedback system via Zustand state
- **Protected routes** — Only authenticated users can access the dashboard

---

## Realtime Architecture

Task updates propagate instantly across clients:

Firestore
→ `onSnapshot` listeners
→ React state updates
→ UI re-render

No polling or manual refresh is required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| State Management | Zustand |
| Backend / Database | Firebase (Firestore + Auth + Storage) — real-time listeners via `onSnapshot` |
| Routing | React Router v7 |
| Build Tool | Vite |
| Deployment | Vercel |

---

## Running Locally

> **Note:** This project uses a private Firebase backend. You would need to provision your own Firebase project to run it locally — Firestore, Authentication (Email/Password, Google, GitHub), and Storage all need to be enabled.

```bash
git clone https://github.com/Lemming-CS/React-Task-Manager.git
cd React-Task-Manager/react-track-tool
npm install
```

Create a `.env` file in `react-track-tool/` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
react-track-tool/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level views (Dashboard, Project, Login...)
│   ├── store/            # Zustand stores (auth, theme, notifications)
│   ├── firebase/         # Firebase config and service helpers
│   └── App.jsx
```

---

## Security

Firestore rules are enforced server-side and cover the following:

- **Users** — public read, but only the owner can write their own profile
- **Projects** — only members can read; only the owner can delete; joining requires a valid pending invite document
- **Tasks** — read/write gated to project members only
- **Invites** — only the invitee can see and accept their invite; only the project owner can create or delete invites

---

## License

MIT