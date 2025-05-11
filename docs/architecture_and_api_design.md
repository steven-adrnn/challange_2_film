# Architecture Overview and API Endpoint Design

## Architecture Overview

The Short Film Festival Web Application consists of three main components:

1. **Backend API Server**
   - Built with Node.js and Express.
   - Uses Sequelize ORM to interact with PostgreSQL database hosted on Supabase.
   - Handles authentication and authorization using JWT with Role-Based Access Control (RBAC).
   - Manages file uploads for film videos and thumbnails, storing files locally and saving relative paths in the database.
   - Exposes RESTful API endpoints for managing users, films, artists, genres, and authentication.
   - Implements pagination, search, and filtering capabilities.

2. **Frontend Web Application**
   - Built with React and Material UI.
   - Provides separate dashboards for Admin and Viewer roles.
   - Implements login and registration pages.
   - Admin dashboard allows film management (upload, update, publish), artist and genre CRUD.
   - Viewer dashboard allows browsing and searching films.
   - Implements role-based routing and access control to restrict pages based on user roles.
   - Communicates with backend API for data operations.

3. **Database**
   - PostgreSQL database hosted on Supabase.
   - Contains tables for users, films, artists, genres, and join tables for many-to-many relationships.
   - Stores metadata and relative file paths for uploaded media.

4. **File Storage**
   - Local file system storage for uploaded videos and thumbnails.
   - Paths stored in the database for retrieval.

---

## API Endpoint Design

### Authentication

| Method | Endpoint          | Description                  | Request Body                          | Response                          | Auth Required | Roles Allowed |
|--------|-------------------|------------------------------|-------------------------------------|----------------------------------|---------------|---------------|
| POST   | /api/auth/register| Register new user             | { email, username, password, role } | { message, user }                 | No            | -             |
| POST   | /api/auth/login   | Login user                   | { email, password }                  | { token, user }                   | No            | -             |
| POST   | /api/auth/logout  | Logout user                  | -                                   | { message }                      | Yes           | admin, viewer |

---

### Films

| Method | Endpoint              | Description                  | Request Body / Params               | Response                          | Auth Required | Roles Allowed |
|--------|-----------------------|------------------------------|-----------------------------------|----------------------------------|---------------|---------------|
| POST   | /api/films            | Create new film with upload  | multipart/form-data: video file, thumbnail file, metadata (title, description, duration, artistIds, genreIds, published) | { film }                        | Yes           | admin         |
| PUT    | /api/films/:id        | Update film info and files   | multipart/form-data or JSON with updated fields and optional files | { film }                        | Yes           | admin         |
| GET    | /api/films            | List films with pagination   | Query params: page, limit         | { films: [], total, page, limit }| Yes           | admin, viewer |
| GET    | /api/films/search     | Search films                 | Query params: q (search term), genreIds, artistIds, sortBy, page, limit | { films: [], total, page, limit }| Yes           | admin, viewer |
| GET    | /api/films/:id        | Get film details             | -                                 | { film }                        | Yes           | admin, viewer |
| GET    | /api/films/:id/video  | Get film video URL           | -                                 | { videoUrl }                    | Yes           | admin, viewer |
| GET    | /api/films/:id/thumbnail | Get film thumbnail URL     | -                                 | { thumbnailUrl }                | Yes           | admin, viewer |

---

### Artists

| Method | Endpoint          | Description                  | Request Body                      | Response                        | Auth Required | Roles Allowed |
|--------|-------------------|------------------------------|---------------------------------|--------------------------------|---------------|---------------|
| POST   | /api/artists      | Create new artist             | { name }                        | { artist }                    | Yes           | admin         |
| GET    | /api/artists      | List all artists              | -                               | [artists]                     | Yes           | admin, viewer |
| PUT    | /api/artists/:id  | Update artist                | { name }                        | { artist }                    | Yes           | admin         |
| DELETE | /api/artists/:id  | Delete artist                | -                               | { message }                  | Yes           | admin         |

---

### Genres

| Method | Endpoint          | Description                  | Request Body                      | Response                        | Auth Required | Roles Allowed |
|--------|-------------------|------------------------------|---------------------------------|--------------------------------|---------------|---------------|
| POST   | /api/genres       | Create new genre              | { name }                        | { genre }                     | Yes           | admin         |
| GET    | /api/genres       | List all genres               | -                               | [genres]                      | Yes           | admin, viewer |
| PUT    | /api/genres/:id   | Update genre                 | { name }                        | { genre }                     | Yes           | admin         |
| DELETE | /api/genres/:id   | Delete genre                 | -                               | { message }                  | Yes           | admin         |

---

## Authentication & Authorization

- JWT tokens issued on login, containing user ID and role.
- Middleware to verify token and extract user info.
- RBAC middleware to restrict access to routes based on roles.
- Unauthenticated users redirected to login page on frontend.

---

## Pagination & Search

- Pagination parameters: `page` (default 1), `limit` (default 10).
- Search supports filtering by title, description, artist names, genre names.
- Sorting options: by created_at, title, duration.

---

## File Upload

- Use `multipart/form-data` for film creation and update endpoints.
- Store relative file paths in the database.

---