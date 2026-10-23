# Backend test list

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
- A-09 api: a `role: "admin"` field in the body is ignored and the account is a customer
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

Token checks
- A-20 api: a request with no token returns 401 on every vehicle and inventory route
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

## Vehicles (V1 to V4)

Create
- V-01 unit: adding a vehicle stores make, model, category, price and quantity
- V-02 api: `POST /api/vehicles` as admin returns 201 with the vehicle and its id
- V-03 api: as customer returns 403
- V-04 api: without a token returns 401
- V-05 api: ids are unique across two creations
- V-06 api: empty make or model returns 422
- V-07 api: a category outside the fixed list returns 422
- V-08 api: price of zero or less, or above the maximum, returns 422
- V-09 api: price sent as a decimal (`10.5`) or a string returns 422
- V-10 api: negative quantity returns 422
- V-11 api: two vehicles with the same make and model are allowed

List
- V-12 api: `GET /api/vehicles` as customer returns all vehicles
- V-13 api: vehicles with quantity zero are included
- V-14 api: with no vehicles it returns 200 and an empty list
- V-15 api: without a token returns 401

Update
- V-16 unit: updating replaces make, model, category and price
- V-17 unit: updating a missing id raises `VehicleNotFound`
- V-18 api: `PUT /api/vehicles/{id}` as admin returns 200 with the new values
- V-19 api: as customer returns 403
- V-20 api: missing id returns 404
- V-21 api: a `quantity` field in the body does not change stock
- V-22 api: a body missing any of make, model, category or price returns 422
- V-23 api: invalid values return 422 and the stored vehicle is unchanged
- V-24 api: an id that is not a number, is zero or negative, or is above the maximum id returns 422
- V-25 db: updating changes only the four editable columns, so a purchase made just before is not overwritten

Delete
- V-26 unit: deleting removes the vehicle
- V-27 unit: deleting a missing id raises `VehicleNotFound`
- V-28 api: `DELETE /api/vehicles/{id}` as admin returns 204
- V-29 api: the deleted vehicle no longer appears in the list
- V-30 api: as customer returns 403 and the vehicle remains
- V-31 api: missing id returns 404
- V-32 api: deleting the same id twice returns 204 then 404

## Search (S1)

Route is `GET /api/vehicles/search`. Filters combine with AND. Text filters ignore letter case. Price bounds are inclusive and in cents. The filtering is SQL, so those tests are `db`.

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
- S-11 db: `%` and `_` in the search text are matched literally, not as wildcards
- S-12 unit: minimum price above maximum price raises `InvalidPriceRange`
- S-13 api: `GET /api/vehicles/search?make=toyota` returns matching vehicles
- S-14 api: no match returns 200 and an empty list, not 404
- S-15 api: out of stock vehicles are included in results
- S-16 api: `InvalidPriceRange` returns 422
- S-17 api: negative or non-integer price bound returns 422
- S-18 api: a category outside the fixed list returns 422
- S-19 api: without a token returns 401
- S-20 api: `/search` is not read as a vehicle id (route order)
- S-21 api: blank search text (`make=`) behaves like no filter

## Inventory (I1, I2)

Purchase
- I-01 unit: purchasing a vehicle with stock returns the vehicle with quantity one lower
- I-02 unit: purchasing with zero stock raises `OutOfStock`
- I-03 unit: purchasing a missing vehicle raises `VehicleNotFound`
- I-04 db: purchase lowers quantity by exactly one
- I-05 db: purchase of the last unit succeeds and leaves quantity zero
- I-06 db: purchase at zero stock changes nothing and returns nothing
- I-07 db: the database refuses a negative quantity (check constraint, last line of defence)
- I-08 db: two concurrent purchases of the last unit give one success and one `OutOfStock`
- I-09 db: N concurrent purchases against stock below N give exactly stock-many successes, the rest `OutOfStock`, final quantity zero
- I-10 api: `POST /api/vehicles/{id}/purchase` as customer returns 200 with the full vehicle and its new quantity
- I-11 api: as admin also returns 200
- I-12 api: out of stock returns 409 and the stock is still zero
- I-13 api: missing id returns 404
- I-14 api: without a token returns 401
- I-15 api: the request body is ignored and exactly one unit is bought

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

## Edge cases and cross-cutting

Errors
- E-01 api: every error body has the same shape (`detail` message)
- E-02 api: an unexpected exception returns 500 with no stack trace or internals in the body (test client created with `raise_server_exceptions=False`)
- E-03 api: when several things are wrong, the order is 401, then 403, then 422, then 404 (a customer sending an invalid PUT body to a missing id gets 403)
- E-04 api: every admin route refuses a customer token with 403 (one parametrised test over a table of method and path)

Data and format
- E-05 db: price is stored and returned as an integer number of cents
- E-06 api: make and model over the maximum length return 422
- E-07 api: make and model have surrounding whitespace trimmed
- E-08 api: unknown extra fields in a body are ignored
- E-09 api: a body that is not valid JSON returns 422

Operations
- E-10 api: CORS allows only the configured frontend origin
- E-11 api: `GET /api/health` returns 200 when the database answers
- E-12 unit: the app refuses to start when the secret key setting is missing
- E-13 db: migrations run from an empty database up to head, and down again
