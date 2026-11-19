import os
import re
import json
import openpyxl
import subprocess

# -------------------------------------------------------------------------
# 1. GENERATE SVG VECTOR DIAGRAM FOR Q 1942 (FLOWER ANATOMY)
# -------------------------------------------------------------------------
svg_1942 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <style>
      .bg { fill: #f8fafc; }
      .petal { fill: #fbcfe8; stroke: #db2777; stroke-width: 2.5; }
      .sepal { fill: #86efac; stroke: #15803d; stroke-width: 2.5; }
      .receptacle { fill: #4ade80; stroke: #15803d; stroke-width: 2; }
      .stamen { stroke: #d97706; stroke-width: 2.5; fill: none; }
      .anther { fill: #fde047; stroke: #b45309; stroke-width: 2; }
      .carpel { fill: #bbf7d0; stroke: #166534; stroke-width: 3; }
      .ovule { fill: #fef08a; stroke: #ca8a04; stroke-width: 1.5; }
      .label-box { fill: #ffffff; stroke: #1e293b; stroke-width: 1.5; rx: 6; }
      .label-text { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; fill: #1e293b; text-anchor: middle; }
      .p-badge { fill: #ef4444; stroke: #b91c1c; stroke-width: 2; rx: 8; }
      .p-text { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; fill: #ffffff; text-anchor: middle; }
      .pointer { stroke: #ef4444; stroke-width: 2.5; stroke-dasharray: 4,4; }
    </style>
  </defs>

  <rect width="500" height="400" class="bg" rx="16"/>
  
  <!-- Flower Stem & Receptacle -->
  <path d="M 250 340 L 250 380" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>
  <path d="M 225 340 C 225 315 275 315 275 340 Z" class="receptacle"/>
  
  <!-- Sepals (Calyx) -->
  <path d="M 225 330 C 180 340 160 300 150 280 C 180 300 215 315 230 330 Z" class="sepal"/>
  <path d="M 275 330 C 320 340 340 300 350 280 C 320 300 285 315 270 330 Z" class="sepal"/>

  <!-- Petals (Corolla) -->
  <path d="M 200 320 C 120 300 80 180 140 100 C 180 160 210 240 220 300 Z" class="petal" opacity="0.9"/>
  <path d="M 300 320 C 380 300 420 180 360 100 C 320 160 290 240 280 300 Z" class="petal" opacity="0.9"/>
  <path d="M 220 300 C 180 200 220 80 250 50 C 280 80 320 200 280 300 Z" class="petal" opacity="0.95"/>

  <!-- Male Stamens (Filament + Anther) -->
  <path d="M 225 310 C 170 280 160 180 175 140" class="stamen"/>
  <ellipse cx="175" cy="135" rx="10" ry="6" class="anther"/>
  
  <path d="M 230 310 C 190 260 185 190 200 150" class="stamen"/>
  <ellipse cx="200" cy="145" rx="10" ry="6" class="anther"/>

  <path d="M 270 310 C 310 260 315 190 300 150" class="stamen"/>
  <ellipse cx="300" cy="145" rx="10" ry="6" class="anther"/>

  <path d="M 275 310 C 330 280 340 180 325 140" class="stamen"/>
  <ellipse cx="325" cy="135" rx="10" ry="6" class="anther"/>

  <!-- Female Pistil / Carpel (Part 'P') -->
  <path d="M 230 315 C 220 280 220 240 240 230 L 244 140 C 240 135 240 120 250 120 C 260 120 260 135 256 140 L 260 230 C 280 240 280 280 270 315 Z" class="carpel"/>
  <circle cx="246" cy="275" r="5" class="ovule"/>
  <circle cx="254" cy="275" r="5" class="ovule"/>
  <circle cx="246" cy="290" r="5" class="ovule"/>
  <circle cx="254" cy="290" r="5" class="ovule"/>

  <!-- Labels -->
  <rect x="25" y="120" width="80" height="30" class="label-box"/>
  <text x="65" y="140" class="label-text">Stamen</text>
  <line x1="105" y1="135" x2="165" y2="135" stroke="#1e293b" stroke-width="1.5"/>

  <rect x="395" y="125" width="75" height="30" class="label-box"/>
  <text x="432" y="145" class="label-text">Petal</text>
  <line x1="395" y1="140" x2="350" y2="140" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Part 'P' Pointer & Badge -->
  <line x1="250" y1="115" x2="250" y2="60" class="pointer"/>
  <rect x="225" y="20" width="50" height="35" class="p-badge"/>
  <text x="250" y="44" class="p-text">P</text>
  
  <text x="250" y="385" font-family="'Outfit', sans-serif" font-size="13" fill="#64748b" font-weight="600" text-anchor="middle">
    Figure: Longitudinal Section (L.S.) of a Typical Flower
  </text>
</svg>"""

img_dirs = [
    r"C:\Users\HP\Documents\Q&A\Questions",
    r"c:\Users\HP\Documents\Fax\TalentHunt\public\assets\questions",
    r"c:\Users\HP\Documents\Fax\TalentHunt\data\Questions"
]
for d in img_dirs:
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "1942.svg"), "w", encoding="utf-8") as f:
        f.write(svg_1942)
print("✓ Generated 1942.svg across all 3 question asset folders.")

# -------------------------------------------------------------------------
# 2. CURATED SENIOR QUESTIONS DATASET (CLASS 10 - EASY & HARD FRAGMENTATION)
# -------------------------------------------------------------------------
curated_batch = [
    {
        "q_no": 1942,
        "question": "Refer to the given diagram showing the longitudinal section of a flower. If the part labeled 'P' is surgically removed before pollination, which of the following botanical processes will NOT take place?",
        "opt_a": "Formation of pollen grains",
        "opt_b": "Development of anther filaments",
        "opt_c": "Formation of fruit and seeds",
        "opt_d": "Opening of petals and sepals",
        "image": "Yes",
        "answer": "Formation of fruit and seeds",
        "explanation": "Part 'P' represents the pistil (carpel), the female reproductive organ consisting of the stigma, style, and ovary. Removing the pistil prevents fertilization, so the ovary cannot mature into a fruit nor can ovules develop into viable seeds. Pollen grains develop normally in the male stamens.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "How Do Organisms Reproduce - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1943,
        "question": "Which specialized epidermal cells control the opening and closing of the stomatal pores in plant leaves to regulate transpiration and gas exchange?",
        "opt_a": "Epidermal pavement cells",
        "opt_b": "Guard cells",
        "opt_c": "Mesophyll cells",
        "opt_d": "Companion cells",
        "image": "No",
        "answer": "Guard cells",
        "explanation": "Guard cells are kidney-shaped (or dumbbell-shaped in grasses) cells surrounding each stoma. Water uptake causes them to become turgid and bow outward, opening the stomatal pore, while water loss makes them flaccid, closing the pore.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Life Processes - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1944,
        "question": "Identify the master endocrine gland located at the base of the human brain that secretes growth hormone (GH) to regulate developmental growth in children.",
        "opt_a": "Pituitary gland",
        "opt_b": "Thyroid gland",
        "opt_c": "Pancreas",
        "opt_d": "Adrenal gland",
        "image": "No",
        "answer": "Pituitary gland",
        "explanation": "The pituitary gland (hypophysis) produces human Growth Hormone (hGH), which stimulates cellular reproduction, protein synthesis, and longitudinal bone growth. Hyposecretion leads to dwarfism, while hypersecretion causes gigantism.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Control and Coordination - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1945,
        "question": "In human female reproductive physiology, in which anatomical organ does the implantation of the developing fertilised blastocyst occur?",
        "opt_a": "Fallopian tube (Oviduct)",
        "opt_b": "Cervix",
        "opt_c": "Uterus",
        "opt_d": "Vagina",
        "image": "No",
        "answer": "Uterus",
        "explanation": "Fertilization occurs in the ampullary-isthmic junction of the fallopian tube (oviduct). The resulting cleaving embryo travels down into the uterus, where it embeds itself into the vascularized endometrial lining (implantation).",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "How Do Organisms Reproduce - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1946,
        "question": "Yeast (Saccharomyces cerevisiae) primarily multiplies under aerobic or anaerobic sugar-rich conditions by which mode of asexual reproduction?",
        "opt_a": "Fragmentation",
        "opt_b": "Binary Fission",
        "opt_c": "Budding",
        "opt_d": "Multiple Fission",
        "image": "No",
        "answer": "Budding",
        "explanation": "Yeast reproduces asexually through asymmetric division termed budding. A small protuberance or bud forms on the mother cell, the nucleus divides mitotically, and one daughter nucleus enters the growing bud until it detaches.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "How Do Organisms Reproduce - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1947,
        "question": "Which of the following environmental contaminants is a synthetic non-biodegradable substance that undergoes biological biomagnification through food chains?",
        "opt_a": "Discarded kraft paper",
        "opt_b": "DDT (Dichlorodiphenyltrichloroethane)",
        "opt_c": "Fallen dry wood logs",
        "opt_d": "Vegetable peels and compost",
        "image": "No",
        "answer": "DDT (Dichlorodiphenyltrichloroethane)",
        "explanation": "DDT is an organochlorine insecticide that cannot be metabolized or broken down by microbial decomposers. Being lipid-soluble, it progressively accumulates in body fat across successive trophic levels (biomagnification).",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Our Environment - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1948,
        "question": "In an ecological pyramid of numbers within a balanced terrestrial grassland ecosystem, which trophic level exhibits the maximum numerical population?",
        "opt_a": "Autotrophic Producers",
        "opt_b": "Primary Herbivores",
        "opt_c": "Secondary Carnivores",
        "opt_d": "Apex Predators",
        "image": "No",
        "answer": "Autotrophic Producers",
        "explanation": "In terrestrial ecosystems, producers (green plants and grasses) form the broad foundational base of the pyramid of numbers, naturally outnumbering primary consumers (herbivores) and higher-tier predators.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Our Environment - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1949,
        "question": "Electrolysis of acidified water is a decomposition reaction yielding H2 and O2 gases. What is the ratio by MASS (MH : MO) of hydrogen and oxygen liberated at the electrodes?",
        "opt_a": "2 : 1",
        "opt_b": "1 : 2",
        "opt_c": "1 : 8",
        "opt_d": "8 : 1",
        "image": "No",
        "answer": "1 : 8",
        "explanation": "The stoichiometric decomposition of water is 2H2O -> 2H2 + O2. By volume, hydrogen and oxygen are liberated in a 2 : 1 ratio. However, by mass: 2 moles of H2 = 4 g, and 1 mole of O2 = 32 g. The mass ratio MH : MO = 4 : 32 = 1 : 8.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Chemical Reactions & Equations - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1950,
        "question": "What are the stoichiometric chemical formulas of the basic oxides formed when Aluminium and Magnesium burn vigorously in atmospheric oxygen?",
        "opt_a": "Al3O4 and MgO2",
        "opt_b": "Al2O3 and MgO",
        "opt_c": "AlO2 and Mg2O",
        "opt_d": "Al2O3 and MgO2",
        "image": "No",
        "answer": "Al2O3 and MgO",
        "explanation": "Aluminium (valency +3) reacts with oxygen (valency -2) to produce amphoteric Aluminium Oxide: 4Al + 3O2 -> 2Al2O3. Magnesium (valency +2) forms basic Magnesium Oxide: 2Mg + O2 -> 2MgO.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Metals and Non-metals - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1951,
        "question": "Green vitriol is a crystalline hydrated salt containing exactly seven molecules of water of crystallisation per formula unit. Identify its chemical formula.",
        "opt_a": "CuSO4·5H2O",
        "opt_b": "Na2CO3·10H2O",
        "opt_c": "FeSO4·7H2O",
        "opt_d": "CaSO4·2H2O",
        "image": "No",
        "answer": "FeSO4·7H2O",
        "explanation": "Ferrous sulphate heptahydrate (FeSO4·7H2O) contains 7 molecules of water of crystallization, giving it a distinctive pale green color. Blue vitriol has 5 (CuSO4·5H2O), washing soda has 10, and gypsum has 2.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Acids, Bases and Salts - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1952,
        "question": "In pea plants, pure tall (TT) is crossed with pure dwarf (tt). When the heterozygous F1 generation (Tt) is self-pollinated, what is the resulting genotypic ratio in the F2 progeny?",
        "opt_a": "3 : 1",
        "opt_b": "1 : 2 : 1",
        "opt_c": "9 : 3 : 3 : 1",
        "opt_d": "2 : 1 : 1",
        "image": "No",
        "answer": "1 : 2 : 1",
        "explanation": "According to Mendel's Law of Segregation, selfing Tt x Tt produces 1 homozygous dominant (TT), 2 heterozygous tall (Tt), and 1 homozygous recessive (tt). The genotypic ratio is strictly 1:2:1 (phenotypic ratio is 3:1).",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Heredity and Evolution - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1953,
        "question": "The directional growth movement of a pollen tube towards the ovule guided by sugar-rich secretions from the pistil is an example of:",
        "opt_a": "Hydrotropism",
        "opt_b": "Geotropism",
        "opt_c": "Chemotropism",
        "opt_d": "Phototropism",
        "image": "No",
        "answer": "Chemotropism",
        "explanation": "Chemotropism is plant orientation towards or away from a chemical gradient. The elongation of the pollen tube through the style towards the ovary ovules is directed by chemical attractants (calcium, sugars) secreted by the pistil.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Control and Coordination - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1954,
        "question": "In human physiological homeostasis, the metabolic and enzymatic biochemical processes of the living human body operate optimally within which narrow pH window?",
        "opt_a": "5.5 to 6.2",
        "opt_b": "6.2 to 6.8",
        "opt_c": "7.0 to 7.8",
        "opt_d": "8.0 to 8.8",
        "image": "No",
        "answer": "7.0 to 7.8",
        "explanation": "Human cells and physiological fluid systems function within an optimal narrow pH range of 7.0 to 7.8. Normal arterial human blood pH is tightly regulated around 7.35–7.45 by bicarbonate buffer systems.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Acids, Bases and Salts - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1955,
        "question": "Copper is alloyed with Zinc to produce alloy 'X', and with Tin to produce alloy 'Y'. Identify alloys 'X' and 'Y' respectively.",
        "opt_a": "Bronze and Brass",
        "opt_b": "Brass and Bronze",
        "opt_c": "Solder and Brass",
        "opt_d": "Bronze and Duralumin",
        "image": "No",
        "answer": "Brass and Bronze",
        "explanation": "Brass is a homogeneous binary alloy composed of Copper and Zinc (Cu + Zn). Bronze is an alloy composed predominantly of Copper and Tin (Cu + Sn). Therefore, X and Y are Brass and Bronze.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Metals and Non-metals - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1956,
        "question": "When granulated zinc is gently heated with concentrated sodium hydroxide (NaOH) solution, which salt is formed along with the liberation of hydrogen gas?",
        "opt_a": "NaZnO2",
        "opt_b": "Na2ZnO2",
        "opt_c": "Na2ZnO",
        "opt_d": "NaZn(OH)4",
        "image": "No",
        "answer": "Na2ZnO2",
        "explanation": "Zinc exhibits amphoteric behavior, reacting with strong alkali to form Sodium Zincate and hydrogen gas: Zn + 2NaOH -> Na2ZnO2 + H2(g).",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Acids, Bases and Salts - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1957,
        "question": "Which macro-element is absorbed by roots from soil as nitrates or nitrites and is essential for the biological synthesis of amino acids and proteins in plants?",
        "opt_a": "Magnesium",
        "opt_b": "Nitrogen",
        "opt_c": "Phosphorus",
        "opt_d": "Iron",
        "image": "No",
        "answer": "Nitrogen",
        "explanation": "Nitrogen is an essential mineral nutrient taken up as inorganic nitrates (NO3⁻) or nitrites (NO2⁻). It is the foundational building block of amino acids, proteins, nucleic acids, and chlorophyll.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Life Processes - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1958,
        "question": "Microscopic, single-endothelial-cell thick blood vessels where diffusion of oxygen, carbon dioxide, glucose, and metabolic wastes occurs with body tissues are:",
        "opt_a": "Arterioles",
        "opt_b": "Capillaries",
        "opt_c": "Veins",
        "opt_d": "Lymphatic ducts",
        "image": "No",
        "answer": "Capillaries",
        "explanation": "Capillaries are the thinnest blood vessels in the human circulatory network. Their microscopic walls consist of a single layer of squamous endothelial cells, permitting rapid passive diffusion of nutrients and respiratory gases.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Life Processes - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1959,
        "question": "Balance the chemical equation: p Al + q H2O -> r Al2O3 + s H2. What are the minimal whole-number coefficients p, q, r, and s respectively?",
        "opt_a": "2, 3, 1, 3",
        "opt_b": "3, 2, 2, 1",
        "opt_c": "2, 3, 3, 1",
        "opt_d": "4, 6, 2, 6",
        "image": "No",
        "answer": "2, 3, 1, 3",
        "explanation": "To balance Aluminium: p = 2 (for Al2O3). To balance Oxygen: 3 on right means q = 3 on left (3H2O). 3H2O gives 6 Hydrogens, requiring s = 3 (3H2). The balanced equation is 2Al + 3H2O -> 1Al2O3 + 3H2, giving p=2, q=3, r=1, s=3.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Chemical Reactions & Equations - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1960,
        "question": "Which of the following groups of salts belongs to the same family of sulphate salts due to sharing the common SO4²⁻ acid radical?",
        "opt_a": "NaCl, Na2SO4, CaSO4",
        "opt_b": "K2SO4, Na2SO4, CaSO4",
        "opt_c": "NaNO3, CaCO3, Na2CO3",
        "opt_d": "MgSO4, CuSO4, MgCl2",
        "image": "No",
        "answer": "K2SO4, Na2SO4, CaSO4",
        "explanation": "Salts having the same positive cation or negative anion radical are classified in the same chemical family. Potassium sulphate (K2SO4), Sodium sulphate (Na2SO4), and Calcium sulphate (CaSO4) all share the sulphate anion (SO4²⁻).",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Acids, Bases and Salts - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1961,
        "question": "Which natural, harmless organic dicarboxylic acid is naturally present in ripe fresh tomatoes?",
        "opt_a": "Methanoic acid (Formic acid)",
        "opt_b": "Acetic acid (Ethanoic acid)",
        "opt_c": "Lactic acid",
        "opt_d": "Oxalic acid",
        "image": "No",
        "answer": "Oxalic acid",
        "explanation": "Ripe tomatoes naturally contain oxalic acid (ethanedioic acid, C2H2O4) along with citric and ascorbic acids. Methanoic acid is found in ant stings, acetic acid in vinegar, and lactic acid in sour curd.",
        "class_name": "Class 10",
        "subject": "Science",
        "topic": "Acids, Bases and Salts - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1962,
        "question": "If the HCF of two positive integers 850 and 325 is 25, find their Least Common Multiple (LCM) using the fundamental theorem of arithmetic relationship: HCF(a,b) × LCM(a,b) = a × b.",
        "opt_a": "2210",
        "opt_b": "8450",
        "opt_c": "11050",
        "opt_d": "13250",
        "image": "No",
        "answer": "11050",
        "explanation": "Using HCF(a, b) * LCM(a, b) = a * b: 25 * LCM = 850 * 325. Therefore, LCM = (850 * 325) / 25 = 850 * 13 = 11,050.",
        "class_name": "Class 10",
        "subject": "Mathematics",
        "topic": "Real Numbers - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1963,
        "question": "For what non-zero value of 'k' will the quadratic equation 2k·x² - 6x + 3 = 0 possess two real and equal roots (discriminant D = b² - 4ac = 0)?",
        "opt_a": "k = 1.5",
        "opt_b": "k = 2",
        "opt_c": "k = 3",
        "opt_d": "k = -1.5",
        "image": "No",
        "answer": "k = 1.5",
        "explanation": "For equal roots, D = b² - 4ac = 0. Here a = 2k, b = -6, and c = 3. D = (-6)² - 4(2k)(3) = 36 - 24k = 0. Hence 24k = 36 => k = 36/24 = 3/2 = 1.5.",
        "class_name": "Class 10",
        "subject": "Mathematics",
        "topic": "Quadratic Equations - Hard",
        "difficulty": "hard"
    },
    {
        "q_no": 1964,
        "question": "Arun is drafting an official communication on his desktop client to send to his corporate office. Which networking protocol transmits this outbound electronic mail message to the mail transfer agent?",
        "opt_a": "FTP (File Transfer Protocol)",
        "opt_b": "HTTP (Hypertext Transfer Protocol)",
        "opt_c": "SMTP (Simple Mail Transfer Protocol)",
        "opt_d": "VoIP (Voice over Internet Protocol)",
        "image": "No",
        "answer": "SMTP (Simple Mail Transfer Protocol)",
        "explanation": "SMTP (Simple Mail Transfer Protocol) is the push protocol used to send outgoing email messages from a client application to a mail server and between mail servers across the Internet. POP3 or IMAP are retrieval protocols.",
        "class_name": "Class 10",
        "subject": "Computer",
        "topic": "Networking Protocols - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1965,
        "question": "Which of the following web platforms is primarily an online retail e-commerce portal rather than an Indian transportation or ticket e-Reservation portal?",
        "opt_a": "https://www.irctc.co.in",
        "opt_b": "https://www.makemytrip.com",
        "opt_c": "https://www.amazon.in",
        "opt_d": "https://www.redbus.in",
        "image": "No",
        "answer": "https://www.amazon.in",
        "explanation": "Amazon (https://www.amazon.in) is a commercial retail and e-commerce marketplace for physical and digital consumer goods. IRCTC, MakeMyTrip, and RedBus are certified online ticket and travel reservation portals.",
        "class_name": "Class 10",
        "subject": "Computer",
        "topic": "Internet Services - Easy",
        "difficulty": "easy"
    },
    {
        "q_no": 1966,
        "question": "In computer networking and file exchange over TCP/IP, what is the official full form of the application protocol acronym 'FTP'?",
        "opt_a": "Fast Transmission Path",
        "opt_b": "File Transfer Protocol",
        "opt_c": "File Transport Process",
        "opt_d": "Format Translation Packet",
        "image": "No",
        "answer": "File Transfer Protocol",
        "explanation": "FTP stands for File Transfer Protocol. It is a standard client-server network protocol used for the reliable transfer and uploading of computer files between a client and a host over a TCP/IP computer network.",
        "class_name": "Class 10",
        "subject": "Computer",
        "topic": "Networking Protocols - Easy",
        "difficulty": "easy"
    }
]

print(f"Loaded {len(curated_batch)} curated senior grade questions.")

# -------------------------------------------------------------------------
# 3. APPEND TO EXCEL FILES (Q&A MASTER AND DATA REPO MIRROR)
# -------------------------------------------------------------------------
excel_paths = [
    r"C:\Users\HP\Documents\Q&A\Master Data Collection.xlsx",
    r"c:\Users\HP\Documents\Fax\TalentHunt\data\Master Data Collection.xlsx"
]

for ep in excel_paths:
    if not os.path.exists(ep):
        print(f"Skipping missing excel: {ep}")
        continue
    wb = openpyxl.load_workbook(ep)
    ws = wb.active
    
    # Check existing max Q. No.
    existing_q_nos = set()
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0]:
            try:
                existing_q_nos.add(int(row[0]))
            except:
                pass
                
    appended = 0
    for q in curated_batch:
        if q["q_no"] in existing_q_nos:
            continue
        ws.append([
            q["q_no"],
            q["question"],
            q["opt_a"],
            q["opt_b"],
            q["opt_c"],
            q["opt_d"],
            q["image"],
            q["answer"],
            q["explanation"],
            q["class_name"],
            q["subject"],
            q["topic"]
        ])
        appended += 1
    wb.save(ep)
    print(f"✓ Appended {appended} questions to {ep} (Total rows now: {ws.max_row})")

# -------------------------------------------------------------------------
# 4. UPDATE DATA/MASTER_QUESTIONS.JSON
# -------------------------------------------------------------------------
json_path = r"c:\Users\HP\Documents\Fax\TalentHunt\data\master_questions.json"
with open(json_path, "r", encoding="utf-8") as f:
    master_json = json.load(f)

existing_ids = {item["id"] for item in master_json}
added_to_json = 0

for q in curated_batch:
    q_id = f"q-master-{q['q_no']}"
    if q_id in existing_ids:
        continue
        
    sub_slug = "math" if q["subject"] == "Mathematics" else ("science" if q["subject"] == "Science" else "computer")
    sub_id = f"math-class10" if q["subject"] == "Mathematics" else (f"science-class10" if q["subject"] == "Science" else "computer-class10")
    
    entry = {
        "id": q_id,
        "q_no": q["q_no"],
        "grade": 10,
        "subject_id": sub_id,
        "subject_name": q["subject"],
        "subject_slug": sub_slug,
        "topic": q["topic"],
        "difficulty": q["difficulty"],
        "question_text": q["question"],
        "raw_text": q["question"],
        "options": [q["opt_a"], q["opt_b"], q["opt_c"], q["opt_d"]],
        "raw_options": [q["opt_a"], q["opt_b"], q["opt_c"], q["opt_d"]],
        "correct_answer": q["answer"],
        "explanation": q["explanation"],
        "hint": f"Review core principles of {q['topic']}.",
        "has_image": (q["image"] == "Yes"),
        "image_filename": f"{q['q_no']}.svg" if q["image"] == "Yes" else None
    }
    master_json.append(entry)
    added_to_json += 1

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(master_json, f, indent=2, ensure_ascii=False)

print(f"✓ Updated master_questions.json with {added_to_json} new questions (Total: {len(master_json)})")

# -------------------------------------------------------------------------
# 5. RUN IMPORT SCRIPT TO UPDATE SQLITE DATABASE
# -------------------------------------------------------------------------
print("\n🔄 Running npm run import-master to synchronize SQLite database...")
subprocess.run(["node", "scripts/importExcelToDb.js"], check=True)

# -------------------------------------------------------------------------
# 6. MIRROR DATABASE TO C:\Users\HP\Documents\Q&A\talenthunt.db
# -------------------------------------------------------------------------
import shutil
src_db = r"c:\Users\HP\Documents\Fax\TalentHunt\data\talenthunt.db"
dst_db = r"C:\Users\HP\Documents\Q&A\talenthunt.db"
shutil.copy2(src_db, dst_db)
print(f"✓ Successfully mirrored SQLite database to {dst_db}")
