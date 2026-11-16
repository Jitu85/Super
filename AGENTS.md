# TalentHunt Project Rules & Architecture Standards

## 1. Unified Asset & Diagram Naming Rule (MANDATORY)
The `Q. No.` column in `Master Data Collection.xlsx` is the **unique primary key** of the question bank.

* **Question Diagrams**:
  * Must strictly follow the formula:
    `{Q_No}.svg` (e.g., `8.svg`, `34.svg`, `779.svg`, `1423.svg`)
  * Under **NO CIRCUMSTANCES** use legacy grade or subject suffixes (such as `8IIIA.svg`, `779VIIM.svg`, `M10E010.svg`, or `S7H003.svg`).

* **Option Diagrams**:
  * When answer options are image diagrams rather than plain text, they must strictly follow the formula:
    `{Q_No}_{Letter}.svg` (e.g., `8_A.svg`, `8_B.svg`, `1423_A.svg`, `1424_A.svg`)
  * In `Master Data Collection.xlsx`, the option columns (`Option A`, `Option B`, etc.) must be written as `{Q_No}_A`, `{Q_No}_B`, etc., and the `Image` column must be set to `Yes`.

## 2. Directory Synchronization Workflow
The authoring source of truth lives in `C:\Users\HP\Documents\Q&A\`.
Whenever any new question, option image, or Excel data is added or modified:
1. Master Files: `C:\Users\HP\Documents\Q&A\Questions\` and `Options\`
2. Project Web Files: `public/assets/questions/` and `public/assets/options/`
3. Project Repository Mirror: `data/Questions/` and `data/Options/`
4. Master Excel: Update both `C:\Users\HP\Documents\Q&A\Master Data Collection.xlsx` and `data/Master Data Collection.xlsx`.
5. JSON & DB: Update `data/master_questions.json`, execute `npm run import-master` to sync `data/talenthunt.db`, and mirror the database back to `C:\Users\HP\Documents\Q&A\`.

## 3. Practice & Exam Engine Integrity
* **Option Evaluation**: Never hardcode `correct_option: 0`. Always dynamically resolve `correct_option` by matching `correct_answer` against the question's `options` array.
* **HTML Markup in Prompts**: Always render question text using `.innerHTML` (never `.textContent`) so underline (`<u>`), bold (`<b>`), and line breaks display properly.
* **Hints vs. Explanations**: Keep `hint` (teacher's guiding clue) and `explanation` (full grammatical/mathematical solution) distinct.
