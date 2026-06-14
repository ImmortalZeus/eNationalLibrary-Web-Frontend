# eNationalLibrary — Frontend

Web client for the eNationalLibrary system, built with React 19 and Vite.

This repository contains only the **frontend** SPA. The backend lives in a separate repo: [eNationalLibrary-Web-Backend](https://github.com/ImmortalZeus/eNationalLibrary-Web-Backend).

---

## 🧱 Tech Stack

- **Framework**: React 19
- **Build tool**: Vite 8
- **HTTP client**: Axios (with JWT interceptor)
- **Auth**: JWT, decoded client-side via `jwt-decode`
- **Styling**: Plain CSS (no UI framework)
- **Routing**: Custom page switch in `App.jsx` (no router library)

---

## ✨ Features

The app is a single-page client with three main areas:

### Public
- **Home** — landing page with featured books, features, hero, footer
- **Login** — sign in as admin or reader
- **Register** — create a new reader account

### Reader (authenticated, role = `Reader`)
- **Reader dashboard** — recommended / featured books
- **Browse books** — search and filter the catalog
- **Book detail** — full book info, borrow, submit / read reviews
- **My records** — borrow and return history
- **Reading card** — view library card details
- **Profile** — account information

### Admin (authenticated, role = `Admin`)
- **Admin dashboard** — system overview
- **Manage books / authors / genres / publishers** — full CRUD on the catalog
- **Manage readers** — reader accounts
- **Manage admins** — admin accounts
- **Manage reading cards**
- **Manage borrow records**
- **Manage reviews**

---

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets served as-is
├── src/
│   ├── main.jsx                # Entry point — mounts <App/> inside <AuthProvider>
│   ├── App.jsx                 # Root component — page switching + auth-aware routing
│   ├── App.css / index.css     # Global styles
│   ├── assets/                 # Images and icons
│   ├── components/             # Reusable UI
│   │   ├── BookCard.tsx
│   │   ├── BorrowModal.tsx
│   │   ├── FeaturedBooksSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Navbar.tsx
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       └── ui.tsx
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state, token + readerId in localStorage
│   ├── data/
│   │   └── constants.ts        # Static constants used by the UI
│   ├── pages/                  # One component per screen
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── guest/              # Reader-facing pages
│   │   │   ├── ReaderDashboard.tsx
│   │   │   ├── BrowsebooksPage.tsx
│   │   │   ├── BookDetailPage.tsx
│   │   │   ├── MyRecordsPage.tsx
│   │   │   ├── ReadingCardPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   └── admin/              # Admin-facing pages
│   │       ├── AdminApp.tsx
│   │       ├── AdminDashboard.tsx
│   │       ├── ManageAdminsPage.tsx
│   │       ├── ManageAuthorsPage.tsx
│   │       ├── ManageBooksPage.tsx
│   │       ├── ManageBorrowRecordsPage.tsx
│   │       ├── ManageGenresPage.tsx
│   │       ├── ManagePublishersPage.tsx
│   │       ├── ManageReadersPage.tsx
│   │       ├── ManageReadingCardsPage.tsx
│   │       └── ManageReviewsPage.tsx
│   ├── services/               # Axios client + one module per backend resource
│   │   ├── api.ts              # base axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── book.service.ts
│   │   ├── reader.service.ts
│   │   ├── admin.service.ts
│   │   ├── author.service.ts
│   │   ├── genre.service.ts
│   │   ├── publisher.service.ts
│   │   ├── borrow-record.service.ts
│   │   ├── reading-card.service.ts
│   │   └── review.service.ts
│   └── types/
│       └── index.ts            # Shared TypeScript-style DTOs and enums
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## ✅ Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- The **eNationalLibrary backend** running and reachable — by default at `http://localhost:3000/api`. See the [backend README](https://github.com/ImmortalZeus/eNationalLibrary-Web-Backend) for setup.

---

## ⚙️ Environment Variables

Vite reads variables prefixed with `VITE_` from a `.env` file at the project root.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | no | `http://localhost:3000/api` | Base URL of the backend API |

Example `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

> ⚠️ Restart the dev server after changing `.env`.

---

## 📦 Installation

```bash
git clone https://github.com/ImmortalZeus/eNationalLibrary-Web-Frontend.git
cd eNationalLibrary-Web-Frontend
npm install
```

---

## ▶️ Running the App

```bash
# development server (HMR)
npm run dev
```

The dev server is available at:

```
http://localhost:5173
```

It is preconfigured to talk to the backend at `http://localhost:3000`, and CORS on the backend is set to accept requests from `http://localhost:5173`.

### Production build

```bash
npm run build      # output to dist/
npm run preview    # serve the production build locally
```

### Lint

```bash
npm run lint
```

---

## 🔐 Authentication

- The login page calls `POST /auth/login` on the backend and stores the returned JWT in `localStorage` under the key `accessToken`.
- A second key, `readerId`, is also persisted for reader-specific flows.
- The Axios client (`src/services/api.ts`) automatically attaches the token to every request:
  ```
  Authorization: Bearer <accessToken>
  ```
- On a `401` response the token is cleared from `localStorage`.
- `AuthContext` (`src/context/AuthContext.tsx`) decodes the JWT to expose `user`, `role`, and `readerId` to the rest of the app via the `useAuth()` hook.
- After login, `App.jsx` routes the user to either the admin area or the reader dashboard based on their role.

---

## 🛣️ Routing Model

There is no router library. `App.jsx` keeps a `page` state and conditionally renders the matching page component. Pages can navigate by calling the `onNavigate` / `onLogout` callbacks passed down as props.

| `page` value | Component |
|--------------|-----------|
| `home` | `HomePage` |
| `login` | `LoginPage` |
| `register` | `RegisterPage` |
| `readerDashboard` | `ReaderDashboard` |
| `browseBooks` | `BrowsebooksPage` |
| `bookDetail` | `BookDetailPage` |
| `myRecords` | `MyRecordsPage` |
| `readingCard` | `ReadingCardPage` |
| `profile` | `ProfilePage` |
| `admin` | `AdminApp` (and its inner admin pages) |

---

## 📜 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |

---

## 👥 Group Members

- Đặng Trung Anh — 20235583
- Hoàng Gia Nam Anh — 20235584
- Phạm Đức Duy — 20235588
- Nguyễn Thái Anh Minh — 20235605
- Trần Tiến Sơn — 20235620

---

✍️ *Group project for the Introduction to Software Engineering course.*
