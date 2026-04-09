# Assignment 2 Test Cases

## Functional Test Cases

| Test Case ID | Scenario | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| TC-01 | Search functionality | Search demo page is open | Enter `selenium`, click Search | Summary shows 1 result and `Selenium Locator Handbook` appears |
| TC-02 | Login functionality | Auth demo page is open | Enter username `student`, password `qa123`, click Login | Dashboard page is shown and title contains `Dashboard` |
| TC-03 | Logout functionality | User is already logged in | Click Logout | Login screen becomes visible and title resets to `Login Demo Workspace` |
| TC-04 | Flight booking | Flight demo page is open | Choose route, date, passengers, passenger name, click Book Flight | Confirmation area is shown and page title changes to booking confirmation |
| TC-05 | Search with Enter key | Search demo page is open | Enter `playwright` and press Enter | Search result appears without clicking button |
| TC-06 | Search with empty keyword | Search demo page is open | Click Search with empty input | Validation message is displayed |
| TC-07 | Invalid login | Auth demo page is open | Enter valid username and wrong password | Error message is displayed and dashboard stays hidden |
| TC-08 | Required auth fields | Auth demo page is open | Click Login with empty username and password | Required-fields message is displayed |
| TC-09 | Flight booking validation | Flight demo page is open | Leave full name empty and click Book Flight | Validation message is displayed and confirmation stays hidden |
| TC-10 | Flight booking with alternative route | Flight demo page is open | Book Istanbul to Seoul for 3 passengers | Route and passenger count are shown in confirmation |

## Selector Coverage Table

| Test Case ID | CSS selector used | XPath selector used |
|---|---|---|
| TC-01 | `css=#search-input` | `//button[@id="search-button"]` |
| TC-02 | `css=input[name="username"]` | `//input[@name="password"]` |
| TC-03 | `css=#login-view` | `//button[@id="logout-button"]` |
| TC-04 | `css=#from-city` | `//button[@id="book-flight"]` |
| TC-05 | `css=#search-input` | `//input[@id="search-input"]` |
| TC-06 | `css=#summary` | `//button[@id="search-button"]` |
| TC-07 | `css=#error-message` | `//input[@name="password"]` |
| TC-08 | `css=#login-button` | `//div[@id="error-message"]` |
| TC-09 | `css=#flight-error` | `//section[@id="confirmation"]` |
| TC-10 | `css=#confirmation-text` | `//span[@id="route-chip"]` |

## Expected Execution Results

| Test Case ID | Status | Notes |
|---|---|---|
| TC-01 | Pass | Deterministic catalog search |
| TC-02 | Pass | Valid credentials are hardcoded for demo reliability |
| TC-03 | Pass | Logout returns to the initial view |
| TC-04 | Pass | Title checkpoint is part of the booking flow |
| TC-05 | Pass | Enter key should trigger search |
| TC-06 | Pass | Empty input should not produce fake results |
| TC-07 | Pass | Wrong password should be rejected |
| TC-08 | Pass | Empty auth fields should show validation |
| TC-09 | Pass | Empty passenger name should block booking |
| TC-10 | Pass | Alternate route booking should still succeed |
