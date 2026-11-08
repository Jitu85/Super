# Question Asset & Diagram Naming Convention

This document defines the official naming conventions for all question and option image assets in the **Talent Hunt** platform.

---

## 1. Question Diagram Naming Pattern

Every question diagram image (.svg) is uniquely linked to its question in `Master Data Collection.xlsx` using the following formula:

$$\text{FileName} = \langle\text{Q. No.}\rangle\langle\text{Class in Roman}\rangle\langle\text{Subject Initial}\rangle\text{.svg}$$

### Components:
1. **$\langle\text{Q. No.}\rangle$**: The exact integer serial number from the `Q. No.` column in `Master Data Collection.xlsx` (e.g., `8`, `26`, `779`, `1319`).
2. **$\langle\text{Class in Roman}\rangle$**: The Roman numeral of the student's grade:
   - Class 3 &rarr; `III`
   - Class 4 &rarr; `IV`
   - Class 5 &rarr; `V`
   - Class 6 &rarr; `VI`
   - Class 7 &rarr; `VII`
   - Class 8 &rarr; `VIII`
   - Class 9 &rarr; `IX`
   - Class 10 &rarr; `X`
3. **$\langle\text{Subject Initial}\rangle$**: Single-letter identifier of the academic subject:
   - `A` = Aptitude / Reasoning
   - `M` = Mathematics
   - `S` = Science
   - `E` = English

---

## 2. Option Diagram Naming Pattern

When individual answer choices are themselves diagrams rather than plain text, option images follow this formula:

$$\text{OptionFileName} = \langle\text{Q. No.}\rangle\langle\text{Option Letter}\rangle\text{-}\langle\text{Class in Roman}\rangle\langle\text{Subject Initial}\rangle\text{.svg}$$

### Examples:
- Question 8, Option A, Class 3 Aptitude &rarr; `8A-IIIA.svg`
- Question 8, Option B, Class 3 Aptitude &rarr; `8B-IIIA.svg`
- Question 12, Option D, Class 3 Aptitude &rarr; `12D-IIIA.svg`
- Question 38, Option C, Class 3 Aptitude &rarr; `38C-IIIA.svg`

---

## 3. Real Question Examples

| Q. No. | Class | Subject | Diagram Type | Generated SVG Filename |
| :---: | :---: | :---: | :--- | :--- |
| **8** | Class 3 | Aptitude | Visual spatial combination | `8IIIA.svg` (and options `8A-IIIA.svg` ... `8D-IIIA.svg`) |
| **26** | Class 3 | Aptitude | Function Machine diagram | `26IIIA.svg` |
| **31** | Class 3 | Aptitude | Monkey climbing pole | `31IIIA.svg` |
| **38** | Class 3 | Aptitude | Paper folding & hole punch | `38IIIA.svg` (and options `38A-IIIA.svg` ... `38D-IIIA.svg`) |
| **779** | Class 7 | Mathematics | Isosceles triangle ABC (5 cm, 5 cm, 8 cm) | `779VIIM.svg` |
| **782** | Class 7 | Mathematics | 90° Right angle with vertex arc | `782VIIM.svg` |
| **786** | Class 7 | Mathematics | Symmetry comparison figures | `786VIIM.svg` |
| **790** | Class 7 | Mathematics | Composite joined rectangles | `790VIIM.svg` |
| **802** | Class 7 | Science | Leaf anatomy with petiole & lamina | `802VIIS.svg` |
| **808** | Class 7 | Science | Thermometer temperature scale | `808VIIS.svg` |
| **812** | Class 7 | Science | Rusting iron nail | `812VIIS.svg` |
| **816** | Class 7 | Science | Wind speed anemometer | `816VIIS.svg` |
| **822** | Class 7 | Science | Mirror reflection & normal | `822VIIS.svg` |
| **825** | Class 7 | Science | Digestive system absorption | `825VIIS.svg` |
| **828** | Class 7 | Science | Trophic food chain | `828VIIS.svg` |
| **1319** | Class 10 | Science | Electroplating cell apparatus | `1319XS.svg` |
| **1323** | Class 10 | Science | Human digestive tract | `1323XS.svg` |
| **1327** | Class 10 | Science | Electric circuit with cell, bulb, switch | `1327XS.svg` |

---

## 4. Storage Locations

All question diagram files must reside in:
1. `public/assets/questions/` — Primary live location served by Express to student browsers.
2. `data/Questions/` — Internal authoring / backup archive matching repository structure.

Option diagram files must reside in:
1. `public/assets/options/` — Live browser location.
2. `data/Options/` — Authoring / backup archive.

