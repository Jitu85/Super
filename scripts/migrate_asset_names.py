import os
import re
import json
import openpyxl

print("🚀 Starting TalentHunt Unified Asset Naming Migration...")

# 1. OPTION SVGS MIGRATION
opt_dirs = [
    r"C:\Users\HP\Documents\Q&A\Options",
    r"c:\Users\HP\Documents\Fax\TalentHunt\public\assets\options",
    r"c:\Users\HP\Documents\Fax\TalentHunt\data\Options"
]

option_rename_map = {
    '8A-IIIA.svg': '8_A.svg',
    '8B-IIIA.svg': '8_B.svg',
    '8C-IIIA.svg': '8_C.svg',
    '8D-IIIA.svg': '8_D.svg',
    '12A-IIIA.svg': '12_A.svg',
    '12B-IIIA.svg': '12_B.svg',
    '12C-IIIA.svg': '12_C.svg',
    '12D-IIIA.svg': '12_D.svg',
    '38A-IIIA.svg': '38_A.svg',
    '38B-IIIA.svg': '38_B.svg',
    '38C-IIIA.svg': '38_C.svg',
    '38D-IIIA.svg': '38_D.svg',
}

for d in opt_dirs:
    if not os.path.exists(d):
        continue
    print(f"\n📂 Processing Options directory: {d}")
    for old_name, new_name in option_rename_map.items():
        old_path = os.path.join(d, old_name)
        new_path = os.path.join(d, new_name)
        if os.path.exists(old_path):
            # We copy to new name, and keep old name as alias or replace
            # Copying content to new_path
            with open(old_path, 'rb') as f_in:
                content = f_in.read()
            with open(new_path, 'wb') as f_out:
                f_out.write(content)
            # Remove old file to enforce clean single standard
            os.remove(old_path)
            print(f"  ✓ Renamed: {old_name} -> {new_name}")

# 2. QUESTION SVGS MIGRATION
q_dirs = [
    r"C:\Users\HP\Documents\Q&A\Questions",
    r"c:\Users\HP\Documents\Fax\TalentHunt\public\assets\questions",
    r"c:\Users\HP\Documents\Fax\TalentHunt\data\Questions"
]

for d in q_dirs:
    if not os.path.exists(d):
        continue
    print(f"\n📂 Processing Questions directory: {d}")
    files = sorted(os.listdir(d))
    renamed_count = 0
    for f in files:
        m = re.match(r"^(\d+)([A-Za-z0-9_-]*)\.svg$", f)
        if m and m.group(2) != "": # Has extra suffix
            q_no = m.group(1)
            new_name = f"{q_no}.svg"
            old_path = os.path.join(d, f)
            new_path = os.path.join(d, new_name)
            
            with open(old_path, 'rb') as f_in:
                content = f_in.read()
            with open(new_path, 'wb') as f_out:
                f_out.write(content)
            os.remove(old_path)
            renamed_count += 1
    print(f"  ✓ Standardized {renamed_count} question diagrams to {{q_no}}.svg in {d}")

# 3. UPDATE MASTER EXCEL FILES
excel_files = [
    r"C:\Users\HP\Documents\Q&A\Master Data Collection.xlsx",
    r"c:\Users\HP\Documents\Fax\TalentHunt\data\Master Data Collection.xlsx"
]

for ef in excel_files:
    if not os.path.exists(ef):
        continue
    print(f"\n📊 Updating Excel file: {ef}")
    wb = openpyxl.load_workbook(ef)
    sheet = wb.active
    
    # Iterate through rows
    updated_rows = 0
    for r in range(2, sheet.max_row + 1):
        q_no_val = str(sheet.cell(row=r, column=1).value or '').strip()
        
        # Row for Q8
        if q_no_val == '8':
            sheet.cell(row=r, column=3, value='8_A')
            sheet.cell(row=r, column=4, value='8_B')
            sheet.cell(row=r, column=5, value='8_C')
            sheet.cell(row=r, column=6, value='8_D')
            sheet.cell(row=r, column=8, value='8_B')
            exp = str(sheet.cell(row=r, column=9).value or '')
            sheet.cell(row=r, column=9, value=exp.replace('8B-IIIA', '8_B'))
            updated_rows += 1
            
        # Row for Q12
        elif q_no_val == '12':
            sheet.cell(row=r, column=3, value='12_A')
            sheet.cell(row=r, column=4, value='12_B')
            sheet.cell(row=r, column=5, value='12_C')
            sheet.cell(row=r, column=6, value='12_D')
            sheet.cell(row=r, column=8, value='12_D')
            exp = str(sheet.cell(row=r, column=9).value or '')
            sheet.cell(row=r, column=9, value=exp.replace('12D-IIIA', '12_D'))
            updated_rows += 1
            
        # Row for Q38
        elif q_no_val == '38':
            sheet.cell(row=r, column=3, value='38_A')
            sheet.cell(row=r, column=4, value='38_B')
            sheet.cell(row=r, column=5, value='38_C')
            sheet.cell(row=r, column=6, value='38_D')
            sheet.cell(row=r, column=8, value='38_B')
            exp = str(sheet.cell(row=r, column=9).value or '')
            sheet.cell(row=r, column=9, value=exp.replace('38B-IIIA', '38_B'))
            updated_rows += 1

        # Row for Q1423
        elif q_no_val == '1423':
            sheet.cell(row=r, column=3, value='1423_A')
            sheet.cell(row=r, column=4, value='1423_B')
            sheet.cell(row=r, column=5, value='1423_C')
            sheet.cell(row=r, column=6, value='1423_D')
            sheet.cell(row=r, column=8, value='1423_B')
            updated_rows += 1

        # Row for Q1424
        elif q_no_val == '1424':
            sheet.cell(row=r, column=3, value='1424_A')
            sheet.cell(row=r, column=4, value='1424_B')
            sheet.cell(row=r, column=5, value='1424_C')
            sheet.cell(row=r, column=6, value='1424_D')
            sheet.cell(row=r, column=7, value='Yes')
            sheet.cell(row=r, column=8, value='1424_A')
            updated_rows += 1
            
    wb.save(ef)
    print(f"  ✓ Saved {updated_rows} updated rows in {ef}")

# 4. UPDATE master_questions.json
json_path = r"c:\Users\HP\Documents\Fax\TalentHunt\data\master_questions.json"
print(f"\n📄 Updating master_questions.json at {json_path}")
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

json_q_diagram_updated = 0
json_opt_diagram_updated = 0

for q in questions:
    q_no = str(q['q_no'])
    
    # 1. Standardize question diagram reference
    # Replace /assets/questions/<legacy>.svg with /assets/questions/{q_no}.svg
    if '/assets/questions/' in q.get('question_text', ''):
        q['question_text'] = re.sub(
            r'/assets/questions/[a-zA-Z0-9_\-]+\.svg',
            f'/assets/questions/{q_no}.svg',
            q['question_text']
        )
        q['image_filename'] = f"{q_no}.svg"
        json_q_diagram_updated += 1
        
    # Wire Q34 diagram if not already wired
    if q_no == '34' and '/assets/questions/' not in q.get('question_text', ''):
        diagram_html = f'<br><div class="olympiad-img-box" style="text-align:center; margin:14px 0;"><img src="/assets/questions/34.svg" class="olympiad-question-img" style="max-height:140px; width:auto; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06);" alt="5 Boxes Alphabet Pattern"></div>'
        q['question_text'] = q['question_text'] + diagram_html
        q['has_image'] = True
        q['image_filename'] = '34.svg'
        json_q_diagram_updated += 1

    # 2. Standardize option diagrams
    # Q8
    if q_no == '8':
        q['options'] = [
            f'<img src="/assets/options/8_A.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="8_A"> <span>Option A</span>',
            f'<img src="/assets/options/8_B.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="8_B"> <span>Option B</span>',
            f'<img src="/assets/options/8_C.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="8_C"> <span>Option C</span>',
            f'<img src="/assets/options/8_D.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="8_D"> <span>Option D</span>'
        ]
        q['correct_answer'] = q['options'][1]
        json_opt_diagram_updated += 1
        
    # Q12
    elif q_no == '12':
        q['options'] = [
            f'<img src="/assets/options/12_A.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="12_A"> <span>Option A</span>',
            f'<img src="/assets/options/12_B.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="12_B"> <span>Option B</span>',
            f'<img src="/assets/options/12_C.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="12_C"> <span>Option C</span>',
            f'<img src="/assets/options/12_D.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="12_D"> <span>Option D</span>'
        ]
        q['correct_answer'] = q['options'][3]
        json_opt_diagram_updated += 1

    # Q38
    elif q_no == '38':
        q['options'] = [
            f'<img src="/assets/options/38_A.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="38_A"> <span>Option A</span>',
            f'<img src="/assets/options/38_B.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="38_B"> <span>Option B</span>',
            f'<img src="/assets/options/38_C.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="38_C"> <span>Option C</span>',
            f'<img src="/assets/options/38_D.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="38_D"> <span>Option D</span>'
        ]
        q['correct_answer'] = q['options'][1]
        json_opt_diagram_updated += 1

    # Q1423
    elif q_no == '1423':
        q['options'] = [
            f'<img src="/assets/options/1423_A.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1423_A"> <span>Option A</span>',
            f'<img src="/assets/options/1423_B.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1423_B"> <span>Option B</span>',
            f'<img src="/assets/options/1423_C.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1423_C"> <span>Option C</span>',
            f'<img src="/assets/options/1423_D.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1423_D"> <span>Option D</span>'
        ]
        q['correct_answer'] = q['options'][1]
        json_opt_diagram_updated += 1

    # Q1424
    elif q_no == '1424':
        q['options'] = [
            f'<img src="/assets/options/1424_A.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1424_A"> <span>Option A (10:05 am)</span>',
            f'<img src="/assets/options/1424_B.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1424_B"> <span>Option B (9:55 am)</span>',
            f'<img src="/assets/options/1424_C.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1424_C"> <span>Option C (10:15 am)</span>',
            f'<img src="/assets/options/1424_D.svg" class="olympiad-option-img" style="max-height:75px; width:auto; max-width:100%; object-fit:contain;" alt="1424_D"> <span>Option D (9:05 am)</span>'
        ]
        q['correct_answer'] = q['options'][0]
        json_opt_diagram_updated += 1

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"  ✓ Updated {json_q_diagram_updated} question diagram links in master_questions.json")
print(f"  ✓ Updated {json_opt_diagram_updated} option diagram sets in master_questions.json")
print("\n✅ Asset files and JSON updated successfully!")
