# Question Asset & Diagram Naming Convention (Unified Standard)

This document defines the official naming conventions for all question and option image assets in the **Talent Hunt** platform.

---

## 1. Question Diagram Naming Pattern

Every question diagram image (.svg) is uniquely linked to its question in `Master Data Collection.xlsx` using the following standardized formula:

$$\text{FileName} = \langle\text{Q. No.}\rangle\text{.svg}$$

### Components:
1. **$\langle\text{Q. No.}\rangle$**: The exact integer serial number from the `Q. No.` column in `Master Data Collection.xlsx` (e.g., `8.svg`, `26.svg`, `34.svg`, `779.svg`, `1319.svg`, `1423.svg`).

---

## 2. Option Diagram Naming Pattern

When individual answer choices are themselves diagrams rather than plain text, option images follow this formula:

$$\text{OptionFileName} = \langle\text{Q. No.}\rangle\text{\_}\langle\text{Option Letter}\rangle\text{.svg}$$

### Examples:
- Question 8, Option A &rarr; `8_A.svg`
- Question 8, Option B &rarr; `8_B.svg`
- Question 12, Option D &rarr; `12_D.svg`
- Question 38, Option C &rarr; `38_C.svg`
- Question 1423, Option A &rarr; `1423_A.svg`
- Question 1424, Option A &rarr; `1424_A.svg`

---

## 3. Real Question Examples

| Q. No. | Class | Subject | Diagram Type | Generated SVG Filename |
| :---: | :---: | :---: | :--- | :--- |
| **8** | Class 3 | Aptitude | Visual spatial combination | `8.svg` (and options `8_A.svg` ... `8_D.svg`) |
| **12** | Class 3 | Aptitude | Matrix Analogy Grid | `12.svg` (and options `12_A.svg` ... `12_D.svg`) |
| **13** | Class 3 | Aptitude | Triangle Counting Diagram | `13.svg` |
| **14** | Class 3 | Aptitude | Apple Picking Bar Chart | `14.svg` |
| **26** | Class 3 | Aptitude | Function Machine diagram | `26.svg` |
| **31** | Class 3 | Aptitude | Monkey climbing pole | `31.svg` |
| **34** | Class 3 | Aptitude | 5 Boxes Alphabet Pattern | `34.svg` |
| **36** | Class 3 | Aptitude | Tap Water Flowchart | `36.svg` |
| **38** | Class 3 | Aptitude | Paper folding & hole punch | `38.svg` (and options `38_A.svg` ... `38_D.svg`) |
| **779** | Class 7 | Mathematics | Isosceles triangle ABC (5 cm, 5 cm, 8 cm) | `779.svg` |
| **782** | Class 7 | Mathematics | 90° Right angle with vertex arc | `782.svg` |
| **786** | Class 7 | Mathematics | Symmetry comparison figures | `786.svg` |
| **790** | Class 7 | Mathematics | Composite joined rectangles | `790.svg` |
| **802** | Class 7 | Science | Leaf anatomy with petiole & lamina | `802.svg` |
| **808** | Class 7 | Science | Thermometer temperature scale | `808.svg` |
| **812** | Class 7 | Science | Rusting iron nail | `812.svg` |
| **816** | Class 7 | Science | Wind speed anemometer | `816.svg` |
| **822** | Class 7 | Science | Mirror reflection & normal | `822.svg` |
| **825** | Class 7 | Science | Digestive system absorption | `825.svg` |
| **828** | Class 7 | Science | Trophic food chain | `828.svg` |
| **1319** | Class 10 | Science | Electroplating cell apparatus | `1319.svg` |
| **1323** | Class 10 | Science | Human digestive tract | `1323.svg` |
| **1327** | Class 10 | Science | Electric circuit with cell, bulb, switch | `1327.svg` |
| **1423** | Class 3 | Aptitude | Mirror image reflection | `1423.svg` (and options `1423_A.svg` ... `1423_D.svg`) |
| **1424** | Class 3 | Mathematics | Badminton court clock time | Options `1424_A.svg` ... `1424_D.svg` |

---

## 4. Storage Locations

All question diagram files must reside in:
1. `public/assets/questions/` — Primary live location served by Express to student browsers.
2. `data/Questions/` — Internal authoring / backup archive matching repository structure.
3. `C:\Users\HP\Documents\Q&A\Questions\` — External Master Authoring Directory.

Option diagram files must reside in:
1. `public/assets/options/` — Live browser location.
2. `data/Options/` — Authoring / backup archive.
3. `C:\Users\HP\Documents\Q&A\Options\` — External Master Authoring Directory.

Option diagram files must reside in:
1. `public/assets/options/` — Live browser location.
2. `data/Options/` — Authoring / backup archive.

