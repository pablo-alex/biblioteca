# Local Library Website — Master Specification for Codex

## 1. Purpose

Build a small, polished web application for a single local physical library.

The application has two clearly separated areas:

- A public-facing library catalog where visitors can discover and inspect books.
- A protected administration area used by up to two library administrators to manage books, users, loans, returns, and basic library information.

The website is primarily a catalog and internal library-management tool. Borrowing is performed physically at the library reception; visitors do not request or reserve books online.

The application should be intentionally simple, maintainable, and appropriate for a single library with approximately 1,000 books and low daily activity.

---

## 2. Core Product Principles

- Favor simplicity and maintainability over architectural complexity.
- PostgreSQL is the source of truth.
- The in-memory book cache is only a temporary read representation for the public catalog.
- The public site should feel like a real physical library translated into a modern digital experience.
- The visual identity must be derived from the provided reference assets rather than from a generic template.
- Give the implementation agent reasonable freedom over UI details, page composition, component choices, and interaction patterns.
- Do not over-engineer the project.

### Explicit non-goals

Do not introduce the following unless explicitly requested later:

- Microservices.
- Redis.
- Message queues.
- WebSockets.
- Kubernetes.
- Multiple backend services.
- A separate frontend deployment.
- Public user accounts.
- Public user authentication.
- Online reservations.
- Online loan requests.
- Payments.
- Notifications.
- Barcode or QR-based copy management.
- Per-copy inventory records.
- Multi-branch architecture.
- Analytics platforms or complex business intelligence.
- Any other infrastructure whose complexity is disproportionate to this project.

---

## 3. Existing Architecture Decisions

### Application

Use a single Express application/process.

- Backend and frontend are served by the same application.
- The frontend is served with `express.static()`.
- API endpoints use the same origin.
- Do not introduce CORS or cross-site cookie architecture.

The frontend technology is intentionally not fixed. The implementation agent may choose an appropriate modern frontend approach that works naturally within this architecture and supports a distinctive, polished visual experience.

### Hosting

Initial hosting target:

- Render.

The architecture should remain portable enough for a future VPS migration without requiring a fundamental rewrite.

Future infrastructure migration may be:

- Render process → PM2/systemd.
- Render HTTPS → Nginx/Caddy + Let's Encrypt.
- Render environment variables → `.env`.

### Database

Use:

- Neon PostgreSQL.

PostgreSQL is the authoritative source of truth for books, users, loans, and administrative data.

---

## 4. References and Visual Identity

The project root must contain:

```text
references/
├── banner.png	       # optional
└── frontis.png        # optional
```

### `references/logo.png`

This file is optional.

Before implementing the visual system, inspect the banner and derive design guidance from it, including where determinable:

- Color palette.
- Typography characteristics.
- Visual proportions.
- Brand personality.
- Shape language.
- General visual identity.

Do not claim an exact font family if it cannot be reliably determined from the image. The banner only work as isnpiration.


### `references/frontis.png`

This file is optional.

If present:

- Inspect it.
- Use it as visual inspiration for the physical library.
- Do not force its use.
- Its absence must never cause an error or prevent development.

### Visual direction

The desired aesthetic is:

**Warm, cozy, welcoming library + modern web design.**

The site should feel connected to a physical library, while still looking contemporary, clean, elegant, and pleasant to use.

Avoid:

- Generic SaaS dashboard aesthetics on the public site.
- Overly sterile/minimal corporate design.
- Excessive visual effects.
- Design complexity that harms usability.

---

## 5. Impeccable and Agent/Tool Setup

Before beginning implementation, inspect the available Codex skills, agents, tools, and project configuration.

The project is expected to use the **Impeccable** skill for UI/UX refinement.

Verify that:

1. Impeccable is actually available and correctly configured.
2. The project can invoke/use it as intended.
3. Its capabilities are understood before major UI implementation begins.

If an image-generation capability or agent/tool is available in the Codex environment, it may be used when appropriate for project assets or visual exploration.

Do not assume that an unavailable image-generation tool exists.

The application must remain fully functional without image generation.

Do not add unnecessary agents or configuration merely for the sake of adding them. Only add project-specific agents/rules/configuration if they provide a clear practical benefit.

---

## 6. Public Website

The public website is primarily a library catalog.

### Public users can:

- Browse active books.
- Search by title.
- Search by author.
- Use autocomplete while searching.
- Filter by genre.
- Open a book detail modal.
- See availability.

### Public users cannot:

- Log in.
- Create an account.
- Request a loan.
- Reserve a book.
- Return a book.

The public interface should make it clear, through appropriate UI copy, that physical borrowing takes place at the library reception.

---

## 7. Public Catalog Search

Search must run server-side over the in-memory book cache.

Do not query Neon directly for each public search.

Search fields:

- Title.
- Author.

Autocomplete:

- Start after approximately 2–3 characters.
- Results should be concise.
- A small book-cover thumbnail/preview may be shown in autocomplete results when an image exists.

The implementation agent may decide the exact interaction and visual presentation.

### Genre filter

Provide a genre filter.

A book can belong to multiple genres.

The public site does not need dedicated genre landing pages or separate genre sections. A filter is sufficient.

---

## 8. Book Detail Modal

Do not create a separate public route for every book unless there is a strong implementation reason.

The preferred interaction is:

**Book card → detail modal.**

The modal should present the complete available book information, including:

- Large cover image.
- Title.
- Author.
- ISBN, if present.
- Genres.
- Publication year.
- Publisher.
- Synopsis.
- Language.
- Number of pages.
- Total physical copies.
- Available physical copies.

Example availability:

> 3 of 5 available

or an equivalent natural UI presentation.

### Missing cover

If no image is available, display a designed placeholder with wording such as:

> Portada no disponible

The implementation agent may design the placeholder so that it fits the site's visual identity.

---

## 9. Book Data Model

One database book row represents a title with multiple physical copies.

Example:

```text
Title: The Little Prince
Quantity: 5
Available: 3
```

This means two copies are currently loaned.

There is no individual physical-copy table.

There are no barcode or QR requirements.

### Suggested conceptual fields

The final SQL schema should include appropriate versions of:

- `id`
- `isbn` — optional, unique when present
- `titulo` — required
- `autor` — required
- `generos` — multiple genres
- `anio_publicacion`
- `editorial`
- `sinopsis`
- `idioma`
- `paginas`
- `imagen_url`
- `imagen_public_id`
- `cantidad`
- `disponible`
- `activo`
- `fecha_registro`

Use suitable PostgreSQL types and constraints.

### ISBN

ISBN is:

- Optional.
- A string.
- Unique when present.
- Not rigidly restricted to exactly 13 characters, because ISBN-10 and formatted values may exist.

Do not unnecessarily reject legitimate ISBN representations.

### Genres

A book may have multiple genres.

For this project, prefer a simple PostgreSQL array such as:

```sql
generos TEXT[]
```

rather than introducing a `generos` table and many-to-many relationship.

Keep the available genre values controlled by application configuration so that the list can be edited without unnecessary database complexity.

The seed format should remain simple:

```json
{
  "titulo": "The Hobbit",
  "autor": "J. R. R. Tolkien",
  "generos": ["Fantasy", "Adventure"]
}
```

---

## 10. Book Quantity and Availability

`cantidad` represents the total number of physical copies.

`disponible` represents the number of copies currently available to lend.

When a book is initially seeded:

- If `cantidad` is omitted, default to `1`.
- If `cantidad = 3`, initialize `disponible = 3`.

The administrator must not directly edit `disponible`.

Availability is changed as a consequence of loan and return operations.

### Quantity editing

Admins may edit the total quantity.

However, the new quantity must never be lower than the number of copies currently loaned.

For example:

```text
Quantity = 5
Available = 2
Loaned = 3
```

The administrator cannot change quantity to `2`.

The implementation should enforce the relevant business rule transactionally.

---

## 11. Soft Deletion of Books

Books must not be physically deleted when they are no longer active.

Use:

```text
activo = false
```

for deactivation.

Inactive books:

- Do not appear in the public catalog.
- Cannot receive new loans.
- Remain in PostgreSQL.
- Retain their historical loan relationships.
- Can be viewed by administrators.
- Can be reactivated by administrators.

The UI should distinguish active and inactive books clearly.

---

## 12. Users

Library users are internal records only.

They do not have accounts or passwords.

Fields:

- Full name — required.
- Phone/cellphone — optional.
- National ID / CI — required and unique.
- Address — optional.
- `activo` — required.

CI must be stored as a string because values may contain letters or separators, for example:

```text
8969130-F
```

### User deactivation

Users may be deactivated.

An inactive user:

- Cannot receive a new loan.
- Normally should not appear in active-user autocomplete.
- Retains all previous loan history.

---

## 13. User Search in Admin

When registering loans, administrators need fast user lookup.

Provide autocomplete/search by:

- Name.
- CI.

The autocomplete may display both the name and the other identifying value to help the administrator select the correct person.

The implementation agent may choose the exact UI.

---

## 14. Loans

Borrowing occurs physically at the library reception.

Only an administrator records a loan.

A user can have any number of simultaneous active loans. There is no configured maximum.

Each borrowed book is represented by its own loan record.

Example:

```text
User A
├── Loan: Book 1
├── Loan: Book 2
└── Loan: Book 3
```

### Loan fields

The loan record should conceptually include:

- `id`
- `usuario_id`
- `libro_id`
- `fecha_prestamo`
- `fecha_limite`
- `fecha_devolucion`
- `detalles` — optional text
- `admin_prestamo_id`
- `admin_devolucion_id`

Additional timestamps/fields may be added if they are useful and remain simple.

### Loan details

`detalles` is an optional free-text field.

It can be used by the administrator for notes such as:

- A particular physical-copy identifier, if the library has one informally.
- A special observation about the copy.
- An observation related to the transaction.

The system does not manage these identifiers as structured inventory data.

---

## 15. Loan Due Date

The default loan period is:

**7 days.**

When creating a loan:

- The due date should default to 7 days after the loan date.
- The administrator may extend/change the due date at registration.

Dates are informational and operational.

The system must NOT block loans or returns merely because a loan is overdue.

### Derived loan status

Do not require administrators to manually maintain a status field unless there is a compelling implementation reason.

Status can be derived:

- `fecha_devolucion IS NULL` → Active.
- `fecha_devolucion IS NOT NULL` → Returned.
- Active + due date in the past → Overdue.

Use an appropriate timezone/date strategy consistently.

---

## 16. Loan Creation Transaction

Loan creation must safely update availability.

Conceptually:

```text
BEGIN TRANSACTION

1. Verify the book is active.
2. Verify available copies > 0.
3. Create the loan.
4. Decrement available copies by 1.

COMMIT
```

If there are no available copies, the operation must fail without creating a loan.

Use a simple database-level concurrency-safe approach. Do not introduce Redis or distributed locking.

---

## 17. Return Transaction

Returning a book should:

1. Verify that the selected loan exists and is still active.
2. Set `fecha_devolucion`.
3. Record the administrator responsible for the return.
4. Increment the corresponding book's available copies.

These operations should be performed transactionally.

A loan that has already been returned must not be returned twice.

---

## 18. Admin Loan/Book Autocomplete

When creating a loan:

- Search users by name/CI.
- Search active books by title/author.
- Show a useful thumbnail preview for books when available.

The administrator should not have to manually enter a book database ID.

The exact form and workflow are left to the implementation agent.

---

## 19. User Loan History

Administrators should be able to open a user's details and see a simple loan history.

It should include at least:

- Book.
- Loan date.
- Return date.
- Status.

Example:

```text
Book                  Loan date    Return date    Status
The Little Prince     01/09/2026   07/09/2026     Returned
1984                  10/09/2026   —              Active
Cien años de soledad  01/08/2026   —              Overdue
```

Keep this interface simple. No complex analytics are required.

---

## 20. Admin Authentication

There are at most two fixed administrators.

Both administrators have exactly the same permissions.

Use a simple session-based authentication approach.

Initial architecture:

- `express-session`
- In-memory session storage
- bcrypt password hashing
- `httpOnly` cookies
- `secure` cookies in production
- `sameSite: 'lax'`

This is acceptable for the current single-process/small-scale deployment.

If the application is later scaled to multiple instances, the session architecture can be revisited.

Do not introduce a full identity-management platform.

---

## 21. Admin Area

The admin area should provide, at minimum:

- Login.
- Dashboard.
- Books management.
- Users management.
- Loans/returns.
- History.

Both administrators have the same permissions.

### Book management

Admins can:

- Create books.
- Edit books.
- Deactivate books.
- Reactivate books.
- Change quantity subject to business rules.
- Edit genres.
- Add/replace/remove a cover image.
- View complete book information.

### User management

Admins can:

- Create users.
- Edit users.
- Deactivate/reactivate users.
- View user details.
- View loan history.

### Loans

Admins can:

- Register loans.
- Register returns.
- View active loans.
- View overdue loans.
- View historical loans.

---

## 22. Dashboard

The dashboard should contain only general library statistics.

Possible cards:

- Total books/titles.
- Total physical copies.
- Available copies.
- Loaned copies.
- Registered users.
- Active loans.

A simple overdue indicator/list may be included if useful, but do not turn the dashboard into an analytics system.

---

## 23. Cloudinary Image Architecture

Cloudinary is used for book cover images.

The database should retain at least:

- `imagen_url`
- `imagen_public_id`

The original uploaded image can be transformed by Cloudinary into different display variants.

Do not store duplicate physical image files merely to support thumbnails.

For example:

```text
Original Cloudinary asset
├── Large/detail transformation
└── Small/thumbnail transformation
```

The implementation may generate transformation URLs dynamically.

---

## 24. Seed Process

The seed process is a local script.

The source is:

```text
seed/
├── libros.json
└── imagenes/
```

The flow is:

```text
libros.json
    ↓
Read book
    ↓
Find corresponding local image
    ↓
If image exists → upload to Cloudinary
    ↓
Receive secure URL/public ID
    ↓
Insert book into PostgreSQL
```

Important:

- The seed must NOT fail the entire process because one image is missing.
- If the image field is null, create the book without an image.
- If the image filename is specified but the file does not exist, create the book with image fields null.
- The frontend then displays the "Portada no disponible" placeholder.

### Seed quantity

There is no strict hard limit of 100 books.

The expected initial catalog is approximately 1,000 books.

### Seed quantity defaults

If `cantidad` is missing:

```text
cantidad = 1
disponible = 1
```

If:

```text
cantidad = 3
```

then:

```text
cantidad = 3
disponible = 3
```

The seed should validate input appropriately and provide useful errors for genuinely invalid records.

---

## 25. Seed Example

A representative seed file may look like:

```json
[
  {
    "titulo": "El Principito",
    "autor": "Antoine de Saint-Exupéry",
    "generos": ["Literatura infantil", "Ficción"],
    "imagen": "el-principito.jpg"
  },
  {
    "isbn": "978-0060883287",
    "titulo": "Cien años de soledad",
    "autor": "Gabriel García Márquez",
    "generos": ["Realismo mágico", "Ficción"],
    "anio_publicacion": 1967,
    "editorial": "Harper Perennial",
    "sinopsis": "La historia de varias generaciones de la familia Buendía en el pueblo ficticio de Macondo.",
    "idioma": "Español",
    "paginas": 417,
    "cantidad": 3,
    "imagen": "cien-anos-de-soledad.jpg"
  },
  {
    "isbn": "978-0451524935",
    "titulo": "1984",
    "autor": "George Orwell",
    "generos": ["Distopía", "Ciencia ficción"],
    "anio_publicacion": 1949,
    "editorial": "Signet Classics",
    "sinopsis": "Una sociedad totalitaria donde el Estado ejerce un control extremo sobre la información, la conducta y el pensamiento.",
    "idioma": "Inglés",
    "paginas": 328,
    "cantidad": 2,
    "imagen": null
  }
]
```

This is illustrative. The final implementation may use equivalent field naming conventions if they are applied consistently.

---

## 26. Database Schema

Create:

```text
database/schema.sql
```

The file must be executable in the Neon SQL editor before running the seed.

It should contain:

- All tables.
- Primary keys.
- Foreign keys.
- Unique constraints.
- Check constraints.
- Useful indexes.
- Appropriate defaults.
- Referential behavior appropriate for historical loan data.

It must NOT contain the approximately 1,000 initial book records.

The seed remains responsible for initial book data.

The schema should preserve historical relationships when books/users become inactive.

---

## 27. Cache Strategy

The public catalog uses an in-memory cache.

Conceptually:

```text
PostgreSQL
    ↓
Load active/catalog data
    ↓
Express memory cache
    ↓
Public search/filter/detail
```

The public catalog must not issue a Neon query for every visitor search/filter action.

### Cache initialization

Load the catalog into memory when the application starts.

Because Render's free tier may sleep, the first request after wake-up may cause the application to load the catalog from PostgreSQL again. This is accepted.

### Cache invalidation

When an administrator:

- Creates a book.
- Edits a book.
- Deactivates/reactivates a book.

invalidate/rebuild the relevant cache.

For loans and returns, do not reload all ~1,000 books unnecessarily.

After a successful database transaction:

- Loan → update only the affected book's `disponible` in cache.
- Return → update only the affected book's `disponible` in cache.

PostgreSQL remains authoritative.

---

## 28. Error Handling

Errors should be useful and understandable.

For duplicate ISBN:

- The database unique constraint should be authoritative.
- The application should handle the PostgreSQL error cleanly and present an understandable message to the administrator.

Do not add unnecessary duplicate-check queries merely to reproduce a database constraint.

Handle expected business-rule failures such as:

- No available copies.
- Inactive book.
- Inactive user.
- Invalid/expired session.
- Already returned loan.
- Invalid quantity reduction.

---

## 29. Validation

Validate input at appropriate boundaries.

Important rules include:

- Required book title.
- Required book author.
- CI required and unique.
- Phone optional.
- Address optional.
- ISBN optional and unique when present.
- Quantity must be a valid positive integer.
- Available copies must never become negative.
- Available copies must never exceed total quantity.
- Quantity cannot be reduced below currently loaned copies.
- Loan requires an active user.
- Loan requires an active book.
- Loan requires an available copy.
- Return requires an active loan.
- Loan due date defaults to seven days but may be changed by the administrator.
- Missing cover image must not prevent book creation.

---

## 30. Security

Keep security appropriate for the scale while following good practices.

At minimum:

- Hash admin passwords with bcrypt.
- Use secure session cookies.
- Protect admin routes with authentication middleware.
- Do not expose database credentials to the browser.
- Do not expose Cloudinary server credentials to the browser.
- Validate/sanitize user-provided input appropriately.
- Use parameterized SQL queries.
- Keep secrets in environment variables.
- Avoid logging passwords, session secrets, database credentials, or Cloudinary secrets.

If direct browser-to-Cloudinary uploads are used, use an appropriately secured upload mechanism such as a signed upload flow rather than exposing a privileged API secret.

---

## 31. Project Structure

Start from a mostly blank project.

The structure should approximately contain:

```text
biblioteca/
├── CODEX.md
├── references/
│   ├── logo.png
│   └── frontis.png
├── seed/
│   ├── libros.json
│   └── imagenes/
├── database/
│   └── schema.sql
├── ...
```

The implementation agent may choose the remaining directories/files according to the selected frontend/backend organization.

Do not create a complicated monorepo unless there is a clear reason.

---

## 32. UI/UX Freedom

The project requirements intentionally define behavior and business rules more strongly than exact visual layouts.

The implementation agent has freedom to decide:

- Exact page layouts.
- Navigation structure.
- Card design.
- Modal composition.
- Form layouts.
- Tables.
- Responsive behavior.
- Component architecture.
- Micro-interactions.
- Typography pairing.
- Spacing system.
- Animation level.

The design must remain consistent with:

**Warm, cozy, welcoming, modern physical-library identity.**

Use the logo and optional frontis image as primary visual references.

Use Impeccable to critique and refine the visual experience where available.

Do not turn the project into an unnecessarily complicated design system.

---

## 33. Responsive Design

The public catalog should work well on:

- Desktop.
- Tablet.
- Mobile.

The admin area should also be usable on smaller screens, although desktop is expected to be the primary administrative environment.

Prioritize practical usability over elaborate responsive effects.

---

## 34. Accessibility

Implement sensible accessibility practices:

- Semantic HTML where appropriate.
- Keyboard-accessible controls.
- Proper form labels.
- Visible focus states.
- Appropriate contrast.
- Accessible modal behavior.
- Meaningful button labels.
- Alternative text or appropriate handling for book covers.

The exact implementation can be chosen by the agent.

---

## 35. Testing

Include practical tests for important business logic.

Prioritize:

- Authentication.
- Book creation.
- ISBN uniqueness.
- User creation and CI uniqueness.
- Quantity validation.
- Loan creation.
- Availability decrement.
- Preventing loans when unavailable.
- Preventing loans for inactive books/users.
- Return processing.
- Availability increment.
- Preventing duplicate returns.
- Overdue status derivation.
- Cache updates after mutations.
- Seed behavior when images are missing.

Do not build an enormous test suite for low-value UI details unless useful.

---

## 36. Environment Configuration

Sensitive configuration must use environment variables.

Expected categories include:

```text
DATABASE_URL
SESSION_SECRET
ADMIN credentials/configuration
CLOUDINARY configuration
NODE_ENV
PORT
```

Use names appropriate to the selected implementation, but keep secrets out of source control.

Provide an example environment file such as:

```text
.env.example
```

with placeholders only.

---

## 37. Deployment

The initial target is Render.

The application should:

- Start through a normal Node/Express process.
- Read environment variables.
- Serve the frontend and API from the same origin.
- Work with Neon PostgreSQL.
- Work with Cloudinary.
- Handle Render sleep/wake behavior correctly with cache initialization.

The implementation should remain portable to a VPS.

---

## 38. Implementation Guidance

Before coding:

1. Inspect the repository.
2. Inspect `references/logo.png`.
3. Inspect `references/frontis.png` if present.
4. Inspect available Codex skills/agents/tools.
5. Verify Impeccable availability/configuration.
6. Determine whether image-generation tooling is actually available.
7. Select a practical frontend technology.
8. Design the database schema.
9. Implement the backend/business logic.
10. Implement the public catalog.
11. Implement the admin area.
12. Implement the seed process.
13. Add tests.
14. Run validation/build/test commands.
15. Refine the UI using Impeccable.
16. Document setup and deployment.

Do not begin by adding infrastructure that the requirements do not justify.

---

## 39. Important Business Rules Summary

The following rules are authoritative:

1. One `libros` row represents a title and its physical-copy count.
2. `cantidad` = total physical copies.
3. `disponible` = currently available physical copies.
4. No individual copy IDs or barcodes are required.
5. A loan consumes one available copy.
6. A return restores one available copy.
7. A user can have multiple simultaneous loans.
8. There is no online reservation/request system.
9. Borrowing is recorded physically by an administrator.
10. CI is mandatory and unique.
11. Phone is optional.
12. Address is optional.
13. Users do not have login accounts.
14. Inactive users cannot receive new loans.
15. Books can have multiple genres.
16. Use a simple `TEXT[]` genre representation rather than a genre relation unless future requirements change.
17. ISBN is optional and unique when present.
18. Missing cover images must not stop seed execution.
19. No cover → show "Portada no disponible".
20. Default loan period = 7 days.
21. Admin may modify the due date when creating a loan.
22. Overdue status is informational; overdue loans are not blocked.
23. Loan status should preferably be derived from dates.
24. `detalles` on a loan is optional free text.
25. Book deletion is soft deletion through `activo`.
26. Inactive books are hidden publicly and cannot be borrowed.
27. PostgreSQL is the source of truth.
28. Public catalog search/filter uses the in-memory cache.
29. Loan/return operations update only the affected book in cache after successful transactions.
30. Maximum two administrators, with identical permissions.
31. Dashboard contains general statistics only.
32. Avoid unnecessary technologies and infrastructure.

---

## 40. Definition of Done

The project is considered ready for its first release when:

- The database schema can be created directly in Neon.
- Books can be seeded from JSON.
- Seed can upload existing cover images to Cloudinary.
- Missing images do not break the seed.
- Public visitors can browse/search/filter active books.
- Autocomplete works for public book search.
- Book details open in a polished modal.
- Missing covers have a coherent placeholder.
- Administrators can authenticate.
- Administrators can manage books.
- Administrators can manage users.
- Administrators can register loans.
- Administrators can register returns.
- Availability remains consistent with loans.
- Loan history is available per user.
- Overdue loans are clearly identifiable.
- Inactive books/users behave according to the rules above.
- Cache behavior is correct.
- Basic tests pass.
- The UI reflects the library's real visual identity.
- The project remains simple enough for one developer to understand and maintain.

When making implementation decisions not explicitly specified here, prefer the simplest robust solution that fits the project's scale and preserves the requirements above.
