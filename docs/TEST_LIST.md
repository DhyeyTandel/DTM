# Test list

Backend tests are A, V, S, I and E. Frontend tests are F, at the end.

One line per behaviour. Each becomes one failing test, one commit, one passing commit.

Layer tags:
- **unit**: service with a fake repository. No HTTP, no database. Only for logic that lives in the service.
- **api**: HTTP request through the test client against a real Postgres test database. Each test is rolled back afterwards.
- **db**: repository against real Postgres. Used wherever the behaviour lives in SQL or in a constraint, because a fake cannot prove it. Concurrency tests are `db`: each thread opens its own session, the vehicle is committed first, and tables are truncated afterwards.

Status codes and limits follow `DECISIONS.md`. Limits are named constants in one module, and tests import them.

## Auth (A1 to A4)

Register
- A-01 unit: registering with a new email creates a customer
- A-02 unit: the stored password is a hash, never the plain text
- A-03 unit: registering an email that already exists raises `EmailAlreadyRegistered`
- A-04 unit: the email is trimmed and lowercased before it is stored or looked up
- A-05 db: inserting the same email twice raises `EmailAlreadyRegistered` (unique constraint, covers two registrations at the same moment)
- A-06 api: `POST /api/auth/register` returns 201 with id, email and role `customer`
- A-07 api: the register response never contains the password or its hash
- A-08 api: duplicate email returns 409
- A-09 api: a `role` field in the body returns 422 and no account is created
- A-10 api: invalid email returns 422
- A-11 api: password shorter than the minimum, or longer than the maximum, returns 422
- A-12 api: missing email or password returns 422

Login
- A-13 unit: correct credentials return an access token
- A-14 unit: wrong password raises `InvalidCredentials`
- A-15 unit: unknown email raises `InvalidCredentials` (same error as wrong password)
- A-16 unit: the token carries only the user id and an expiry taken from config
- A-17 api: `POST /api/auth/login` with a JSON body returns 200 with a bearer token
- A-18 api: wrong password and unknown email both return 401 with the same body
- A-19 api: login email match ignores letter case
- A-33 unit: a password over the byte limit raises `InvalidCredentials` at login, because bcrypt refuses to read it

Token checks
- A-35 api: a validly signed token with no `exp` or no `sub` claim returns 401 (a token that never expires must not work)
- A-36 api: a validly signed token whose `sub` is not a number returns 401
- A-34 api: a valid token gives the dependency the signed-in user (the case every other token check is the opposite of)
- A-20 api: a request with no token returns 401 on every vehicle and inventory route (a table of method and path, including purchase and restock)
- A-21 api: a malformed token returns 401
- A-22 api: a token signed with a different secret returns 401
- A-23 api: an expired token returns 401
- A-24 api: a valid token for a user that no longer exists returns 401
- A-25 api: an `Authorization` header that does not use the `Bearer` scheme returns 401
- A-26 api: the role comes from the database, so a user whose role changed after the token was issued gets the current role
- A-27 api: a customer token on an admin route returns 403
- A-28 api: an admin token on an admin route is accepted

Admin seed
- A-29 db: the seed script creates an admin from the configured email and password
- A-30 db: running the seed script twice leaves exactly one admin
- A-31 db: if the admin email is already a customer, the seed makes it an admin and sets the configured password
- A-32 unit: the seed script fails with a clear message when the admin settings are missing
- A-39 db: the database refuses a role outside the list (check constraint), and the repository lets that error through instead of calling it a duplicate email
- A-38 db: running the seed script's entry point commits the admin, so a new session can read it
- A-37 unit: the seed script refuses an admin password outside the byte limits, with a clear message (bcrypt would otherwise crash on it)
- A-40 unit: seeding an empty vehicle table adds about fifteen vehicles covering every category, a few at zero stock, all inside the price and quantity limits
- A-41 unit: seeding when the table already has a vehicle adds nothing
- A-42 db: the seed entry point stocks the table, and running it twice does not duplicate the vehicles
- A-43 unit: every seeded vehicle has its own image, either an https url or a `/images/` path, inside the length limit, with no whitespace
- A-44 unit: every seeded vehicle photo is a `/images/vehicles/` path (the photos are self hosted, so they cannot break during a demo)
- A-45 api: `GET /api/auth/me` returns the id, email and role of the user the token belongs to, and 401 without a token or with a bad one

## Vehicles (V1 to V4)

Create
- V-01 unit: adding a vehicle stores make, model, category, price and quantity
- V-02 api: `POST /api/vehicles` as admin returns 201 with the vehicle and its id
- V-03 api: as customer returns 403
- V-04 api: without a token returns 401
- V-05 api: ids are unique across two creations
- V-06 api: empty make or model returns 422
- V-07 api: a category outside the fixed list returns 422, including a wrong-case value (`SUV`)
- V-08 api: price of 0, -1 or 10^11 + 1 returns 422; 1 and 10^11 are accepted
- V-09 api: price sent as a decimal (`10.5`), a whole-number decimal (`10.0`), a string or a boolean returns 422
- V-10 api: quantity of -1, above 10000, a decimal or a string returns 422; 0 and 10000 are accepted
- V-11 api: two vehicles with the same make and model are allowed
- V-33 api: a body missing any of make, model, category, price or quantity returns 422
- V-34 db: the database refuses a price outside 1 to 10^11, a quantity above 10000, a category outside the list, and an empty make or model (one named check constraint each)

Image url (added after the first backend phase)
- V-35 db: the database refuses an image url that is not https (`ck_vehicles_image_url`, http and `javascript:` cases) and accepts a vehicle with none
- V-36 api: `POST /api/vehicles` with an https `image_url` returns 201 and echoes it; without one the response has `image_url: null`
- V-37 api: an `image_url` that is `http`, `javascript:`, contains a space or a trailing newline, is empty, is only `https://`, or is over 500 characters returns 422, on create and on update; exactly 500 is accepted
- V-38 api: `PUT` replaces `image_url`, `null` clears it, leaving it out returns 422
- V-39 api: list and search responses include `image_url` (passes as soon as V-36 does, because every response shares one schema, so it has no red step)
- V-41 api: an `image_url` may also be a site relative path that starts with `/images/` (the self hosted photos), on create and on update, and is echoed back
- V-42 api: a path that is not under `/images/`, is only `/images/`, contains `..`, `%`, a backslash, a space or a newline, starts with `//`, or is over 500 characters returns 422, on create and on update
- V-43 db: the database refuses `/etc/passwd`, `//evil.example/x.jpg`, `/images/../secret.jpg`, `/images/%2e%2e/x` and a backslash, and accepts `/images/vehicles/swift.jpg` (`ck_vehicles_image_url`)

List
- V-12 api: `GET /api/vehicles` as customer returns all vehicles
- V-13 api: vehicles with quantity zero are included
- V-14 api: with no vehicles it returns 200 and an empty list
- V-15 api: without a token returns 401

Update
- V-16 unit: updating replaces make, model, category, price and image url
- V-17 unit: updating a missing id raises `VehicleNotFound`
- V-18 api: `PUT /api/vehicles/{id}` as admin returns 200 with the new values
- V-19 api: as customer returns 403
- V-20 api: missing id returns 404
- V-21 api: a `quantity` field in the body returns 422 and stock is unchanged
- V-22 api: a body missing any of make, model, category, price or image_url returns 422 (image_url may be `null`, but it must be there)
- V-23 api: invalid values return 422 and the stored vehicle is unchanged
- V-24 api: an id that is not a number, is zero or negative, or is above the maximum id returns 422
- V-25 db: updating changes only the five editable columns (make, model, category, price, image url), so a purchase made just before is not overwritten

Delete
- V-26 unit: deleting removes the vehicle
- V-27 unit: deleting a missing id raises `VehicleNotFound`
- V-28 api: `DELETE /api/vehicles/{id}` as admin returns 204
- V-29 api: the deleted vehicle no longer appears in the list
- V-30 api: as customer returns 403 and the vehicle remains
- V-31 api: missing id returns 404
- V-32 api: deleting the same id twice returns 204 then 404

## Search (S1)

Route is `GET /api/vehicles/search`. Filters combine with AND. Text filters ignore letter case. Price bounds are inclusive and in paise. The filtering is SQL, so those tests are `db`.

- S-01 db: no filters returns every vehicle
- S-02 db: filter by make
- S-03 db: filter by model
- S-04 db: filter by category
- S-05 db: filter by minimum price
- S-06 db: filter by maximum price
- S-07 db: filter by price range
- S-08 db: several filters together all have to match
- S-09 db: make and model match on part of the text (`toy` finds `Toyota`)
- S-10 db: a price exactly equal to the minimum or maximum is included
- S-11 db: `%`, `_` and the escape character in the search text are matched literally, not as wildcards
- S-12 unit: minimum price above maximum price raises `InvalidPriceRange`
- S-13 api: `GET /api/vehicles/search?make=toyota` returns matching vehicles
- S-14 api: no match returns 200 and an empty list, not 404
- S-15 api: out of stock vehicles are included in results
- S-16 api: minimum price above maximum price returns 422 (not 400)
- S-17 api: a negative, non-integer or above-10^11 price bound returns 422
- S-18 api: a category outside the fixed list returns 422
- S-19 api: without a token returns 401
- S-20 api: `/search` is not read as a vehicle id (route order). Covered by S-13 while there is no `GET /api/vehicles/{id}`: with no such route this cannot go red, so it gets no test of its own until one is added
- S-21 api: blank search text (`make=` or only spaces) behaves like no filter
- S-22 api: search text over 50 characters returns 422

## Inventory (I1, I2)

Purchase
- I-01 unit: purchasing a vehicle with stock returns the vehicle with quantity one lower
- I-02 unit: purchasing with zero stock raises `OutOfStock`
- I-03 unit: purchasing a missing vehicle raises `VehicleNotFound`
- I-04 db: purchase lowers quantity by exactly one
- I-05 db: purchase of the last unit succeeds and leaves quantity zero
- I-06 db: purchase at zero stock changes nothing and returns nothing
- I-07 db: the database refuses a negative quantity (check constraint, last line of defence)
- I-08 db: ten concurrent purchases of the last unit give one success and nine `OutOfStock`. Each thread uses its own session, waits on a `threading.Barrier` right before the update so they really overlap, and closes its session before the test ends so the truncate does not wait on a lock.
- I-09 db: N concurrent purchases against stock below N give exactly stock-many successes, the rest `OutOfStock`, final quantity zero. Same rules as I-08, and the engine pool must be at least N connections (the default allows 15) or threads wait on the pool and run one after another.
- I-10 api: `POST /api/vehicles/{id}/purchase` as customer returns 200 with the full vehicle and its new quantity
- I-11 api: an admin purchase returns 200 and is handled exactly like a customer's
- I-12 api: out of stock returns 409 and the stock is still zero
- I-13 api: missing id returns 404
- I-14 api: without a token returns 401
- I-15 api: purchase takes no body, so a body sent to it is not read and exactly one unit is bought

Restock
- I-16 unit: restock adds the given amount to quantity
- I-17 unit: restock of a missing vehicle raises `VehicleNotFound`
- I-18 unit: an amount of zero or less, or above the maximum restock amount, raises `InvalidQuantity`
- I-19 db: restock adds to the current value in one statement, so it does not overwrite a purchase made in between
- I-20 api: `POST /api/vehicles/{id}/restock` as admin returns 200 with the full vehicle and its new quantity
- I-21 api: as customer returns 403
- I-22 api: without a token returns 401
- I-23 api: missing id returns 404
- I-24 api: amount of zero, negative, above the maximum, decimal or missing returns 422
- I-25 api: restocking a sold-out vehicle makes it purchasable again
- I-26 db: a restock past 10000 returns nothing and quantity is unchanged (the service raises `StockLimitExceeded`, covered by the unit tests). The update itself refuses it (`quantity + amount <= 10000` in the `WHERE`), not the check constraint
- I-27 api: a restock past 10000 returns 409 and quantity is unchanged

Purchase record and constraint
- I-28 unit: a purchase records who bought which vehicle, with its make, model and price at that moment
- I-29 db: a purchase writes one `purchases` row: user id, vehicle id, snapshot make, model and price, and `created_at`
- I-30 db: a purchase of a missing or sold-out vehicle writes no row
- I-31 db: deleting a purchased vehicle succeeds, and its purchase rows keep the snapshot with `vehicle_id` null
- I-32 db: in the concurrent test of I-09, the number of `purchases` rows equals the number of successes
- I-33 db: the database refuses a quantity of 10001 written directly (`ck_vehicles_quantity`, the upper-bound twin of I-07)
- I-34 db: if the purchase row cannot be written, the stock change is rolled back with it (one transaction)

## Edge cases and cross-cutting

Errors
- E-01 api: every error body has the same shape (`detail` message)
- E-02 api: an unexpected exception returns 500 with no stack trace or internals in the body (test client created with `raise_server_exceptions=False`)
- E-03 api: when several things are wrong, the order is 401, then 403, then 422, then 404, then 409 (a customer sending an invalid PUT body to a missing id gets 403; an invalid body to a missing id gets 422)
- E-04 api: every admin route refuses a customer token with 403 (one parametrised test over a table of method and path)

Data and format
- E-05 db: price is stored and returned as an integer number of paise, and a price at the maximum (10^11) does not overflow
- E-06 api: make and model over the maximum length return 422
- E-07 api: make and model have surrounding whitespace trimmed on create and update, and a value of only spaces returns 422
- E-08 api: any endpoint that accepts a body rejects an unknown field with 422 (purchase takes no body, so it is not covered; see I-15)
- E-09 api: a body that is not valid JSON returns 422

Operations
- E-10 retired: no CORS, the browser only talks to its own origin (see DECISIONS, "No CORS")
- E-11 api: `GET /api/health` returns 200 when the database answers
- E-12 unit: the app refuses to start when the secret key setting is missing (the test removes `SECRET_KEY` from the environment and passes no env file)
- E-13 db: migrations run from an empty database up to head, and down again. It ends with an upgrade to head, because the test database is shared and a downgrade to base would drop the schema for every test after it.
- E-14 api: `GET /api/health` returns 200 with status `ok` (the plain check that proves the test loop; E-11 adds the database)
- E-15 api: `GET /api/health` returns 503 with a `detail` message when the database does not answer

## Frontend (F)

Vitest and React Testing Library. MSW answers the requests, so the real api module runs and no test reaches a real server. Components are tested through what the user sees.

Purchase button (F4)
- F-01 the Purchase button is enabled when stock is above zero
- F-02 the Purchase button is disabled when stock is zero
- F-03 a vehicle with zero stock shows a "Sold out" status and a SOLD OUT strip on its photo (was "an out of stock label"; the dealer floor design reads Sold out, and the button keeps "Out of stock")
- F-04 clicking Purchase asks the api layer to buy that vehicle once, and the list shows the new quantity
- F-05 the button is disabled while the purchase request is running

Out of stock response (F4)
- F-06 a 409 shows an out of stock message
- F-07 after a 409 the list is fetched again and the vehicle shows as out of stock
- F-08 any other purchase error shows a general error message and the list is left as it was

Admin route guard (F5)
- F-09 a visitor opening any app page is sent to the login page
- F-10 a customer opening an admin page is sent to the dashboard
- F-11 an admin can open the admin pages
- F-12 add, update, delete and restock controls are shown to an admin and hidden from a customer
- F-13 logging out clears the token and sends the user to the login page

Login and register forms (F1)
- F-14 an invalid email shows an error and sends no request
- F-15 a password shorter than the minimum, or longer than the maximum, shows an error and sends no request
- F-16 empty fields show an error and send no request
- F-17 a successful login stores the token and opens the dashboard
- F-18 a 401 on login shows "invalid email or password"
- F-19 a 409 on register shows that the email is already registered
- F-20 a successful register sends the user to the login page

Api client (F0)
- F-21 a request sends the stored token as a bearer header
- F-22 a request with no stored token sends no authorization header
- F-23 a 401 response clears the stored token
- F-24 a response with an error status rejects with an error that carries that status

Money and stock labels (F0)
- F-25 a price in paise is shown in rupees with Indian digit grouping (14_49_000_00 shows as ₹14,49,000)
- F-26 a price with paise left over shows two decimals (₹14,49,000.50), and a whole rupee price shows none
- F-27 stock above 3 is in stock, 1 to 3 is low, 0 is sold out
- F-28 the stock status line reads "In stock", "<n> left" (with the real count) and "Sold out" (was "Only 3 left" and "Out of stock")

Shared parts (F0)
- F-29 a vehicle with no image shows a plain "No photo yet" block and no broken image; a vehicle with an image shows it with the car's name as its alt text
- F-30 typing in a filter field reports the changed filters, and Clear filters resets every field
- F-31 a text field with an error is marked invalid and the message is read with it
- F-32 the theme starts from the stored choice, then from the system setting, and the toggle switches it and remembers it

Dealer floor listing (F2)
- F-33 a stock number is the vehicle id padded to four digits after DTM- (12 shows as DTM-0012)
- F-34 the CURRENT tab lists every vehicle, sold out ones included; the SOLD OUT tab lists only vehicles at zero stock
- F-35 filters narrow the list: category, a price range given in rupees, and availability (in stock, low, sold out)
- F-36 sort orders by price low to high, price high to low, or name
- F-37 the tab, category, price range, availability and sort are read from the url and written back to it
- F-38 clicking a category tile sets the category filter, and clicking the selected tile clears it
- F-39 a filter section opens and closes and says which (aria-expanded); Hide filters hides the sidebar and Show filters brings it back
- F-40 a photo shows a LOW STOCK strip at 3 or fewer and a SOLD OUT strip at zero, and no strip otherwise
- F-41 the hero count is the whole lot and does not follow the tab; clicking the SOLD OUT tab narrows the grid to zero stock through the url
- F-42 the Filters button opens the filter drawer and Close filters closes it
- F-43 a category in the url that is not a category is ignored
- F-44 a price that is negative or not a number is ignored, and a price with decimals is rounded to whole paise
- F-45 Hide filters and Show filters hand focus to each other
- F-46 each filter section and its radio group have the same accessible name, and a closed section keeps its panel in the page, hidden

Real screens (F3)
- F-47 a request with a body sends it as json with a json content type, and a 204 response resolves to nothing
- F-48 the current user is fetched with the stored token and tells the app the role; no token means no request
- F-49 the inventory shows a loading state while the list loads, an error with a Try again button when it fails, and a "nothing on the lot yet" state when there are no vehicles at all
- F-50 the inventory shows the vehicles from the api, and the hero count is the number of vehicles the api returned
- F-51 Details opens the vehicle page, which shows a bigger photo, the same price and status block, and a back link; an unknown id shows a not found state
- F-52 an admin sees Add vehicle on the inventory; a customer does not
- F-53 the add vehicle form checks make, model, category, price, quantity and image url before sending, shows api errors, and returns to the inventory after saving
- F-54 the edit form opens with the vehicle's current values and saves with PUT; quantity is not editable there
- F-55 Delete asks for confirmation first; Cancel does nothing, and confirming deletes the vehicle and returns to the inventory
- F-56 Restock takes an amount from 1 to 1000, rejects anything else without a request, and shows the quantity the server returns
- F-57 register and login forms show the api's message inline, and a signed in user opening login or register is sent to the inventory
- F-58 Details and Edit are links to the vehicle and edit pages, not buttons
- F-59 a field error is announced as an alert, and the register password field asks for a new password
- F-60 a price must look like 1500000 or 1500000.50, a quantity and a restock amount are plain whole numbers, and an image path with .., % or a backslash is refused (no 1e3, no 19.999)
- F-61 the delete confirmation is a labelled group; focus moves to Cancel when it opens and back to Delete when it is cancelled
- F-62 if the role cannot be checked, an admin page shows the error and a Try again button; an address that does not exist is sent to the inventory

