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

## [2026-10-24] Prices are INR, stored in paise as BigInteger

**Supersedes** — "Prices stored as integer cents", "Currency is USD", and the price part of "Limits live in one constants module".

**Decision** — Prices are integer paise in the database and the API, in a BigInteger column. A price is from 1 to 10^11 paise (100 crore rupees). The frontend turns paise into rupees for display, and the currency is one constant there. The password, make/model, restock and id limits from the earlier entry stay.

**Why** — It is an Indian dealership. Cars cost crores, and 10^11 paise does not fit a 32-bit column, so the column has to be wider. Whole paise are still exact integers, so range search stays exact.

## [2026-10-24] Categories: sedan, suv, hatchback, coupe, truck, ev

**Supersedes** — "Categories are a fixed list". The list was sedan, suv, hatchback, coupe, truck, van.

**Decision** — The categories are sedan, suv, hatchback, coupe, truck and ev. Still one enum, stored as text.

**Why** — Electric vehicles matter more to a current dealership than vans.

## [2026-10-24] PUT with quantity in the body is a 422

**Supersedes** — The part of "PUT replaces four fields and never touches quantity" that said a `quantity` in the body is ignored.

**Decision** — A PUT body that contains `quantity` is refused with 422. PUT still requires make, model, category and price and writes only those four columns.

**Why** — If the field is silently ignored, the caller thinks the stock changed. Stock only moves through purchase and restock, so an attempt to set it should fail loudly.

## [2026-10-24] All input validation is 422

**Decision** — Every kind of bad input returns 422, FastAPI's default: wrong types, out of range values, a minimum price above the maximum, and fields we do not accept. A request body with an unknown field is refused on every endpoint, not only on PUT. No 400 anywhere.

**Why** — One rule everywhere is easier to explain and to test. Refusing unknown fields everywhere is a consequence of the PUT decision above: the same reasoning applies to a `role` sent at register. [unverified] The owner asked for 422 on everything; applying it to unknown fields on all bodies was Claude's reading of that, and changes A-09 and E-08.

## [2026-10-24] Which error wins, with 409 last

**Supersedes** — "Which error wins".

**Decision** — When several things are wrong at once, the order is 401, 403, 422, 404, 409.

**Why** — Same reasoning as before, now including 409: a vehicle has to exist before it can be out of stock.

## [2026-10-24] Frontend tests: purchase, out of stock, route guard, forms

**Supersedes** — "Frontend tests".

**Decision** — Frontend tests cover the Purchase button, the 409 out of stock message, the admin route guard, and login and register form validation. They are listed as F-01 to F-20 in `TEST_LIST.md`.

**Why** — These are the places where the frontend decides something instead of only showing data. Each one is a way the UI can let a user do what the server will refuse.

## [2026-10-24] Unknown fields are a 422, set once on a shared base schema

**Supersedes** — The `[unverified]` note in "All input validation is 422". The owner has confirmed that reading.

**Decision** — Any extra field in a request body is a 422, on every endpoint. Every request schema inherits from one base schema that sets `extra="forbid"`. No schema repeats the setting.

**Why** — One place to read and to change, and a new schema cannot forget it. This is what A-09, V-21 and E-08 test.

## [2026-10-24] Purchase takes no body

**Decision** — `POST /api/vehicles/{id}/purchase` has no request body model. A body sent to it is not read. E-08 applies to every endpoint that accepts a body, and I-15 says the same for purchase.

**Why** — A purchase is always one unit, so there is nothing to put in a body. Giving it a body model only to refuse it would be code for no behaviour. This removes the conflict between I-15 and E-08.

## [2026-10-24] Synchronous SQLAlchemy

**Decision** — The backend uses synchronous SQLAlchemy 2 with psycopg 3, and plain `def` routes.

**Why** — It is the simplest to read and to explain. Concurrency tests can use one session per thread, and FastAPI runs `def` routes in a threadpool, so requests still overlap.

## [2026-10-24] API tests roll back through a savepoint

**Decision** — Each api test runs on one connection inside an outer transaction. Sessions use `join_transaction_mode="create_savepoint"`, so a commit in a request only releases a savepoint. The outer transaction is rolled back after the test. This fixture is never used for concurrent requests.

**Why** — The app commits for real, the tests leave no data behind, and no truncate is needed between tests. Concurrent tests need separate connections, which is why they use the commit and truncate fixture instead.

## [2026-10-24] Alembic takes the database url from its caller first

**Decision** — `alembic/env.py` uses the `sqlalchemy.url` already set on the Alembic config, and falls back to `Settings().database_url` only when none is set. Tests set their own test url and never fall back to the dev one.

**Why** — If `env.py` always read the app settings, the test run would migrate, and later truncate, the dev database.

## [2026-10-24] The session commits before the response is sent

**Decision** — The session dependency is declared with `Depends(get_session, scope="function")`, so its commit runs when the route function returns, before the response goes out. The session is opened with `with`, commits after `yield`, and an exception skips the commit so closing the session rolls back.

**Why** — By default code after `yield` runs after the response is sent. A failed commit, such as a duplicate email (A-08), would then reach the client as a success. This is written down now and applied when `get_session` is first built.

## [2026-10-25] The users table: named unique and check constraints, sized columns

**Decision** — `users` has a unique constraint on `email` (`uq_users_email`) and a check constraint on `role` (`ck_users_role`, built from the `Role` enum). Both are named, so the repository can tell a duplicate email from any other integrity error by constraint name. `email` is 320 characters, `password_hash` 100, `role` 20.

**Why** — The database is the last line of defence when two requests race or a bug writes a bad role, and a named constraint lets the code answer each failure correctly. A-39 exists because an unnamed integrity error was first reported as a duplicate email. The sizes are the longest valid email, a bcrypt hash with room to spare, and a short word.

## [2026-10-25] A database failure on health is a 503

**Decision** — `GET /api/health` returns 503 with `{"detail": "Database unavailable"}` when the query raises `OperationalError`. Any other exception is still a 500.

**Why** — A health check exists to say whether the service can do its job. 503 tells a load balancer or Caddy the instance is unhealthy, and the 500 for unexpected errors would look like a bug in our code.

## [2026-10-25] Login takes the email as a plain string

**Decision** — `LoginRequest.email` is a `str`, not `EmailStr`. Register still validates with `EmailStr`.

**Why** — Login must give the same 401 for a wrong password and an unknown email. If login validated the format, a malformed email would be a 422 and tell the caller something the 401 hides. A malformed email cannot match a stored one anyway.

## [2026-10-25] The seed is a plain function, with a thin wrapper around it

**Decision** — `seed_admin(users, settings)` is a function that takes a repository and settings. `run_seed` opens a session and commits. `main` reads `Settings()`, turns `InvalidAdminSettings` into a message and exit. No class and no command line framework.

**Why** — Each layer is testable on its own: the function with a fake repository (A-32, A-37), the wrapper against Postgres (A-38). A class would hold no state worth keeping.

## [2026-10-25] Tests swap the session factory after `create_app`

**Decision** — `create_app(settings)` builds its own session factory from `settings.database_url`. API tests then replace `app.state.session_factory` with one that rolls back after each test. `create_app` takes no factory argument.

**Why** — Creating an engine does not connect, so building a real one that the test throws away is harmless. A factory parameter would exist only for tests, and nothing in production would use it.

## [2026-10-25] A token must carry `exp` and `sub`

**Decision** — Decoding passes `options={"require": ["exp", "sub"]}`. A validly signed token missing either, or with a `sub` that is not a number, is a 401.

**Why** — PyJWT checks `exp` only when it is present, so a token signed without one would never expire. A-35 and A-36 test this. The claim names are constants in `tokens.py`.

## [2026-10-25] The vehicles table

**Decision** — `vehicles` has an `Integer` id, `make` and `model` as `String(50)`, `category` as `String(20)`, `price` as `BigInteger` and `quantity` as `Integer`. Each rule is a named check constraint: `ck_vehicles_make` and `ck_vehicles_model` (`char_length >= 1`), `ck_vehicles_category` (the six categories), `ck_vehicles_price` (1 to 10^11) and `ck_vehicles_quantity` (0 to 10000). There is no unique constraint, so two vehicles with the same make and model are allowed. The migration writes the numbers and category names out in full and does not import them from the app.

**Why** — The database is the last line of defence, as it is for `users`. An old migration must keep doing what it did when it was written, so it cannot read an enum that may change later. Next phase's `purchases.vehicle_id` will be a nullable `Integer` with `ForeignKey("vehicles.id", ondelete="SET NULL")`. That is a property of the purchases table, so `vehicles` needs nothing extra for it now. The upper length is already enforced by `String(50)`, which is why the length check only needs the lower end.

## [2026-10-25] Quantity is capped at 10000, and a restock past it is a 409

**Supersedes** — The "no cap on total quantity" part of "Restock limit is per request, not on total stock", and its choice of BigInteger for quantity.

**Decision** — Quantity is 0 to 10000. Create checks it in the schema, and `ck_vehicles_quantity` checks it in the database. Restock stays a single `quantity = quantity + amount` update. When that pushes stock past the limit, the check constraint refuses it, the repository turns the violation into `StockLimitExceeded` (the same way it does for a duplicate email), and the answer is 409 with stock unchanged. The amount per request is still 1 to 1,000. Quantity is an `Integer`, because 10000 plus 1000 cannot overflow it. `StockLimitExceeded` and its tests (I-26, I-27) are built with restock, next phase.

**Why** — The owner wants a database check on the upper limit. Without handling, a restock past it would be a 500. A conditional `WHERE quantity + :amount <= 10000` would change no row both for a missing vehicle and for an over-limit one, and would need a follow-up read to tell them apart. With the constraint, no row means missing and a violation means over the limit, and Postgres checks the new row even when requests overlap. It is 409 and not 422 because the amount is valid; it clashes with the current stock, as out of stock does.

## [2026-10-25] Quantity is required when adding a vehicle

**Decision** — `POST /api/vehicles` requires make, model, category, price and quantity. A missing quantity is a 422. There is no default.

**Why** — The story says "starting quantity", and a default of 0 would let a typo create a vehicle nobody can buy without a warning.

## [2026-10-25] Numbers in a body are strict integers, text is trimmed before it is measured

**Decision** — `price` and `quantity` in request bodies are strict integers, so `"10"`, `10.0` and `true` are all 422. Search query values are not strict, because they arrive as strings. `make` and `model` are trimmed by the schema before the length check, so a value of only spaces is a 422 on create and update.

**Why** — Pydantic by default turns `"10"` into 10, which would let V-09 pass without a 422. If trimming happened after the length check, `"   "` would pass the schema and reach `ck_vehicles_make` as a 500. Trimming first makes the schema the place that says no.

## [2026-10-25] Search: bounds, blank text, and how text is matched

**Decision** — `min_price` and `max_price` are integers from 0 to 10^11. Search text is trimmed, blank text counts as no filter, and text over 50 characters is a 422. `make` and `model` match with SQLAlchemy's `icontains(..., autoescape=True)`, so `%`, `_` and the escape character are matched literally. Category is an exact match. Results are ordered by id, as the list is. A minimum above the maximum is `InvalidPriceRange`, raised by the service, and maps to 422.

**Why** — An unbounded integer such as 10^30 can reach the database as a data error instead of a 422. Matching the 50 character limit of make and model means longer text could never match anyway. `autoescape` is one argument, so there is no escaping code of ours to explain. A fixed order keeps the list stable between requests.

## [2026-10-25] Delete and update are single statements

**Decision** — Delete is `DELETE ... WHERE id = :id RETURNING id`, and update is `UPDATE ... SET make, model, category, price WHERE id = :id RETURNING`. No row back means `VehicleNotFound`. Neither reads first.

**Why** — Read then delete lets two overlapping deletes both answer 204, which is the same mistake as read then write on purchase. Naming the four columns in the `UPDATE` makes it visible that quantity is never written.

## [2026-10-25] E-12 means a missing SECRET_KEY

**Decision** — The app refuses to start when `SECRET_KEY` is not set. An empty value is not checked.

**Why** — A required field in `Settings` already does this, and a minimum length would be a second rule for a case the deployment does not produce. The test removes `SECRET_KEY` from the environment and passes no env file, so a developer's own `.env` cannot make it pass.

## [2026-10-25] Purchases are recorded

**Supersedes** — The "no purchase history" part of "Also left out", and the matching line in `STORIES.md`.

**Decision** — Every successful purchase writes one row in `purchases`: `user_id` (required, a foreign key to `users`), `vehicle_id` (nullable, `ON DELETE SET NULL`), `make`, `model` and `price` copied from the vehicle at purchase time, and `created_at`. The row is written in the same session as the stock update, so both commit or both roll back. The service passes plain fields, taken from the vehicle the update returned. Nothing reads the table yet.

**Why** — "What does delete do to it" was the reason to skip it. `SET NULL` plus the snapshot answers that: a deleted car leaves its sales readable. The user id has no `ON DELETE` rule, so a user with purchases cannot be deleted; there is no user delete today. One transaction means stock cannot drop without a record, and a rolled back sale leaves no record.

## [2026-10-25] Restock refuses past the cap inside the update

**Supersedes** — The part of "Quantity is capped at 10000, and a restock past it is a 409" that has the check constraint raise `StockLimitExceeded`.

**Decision** — Restock is `UPDATE ... SET quantity = quantity + :amount WHERE id = :id AND quantity + :amount <= 10000 RETURNING`. No row back: the service asks whether the vehicle exists and raises `VehicleNotFound` (404) or `StockLimitExceeded` (409). `ck_vehicles_quantity` stays as the last line of defence, with its own test. `OutOfStock` and `StockLimitExceeded` both map to 409.

**Why** — It is the same shape as purchase, so one idea explains both, and no database error is turned into a domain error by catching it. The follow-up read only picks which error to raise, never whether the update happened.

## [2026-10-25] Purchase moves to its own service

**Decision** — `PurchaseService` holds both the vehicle and purchase repositories and has `purchase(user_id, vehicle_id)`. `VehicleService` keeps add, list, search, update, delete and restock. Repositories take plain fields (`VehicleRepository.add(make, model, category, price, quantity)`), so no service builds or changes an ORM object.

**Why** — Purchase is the only operation that writes two tables, so it is the only one that needs two repositories. Putting it in `VehicleService` would have changed that service's constructor and every test that builds it. The user repository still takes a `User`; the same change there was not asked for.

## [2026-10-25] One error shape, including the unexpected 500

**Decision** — Every error body is a JSON object with the single key `detail`. It is a string everywhere except a 422 from request validation, where it is FastAPI's list of problems. An exception nobody handled is a 500 with the fixed text "Internal server error". The real error and trace stay in the server log.

**Why** — A check found one gap: an unhandled exception answered plain text, with no `detail`. The 422 list is kept because it says which field is wrong, which the frontend can use; flattening it to a string would lose that. E-01 and E-02 now have tests.

## [2026-10-25] The seed adds sample vehicles only to an empty table

**Decision** — `seed_vehicles` inserts sixteen cars (all six categories, three at zero stock, prices in paise) when the vehicle table has no rows, and nothing otherwise. `run_seed` calls it after `seed_admin` and commits once. The admin logic is unchanged.

**Why** — The seed runs on every deploy. Checking for an empty table is the simplest rule that keeps a redeploy from duplicating cars. The cost: if the owner deletes every car, the next deploy puts the samples back.

## [2026-10-25] The test report is one make target

**Decision** — `make test-report` starts the test database, runs the suite with `pytest-html` and `pytest-cov` (branch coverage), and writes `docs/test-report/report.html` and `docs/test-report/coverage/`. Both are committed. The target deletes the `.gitignore` that coverage writes into its folder.

**Why** — The brief asks for a test report, and one command means it is never out of date by hand. Committing it means a reviewer can read it without running anything.
