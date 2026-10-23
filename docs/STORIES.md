# User stories

Dhyey Tandel Motors (DTM) is a car dealership inventory app. These stories are the brief, cut into small slices. Each backend behaviour in `TEST_LIST.md` traces back to one of these.

Roles: **visitor** (no account), **customer** (registered), **admin** (seeded).

## Auth

**A1. Register.** As a visitor, I want to register with an email and password, so that I can use the dealership.
- Every new account is a customer. There is no way to pick a role.
- A second registration with the same email is refused, whatever the letter case.
- Registering returns the new account, not a token. The user then logs in.

**A2. Log in.** As a customer or admin, I want to log in with my email and password, so that I get a token for the other endpoints.
- Login takes a JSON body with email and password.
- A wrong password and an unknown email look the same to the caller.

**A3. Protected endpoints.** As the dealership, I want every vehicle and inventory endpoint to need a valid token, so that strangers cannot read or change stock.

**A4. Seeded admin.** As the owner, I want an admin account created by a seed script, so that nobody can make themselves an admin through the API.
- Running the script twice does not create two admins.
- If the admin email was already registered as a customer, the script makes it the admin and sets the configured password, so whoever registered it first does not keep access.

## Vehicles

**V1. Add a vehicle.** As an admin, I want to add a vehicle with make, model, category, price and starting quantity, so that it appears in the catalogue.
- Customers cannot add vehicles.

**V2. Browse vehicles.** As a customer, I want to see every vehicle, including ones with zero stock, so that I know what the dealership carries and what is sold out.

**V3. Update a vehicle.** As an admin, I want to correct a vehicle's make, model, category or price, so that the catalogue stays accurate.
- Make, model, category and price are all required, and replace the old values.
- Quantity is not accepted here. A request that includes it is refused. Stock only moves through purchase and restock.

**V4. Delete a vehicle.** As an admin, I want to delete a vehicle, so that models we no longer carry disappear.

## Search

**S1. Search vehicles.** As a customer, I want to search by make, model, category and price range, alone or combined, so that I can find a car I can afford.
- Out of stock vehicles still show up in results.

## Inventory

**I1. Purchase.** As a signed-in user, I want to buy one unit of a vehicle, so that I get the car and the stock drops by one.
- Any signed-in user can buy, admins included.
- Buying the last unit is fine. Buying when stock is zero is refused, and stock never goes below zero, even when many people buy at the same moment.

**I2. Restock.** As an admin, I want to add units to a vehicle's stock, so that sold-out cars can be sold again.

## Frontend

**F1. Register and log in.** As a visitor, I want register and login forms, so that I can get into the app.

**F2. Dashboard.** As a customer, I want a page showing every vehicle, so that I can see the whole catalogue.
- Zero stock vehicles are shown as out of stock.

**F3. Search and filter.** As a customer, I want search and filter controls on the dashboard, so that I can narrow the list without leaving the page.

**F4. Purchase button.** As a customer, I want a Purchase button on every vehicle, disabled when stock is zero, so that I cannot try to buy what is not there.
- If the server still says out of stock (someone else bought first), I see a clear message and the list refreshes.

**F5. Admin tools.** As an admin, I want forms to add, update, delete and restock vehicles, so that I can run the catalogue from the UI.
- Customers do not see these controls.

**F6. Looks and feel.** As any user, I want a clean, responsive layout that works on a phone, so that the app is pleasant to use.

## Delivery

**D1. Continuous integration.** As a developer, I want every push to run lint, type checks and tests for backend and frontend, so that main is always releasable.
- Migrations run from an empty database to the latest and back down again.
- Frontend tests are listed in `TEST_LIST.md` (F-01 onward).

**D2. Small releases.** As the owner, I want the app deployed on my VPS with Docker Compose and Caddy behind Cloudflare, and redeployed from main in small steps, so that each finished slice is live.
- A health endpoint answers when the database answers, so Docker and Caddy can tell the app is up.
- The app refuses to start without its secret key.
- Only the configured frontend origin may call the API from a browser.

**D3. Brief deliverables.** As the reviewer at Incubyte, I want a README (setup, screenshots, test report, "My AI Usage"), a `PROMPTS.md` with raw chat logs, and AI co-author trailers on commits, so that I can see how the work was done.

## Out of scope for one day

Written down so it is a decision, not an oversight.

- Refresh tokens. Access tokens just expire, and the user logs in again.
- Email verification.
- Pagination. The list returns everything.
- Purchase history. Nothing records who bought what.
- Hiding the login timing difference between an unknown email and a wrong password.

## Answers to the open questions

All five are decided and logged in `DECISIONS.md`. Later entries there supersede some of these answers (currency, categories, PUT with quantity).

1. **Who can add a vehicle?** Admin only.
2. **Does PUT change quantity?** No, and sending it is a 422.
3. **Login identifier?** Email and password.
4. **Category values?** A fixed list: sedan, suv, hatchback, coupe, truck, ev.
5. **Currency?** INR, prices stored in paise.
