# Platform Blueprint & Design Architecture Archive

This directory permanently archives the foundational business blueprint, architectural diagrams, wireframe specifications, and original raw question bank data for the TalentHunt platform (formerly preserved in the external `Quiz` directory).

## 1. Master Strategic Documents
- **[`Kids_Competitive_Exam_Platform_Blueprint.pdf`](./Kids_Competitive_Exam_Platform_Blueprint.pdf)**: Complete 2.3 MB platform blueprint covering market analysis, value proposition, question bank architecture, parent/student dashboards, and monetization strategy.
- **[`blueprint.html`](./blueprint.html)**: Standalone HTML documentation with embedded print stylesheets, wireframe specifications (Pages 1 to 10), and design tokens.

## 2. High-Resolution Architecture & Business Diagrams
- **`diagram_architecture.png`**: Multi-tier system architecture (Client SPA, Express/Node.js API, SQLite/PostgreSQL Database Adapter, Content Engine).
- **`diagram_database_schema.png`**: Relational entity relationship diagram (Users, Subjects, Topics, Lessons, Questions, Olympiad Exams, Progress, Badges).
- **`diagram_user_flow.png`**: Complete student, parent, and admin user journey map.
- **`chart_competitive_landscape.png`**: Competitive positioning matrix against traditional EdTech and Olympiad providers.
- **`chart_revenue_model.png`**: Financial model, subscription tiers, and unit economics.

## 3. Original Source Data Archives
- **`source_data/olympiad_question_bank_v3.csv`**: Source dataset of 720 questions for CBSE Classes 3 to 6 (Mathematics, Science, English).
- **`source_data/Properly_Merged_Quizzes.html`**: Source dataset of 660 questions for CBSE Classes 7 to 10 with 88 inline vector diagrams.

> [!NOTE]
> All 1,421 questions and 88 SVGs have been merged, formatted, and deployed into:
> - `data/Master Data Collection.xlsx`
> - `data/master_questions.json`
> - `public/assets/questions/`
> - `src/db/seedData.js`
