# Decisions

Append only. Earlier entries are never rewritten. A change of mind is a new entry that points at the old one.

## [2026-10-24] Backend framework: FastAPI

**Decision** — FastAPI for the backend.

**Why** — Pydantic validation and dependency injection make the service layer easy to test in isolation, and Python is the language I'm fastest and most confident in.

## [2026-10-24] List returns every vehicle, including zero stock

**Decision** — `GET /api/vehicles` returns all vehicles. The UI shows zero stock ones as out of stock.

**Why** — Hiding sold-out cars makes them look discontinued, and an admin could not find one to restock from the UI.

## [2026-10-24] Put, delete and restock are admin only

**Decision** — Only an admin can update, delete or restock a vehicle.

**Why** — These change what the dealership sells. A customer only needs to browse and buy.

## [2026-10-24] A purchase is always one unit

**Decision** — The purchase endpoint takes no quantity. Each call buys one unit.

**Why** — It is the smallest version of the brief and removes a whole class of input checks. A quantity can be added later as its own slice.

## [2026-10-24] No role choice at register; admin comes from a seed script

**Decision** — Register always creates a customer. An admin is created by a seed script that reads its credentials from config.

**Why** — A role field in a public endpoint is a way to make yourself an admin. Taking the choice away removes the risk instead of guarding it.

## [2026-10-24] Purchase is one atomic update, 409 when out of stock

**Decision** — Purchase is a single `UPDATE ... SET quantity = quantity - 1 WHERE id = ... AND quantity > 0`. If no row changes, the car is out of stock or missing, and we answer 409 or 404. It is never read first and written after.

**Why** — Read then write lets two buyers both see stock of 1 and both succeed. One statement lets the database decide who wins, with no locks of ours to explain.

## [2026-10-24] Prices stored as integer cents

**Decision** — Price is an integer number of the currency's smallest unit, in the database and in the API. Only the UI turns it into a display string.

**Why** — Floats cannot hold money exactly (`0.1 + 0.2`). Integers compare and add exactly, which price range search relies on.

## [2026-10-24] Out of scope for one day

**Decision** — No refresh tokens, no email verification, no pagination.

**Why** — Each is real work and none is in the brief. They are written here so it is clear they were left out on purpose. The list endpoint returning everything is the visible cost of no pagination.

## [2026-10-24] Adding a vehicle is admin only

**Decision** — `POST /api/vehicles` needs an admin.

**Why** — The brief's UI spec puts adding under admin, and a customer adding stock to a dealer's inventory makes no sense.

## [2026-10-24] PUT replaces four fields and never touches quantity

**Decision** — PUT requires make, model, category and price, and replaces all four. A `quantity` in the body is ignored. The update writes only those four columns.

**Why** — Quantity changes only through purchase and restock. A PUT that wrote quantity could overwrite a purchase made a moment earlier.

## [2026-10-24] Login with email and password, JSON body

**Decision** — Accounts are identified by email, trimmed and lowercased by the service, with a unique constraint in the database. Login takes JSON `{email, password}`. Register returns the account, not a token.

**Why** — It is the simplest identifier that fits the brief. The unique constraint, not a check before the insert, is what stops two registrations of one email at the same moment.

## [2026-10-24] Categories are a fixed list

**Decision** — The categories are sedan, suv, hatchback, coupe, truck and van, kept in one enum and stored as text.

**Why** — Search by category needs values that match exactly, and free text would give "SUV" and "suv" as two categories.

## [2026-10-24] Currency is USD

**Decision** — Prices are shown in USD. The currency is one constant in the frontend. The API only knows cents.

**Why** — The brief names no currency, and the choice only changes how the UI formats a number.

## [2026-10-24] Token holds the user id; the role comes from the database

**Decision** — The JWT carries only the user id and an expiry. Each request loads the user from the database, and the role comes from that row. Algorithm HS256, expiry 60 minutes, both in config. A missing or wrongly formed token returns 401 from our own code (`HTTPBearer(auto_error=False)`), not whatever FastAPI's default returns.

**Why** — We already have to load the user to reject deleted accounts, so the role costs nothing extra and a role change takes effect at once. Own 401 means the status does not depend on the FastAPI version.

## [2026-10-24] Seed script creates or updates the admin

**Decision** — The seed script creates the admin from config. If the email already exists, it sets the role to admin and sets the configured password.

**Why** — Skipping an existing account would leave no admin. Promoting it without resetting the password would hand admin to whoever registered the address first.

## [2026-10-24] Any signed-in user can purchase

**Decision** — Purchase needs a valid token and nothing more, so admins can buy too.

**Why** — Checking for the customer role is an extra rule with no reason behind it.

## [2026-10-24] Failed purchase: how 404 and 409 are told apart

**Decision** — The repository's purchase runs the atomic update with `RETURNING` and gives back the vehicle, or nothing if no row changed. On nothing, the service asks whether the vehicle exists and raises `VehicleNotFound` or `OutOfStock`. That follow-up read only checks existence and never decides stock. Postgres stays on its default isolation level.

**Why** — The update alone cannot say why it changed nothing. A vehicle deleted in between correctly gives 404. One restocked in between gives 409, which was true when the update ran. A stricter isolation level would turn the losing buyer into a serialization error, which would be a 500.

## [2026-10-24] Restock limit is per request, not on total stock

**Decision** — A restock amount must be between 1 and a maximum per request. Quantity is a BigInteger. Restock is a single `quantity = quantity + amount` update. There is no cap on total quantity.

**Why** — The architect suggested also capping total stock inside the update. That is a second conditional update to explain for a case nobody needs in a day. A bounded amount and a wide column cannot overflow.

## [2026-10-24] Limits live in one constants module

**Decision** — Password length 8 to 72 bytes, make and model up to 50 characters, price from 1 to 1,000,000,000 cents, restock amount from 1 to 1,000, vehicle id up to 2,147,483,647. Ids are database integers. Path ids are bounded so a huge id gives 422, not a database error.

**Why** — Tests and schemas import the same names, so a limit changes in one place. bcrypt only reads 72 bytes, so a longer password is refused instead of silently cut. The price maximum fits a 32-bit column. These numbers are my picks and are easy to change.

## [2026-10-24] Which error wins

**Decision** — When several things are wrong at once, the order is 401, 403, 422, 404.

**Why** — It is what FastAPI does when authentication and role checks are dependencies of the route, and it means a customer learns nothing about vehicles they may not touch.

## [2026-10-24] Test layers and isolation

**Decision** — Logic in the service is tested with a fake repository. Anything that lives in SQL or a constraint (search, atomic updates, unique email, concurrency, migrations) is tested against real Postgres. API tests roll back after each test. Concurrency tests commit their data, use one session per thread, and truncate tables afterwards. Each repository has a `typing.Protocol`. One session per request, committed by the session dependency.

**Why** — A fake would pass even when the SQL is wrong, and a rolled-back shared session would make "concurrent" requests run one after another, so a read-then-write bug would go unnoticed.

## [2026-10-24] Frontend tests

**Decision** — Frontend tests cover the Purchase button only: disabled at zero stock, and a 409 shows a message and refreshes the list. That test list is written when the frontend phase starts.

**Why** — The brief asks for TDD "especially for the backend". The Purchase button is the one place where the frontend has real behaviour.

## [2026-10-24] Also left out

**Decision** — No purchase history, and no defence against the login timing difference between an unknown email and a wrong password.

**Why** — A history table is not in the brief, and adding one later means deciding what delete does to it. Hiding the timing needs a dummy hash check that is more to explain than it is worth here.
