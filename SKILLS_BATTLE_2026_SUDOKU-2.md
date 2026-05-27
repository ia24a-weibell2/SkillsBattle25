# Skills Battle 2026 – Application Development
## Killer Sudoku (Cage Sudoku)
> Version 1.1

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Rules of the Game](#2-rules-of-the-game)
3. [Architecture & Deliverables](#3-architecture--deliverables)
4. [Database](#4-database)
5. [Use Cases](#5-use-cases)
6. [Validation Rules](#6-validation-rules)
7. [Additional Use Cases](#7-additional-use-cases)
8. [Documentation Requirements](#8-documentation-requirements)
9. [Test Cases](#9-test-cases)

---

## 1. Project Overview

Build a **Killer Sudoku** (cage-sum variant) web/desktop application where users can:
- Read the rules
- Register and log in
- Enter, save, and solve puzzles
- Request hints
- View a high score board
- Auto-solve puzzles algorithmically

The UI/UX design (mockups) is part of the deliverable.  
All deliverables are submitted as `AppDev_Name_FirstName.zip`.

---

## 2. Rules of the Game

The objective is to fill a 9×9 grid with digits 1–9 such that:

| Rule | Description |
|------|-------------|
| **Row** | Each row contains each number (1–9) exactly once |
| **Column** | Each column contains each number (1–9) exactly once |
| **Nonet (3×3 box)** | Each 3×3 box contains each number (1–9) exactly once |
| **Cage sum** | The sum of all numbers in a cage equals the small number shown in the cage's corner |
| **Cage uniqueness** | No number appears more than once within the same cage |
| **Unique solution** | Every valid puzzle has exactly one solution |

---

## 3. Architecture & Deliverables

### 3.1 Deliverables (zip: `AppDev_Name_FirstName.zip`)
- [ ] Documentation (PDF): mockups, DB diagram, class diagram, use cases, validation rules, test protocol
- [ ] Executable / deployable application
- [ ] Full source code
- [ ] `sudoku.sql` – all CREATE TABLE statements with PK/FK constraints
- [ ] Test cases (submitted by **12:00**)
- [ ] Test framework results (e.g., JUnit)

### 3.2 Technology Notes
- Database: **MySQL** or **MS-SQL Server** (local), database name: `sudoku`
- Backend language: your choice
- Test framework: your choice (e.g., JUnit, pytest, NUnit, Jest)
- UI tests may be run manually without a framework

---

## 4. Database

Database name: **`sudoku`**

> Schema is free – design your own. The following tables are the minimum suggested structure.

### Suggested Tables

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO_INCREMENT | |
| `username` | VARCHAR(50) UNIQUE NOT NULL | |
| `email` | VARCHAR(100) UNIQUE NOT NULL | |
| `password_hash` | VARCHAR(255) NOT NULL | Store hashed passwords only |
| `created_at` | DATETIME | |

#### `puzzles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO_INCREMENT | |
| `creator_id` | INT FK → users.id | |
| `difficulty` | TINYINT (1–3) | 1=Easy, 2=Medium, 3=Hard |
| `created_at` | DATETIME | |
| `is_solvable` | BOOLEAN | Set by algorithm before save |

#### `cages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO_INCREMENT | |
| `puzzle_id` | INT FK → puzzles.id | |
| `target_sum` | INT NOT NULL | The cage's required sum |

#### `cage_cells`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO_INCREMENT | |
| `cage_id` | INT FK → cages.id | |
| `row` | TINYINT (0–8) | |
| `col` | TINYINT (0–8) | |

#### `results`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO_INCREMENT | |
| `user_id` | INT FK → users.id NULL | NULL = anonymized (deleted user) |
| `puzzle_id` | INT FK → puzzles.id | |
| `time_seconds` | INT | Time taken to solve |
| `hints_used` | INT | Number of hints requested |
| `score` | INT | Calculated high score |
| `solved_at` | DATETIME | |

#### `ratings` *(UC-14)*
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO_INCREMENT | |
| `user_id` | INT FK → users.id | |
| `puzzle_id` | INT FK → puzzles.id | |
| `rating` | TINYINT (1–5) NOT NULL | |
| `rated_at` | DATETIME | |

> Unique constraint on `(user_id, puzzle_id)` — one rating per user per puzzle.

#### Additional columns (from additional UCs)

`users.deleted_at` — `DATETIME NULL` — set on soft-delete (UC-12); NULL means active account.  
`puzzles.avg_rating` — `DECIMAL(3,2) NULL` — recalculated after each rating upsert (UC-14).

---

## 5. Use Cases

### UC-01: Read Rules
- **Actor:** Guest
- **Description:** On the start/home page, display:
  - The rules of Killer Sudoku
  - A visual example puzzle with cage markings
- **Precondition:** None (no login required)

---

### UC-02: Create User (Register)
- **Actor:** Guest
- **Description:** A guest can register with at minimum:
  - Username (unique)
  - Email (unique, valid format)
  - Password (with confirmation, hashed before storage)
- **Postcondition:** User account created in DB; user can log in

---

### UC-03: Login
- **Actor:** Guest / User
- **Description:** Authenticate with username/email + password
- **Postcondition:** Session/token created; user is logged in
- **Included by:** UC-04, UC-05, UC-06, UC-07, UC-08, UC-10

---

### UC-04: Enter Puzzle
- **Actor:** User (logged in)
- **Description:**
  - User draws or defines cages on a 9×9 grid
  - Assigns a target sum to each cage
  - Sets difficulty level (1 = Easy, 2 = Medium, 3 = Hard)
- **Extends:** UC-05 (save puzzle, only if solvable)
- **Validation:** See [Section 6](#6-validation-rules)

---

### UC-05: Save New Puzzle
- **Actor:** User / System
- **Description:**
  - Before saving, the system runs the solver algorithm (UC-11) to verify solvability
  - If the puzzle has exactly one valid solution → save to DB
  - If not solvable or not unique → show error, do not save
- **Precondition:** UC-04 completed with valid cage definitions

---

### UC-06: Solve Puzzle
- **Actor:** User (logged in)
- **Description:**
  - User selects a stored puzzle to play
  - User fills in cells manually
  - May request hints (UC-07)
  - May trigger check solution (UC-09)
  - Timer runs from puzzle load until solve/check

---

### UC-07: Ask for a Hint
- **Actor:** User (logged in)
- **Description:**
  - User requests a hint during solving
  - System reveals one correct cell value (suggested approach: pick the cell with fewest candidates)
  - Each hint increments `hints_used` counter (affects high score)
- **Included by:** UC-06

---

### UC-08: Show High Score
- **Actor:** User (logged in)
- **Description:**
  - Display ranking of results per puzzle or globally
  - Score formula (suggested):
    ```
    score = max(0, BASE_SCORE - (time_seconds * TIME_PENALTY) - (hints_used * HINT_PENALTY))
    ```
    Example constants: `BASE_SCORE = 10000`, `TIME_PENALTY = 1`, `HINT_PENALTY = 500`
- **Includes:** UC-03 (login required)

---

### UC-09: Check Solution
- **Actor:** User / System
- **Description:**
  - Triggered when all 81 cells are filled
  - Step 1 – Quick validation: check that the total sum of all cells = **405** (see [Section 6.2](#62-sum-validation))
  - Step 2 – Full algorithmic validation: verify rows, columns, nonets, and cage sums
  - If correct → UC-10 (save result)
  - If incorrect → highlight errors and let user continue

---

### UC-10: Save Result
- **Actor:** System
- **Description:**
  - On successful solution check: save `time_seconds`, `hints_used`, and calculated `score` to `results` table
- **Triggered by:** UC-09 (solution correct)

---

### UC-11: Auto Solve
- **Actor:** System
- **Description:**
  - Algorithmically solve any given Killer Sudoku puzzle
  - Used internally by: UC-05 (solvability check), UC-07 (hint generation)
  - Suggested algorithm: **Backtracking with constraint propagation**
  - Must verify solution uniqueness (run solver past first solution to check for a second)

---

### UC-12: Delete / Deactivate Account *(Additional – see [Section 7](#7-additional-use-cases))*
- **Actor:** User (logged in)
- **Summary:** User can permanently delete their account. Results are anonymized; session ends immediately.

---

### UC-13: Puzzle Difficulty Filter *(Additional – see [Section 7](#7-additional-use-cases))*
- **Actor:** User (logged in)
- **Summary:** When browsing puzzles, user can filter the list by difficulty level (Easy / Medium / Hard / All).

---

### UC-14: Puzzle Rating *(Additional – see [Section 7](#7-additional-use-cases))*
- **Actor:** User (logged in)
- **Summary:** After successfully solving a puzzle, user can rate it 1–5 stars. Average rating is shown in the puzzle list.

---

## 6. Validation Rules

### 6.1 Input Validation

| Field | Rule |
|-------|------|
| Username | 3–30 characters, alphanumeric + underscore, unique |
| Email | Valid email format, unique |
| Password | Min 8 characters, at least 1 digit |
| Difficulty | Integer, 1–3 only |
| Cage target sum | Integer ≥ 1; theoretical max for n cells: sum of n largest distinct digits ≤ 9 |
| Cell value (during solving) | Integer 1–9 only |
| Cage cells | Each cell (row 0–8, col 0–8); no cell in two cages; all 81 cells covered |

### 6.2 Sum Validation (Quick Check)

> **The sum of all numbers in a completed 9×9 Sudoku is always 405.**

**Calculation:**
- Each digit 1–9 appears exactly 9 times (once per row, 9 rows)
- `(1+2+3+4+5+6+7+8+9) × 9 = 45 × 9 = 405`

Use this as a **fast pre-check** before running the full algorithm.

### 6.3 Cage Validation (on puzzle entry)

- Every cell must belong to exactly one cage
- All 81 cells must be covered
- Cage target sum must be achievable with the number of cells in that cage:
  - Min possible sum for n cells: `1+2+...+n = n(n+1)/2`
  - Max possible sum for n cells: `9+8+...+(10-n) = n(19-n)/2`

### 6.4 Solution Validation (full check)

- Each row contains 1–9 exactly once
- Each column contains 1–9 exactly once
- Each 3×3 nonet contains 1–9 exactly once
- Each cage's cell values sum to the cage's target
- No repeated value within a cage

---

## 7. Additional Use Cases

> These 3 use cases were chosen because they directly extend existing functionality (account management, puzzle browsing, and solving flow) without requiring fundamentally new architecture. Each adds meaningful user value and is testable in isolation.

---

### UC-12: Delete / Deactivate Account

- **Actor:** User (logged in)
- **Justification:** Account lifecycle management is a standard requirement in any user-facing application and maps naturally onto the existing `users` table.
- **Description:**
  - User navigates to account settings and requests account deletion
  - A confirmation dialog is shown: "Are you sure? This cannot be undone."
  - On confirmation:
    - User record is soft-deleted (set `deleted_at` timestamp) OR hard-deleted from `users`
    - All `results` rows for the user are anonymized (set `user_id` to NULL or a placeholder "Deleted User")
    - Active session is terminated; user is redirected to the home/guest page
  - On cancellation: nothing changes
- **Precondition:** User is logged in
- **Postcondition:** Account is removed/deactivated; user cannot log in again with those credentials; high scores remain but show anonymized name
- **Validation:**
  - Confirmation step is mandatory (no single-click delete)
  - Password re-entry may be required as a second factor before deletion

#### Database changes for UC-12

Add to `users` table:
| Column | Type | Notes |
|--------|------|-------|
| `deleted_at` | DATETIME NULL | NULL = active; set on soft-delete |

---

### UC-13: Puzzle Difficulty Filter

- **Actor:** User (logged in)
- **Justification:** As puzzles accumulate in the database, users need a way to browse by difficulty. This is a read-only operation on existing data — zero schema changes required.
- **Description:**
  - On the puzzle list/browse screen, a filter control (buttons or dropdown) allows the user to select:
    - All (default)
    - Easy (difficulty = 1)
    - Medium (difficulty = 2)
    - Hard (difficulty = 3)
  - The puzzle list updates immediately to show only matching puzzles
  - Each puzzle entry shows: title/ID, difficulty badge, creator username, number of times solved, and average rating (if UC-14 is implemented)
  - Filter state persists during the session (re-opening the list restores the last filter)
- **Precondition:** User is logged in; at least one puzzle exists in the DB
- **Postcondition:** Filtered list is displayed; user can select a puzzle to solve
- **Validation:**
  - Filter value must be one of: `null` (all), `1`, `2`, `3`
  - If no puzzles match the filter, show a friendly empty-state message: "No puzzles found for this difficulty. Try a different level or create one!"

---

### UC-14: Puzzle Rating

- **Actor:** User (logged in)
- **Justification:** Ratings give puzzle creators feedback on quality and help other users pick good puzzles. It extends the post-solve flow naturally (after UC-09 succeeds) and adds one table to the schema.
- **Description:**
  - After successfully solving a puzzle (UC-09 returns correct), the user is prompted: "Rate this puzzle: ★☆☆☆☆"
  - User selects 1–5 stars and optionally submits
  - Rating is saved; the puzzle's average rating is recalculated and displayed in the puzzle list
  - A user can only rate a puzzle they have successfully solved
  - If a user solved the same puzzle multiple times, their most recent rating replaces the previous one
  - Users can update their rating by re-solving and re-rating, or via a "My Ratings" view
- **Precondition:** User has successfully solved the puzzle (entry exists in `results` table for this user + puzzle)
- **Postcondition:** Rating saved to DB; puzzle average rating updated
- **Validation:**
  - Rating must be an integer between 1 and 5 (inclusive)
  - Rating = 0 or > 5 → rejected
  - User must have a completed result for the puzzle (enforce via FK or application logic)

#### Database changes for UC-14

Add new table `ratings`:
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK AUTO_INCREMENT | |
| `user_id` | INT FK → users.id | |
| `puzzle_id` | INT FK → puzzles.id | |
| `rating` | TINYINT (1–5) NOT NULL | |
| `rated_at` | DATETIME | |

Unique constraint: `(user_id, puzzle_id)` — one rating per user per puzzle (upsert on re-rate).

Add to `puzzles` table (computed or stored):
| Column | Type | Notes |
|--------|------|-------|
| `avg_rating` | DECIMAL(3,2) NULL | Updated after each rating insert/update |

---

## 8. Documentation Requirements

The PDF documentation must include:

- [ ] **Mockups** – UI wireframes for each screen
- [ ] **Database diagram** – ER diagram with all tables and relationships
- [ ] **Class diagram** – Key classes/models
- [ ] **Additional use cases** – Your 3 extra UCs with justification
- [ ] **Validation rules** – All rules as defined in Section 6
- [ ] **Test protocol** – Executed test results

---

## 9. Test Cases

> For each use case: at least **1 positive**, **1 negative**, and **1 boundary** test case where applicable.
> Mark with `[UNIT]` if suitable for automated unit testing.

---

### TC-UC01: Read Rules

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC01-P1 | Positive | Open application as guest | Rules page visible, example puzzle displayed |
| TC01-N1 | Negative | Navigate directly to rules URL without server running | Appropriate error page shown |

---

### TC-UC02: Create User

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC02-P1 | Positive | Valid username, email, password | Account created, redirected to login |
| TC02-N1 | Negative | Duplicate username | Error: "Username already taken" |
| TC02-N2 | Negative | Invalid email format (`user@`) | Validation error shown |
| TC02-N3 | Negative | Password < 8 chars | Validation error shown |
| TC02-N4 | Negative | Mismatched password confirmation | Error: "Passwords do not match" |
| TC02-B1 | Boundary | Username exactly 3 chars | Accepted |
| TC02-B2 | Boundary | Username exactly 30 chars | Accepted |
| TC02-B3 | Boundary | Username 2 chars | Rejected |
| TC02-B4 | Boundary | Username 31 chars | Rejected |

---

### TC-UC03: Login

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC03-P1 | Positive | Correct credentials | Login successful, session started |
| TC03-N1 | Negative | Wrong password | Error: "Invalid credentials" |
| TC03-N2 | Negative | Non-existent username | Error: "Invalid credentials" |
| TC03-N3 | Negative | Empty fields | Validation error |
| TC03-B1 | Boundary | Password with exactly 8 chars | Accepted if correct |

---

### TC-UC04: Enter Puzzle

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC04-P1 | Positive | Valid cages covering all 81 cells, valid sums, difficulty 2 | Puzzle ready for save |
| TC04-N1 | Negative | One cell not assigned to a cage | Error: "All cells must belong to a cage" |
| TC04-N2 | Negative | One cell assigned to two cages | Error: "Cell already in a cage" |
| TC04-N3 | Negative | Cage target sum = 0 | Validation error |
| TC04-N4 | Negative | Cage target sum exceeds max for cell count | Error: "Sum not achievable" |
| TC04-B1 | Boundary | Single-cell cage with sum = 9 | Accepted |
| TC04-B2 | Boundary | Single-cell cage with sum = 10 | Rejected |
| TC04-B3 | Boundary | 9-cell cage with sum = 45 | Accepted (only valid combo: 1–9) |
| TC04-B4 | Boundary | 9-cell cage with sum = 44 | Rejected |
| TC04-N5 | Negative | Difficulty = 0 | Validation error |
| TC04-N6 | Negative | Difficulty = 4 | Validation error |

---

### TC-UC05: Save New Puzzle `[UNIT]`

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC05-P1 | Positive | Valid, uniquely solvable puzzle | Saved to DB, success message |
| TC05-N1 | Negative | Unsolvable cage configuration | Error: "Puzzle has no solution", not saved |
| TC05-N2 | Negative | Puzzle with multiple solutions | Error: "Puzzle solution is not unique", not saved |
| TC05-B1 | Boundary | Minimal valid puzzle (just barely solvable) | Saved |

---

### TC-UC06: Solve Puzzle

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC06-P1 | Positive | Select a saved puzzle and fill all cells correctly | Solution accepted |
| TC06-N1 | Negative | Enter a letter in a cell | Input rejected, only digits 1–9 allowed |
| TC06-N2 | Negative | Enter `0` in a cell | Input rejected |
| TC06-B1 | Boundary | Enter `1` in a cell | Accepted |
| TC06-B2 | Boundary | Enter `9` in a cell | Accepted |

---

### TC-UC07: Ask for a Hint

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC07-P1 | Positive | Request hint on unsolved puzzle | One correct cell revealed, `hints_used` incremented |
| TC07-P2 | Positive | Request 3 hints | Each reveals a cell, counter = 3 |
| TC07-N1 | Negative | Request hint when puzzle already complete | No hint given or graceful message |
| TC07-B1 | Boundary | Request hint when only 1 cell remains | That cell is revealed |

---

### TC-UC08: Show High Score

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC08-P1 | Positive | View high score after solving a puzzle | Scores listed, sorted by score descending |
| TC08-N1 | Negative | View high score with no results in DB | Empty state shown, no crash |
| TC08-B1 | Boundary | Two users with equal score | Both shown, tie handled gracefully |

---

### TC-UC09: Check Solution `[UNIT]`

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC09-P1 | Positive | Completely correct solution | "Correct!" shown, result saved |
| TC09-N1 | Negative | One cell wrong | "Incorrect" shown, errors highlighted |
| TC09-N2 | Negative | Total sum ≠ 405 | Quick-check fails, algorithm not needed |
| TC09-N3 | Negative | Duplicate in a row | Error detected |
| TC09-N4 | Negative | Cage sum wrong | Error detected |
| TC09-B1 | Boundary | All cells filled, sum = 405, but one cage incorrect | Algorithm catches it |

---

### TC-UC10: Save Result `[UNIT]`

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC10-P1 | Positive | Correct solution with time=120s, hints=1 | Result saved; score calculated and stored |
| TC10-N1 | Negative | DB connection lost during save | Error handled gracefully, user informed |
| TC10-B1 | Boundary | time=0 seconds (instant solve) | Result saved with score near max |
| TC10-B2 | Boundary | hints=0 | No hint penalty applied |

---

### TC-UC11: Auto Solve `[UNIT]`

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC11-P1 | Positive | Valid, solvable puzzle | Returns correct complete grid |
| TC11-N1 | Negative | Unsolvable puzzle | Returns null / no solution found |
| TC11-N2 | Negative | Puzzle with multiple solutions | Returns first solution AND flags non-uniqueness |
| TC11-B1 | Boundary | Nearly-complete puzzle (80 cells filled) | Solves final cell correctly |
| TC11-B2 | Boundary | Empty grid with cages only | Solves from scratch |
| TC11-P2 | Positive | Run twice on same puzzle | Same solution returned (deterministic) |

---

### TC-UC12: Delete Account (Additional)

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC12-P1 | Positive | User confirms account deletion | Account removed, session ended |
| TC12-N1 | Negative | User cancels deletion dialog | Account NOT deleted |

---

### TC-UC13: Puzzle Difficulty Filter (Additional)

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC13-P1 | Positive | Filter by difficulty = 1 | Only easy puzzles shown |
| TC13-N1 | Negative | No puzzles with selected difficulty in DB | Empty state with message |
| TC13-B1 | Boundary | Filter by all difficulties | All puzzles shown |

---

### TC-UC14: Puzzle Rating (Additional)

| ID | Type | Input | Expected Result |
|----|------|-------|----------------|
| TC14-P1 | Positive | Rate puzzle 4 stars after solving | Rating saved, average updated |
| TC14-N1 | Negative | Rate puzzle without solving it | Rating disallowed or prompted |
| TC14-N2 | Negative | Rate same puzzle twice | Second rating replaces first (or rejected) |
| TC14-B1 | Boundary | Rating = 1 | Accepted |
| TC14-B2 | Boundary | Rating = 5 | Accepted |
| TC14-B3 | Boundary | Rating = 0 | Rejected |
| TC14-B4 | Boundary | Rating = 6 | Rejected |

---

## Quick Reference: Score Formula

```
score = max(0, 10000 - (time_seconds * 1) - (hints_used * 500))
```

## Quick Reference: Sum Check

```
Expected total = 45 × 9 = 405
```

## Quick Reference: Cage Sum Bounds

```
min_sum(n) = n*(n+1)/2
max_sum(n) = n*(19-n)/2
```
