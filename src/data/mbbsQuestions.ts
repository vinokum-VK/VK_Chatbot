export interface MBBSQuestion {
  id: number;
  year: 1 | 2 | 3 | 4;
  subject: string;
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0 (A), 1 (B), 2 (C), or 3 (D)
  explanation: string;
  whyWrong?: {
    [optionIndex: number]: string;
  };
}

/**
 * Shuffles the 4 options of a question so that the correct answer is
 * unpredictably and evenly distributed across Choices A, B, C, and D (0, 1, 2, 3),
 * while keeping correctAnswer and whyWrong index mappings in perfect sync.
 */
export function shuffleQuestionOptions(q: MBBSQuestion): MBBSQuestion {
  const items = q.options.map((text, origIdx) => ({
    text,
    origIdx,
    isCorrect: origIdx === q.correctAnswer,
    whyWrongText: q.whyWrong ? q.whyWrong[origIdx] : undefined,
  }));

  // Fisher-Yates shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  // Identify new index of the correct option
  const newCorrectAnswer = items.findIndex((item) => item.isCorrect);

  // Remap whyWrong keys to the new distractor positions
  const newWhyWrong: { [idx: number]: string } = {};
  items.forEach((item, newIdx) => {
    if (!item.isCorrect && item.whyWrongText) {
      newWhyWrong[newIdx] = item.whyWrongText;
    }
  });

  return {
    ...q,
    options: items.map((item) => item.text) as [string, string, string, string],
    correctAnswer: newCorrectAnswer >= 0 ? newCorrectAnswer : 0,
    whyWrong: newWhyWrong,
  };
}

const RAW_MBBS_100_QUESTIONS: MBBSQuestion[] = [
  // --- YEAR 1: PRE-CLINICAL (Anatomy, Physiology, Biochemistry) ---
  {
    id: 1,
    year: 1,
    subject: "Anatomy",
    topic: "Neuroanatomy - Blood Supply",
    question: "Which artery is most commonly involved in epidural (extradural) hematoma following trauma to the pterion?",
    options: [
      "Middle meningeal artery",
      "Anterior cerebral artery",
      "Superior cerebral vein",
      "Basilar artery"
    ],
    correctAnswer: 0,
    explanation: "The pterion overlies the anterior branch of the middle meningeal artery. Fractures at this thin skull junction classically tear the middle meningeal artery, causing arterial bleeding into the epidural space (lens/biconvex shaped on CT).",
    whyWrong: {
      1: "The anterior cerebral artery supplies the medial surface of cerebral hemispheres; its rupture does not cause epidural hematoma.",
      2: "Tearing of bridging superior cerebral veins leads to subdural hematoma, not epidural hematoma.",
      3: "The basilar artery sits on the ventral brainstem inside the subarachnoid space; rupture causes subarachnoid hemorrhage."
    }
  },
  {
    id: 2,
    year: 1,
    subject: "Physiology",
    topic: "Cardiovascular - Pacemaker Action Potential",
    question: "Which ion current is predominantly responsible for the phase 0 depolarization of the sinoatrial (SA) node action potential?",
    options: [
      "Inward Ca²⁺ current via L-type calcium channels",
      "Rapid inward Na⁺ current via voltage-gated Na⁺ channels",
      "Outward K⁺ current via delayed rectifier channels",
      "Funny current (If) carrying primarily Na⁺"
    ],
    correctAnswer: 0,
    explanation: "Unlike ventricular myocytes where phase 0 is driven by rapid inward Na⁺ influx (INa), the SA and AV nodal action potentials rely on inward Ca²⁺ current through voltage-gated L-type calcium channels for phase 0 upstroke.",
    whyWrong: {
      1: "Fast voltage-gated Na⁺ channels are inactivated at the higher resting membrane potential (-60 mV) of nodal cells.",
      2: "Outward K⁺ current is responsible for phase 3 repolarization, not phase 0 upstroke.",
      3: "The funny current (If) drives phase 4 pacemaker prepotential/automaticity, not phase 0 depolarization."
    }
  },
  {
    id: 3,
    year: 1,
    subject: "Biochemistry",
    topic: "Carbohydrate Metabolism - Rate Limiting Enzymes",
    question: "Which enzyme represents the primary committed and rate-limiting step of glycolysis?",
    options: [
      "Phosphofructokinase-1 (PFK-1)",
      "Hexokinase",
      "Pyruvate kinase",
      "Glucose-6-phosphatase"
    ],
    correctAnswer: 0,
    explanation: "Phosphofructokinase-1 (PFK-1) converts fructose-6-phosphate to fructose-1,6-bisphosphate using ATP. It is the primary committed and heavily allosterically regulated rate-limiting enzyme of glycolysis (activated by AMP and F-2,6-BP; inhibited by ATP and citrate).",
    whyWrong: {
      1: "Hexokinase catalyzes the initial trapping step, but glucose-6-phosphate can enter the HMP shunt or glycogen synthesis.",
      2: "Pyruvate kinase is an irreversible regulation point, but PFK-1 is the committed rate-limiting gatekeeper.",
      3: "Glucose-6-phosphatase is a gluconeogenic enzyme present in the liver and kidney, not a glycolytic enzyme."
    }
  },
  {
    id: 4,
    year: 1,
    subject: "Anatomy",
    topic: "Upper Limb - Nerve Injury",
    question: "A patient presents with 'wrist drop' and loss of sensation over the dorsal first web space following a midshaft fracture of the humerus. Which nerve is injured?",
    options: [
      "Radial nerve",
      "Ulnar nerve",
      "Median nerve",
      "Musculocutaneous nerve"
    ],
    correctAnswer: 0,
    explanation: "The radial nerve travels closely along the spiral (radial) groove of the humerus. Midshaft humeral fractures commonly compromise the radial nerve, paralyzing the wrist and finger extensors (wrist drop) and causing sensory loss over the dorsum of the hand.",
    whyWrong: {
      1: "Ulnar nerve injury (e.g. medial epicondyle trauma) leads to claw hand (intrinsic hand muscle weakness) and hypothenar numbness.",
      2: "Median nerve injury causes 'ape hand' or 'hand of benediction' with thenar atrophy, not wrist drop.",
      3: "Musculocutaneous nerve injury causes loss of biceps reflex and forearm flexion/supination weakness."
    }
  },
  {
    id: 5,
    year: 1,
    subject: "Physiology",
    topic: "Renal Physiology - GFR & Clearance",
    question: "Which substance is considered the gold standard for measuring Glomerular Filtration Rate (GFR) because it is freely filtered, neither reabsorbed nor secreted?",
    options: [
      "Inulin",
      "Para-aminohippuric acid (PAH)",
      "Urea",
      "Creatinine"
    ],
    correctAnswer: 0,
    explanation: "Inulin is an exogenous fructose polymer that is freely filtered at the glomerulus and neither reabsorbed, secreted, nor metabolized by the renal tubules, making its renal clearance exactly equal to GFR.",
    whyWrong: {
      1: "PAH clearance is used to measure Renal Plasma Flow (RPF) because it is almost completely cleared by filtration plus active tubular secretion.",
      2: "Urea is extensively reabsorbed along the nephron (~50%), significantly underestimating GFR.",
      3: "Creatinine is an endogenous marker used clinically, but slight tubular secretion causes it to modestly overestimate true GFR."
    }
  },
  {
    id: 6,
    year: 1,
    subject: "Biochemistry",
    topic: "Lipid Metabolism - Ketone Bodies",
    question: "Which organ synthesizes ketone bodies but CANNOT utilize them for energy due to the absence of the enzyme thiophorase (beta-ketoacyl-CoA transferase)?",
    options: [
      "Liver",
      "Brain",
      "Skeletal muscle",
      "Heart"
    ],
    correctAnswer: 0,
    explanation: "The liver is the primary site of ketogenesis during fasting and diabetic ketoacidosis. However, hepatocytes lack succinyl-CoA:3-ketoacid CoA transferase (thiophorase) and therefore cannot activate acetoacetate for their own energy consumption.",
    whyWrong: {
      1: "The brain avidly oxidizes ketone bodies during prolonged starvation to spare glucose.",
      2: "Skeletal muscle readily utilizes ketone bodies during early starvation.",
      3: "Cardiac muscle preferentially consumes fatty acids and ketone bodies as efficient energy substrates."
    }
  },
  {
    id: 7,
    year: 1,
    subject: "Anatomy",
    topic: "Abdomen - Inguinal Canal",
    question: "An indirect inguinal hernia enters the inguinal canal through which anatomical opening?",
    options: [
      "Deep inguinal ring",
      "Superficial inguinal ring directly through Hesselbach's triangle",
      "Saphenous opening",
      "Femoral ring"
    ],
    correctAnswer: 0,
    explanation: "Indirect inguinal hernias enter laterally to the inferior epigastric vessels through the deep (internal) inguinal ring within the transversalis fascia, traversing the entire inguinal canal inside the spermatic cord.",
    whyWrong: {
      1: "Direct inguinal hernias push directly through the floor of Hesselbach's triangle medial to the inferior epigastric vessels.",
      2: "The saphenous opening in the fascia lata transmits the great saphenous vein, not an inguinal hernia.",
      3: "The femoral ring is the entrance site for femoral hernias below the inguinal ligament."
    }
  },
  {
    id: 8,
    year: 1,
    subject: "Physiology",
    topic: "Respiratory - Oxygen-Hemoglobin Dissociation Curve",
    question: "Which of the following factors shifts the oxygen-hemoglobin dissociation curve to the RIGHT (Bohr effect)?",
    options: [
      "Increased 2,3-BPG, increased H⁺ (decreased pH), increased temperature",
      "Decreased 2,3-BPG and decreased CO₂",
      "Alkalosis and hypothermia",
      "Fetal hemoglobin (HbF) predominance"
    ],
    correctAnswer: 0,
    explanation: "A right shift in the oxygen-hemoglobin curve reduces Hb affinity for O₂, facilitating oxygen unloading in working tissues. It is triggered by high metabolic activity: high CO₂, low pH (acidosis), high 2,3-BPG, and elevated temperature.",
    whyWrong: {
      1: "Decreased 2,3-BPG and low CO₂ cause a left shift, increasing oxygen affinity.",
      2: "Alkalosis and hypothermia shift the curve to the left.",
      3: "Fetal hemoglobin (HbF) binds 2,3-BPG poorly, resulting in a leftward shift to extract oxygen across the placenta."
    }
  },
  {
    id: 9,
    year: 1,
    subject: "Biochemistry",
    topic: "Molecular Biology - DNA Replication",
    question: "Which eukaryotic enzyme is responsible for synthesizing telomeric repeat sequences at the ends of linear chromosomes?",
    options: [
      "Telomerase (a reverse transcriptase)",
      "DNA Polymerase alpha",
      "Topoisomerase II",
      "DNA Ligase IV"
    ],
    correctAnswer: 0,
    explanation: "Telomerase is an RNA-dependent DNA polymerase (reverse transcriptase ribonucleoprotein) that adds repetitive TTAGGG hexamer sequences to chromosome 3' ends, preventing critical loss of genetic data.",
    whyWrong: {
      1: "DNA Polymerase alpha synthesizes RNA primers and initial DNA strands on the lagging strand.",
      2: "Topoisomerase II relieves torsional supercoiling during replication fork progression.",
      3: "DNA Ligase IV functions specifically in non-homologous end joining (NHEJ) double-strand repair."
    }
  },
  {
    id: 10,
    year: 1,
    subject: "Anatomy",
    topic: "Thorax - Heart Anatomy",
    question: "The oblique pericardial sinus of the heart lies behind which cardiac chamber?",
    options: [
      "Left atrium",
      "Right ventricle",
      "Right atrium",
      "Left ventricle"
    ],
    correctAnswer: 0,
    explanation: "The oblique sinus of the serous pericardium is a blind cul-de-sac located posterior to the base of the heart, specifically behind the left atrium between the right and left pulmonary veins.",
    whyWrong: {
      1: "The right ventricle forms the vast majority of the anterior sternocostal surface.",
      2: "The right atrium forms the right border; the sinus lies behind the posterior left atrium.",
      3: "The left ventricle forms the apex and left border, lying anterolateral to the sinus."
    }
  },
  {
    id: 11,
    year: 1,
    subject: "Physiology",
    topic: "Endocrinology - Thyroid Hormones",
    question: "What is the primary circulating form of thyroid hormone, and which form is biologically the most active at nuclear receptors?",
    options: [
      "T4 is the primary circulating form; T3 is the most active form",
      "T3 is the primary circulating form; T4 is the most active form",
      "Reverse T3 is the primary circulating form; T3 is the most active form",
      "Thyroglobulin is the active circulating hormone"
    ],
    correctAnswer: 0,
    explanation: "The thyroid gland secretes ~90% T4 (thyroxine), which has a longer half-life (7 days) and represents the major circulating pool. Peripheral 5'-deiodinases convert T4 to T3 (triiodothyronine), which possesses ~4-5x greater receptor affinity.",
    whyWrong: {
      1: "T3 is secreted in smaller amounts and has a short half-life (~1 day); it is not the main circulating pool.",
      2: "Reverse T3 (rT3) is an inactive byproduct generated during starvation or illness.",
      3: "Thyroglobulin is the follicular storage glycoprotein, not a circulating bioactive hormone."
    }
  },
  {
    id: 12,
    year: 1,
    subject: "Biochemistry",
    topic: "Inborn Errors of Metabolism",
    question: "Phenylketonuria (PKU) is classically caused by an autosomal recessive deficiency in which enzyme?",
    options: [
      "Phenylalanine hydroxylase",
      "Homogentisate oxidase",
      "Branched-chain alpha-ketoacid dehydrogenase",
      "Tyrosinase"
    ],
    correctAnswer: 0,
    explanation: "Classic PKU is caused by deficiency of phenylalanine hydroxylase (PAH), impairing the conversion of phenylalanine to tyrosine and leading to accumulation of phenylalanine, phenylketones, and severe developmental delay if untreated.",
    whyWrong: {
      1: "Homogentisate oxidase deficiency causes alkaptonuria (ochronosis and black urine).",
      2: "Branched-chain alpha-ketoacid dehydrogenase deficiency causes Maple Syrup Urine Disease (MSUD).",
      3: "Tyrosinase deficiency leads to oculocutaneous albinism."
    }
  },
  {
    id: 13,
    year: 1,
    subject: "Anatomy",
    topic: "Embryology - Pharyngeal Arches",
    question: "The facial nerve (Cranial Nerve VII) is the nerve of which embryonic pharyngeal arch?",
    options: [
      "Second pharyngeal arch (Hyoid arch)",
      "First pharyngeal arch (Mandibular arch)",
      "Third pharyngeal arch",
      "Fourth pharyngeal arch"
    ],
    correctAnswer: 0,
    explanation: "The second pharyngeal (hyoid) arch gives rise to the muscles of facial expression, stapedius, stylohyoid, and posterior belly of digastric, all innervated by the facial nerve (CN VII).",
    whyWrong: {
      1: "The first arch is innervated by the mandibular division of the trigeminal nerve (CN V3).",
      2: "The third arch is innervated by the glossopharyngeal nerve (CN IX).",
      3: "The fourth arch is innervated by the superior laryngeal branch of the vagus nerve (CN X)."
    }
  },
  {
    id: 14,
    year: 1,
    subject: "Physiology",
    topic: "Neurophysiology - Synaptic Transmission",
    question: "Saltatory conduction in myelinated nerve fibers occurs because action potentials jump between which specialized structures?",
    options: [
      "Nodes of Ranvier",
      "Schwann cell nuclei",
      "Synaptic boutons",
      "Dendritic spines"
    ],
    correctAnswer: 0,
    explanation: "Myelin sheaths provide electrical insulation with high membrane resistance. Voltage-gated Na⁺ channels are clustered at high density exclusively at unmyelinated Nodes of Ranvier, allowing depolarization to jump rapidly.",
    whyWrong: {
      1: "Schwann cell nuclei are metabolic centers located along the internodal sheath, not electrical conductive gaps.",
      2: "Synaptic boutons are terminal ends of axons for neurotransmitter release.",
      3: "Dendritic spines receive afferent synaptic inputs on neuronal dendrites."
    }
  },
  {
    id: 15,
    year: 1,
    subject: "Biochemistry",
    topic: "Vitamins - Deficiency Disorders",
    question: "Wernicke-Korsakoff syndrome, frequently seen in chronic alcoholics, is caused by a nutritional deficiency of which cofactor?",
    options: [
      "Thiamine (Vitamin B1)",
      "Niacin (Vitamin B3)",
      "Cobalamin (Vitamin B12)",
      "Pyridoxine (Vitamin B6)"
    ],
    correctAnswer: 0,
    explanation: "Thiamine (vitamin B1) pyrophosphate (TPP) is an indispensable cofactor for pyruvate dehydrogenase, alpha-ketoglutarate dehydrogenase, and transketolase. Deficiency results in Wernicke encephalopathy (ataxia, confusion, ophthalmoplegia).",
    whyWrong: {
      1: "Niacin (B3) deficiency causes pellagra (diarrhea, dermatitis, dementia, death).",
      2: "Cobalamin (B12) deficiency causes megaloblastic anemia and subacute combined degeneration of the spinal cord.",
      3: "Pyridoxine (B6) deficiency causes peripheral neuropathy, sideroblastic anemia, and convulsions."
    }
  },
  {
    id: 16,
    year: 1,
    subject: "Anatomy",
    topic: "Head and Neck - Cranial Nerves",
    question: "During thyroidectomy, ligation of the inferior thyroid artery close to the thyroid gland puts which nerve at greatest risk of accidental injury?",
    options: [
      "Recurrent laryngeal nerve",
      "External branch of superior laryngeal nerve",
      "Ansa cervicalis",
      "Hypoglossal nerve"
    ],
    correctAnswer: 0,
    explanation: "The recurrent laryngeal nerve courses in the tracheoesophageal groove in close relationship with the branches of the inferior thyroid artery near the lower pole of the thyroid gland.",
    whyWrong: {
      1: "The external branch of the superior laryngeal nerve runs near the superior thyroid artery at the upper pole.",
      2: "The ansa cervicalis lies superficial to the carotid sheath and innervates strap muscles.",
      3: "The hypoglossal nerve lies high in the carotid triangle, well above the inferior thyroid artery."
    }
  },
  {
    id: 17,
    year: 1,
    subject: "Physiology",
    topic: "Gastrointestinal - Gastric Acid Secretion",
    question: "Which hormone, secreted by G cells of the gastric antrum, directly stimulates parietal cells to secrete hydrochloric acid (HCl)?",
    options: [
      "Gastrin",
      "Secretin",
      "Cholecystokinin (CCK)",
      "Somatostatin"
    ],
    correctAnswer: 0,
    explanation: "Gastrin is released by antral G cells into the bloodstream. It binds CCK-B receptors on parietal cells to stimulate acid secretion directly, and also stimulates ECL cells to release histamine.",
    whyWrong: {
      1: "Secretin is released by duodenal S cells in response to acid and inhibits gastric acid while stimulating pancreatic bicarbonate.",
      2: "CCK stimulates gallbladder contraction and pancreatic enzyme release while slowing gastric emptying.",
      3: "Somatostatin from D cells is the universal inhibitor of gastric acid secretion."
    }
  },
  {
    id: 18,
    year: 1,
    subject: "Biochemistry",
    topic: "Purine Metabolism - Gout",
    question: "Allopurinol reduces serum uric acid levels in gout by competitively inhibiting which enzyme?",
    options: [
      "Xanthine oxidase",
      "Hypoxanthine-guanine phosphoribosyltransferase (HGPRT)",
      "Adenosine deaminase",
      "PRPP synthetase"
    ],
    correctAnswer: 0,
    explanation: "Allopurinol (and its metabolite alloxanthine/oxypurinol) inhibits xanthine oxidase, blocking the conversion of hypoxanthine to xanthine and xanthine to uric acid, decreasing uric acid levels in gout.",
    whyWrong: {
      1: "HGPRT is a purine salvage enzyme; its congenital deficiency causes Lesch-Nyhan syndrome.",
      2: "Adenosine deaminase deficiency leads to severe combined immunodeficiency (SCID).",
      3: "PRPP synthetase catalyzes the initial step of de novo purine synthesis."
    }
  },
  {
    id: 19,
    year: 1,
    subject: "Anatomy",
    topic: "Lower Limb - Compartments",
    question: "Acute anterior compartment syndrome of the leg compresses which nerve and artery?",
    options: [
      "Deep peroneal (fibular) nerve and anterior tibial artery",
      "Superficial peroneal nerve and peroneal artery",
      "Tibial nerve and posterior tibial artery",
      "Saphenous nerve and femoral artery"
    ],
    correctAnswer: 0,
    explanation: "The tight anterior fascial compartment of the leg contains the tibialis anterior, EHL, EDL, peroneus tertius, the anterior tibial artery, and the deep peroneal nerve (supplying dorsiflexion and sensation to 1st web space).",
    whyWrong: {
      1: "The superficial peroneal nerve and muscles run in the lateral compartment.",
      2: "The tibial nerve and posterior tibial artery run in the deep posterior compartment.",
      3: "The saphenous nerve is a cutaneous sensory branch running with the great saphenous vein subcutaneously."
    }
  },
  {
    id: 20,
    year: 1,
    subject: "Physiology",
    topic: "Hematology - Blood Groups",
    question: "A person with blood group 'O Rh-positive' has which antigens on their red blood cell membrane and which antibodies in their plasma?",
    options: [
      "Rh(D) antigen on RBCs; Anti-A and Anti-B antibodies in plasma",
      "A and B antigens on RBCs; No ABO antibodies in plasma",
      "Only A antigen on RBCs; Anti-B in plasma",
      "No antigens on RBCs; Anti-D in plasma"
    ],
    correctAnswer: 0,
    explanation: "Group O individuals lack A and B carbohydrate antigens on their erythrocytes, so their plasma naturally contains both anti-A and anti-B IgM antibodies. Rh-positive means the D antigen is present on the RBC membrane.",
    whyWrong: {
      1: "Group AB red cells possess both A and B antigens and have neither anti-A nor anti-B in plasma.",
      2: "Group A red cells have A antigen with anti-B in plasma.",
      3: "Rh-positive individuals express the Rh(D) protein antigen, so they do not develop anti-D antibodies."
    }
  },
  {
    id: 21,
    year: 1,
    subject: "Biochemistry",
    topic: "Lipoproteins - Atherosclerosis",
    question: "Which apolipoprotein serves as the structural protein for LDL and acts as the ligand for the LDL receptor on peripheral cells?",
    options: [
      "Apo B-100",
      "Apo B-48",
      "Apo A-1",
      "Apo E"
    ],
    correctAnswer: 0,
    explanation: "Apolipoprotein B-100 is synthesized in the liver and present on VLDL, IDL, and LDL. It binds LDL receptors, mediating cellular endocytosis. Apo B-48 is truncated in the intestine and found on chylomicrons.",
    whyWrong: {
      1: "Apo B-48 is specific to intestine-derived chylomicrons and chylomicron remnants.",
      2: "Apo A-1 is the major structural apolipoprotein of HDL and activates LCAT.",
      3: "Apo E mediates remnant uptake by hepatic receptors for chylomicron and VLDL remnants."
    }
  },
  {
    id: 22,
    year: 1,
    subject: "Anatomy",
    topic: "Pelvis - Ureter Relations",
    question: "In the female pelvis, the ureter passes directly inferior to which important vascular structure ('water under the bridge')?",
    options: [
      "Uterine artery",
      "Ovarian artery",
      "Internal iliac vein",
      "Superior rectal artery"
    ],
    correctAnswer: 0,
    explanation: "The ureter runs within the pelvis and passes directly underneath ('water under the bridge') the uterine artery near the lateral fornix of the vagina, putting it at risk of injury during hysterectomy.",
    whyWrong: {
      1: "The ovarian artery runs in the suspensory (infundibulopelvic) ligament superiorly.",
      2: "The internal iliac vein lies on the posterolateral pelvic wall.",
      3: "The superior rectal artery continues into the pelvic cavity behind the rectum."
    }
  },
  {
    id: 23,
    year: 1,
    subject: "Physiology",
    topic: "Muscle Physiology - Contraction Mechanism",
    question: "During skeletal muscle contraction, binding of ATP to the myosin head causes which immediate mechanical event?",
    options: [
      "Detachment of myosin cross-bridge from the actin filament",
      "The power stroke pulling actin toward the M line",
      "Phosphorylation of tropomyosin",
      "Release of calcium from troponin C"
    ],
    correctAnswer: 0,
    explanation: "In the cross-bridge cycle, ATP binding to the myosin head causes immediate allosteric conformational detachment of myosin from actin. Lack of ATP prevents this detachment, producing rigor mortis.",
    whyWrong: {
      1: "The power stroke is triggered by the release of inorganic phosphate (Pi) from the energized myosin head.",
      2: "Tropomyosin shifts upon calcium binding to troponin C; it is not phosphorylated by ATP to move.",
      3: "Calcium dissociation occurs when sarcoplasmic reticulum Ca²⁺-ATPase (SERCA) pumps calcium back into storage."
    }
  },
  {
    id: 24,
    year: 1,
    subject: "Biochemistry",
    topic: "Collagen Synthesis - Scurvy",
    question: "Ascorbic acid (Vitamin C) is an essential cofactor for which post-translational modification in collagen biosynthesis?",
    options: [
      "Hydroxylation of proline and lysine residues",
      "Cross-linking by lysyl oxidase",
      "Cleavage of terminal propeptides",
      "Glycosylation of hydroxyproline"
    ],
    correctAnswer: 0,
    explanation: "Vitamin C keeps the iron atom in prolyl and lysyl hydroxylase enzymes in its active reduced Fe²⁺ state. Without vitamin C, collagen alpha chains cannot form stable hydrogen-bonded triple helices, causing scurvy.",
    whyWrong: {
      1: "Cross-linking of collagen fibrils is mediated by copper-dependent lysyl oxidase.",
      2: "Cleavage of terminal propeptides is performed extracellularly by procollagen peptidases.",
      3: "Glucose and galactose are attached to hydroxylysine residues, not hydroxyproline."
    }
  },
  {
    id: 25,
    year: 1,
    subject: "Physiology",
    topic: "Special Senses - Auditory System",
    question: "Where are the primary sensory hair cells for auditory transduction located within the cochlea?",
    options: [
      "Organ of Corti on the basilar membrane",
      "Crista ampullaris",
      "Macula of the utricle",
      "Stria vascularis"
    ],
    correctAnswer: 0,
    explanation: "The Organ of Corti rests on the basilar membrane within the cochlear duct (scala media). Movement of perilymph displaces the basilar membrane, shearing stereocilia against the tectorial membrane to open mechanosensitive K⁺ channels.",
    whyWrong: {
      1: "The crista ampullaris is located in semicircular canals and senses angular acceleration.",
      2: "The maculae in utricle and saccule sense linear acceleration and gravity.",
      3: "The stria vascularis produces endolymph rich in potassium."
    }
  },

  // --- YEAR 2: PARA-CLINICAL (Pathology, Pharmacology, Microbiology, Forensic Medicine) ---
  {
    id: 26,
    year: 2,
    subject: "Pathology",
    topic: "Cell Injury & Necrosis",
    question: "Caseous necrosis with surrounding epithelioid histiocytes and Langhans giant cells is the hallmark histopathological feature of which disease?",
    options: [
      "Tuberculosis (Mycobacterium tuberculosis infection)",
      "Acute myocardial infarction",
      "Acute pancreatitis",
      "Cerebral ischemic infarction"
    ],
    correctAnswer: 0,
    explanation: "Caseous ('cheese-like') necrosis is the characteristic friable yellowish-white necrosis seen in tuberculous granulomas, surrounded by collar lymphocytes, epithelioid macrophages, and Langhans multinucleated giant cells.",
    whyWrong: {
      1: "Myocardial infarction undergoes coagulative necrosis characterized by preserved cellular outlines and ghost cells.",
      2: "Acute pancreatitis produces enzymatic fat necrosis with saponification of calcium.",
      3: "Brain ischemic infarction results in liquefactive necrosis due to rich hydrolytic enzymes."
    }
  },
  {
    id: 27,
    year: 2,
    subject: "Pharmacology",
    topic: "Autonomic Nervous System - Atropine",
    question: "Which of the following is an expected pharmacological effect of the muscarinic antagonist atropine?",
    options: [
      "Mydriasis and cycloplegia",
      "Miosis and ciliary spasm",
      "Increased salivation and bronchorrhea",
      "Sinus bradycardia at therapeutic doses"
    ],
    correctAnswer: 0,
    explanation: "Atropine blocks muscarinic M3 receptors on the pupillary sphincter (causing passive dilation = mydriasis) and ciliary muscle (paralysis of accommodation = cycloplegia).",
    whyWrong: {
      1: "Miosis and ciliary spasm are caused by muscarinic agonists like pilocarpine or organophosphates.",
      2: "Atropine produces xerostomia (dry mouth) and bronchodilation by blocking glandular M3 receptors.",
      3: "Atropine blocks cardiac M2 receptors on the SA node, producing sinus tachycardia."
    }
  },
  {
    id: 28,
    year: 2,
    subject: "Microbiology",
    topic: "Bacteriology - Gram-Positive Cocci",
    question: "Which test reliably differentiates Staphylococcus aureus from coagulase-negative Staphylococci (such as S. epidermidis)?",
    options: [
      "Coagulase test",
      "Catalase test",
      "Optochin sensitivity test",
      "Bacitracin sensitivity test"
    ],
    correctAnswer: 0,
    explanation: "Staphylococcus aureus produces coagulase enzyme that converts fibrinogen to fibrin (clotting plasma). S. epidermidis and S. saprophyticus are coagulase-negative.",
    whyWrong: {
      1: "Catalase differentiates Staphylococci (catalase-positive) from Streptococci (catalase-negative).",
      2: "Optochin sensitivity differentiates Streptococcus pneumoniae (sensitive) from viridans Streptococci.",
      3: "Bacitracin sensitivity test identifies Streptococcus pyogenes (Group A Strep)."
    }
  },
  {
    id: 29,
    year: 2,
    subject: "Forensic Medicine",
    topic: "Thanatology - Post-Mortem Changes",
    question: "Rigor mortis typically starts appearing first in which small muscle group in accordance with Nysten's Law?",
    options: [
      "Eyelids and jaw muscles",
      "Lower limb quadriceps",
      "Gastrocnemius",
      "Abdominal rectus"
    ],
    correctAnswer: 0,
    explanation: "According to Nysten's law, post-mortem rigidity (rigor mortis) is typically detected first in involuntary muscles (heart), then small voluntary muscles of the eyelids, face, and jaw, progressing downward to neck, trunk, upper limbs, and lower limbs.",
    whyWrong: {
      1: "Large muscle groups like quadriceps stiffen later in the typical craniocaudal progression.",
      2: "Gastrocnemius and calf muscles are among the last voluntary muscles to exhibit rigor mortis.",
      3: "Abdominal muscles become rigid after the head and neck have already stiffened."
    }
  },
  {
    id: 30,
    year: 2,
    subject: "Pathology",
    topic: "Neoplasia - Tumor Markers",
    question: "Alpha-fetoprotein (AFP) is a serum tumor marker most strongly associated with which malignant neoplasm?",
    options: [
      "Hepatocellular carcinoma and yolk sac tumors",
      "Colorectal adenocarcinoma",
      "Prostate adenocarcinoma",
      "Ovarian serous cystadenocarcinoma"
    ],
    correctAnswer: 0,
    explanation: "Alpha-fetoprotein (AFP) is normally synthesized by fetal liver and yolk sac. Dramatically elevated adult serum levels indicate hepatocellular carcinoma (HCC) or non-seminomatous germ cell tumors (specifically yolk sac/endodermal sinus tumor).",
    whyWrong: {
      1: "Carcinoembryonic antigen (CEA) is the surveillance marker for colorectal carcinoma.",
      2: "Prostate-Specific Antigen (PSA) is the marker for prostate adenocarcinoma.",
      3: "CA-125 is the primary serum marker for epithelial ovarian carcinomas."
    }
  },
  {
    id: 31,
    year: 2,
    subject: "Pharmacology",
    topic: "Antimicrobials - Mechanism of Action",
    question: "Which class of antibiotics binds irreversibly to the 30S ribosomal subunit to cause mistranslation and is notoriously associated with nephrotoxicity and ototoxicity?",
    options: [
      "Aminoglycosides (e.g. Gentamicin, Amikacin)",
      "Macrolides (e.g. Azithromycin)",
      "Beta-lactams (e.g. Ceftriaxone)",
      "Fluoroquinolones (e.g. Ciprofloxacin)"
    ],
    correctAnswer: 0,
    explanation: "Aminoglycosides bind bactericidally to the 30S bacterial ribosome. They accumulate in renal proximal tubules and inner ear hair cells, resulting in dose-dependent nephrotoxicity and permanent ototoxicity.",
    whyWrong: {
      1: "Macrolides bind reversibly to the 50S subunit and cause QT prolongation and gastrointestinal distress.",
      2: "Beta-lactams inhibit peptidoglycan transpeptidases (cell wall synthesis) and are generally non-nephrotoxic.",
      3: "Fluoroquinolones inhibit bacterial DNA gyrase and topoisomerase IV; associated with tendinitis."
    }
  },
  {
    id: 32,
    year: 2,
    subject: "Microbiology",
    topic: "Virology - Hepatitis Viruses",
    question: "Which hepatitis virus is a defective RNA virus that requires the surface antigen (HBsAg) of Hepatitis B virus to establish infection?",
    options: [
      "Hepatitis D virus (Delta agent)",
      "Hepatitis A virus",
      "Hepatitis C virus",
      "Hepatitis E virus"
    ],
    correctAnswer: 0,
    explanation: "Hepatitis D virus (HDV) is a circular single-stranded negative-sense RNA satellite virus. It is replication-defective and requires the envelope protein (HBsAg) of HBV to assemble virions and infect hepatocytes.",
    whyWrong: {
      1: "Hepatitis A is an autonomous picornavirus transmitted feco-orally.",
      2: "Hepatitis C is an independent flavivirus capable of self-assembly and chronic transmission.",
      3: "Hepatitis E is a hepevirus transmitted feco-orally causing severe hepatitis in pregnant women."
    }
  },
  {
    id: 33,
    year: 2,
    subject: "Forensic Medicine",
    topic: "Toxicology - Organophosphate Poisoning",
    question: "What is the specific enzyme-reactivating antidote administered in severe organophosphate insecticide poisoning?",
    options: [
      "Pralidoxime (2-PAM)",
      "N-acetylcysteine",
      "Flumazenil",
      "Naloxone"
    ],
    correctAnswer: 0,
    explanation: "Pralidoxime (2-PAM) binds to organophosphorus-inhibited acetylcholinesterase and regenerates active enzyme before 'aging' occurs. Atropine treats muscarinic symptoms, but pralidoxime reverses nicotinic paralysis.",
    whyWrong: {
      1: "N-acetylcysteine (NAC) restores glutathione stores in acetaminophen (paracetamol) poisoning.",
      2: "Flumazenil is a competitive antagonist at the GABAA benzodiazepine site.",
      3: "Naloxone is an opioid receptor competitive antagonist."
    }
  },
  {
    id: 34,
    year: 2,
    subject: "Pathology",
    topic: "Hematology - Leukemias",
    question: "The Philadelphia chromosome, carrying the t(9;22)(q34;q11) reciprocal translocation resulting in the BCR-ABL1 fusion gene, is the diagnostic hallmark of which disorder?",
    options: [
      "Chronic Myeloid Leukemia (CML)",
      "Acute Promyelocytic Leukemia (APL)",
      "Burkitt Lymphoma",
      "Chronic Lymphocytic Leukemia (CLL)"
    ],
    correctAnswer: 0,
    explanation: "The Philadelphia chromosome t(9;22) fuses BCR with the ABL1 proto-oncogene, creating a constitutively active tyrosine kinase in >95% of patients with Chronic Myeloid Leukemia (CML), targeted by Imatinib.",
    whyWrong: {
      1: "Acute Promyelocytic Leukemia is characterized by t(15;17) PML-RARA fusion, treated with ATRA.",
      2: "Burkitt Lymphoma is characterized by t(8;14) involving the c-MYC oncogene.",
      3: "CLL is characterized by deletions of 13q14, 11q, or trisomy 12, not the Philadelphia chromosome."
    }
  },
  {
    id: 35,
    year: 2,
    subject: "Pharmacology",
    topic: "Cardiovascular - Antihypertensives",
    question: "Which class of antihypertensive drugs can cause a dry, persistent cough due to impaired breakdown of bradykinin and substance P in the respiratory tract?",
    options: [
      "ACE Inhibitors (e.g. Enalapril, Ramipril)",
      "Angiotensin Receptor Blockers (e.g. Losartan)",
      "Calcium Channel Blockers (e.g. Amlodipine)",
      "Thiazide Diuretics (e.g. Chlorthalidone)"
    ],
    correctAnswer: 0,
    explanation: "Angiotensin-Converting Enzyme (ACE) is identical to kininase II, the pulmonary enzyme that degrades bradykinin. Inhibiting ACE leads to bradykinin and substance P accumulation in bronchial mucosa, triggering dry cough in 10-20% of patients.",
    whyWrong: {
      1: "ARBs selectively block AT1 receptors without inhibiting ACE or increasing bradykinin, avoiding dry cough.",
      2: "Calcium channel blockers cause peripheral pedal edema and flushing, not dry cough.",
      3: "Thiazide diuretics cause hypokalemic metabolic alkalosis, hyperuricemia, and hyperglycemia."
    }
  },
  {
    id: 36,
    year: 2,
    subject: "Microbiology",
    topic: "Parasitology - Malaria",
    question: "Which species of Plasmodium causes 'malignant tertian malaria' characterized by sequestration in microvessels and cerebral malaria?",
    options: [
      "Plasmodium falciparum",
      "Plasmodium vivax",
      "Plasmodium malariae",
      "Plasmodium ovale"
    ],
    correctAnswer: 0,
    explanation: "Plasmodium falciparum expresses PfEMP-1 on parasitized erythrocyte surfaces, causing cytoadherence to endothelial ICAM-1. This causes microvascular occlusion, cerebral malaria, and high mortality.",
    whyWrong: {
      1: "P. vivax causes benign tertian malaria and produces dormant liver hypnozoites.",
      2: "P. malariae causes quartan malaria (72-hour fever spikes) and immune complex nephropathy.",
      3: "P. ovale causes mild tertian malaria with hypnozoites in West Africa."
    }
  },
  {
    id: 37,
    year: 2,
    subject: "Forensic Medicine",
    topic: "Traumatology - Wounds",
    question: "A firearm wound characterized by a central entrance hole surrounded by a collar of abrasion, grease collar, tattooing, and soot scorch is classified as:",
    options: [
      "Close-range (near contact) gunshot wound",
      "Contact wound with star-shaped tearing over bone",
      "Distant gunshot wound",
      "Incised defense wound"
    ],
    correctAnswer: 0,
    explanation: "In close-range gunshot wounds (usually 15-45 cm), unburned and burning propellant powder particles penetrate the skin (tattooing/stippling) along with soot deposition around the entrance defect.",
    whyWrong: {
      1: "Hard contact wounds over flat bone force expanding gases sub-periosteally, producing a stellate/star-shaped burst.",
      2: "Distant gunshot wounds produce only an entrance hole with abrasion and grease collar, lacking powder soot or tattooing.",
      3: "Incised defense wounds are sharp force slicing wounds on the forearms or palms."
    }
  },
  {
    id: 38,
    year: 2,
    subject: "Pathology",
    topic: "Renal Pathology - Nephrotic Syndrome",
    question: "Which glomerular disease is the most common cause of nephrotic syndrome in children and shows diffuse effacement of visceral podocyte foot processes on electron microscopy with normal light microscopy?",
    options: [
      "Minimal Change Disease",
      "Membranous Nephropathy",
      "Focal Segmental Glomerulosclerosis (FSGS)",
      "Post-streptococcal glomerulonephritis"
    ],
    correctAnswer: 0,
    explanation: "Minimal Change Disease (Lipoid Nephrosis) accounts for >80% of childhood nephrotic syndrome. Light microscopy shows normal glomeruli, but electron microscopy reveals selective loss/effacement of podocyte foot processes. It responds dramatically to corticosteroids.",
    whyWrong: {
      1: "Membranous nephropathy shows diffuse basement membrane thickening and subepithelial 'spike and dome' deposits in adults.",
      2: "FSGS shows focal and segmental glomerular sclerosis/hyalinosis and has a poor response to steroids.",
      3: "PSGN presents as nephritic syndrome (hematuria, hypertension, edema) with subepithelial humps."
    }
  },
  {
    id: 39,
    year: 2,
    subject: "Pharmacology",
    topic: "Autacoids - NSAIDs",
    question: "Aspirin produces irreversible inhibition of platelet aggregation primarily by acetylating which enzyme?",
    options: [
      "Cyclooxygenase-1 (COX-1)",
      "Phospholipase A2",
      "Lipoxygenase (5-LOX)",
      "Thromboxane synthetase"
    ],
    correctAnswer: 0,
    explanation: "Aspirin covalently acetylates the serine-529 residue of COX-1, permanently abolishing platelet thromboxane A2 (TXA2) generation for the entire lifespan of the platelet (~8-10 days).",
    whyWrong: {
      1: "Corticosteroids inhibit phospholipase A2 by inducing lipocortin/annexin A1.",
      2: "Zileuton inhibits 5-lipoxygenase, blocking leukotriene synthesis.",
      3: "Thromboxane synthetase inhibitors (e.g. dazoxiben) block the downstream enzyme, but aspirin targets COX-1."
    }
  },
  {
    id: 40,
    year: 2,
    subject: "Microbiology",
    topic: "Immunology - Hypersensitivity",
    question: "Anaphylactic shock following penicillin administration is mediated by which type of hypersensitivity reaction (Gell and Coombs classification)?",
    options: [
      "Type I (IgE-mediated immediate hypersensitivity)",
      "Type II (Antibody-dependent cytotoxic)",
      "Type III (Immune complex-mediated)",
      "Type IV (T-cell mediated delayed-type hypersensitivity)"
    ],
    correctAnswer: 0,
    explanation: "Type I hypersensitivity occurs when penicillin acts as a hapten, inducing IgE antibodies that bind FcεRI receptors on mast cells and basophils. Re-exposure causes cross-linking and rapid degranulation of histamine, leukotrienes, and tryptase.",
    whyWrong: {
      1: "Type II reactions involve IgG/IgM attacking cell surface antigens (e.g., autoimmune hemolytic anemia, Goodpasture).",
      2: "Type III reactions involve circulating antigen-antibody complexes depositing in tissues (e.g., serum sickness, SLE).",
      3: "Type IV reactions are cell-mediated by sensitized T-lymphocytes (e.g., tuberculin skin test, contact dermatitis)."
    }
  },
  {
    id: 41,
    year: 2,
    subject: "Forensic Medicine",
    topic: "Medical Jurisprudence - Consent",
    question: "In India, under Section 90 of the Indian Penal Code, a child below what age cannot give valid legal consent for medical examination or treatment?",
    options: [
      "12 years",
      "14 years",
      "16 years",
      "18 years"
    ],
    correctAnswer: 0,
    explanation: "Under Section 90 of the IPC, consent given by a child under twelve years of age is not valid consent in law. The parents or legal guardians must provide consent on the child's behalf.",
    whyWrong: {
      1: "14 years is the threshold for certain child labor regulations, not general IPC consent.",
      2: "16 years is relevant in specific offenses like statutory rape under previous codes.",
      3: "18 years is the age of majority for contracts and general legal adulthood under the Indian Majority Act."
    }
  },
  {
    id: 42,
    year: 2,
    subject: "Pathology",
    topic: "Cardiovascular Pathology - Atherosclerosis",
    question: "What is the earliest microscopically visible stage of atherosclerosis found in arterial walls?",
    options: [
      "Fatty streak (lipid-laden foam cells in the intima)",
      "Fibrous cap atheroma",
      "Complicated plaque with calcification",
      "Ulcerated thrombosis"
    ],
    correctAnswer: 0,
    explanation: "Fatty streaks are the earliest lesions of atherosclerosis, consisting of subendothelial accumulations of lipid-laden macrophages (foam cells) in the tunica intima, often detectable even in adolescents.",
    whyWrong: {
      1: "Fibrous cap atheroma is an advanced fibrofatty lesion with smooth muscle proliferation and necrotic core.",
      2: "Calcification is a feature of late, complicated atherosclerotic plaques.",
      3: "Ulcerated thrombosis represents an end-stage acute event leading to unstable angina or infarction."
    }
  },
  {
    id: 43,
    year: 2,
    subject: "Pharmacology",
    topic: "Central Nervous System - Antiepileptics",
    question: "Which antiepileptic drug is the drug of choice for absence (petit mal) seizures in children, acting by blocking T-type calcium channels in thalamic neurons?",
    options: [
      "Ethosuximide",
      "Phenytoin",
      "Carbamazepine",
      "Phenobarbital"
    ],
    correctAnswer: 0,
    explanation: "Ethosuximide selectively inhibits low-threshold T-type Ca²⁺ channels in thalamic relay neurons, disrupting the rhythmic 3-Hz spike-and-wave discharges pathognomonic of absence seizures without causing sedation.",
    whyWrong: {
      1: "Phenytoin blocks voltage-gated Na⁺ channels; it can paradoxically worsen absence seizures.",
      2: "Carbamazepine is first-line for focal seizures and can exacerbate absence epilepsy.",
      3: "Phenobarbital enhances GABAA receptor opening and is used for neonatal seizures."
    }
  },
  {
    id: 44,
    year: 2,
    subject: "Microbiology",
    topic: "Bacteriology - Acid-Fast Bacilli",
    question: "Which staining technique is the standard laboratory method used to detect Mycobacterium tuberculosis in sputum smears?",
    options: [
      "Ziehl-Neelsen (Acid-Fast) stain",
      "Gram stain",
      "Albert stain",
      "India Ink preparation"
    ],
    correctAnswer: 0,
    explanation: "The high lipid (mycolic acid) content of the mycobacterial cell wall resists standard Gram staining. The Ziehl-Neelsen carbolfuchsin stain uses heat and acid-alcohol decolorization; M. tuberculosis retains the bright red color.",
    whyWrong: {
      1: "Gram stain poorly penetrates waxy mycolic acid walls ('ghost bacilli').",
      2: "Albert stain demonstrates metachromatic volutin granules in Corynebacterium diphtheriae.",
      3: "India Ink is a negative stain used to visualize the thick capsule of Cryptococcus neoformans."
    }
  },
  {
    id: 45,
    year: 2,
    subject: "Forensic Medicine",
    topic: "Toxicology - Metallic Poisons",
    question: "Raindrop pigmentation of the skin and Mee's lines (transverse white bands) on nails are classic signs of chronic poisoning with which element?",
    options: [
      "Arsenic",
      "Lead",
      "Mercury",
      "Thallium"
    ],
    correctAnswer: 0,
    explanation: "Chronic arsenic poisoning causes classic cutaneous hyperpigmentation ('raindrop' pattern), palmar-plantar hyperkeratosis, and Mee's lines in fingernails, along with peripheral sensorimotor neuropathy.",
    whyWrong: {
      1: "Chronic lead poisoning produces Burtonian blue lines on gums, basophilic stippling, and wrist drop.",
      2: "Chronic mercury poisoning causes erethism, intention tremors ('hatter's shakes'), and acrodynia.",
      3: "Thallium toxicity is characterized by dramatic alopecia and painful sensory neuropathy."
    }
  },
  {
    id: 46,
    year: 2,
    subject: "Pathology",
    topic: "Liver Pathology - Cirrhosis",
    question: "Mallory-Denk bodies (intracytoplasmic eosinophilic inclusions composed of damaged cytokeratins) are most characteristically observed in hepatocytes of patients with:",
    options: [
      "Alcoholic hepatitis",
      "Hepatitis A infection",
      "Wilson disease",
      "Primary Biliary Cholangitis"
    ],
    correctAnswer: 0,
    explanation: "Mallory-Denk bodies are irregular ropy eosinophilic inclusions of ubiquitinated cytokeratin intermediate filaments, seen classically alongside neutrophilic infiltration and ballooning degeneration in alcoholic hepatitis.",
    whyWrong: {
      1: "Hepatitis A causes acute self-limited ballooning degeneration with Councilman acidophilic bodies, not Mallory bodies.",
      2: "Wilson disease features copper accumulation in hepatocytes and Descemet's membrane (Kayser-Fleischer rings).",
      3: "Primary Biliary Cholangitis shows autoimmune destruction of interlobular bile ducts with anti-mitochondrial antibodies."
    }
  },
  {
    id: 47,
    year: 2,
    subject: "Pharmacology",
    topic: "Endocrine - Antidiabetic Drugs",
    question: "Metformin, the cornerstone biguanide oral hypoglycemic agent, lowers blood glucose primarily by which cellular mechanism?",
    options: [
      "Activating AMP-activated protein kinase (AMPK) to reduce hepatic gluconeogenesis",
      "Stimulating beta-cell insulin secretion via ATP-sensitive K⁺ channels",
      "Inhibiting intestinal alpha-glucosidase enzymes",
      "Inhibiting renal SGLT2 sodium-glucose cotransporters"
    ],
    correctAnswer: 0,
    explanation: "Metformin inhibits mitochondrial complex I, altering the AMP:ATP ratio and activating AMP-activated protein kinase (AMPK). This downregulates gluconeogenic enzymes in hepatocytes, reducing hepatic glucose output.",
    whyWrong: {
      1: "Sulfonylureas (e.g. Glimepiride) block ATP-sensitive K⁺ channels to stimulate insulin exocytosis.",
      2: "Acarbose and voglibose inhibit brush-border alpha-glucosidases to delay carbohydrate absorption.",
      3: "Dapagliflozin and empagliflozin inhibit renal SGLT2 cotransporters in proximal tubules."
    }
  },
  {
    id: 48,
    year: 2,
    subject: "Microbiology",
    topic: "Mycology - Opportunistic Fungi",
    question: "Which fungal organism forms narrow-angle (45-degree) acutely branching, septate hyphae in tissue and causes fungal balls (aspergilloma) in pre-existing lung cavities?",
    options: [
      "Aspergillus fumigatus",
      "Mucor species",
      "Candida albicans",
      "Histoplasma capsulatum"
    ],
    correctAnswer: 0,
    explanation: "Aspergillus fumigatus produces acute-angle (~45°) branching, regular septate hyphae. It readily colonizes pre-existing tuberculosis cavities to form fungus balls (aspergillomas).",
    whyWrong: {
      1: "Mucor and Rhizopus species form broad, non-septate, right-angle (90°) branching ribbon-like hyphae.",
      2: "Candida displays pseudohyphae and budding yeast forms with germ tubes at 37°C.",
      3: "Histoplasma capsulatum is an intracellular dimorphic fungus multiplying as tiny round yeasts inside macrophages."
    }
  },
  {
    id: 49,
    year: 2,
    subject: "Forensic Medicine",
    topic: "Asphyxial Deaths",
    question: "In complete hanging, what is the most common and immediate cause of death?",
    options: [
      "Compression of bilateral jugular veins and carotid arteries leading to cerebral ischemia",
      "Fracture dislocation of cervical vertebrae C2-C3 with transection of the cord",
      "Laryngeal fracture and complete airway occlusion",
      "Vagal cardiac arrest from pressure on the carotid sinus"
    ],
    correctAnswer: 0,
    explanation: "In standard judicial or domestic hanging, the ligature exerts as little as 3.5-5 kg of tension, instantly occluding the low-pressure jugular veins and then carotid arteries (requiring ~5 kg), producing rapid cerebral hypoxia and unconsciousness.",
    whyWrong: {
      1: "Fracture of the cervical vertebrae (hangman's fracture) occurs in judicial drop hanging, not typical domestic hanging.",
      2: "Airway occlusion requires much higher pressure (~15 kg) and is secondary to vascular occlusion.",
      3: "Vagal inhibition can occur in ligature strangulation, but cerebral ischemia is the primary mechanism in hanging."
    }
  },
  {
    id: 50,
    year: 2,
    subject: "Pathology",
    topic: "Environmental & Nutritional Pathology",
    question: "Asbestos exposure is strongly linked to which highly aggressive malignancy of the pleural and peritoneal cavities?",
    options: [
      "Malignant mesothelioma",
      "Small cell lung carcinoma",
      "Squamous cell carcinoma of the larynx",
      "Renal cell carcinoma"
    ],
    correctAnswer: 0,
    explanation: "Asbestos fibers (especially amphiboles) penetrate into the pleura, generating chronic reactive oxygen species and malignant mesothelioma. Asbestos bodies (ferruginous bodies with iron-protein coating) are seen on histology.",
    whyWrong: {
      1: "Small cell lung cancer is heavily linked to cigarette smoking; while asbestos increases bronchogenic adenocarcinoma risk synergistically with smoking, mesothelioma is its specific tumor.",
      2: "Laryngeal squamous carcinoma is primarily tied to tobacco and alcohol consumption.",
      3: "Renal cell carcinoma is linked to VHL mutation, smoking, and hypertension, not asbestos."
    }
  },

  // --- YEAR 3: CLINICAL PART 1 (Community Medicine, Ophthalmology, ENT) ---
  {
    id: 51,
    year: 3,
    subject: "Community Medicine",
    topic: "Epidemiology - Study Designs",
    question: "Which epidemiological study design calculates an Odds Ratio (OR) by starting with diseased subjects and matching them to healthy controls to assess past exposures?",
    options: [
      "Case-Control Study",
      "Prospective Cohort Study",
      "Randomized Controlled Trial (RCT)",
      "Cross-Sectional Prevalence Study"
    ],
    correctAnswer: 0,
    explanation: "Case-control studies are observational, retrospective studies that begin with outcome (cases vs. controls) and look backward in time for exposure. Because incidence cannot be calculated, the Odds Ratio is the measure of association.",
    whyWrong: {
      1: "Prospective cohort studies follow exposed vs unexposed cohorts forward to calculate Relative Risk (Incidence Rate).",
      2: "RCTs are interventional experimental studies randomizing exposure.",
      3: "Cross-sectional studies evaluate exposure and disease simultaneously at a single point in time to assess prevalence."
    }
  },
  {
    id: 52,
    year: 3,
    subject: "Ophthalmology",
    topic: "Cataract",
    question: "What is the most common cause of painless, progressive, bilateral decrease in vision in elderly individuals worldwide?",
    options: [
      "Age-related (senile) cataract",
      "Primary open-angle glaucoma",
      "Age-related macular degeneration",
      "Diabetic retinopathy"
    ],
    correctAnswer: 0,
    explanation: "Age-related cataract (opacification of the crystalline lens) remains the single leading cause of reversible blindness worldwide, presenting with painless, gradual, progressive visual deterioration and glare.",
    whyWrong: {
      1: "Primary open-angle glaucoma presents with insidious peripheral visual field loss (tunnel vision), usually asymptomatic until late.",
      2: "ARMD causes central scotoma and metamorphopsia, not diffuse lens clouding.",
      3: "Diabetic retinopathy presents with microaneurysms, hemorrhages, and macular edema in patients with diabetes."
    }
  },
  {
    id: 53,
    year: 3,
    subject: "ENT",
    topic: "Hearing Assessment - Tuning Fork Tests",
    question: "In Rinne's tuning fork test, if bone conduction is louder and longer than air conduction (BC > AC) in the affected ear, what type of hearing loss is present?",
    options: [
      "Conductive hearing loss (Negative Rinne)",
      "Sensorineural hearing loss (Positive Rinne)",
      "Normal hearing (Positive Rinne)",
      "Central auditory processing disorder"
    ],
    correctAnswer: 0,
    explanation: "Normally, air conduction is louder than bone conduction (AC > BC = Positive Rinne). When an obstruction in the external or middle ear impedes sound (e.g. otitis media, otosclerosis), bone conduction exceeds air conduction (BC > AC = Negative Rinne).",
    whyWrong: {
      1: "In sensorineural hearing loss, AC remains greater than BC (AC > BC) because both are reduced equally by cochlear nerve damage.",
      2: "Normal hearing shows AC > BC (Positive Rinne).",
      3: "Central processing disorder shows normal peripheral tuning fork test results."
    }
  },
  {
    id: 54,
    year: 3,
    subject: "Community Medicine",
    topic: "National Immunization Schedule (IGNOU/Govt of India)",
    question: "Under the Universal Immunization Programme (UIP) in India, which vaccine is administered intradermally at birth to protect against severe disseminated forms of childhood tuberculosis?",
    options: [
      "BCG (Bacille Calmette-Guérin)",
      "Hepatitis B vaccine",
      "OPV (Oral Polio Vaccine)",
      "Pentavalent vaccine"
    ],
    correctAnswer: 0,
    explanation: "BCG (live attenuated M. bovis strain) is given intradermally (0.05 mL at birth or 0.1 mL after 1 month) over the left deltoid to prevent tuberculous meningitis and miliary tuberculosis in infants.",
    whyWrong: {
      1: "Hepatitis B birth dose is given intramuscularly in the anterolateral thigh within 24 hours.",
      2: "Zero dose OPV is administered orally (2 drops).",
      3: "Pentavalent (DPT + HepB + Hib) is administered at 6, 10, and 14 weeks intramuscularly."
    }
  },
  {
    id: 55,
    year: 3,
    subject: "Ophthalmology",
    topic: "Glaucoma - Acute Angle-Closure",
    question: "A 60-year-old hyperopic female presents with severe periocular pain, nausea, colored halos around lights, a hazy cornea, and a mid-dilated fixed oval pupil. What is the emergency diagnosis?",
    options: [
      "Acute angle-closure glaucoma",
      "Acute anterior uveitis",
      "Bacterial corneal ulcer",
      "Endophthalmitis"
    ],
    correctAnswer: 0,
    explanation: "Acute angle-closure glaucoma occurs when pupil dilation causes pupillary block in shallow anterior chambers. IOP spikes rapidly (>50 mmHg), causing corneal edema (halos), ciliary flush, severe trigeminal pain, and a mid-dilated fixed pupil.",
    whyWrong: {
      1: "Acute anterior uveitis features a small, irregular, constricted pupil (miosis) with keratic precipitates and photophobia.",
      2: "Corneal ulcer presents with a distinct white stromal infiltrate on the cornea and fluorescein uptake.",
      3: "Endophthalmitis usually occurs post-surgery or trauma with hypopyon and vitreous involvement."
    }
  },
  {
    id: 56,
    year: 3,
    subject: "ENT",
    topic: "Otitis Media - Complications",
    question: "Cholesteatoma is most commonly associated with which type of Chronic Suppurative Otitis Media (CSOM)?",
    options: [
      "Atticoantral disease ('unsafe' CSOM)",
      "Tubotympanic disease ('safe' CSOM)",
      "Secretory otitis media with effusion",
      "Otomycosis"
    ],
    correctAnswer: 0,
    explanation: "Atticoantral CSOM involves the postero-superior margin or pars flaccida of the tympanic membrane. It is associated with bone-eroding keratinizing squamous epithelium (cholesteatoma), carrying high risk of intracranial complications.",
    whyWrong: {
      1: "Tubotympanic CSOM ('safe' ear) involves central perforation of the pars tensa without cholesteatoma.",
      2: "Otitis media with effusion has an intact retracted tympanic membrane with amber fluid/air bubbles.",
      3: "Otomycosis is a superficial fungal infection of the external auditory canal."
    }
  },
  {
    id: 57,
    year: 3,
    subject: "Community Medicine",
    topic: "Biostatistics",
    question: "If a diagnostic test has high 'Sensitivity', it is particularly valuable for:",
    options: [
      "Ruling OUT disease when the test result is negative (SnNOut)",
      "Ruling IN disease when the test result is positive (SpPIn)",
      "Estimating the overall prevalence in the population",
      "Eliminating confounding bias in clinical trials"
    ],
    correctAnswer: 0,
    explanation: "Sensitivity = TP / (TP + FN). A highly sensitive test has very few false negatives. Therefore, a negative result gives high confidence that the patient does NOT have the condition (mnemonic: SnNOut).",
    whyWrong: {
      1: "A highly Specific test has few false positives, so a positive result rules IN disease (SpPIn).",
      2: "Prevalence is determined by cross-sectional surveys, not test sensitivity alone.",
      3: "Confounding bias in trials is minimized by randomization, not test sensitivity."
    }
  },
  {
    id: 58,
    year: 3,
    subject: "Ophthalmology",
    topic: "Retina - Emergencies",
    question: "A sudden, painless, profound loss of vision with a pale milky-white retina and a classic 'cherry-red spot' at the fovea is diagnostic of:",
    options: [
      "Central Retinal Artery Occlusion (CRAO)",
      "Central Retinal Vein Occlusion (CRVO)",
      "Rhegmatogenous Retinal Detachment",
      "Vitreous hemorrhage"
    ],
    correctAnswer: 0,
    explanation: "In CRAO, the retinal arterioles lose perfusion, causing acute ischemic whitening of the nerve fiber layer. The fovea is thin and translucent, allowing the underlying red choroidal circulation to show through as a 'cherry-red spot'.",
    whyWrong: {
      1: "CRVO displays extensive flame hemorrhages and dilated tortuous veins across the entire fundus ('blood and thunder').",
      2: "Retinal detachment presents with a dark veil/curtain dropping over the visual field and flashes of light.",
      3: "Vitreous hemorrhage obscures the fundus completely with loss of the red reflex."
    }
  },
  {
    id: 59,
    year: 3,
    subject: "ENT",
    topic: "Epistaxis",
    question: "Little's area (Kiesselbach's plexus), the site of >90% of anterior epistaxis, is formed on the anterior nasal septum by an anastomosis of branches from which arteries?",
    options: [
      "Sphenopalatine, Greater palatine, Superior labial, and Anterior ethmoidal arteries",
      "Internal carotid artery and Middle meningeal artery",
      "Vertebral and Basilar arteries",
      "Facial artery and Occipital artery"
    ],
    correctAnswer: 0,
    explanation: "Kiesselbach's plexus on the anterior inferior nasal septum is formed by an anastomosis between branches of the internal carotid (Anterior ethmoidal) and external carotid (Sphenopalatine, Greater palatine, and Superior labial) arteries.",
    whyWrong: {
      1: "The middle meningeal artery supplies intracranial dura, not Little's area.",
      2: "Vertebral and basilar arteries supply posterior cerebral circulation.",
      3: "The occipital artery supplies the posterior scalp."
    }
  },
  {
    id: 60,
    year: 3,
    subject: "Community Medicine",
    topic: "Nutrition & Deficiency Programs (IGNOU)",
    question: "Bitot's spots (foamy, silvery-grey patches on the bulbar conjunctiva) are a clinical manifestation of which micronutrient deficiency?",
    options: [
      "Vitamin A deficiency",
      "Vitamin D deficiency",
      "Vitamin C deficiency",
      "Iron deficiency"
    ],
    correctAnswer: 0,
    explanation: "Under the WHO xerophthalmia classification, Bitot's spots (Stage X1B) represent keratin debris accumulation on the temporal bulbar conjunctiva secondary to Vitamin A deficiency, following night blindness (XN).",
    whyWrong: {
      1: "Vitamin D deficiency causes rickets in children and osteomalacia in adults.",
      2: "Vitamin C deficiency causes scurvy (bleeding gums and subperiosteal hematomas).",
      3: "Iron deficiency causes microcytic hypochromic anemia and koilonychia."
    }
  },
  {
    id: 61,
    year: 3,
    subject: "Ophthalmology",
    topic: "Optics and Refraction",
    question: "In myopia (nearsightedness), where does the parallel rays of light coming from infinity come to a focus when accommodation is at rest?",
    options: [
      "In front of the retina (corrected with concave / minus lenses)",
      "Behind the retina (corrected with convex / plus lenses)",
      "Directly on the fovea centralis",
      "Unevenly in multiple focal planes"
    ],
    correctAnswer: 0,
    explanation: "In axial or refractive myopia, the eye's refractive power is too strong or the axial length is too long, causing light rays to focus in front of the retina. Biconcave (minus) lenses diverge incoming rays to move the focal point back onto the retina.",
    whyWrong: {
      1: "In hypermetropia (farsightedness), light rays focus behind the retina and are corrected with convex (plus) lenses.",
      2: "Focus directly on the retina is the definition of normal emmetropia.",
      3: "Focusing in multiple planes due to irregular corneal curvature is astigmatism."
    }
  },
  {
    id: 62,
    year: 3,
    subject: "ENT",
    topic: "Pharynx & Larynx - Infections",
    question: "A 'hot potato voice', trismus, deviation of the uvula to the contralateral side, and bulging of the superior tonsillar pillar are pathognomonic of:",
    options: [
      "Peritonsillar abscess (Quinsy)",
      "Retropharyngeal abscess",
      "Ludwig's angina",
      "Acute epiglottitis"
    ],
    correctAnswer: 0,
    explanation: "Peritonsillar abscess (quinsy) is a collection of pus between the palatine tonsil capsule and pharyngeal constrictor muscle, causing severe odynophagia, trismus (pterygoid spasm), muffled 'hot potato' voice, and uvular deviation.",
    whyWrong: {
      1: "Retropharyngeal abscess presents with neck stiffness, stridor, and posterior pharyngeal wall bulging in toddlers.",
      2: "Ludwig's angina is a bilateral cellulitis of the submandibular space elevating the floor of the mouth.",
      3: "Acute epiglottitis causes tripod positioning, drooling, and cherry-red swollen epiglottis."
    }
  },
  {
    id: 63,
    year: 3,
    subject: "Community Medicine",
    topic: "Water and Environmental Health",
    question: "What is the recommended free residual chlorine concentration in drinking water at the consumer's tap after a contact time of 1 hour?",
    options: [
      "At least 0.5 mg/L (parts per million)",
      "0.01 mg/L",
      "5.0 mg/L",
      "10.0 mg/L"
    ],
    correctAnswer: 0,
    explanation: "For routine public water supplies, chlorination should achieve a minimum free residual chlorine of 0.5 mg/L (ppm) after a 60-minute contact period to ensure ongoing protection against secondary microbial contamination.",
    whyWrong: {
      1: "0.01 mg/L is far too low and provides zero residual bactericidal capacity.",
      2: "5.0 mg/L is excessively high, imparting strong chemical odor and mucosal irritation.",
      3: "10.0 mg/L is used for initial shock disinfection of wells, not distribution tap water."
    }
  },
  {
    id: 64,
    year: 3,
    subject: "Ophthalmology",
    topic: "Infections - Trachoma",
    question: "Trachoma, a leading infectious cause of blindness characterized by conjunctival follicles and trichiasis, is caused by which pathogen?",
    options: [
      "Chlamydia trachomatis (Serovars A, B, Ba, C)",
      "Neisseria gonorrhoeae",
      "Herpes Simplex Virus Type 1",
      "Adenovirus serotypes 8 and 19"
    ],
    correctAnswer: 0,
    explanation: "Chlamydia trachomatis serotypes A, B, Ba, and C cause endemic blinding trachoma. Repeated chronic reinfections produce upper palpebral scarring (Arlt's line), trichiasis, corneal opacity, and blindness.",
    whyWrong: {
      1: "N. gonorrhoeae causes hyperacute purulent conjunctivitis in neonates and adults.",
      2: "HSV-1 causes dendritic corneal ulcers stained with fluorescein.",
      3: "Adenovirus serotypes 8 and 19 cause epidemic keratoconjunctivitis (EKC)."
    }
  },
  {
    id: 65,
    year: 3,
    subject: "ENT",
    topic: "Vestibular Disorders",
    question: "Brief, paroxysmal episodes of true rotational vertigo triggered by sudden head position changes (like turning in bed) without hearing loss or tinnitus are characteristic of:",
    options: [
      "Benign Paroxysmal Positional Vertigo (BPPV)",
      "Meniere's disease",
      "Vestibular schwannoma (Acoustic neuroma)",
      "Vestibular neuronitis"
    ],
    correctAnswer: 0,
    explanation: "BPPV is caused by displaced otoconia (canaliths) entering a semicircular canal (usually posterior). Diagnostic Dix-Hallpike maneuver induces torsional nystagmus and vertigo, successfully treated by the Epley particle repositioning maneuver.",
    whyWrong: {
      1: "Meniere's disease features prolonged episodic vertigo lasting hours accompanied by fluctuating sensorineural hearing loss, tinnitus, and aural fullness.",
      2: "Vestibular schwannoma causes progressive unilateral sensorineural hearing loss with high-pitched tinnitus.",
      3: "Vestibular neuronitis causes continuous prolonged vertigo lasting several days following a viral illness."
    }
  },
  {
    id: 66,
    year: 3,
    subject: "Community Medicine",
    topic: "Demography and Family Planning",
    question: "Which of the following intrauterine contraceptive devices (IUCDs) is effective for 10 years after insertion in the Government of India family planning program?",
    options: [
      "Cu-T 380A",
      "Cu-T 200",
      "Multiload 375",
      "Levonorgestrel-releasing IUD (Mirena)"
    ],
    correctAnswer: 0,
    explanation: "The Copper-T 380A (Cu-T 380A) is a second-generation copper IUD approved for 10 continuous years of protection, provided free across public health facilities under India's Family Planning program.",
    whyWrong: {
      1: "Cu-T 200 had an effective lifespan of only 3 years.",
      2: "Multiload 375 is approved for 5 years of contraceptive use.",
      3: "LNG-IUD (Mirena) is approved for 5-8 years."
    }
  },
  {
    id: 67,
    year: 3,
    subject: "Ophthalmology",
    topic: "Corneal Ulcers",
    question: "A branch-like, linear 'dendritic ulcer' on the cornea with terminal end-bulbs that stains vividly with fluorescein dye is classic for:",
    options: [
      "Herpes Simplex Keratitis",
      "Fungal corneal ulcer (Fusarium)",
      "Acanthamoeba keratitis",
      "Bacterial hypopyon ulcer"
    ],
    correctAnswer: 0,
    explanation: "Dendritic ulcers are caused by active replication of Herpes Simplex Virus Type 1 within corneal epithelial cells. Corticosteroids are strictly contraindicated as they cause rapid geographic ulceration and stromal melting.",
    whyWrong: {
      1: "Fungal corneal ulcer shows dry, raised slough with feathery hyphate margins and satellite lesions.",
      2: "Acanthamoeba keratitis (contact lens wearers) presents with severe pain disproportionate to signs and ring infiltrates.",
      3: "Bacterial ulcer presents as a round stromal defect with dense purulent base."
    }
  },
  {
    id: 68,
    year: 3,
    subject: "ENT",
    topic: "Facial Nerve Disorders",
    question: "Idiopathic, acute-onset unilateral lower motor neuron (LMN) facial nerve paralysis affecting both the upper and lower face (inability to close eye or furrow forehead) is termed:",
    options: [
      "Bell's palsy",
      "Upper motor neuron facial palsy (stroke)",
      "Ramsay Hunt syndrome",
      "Trigeminal neuralgia"
    ],
    correctAnswer: 0,
    explanation: "Bell's palsy is an acute lower motor neuron (LMN) paralysis of CN VII, likely linked to HSV reactivation. Because lower motor neuron lesions affect all branches, the entire ipsilateral half of the face is paralyzed (including forehead wrinkling).",
    whyWrong: {
      1: "An upper motor neuron lesion spares the forehead due to bilateral cortical innervation of frontalis.",
      2: "Ramsay Hunt syndrome is facial palsy caused by Varicella Zoster with painful vesicular eruptions in the external auditory canal.",
      3: "Trigeminal neuralgia causes sudden lancinating electric-shock facial pain without motor weakness."
    }
  },
  {
    id: 69,
    year: 3,
    subject: "Community Medicine",
    topic: "Infectious Disease Control",
    question: "What is the primary vector responsible for the transmission of Dengue fever and Chikungunya virus in urban India?",
    options: [
      "Aedes aegypti (day-biting tiger mosquito)",
      "Anopheles stephensi",
      "Culex quinquefasciatus",
      "Mansonia annulifera"
    ],
    correctAnswer: 0,
    explanation: "Aedes aegypti breeds in artificial clean water containers (tires, flowerpots, coolers). It is a persistent daytime biter with striped legs ('tiger mosquito') transmitting Dengue, Chikungunya, and Zika.",
    whyWrong: {
      1: "Anopheles stephensi is the principal urban vector for malaria.",
      2: "Culex quinquefasciatus breeds in dirty/stagnant drainage water and transmits Bancroftian filariasis.",
      3: "Mansonia mosquitoes transmit Brugian filariasis and attach to aquatic plants (Pistia)."
    }
  },
  {
    id: 70,
    year: 3,
    subject: "Ophthalmology",
    topic: "Strabismus & Amblyopia",
    question: "What is the medical term for 'lazy eye'—a developmental reduction in visual acuity in an eye that does not improve with refractive correction alone?",
    options: [
      "Amblyopia",
      "Astigmatism",
      "Anisocoria",
      "Presbyopia"
    ],
    correctAnswer: 0,
    explanation: "Amblyopia occurs during the critical visual development period in early childhood when clear image transmission from one eye to the visual cortex is hindered (by strabismus, refractive error, or cataract). It is treated with occlusion patching of the good eye.",
    whyWrong: {
      1: "Astigmatism is an optical refractive error caused by differing corneal curvature meridians.",
      2: "Anisocoria is unequal pupil size.",
      3: "Presbyopia is age-related loss of lens elasticity for near vision accommodation."
    }
  },
  {
    id: 71,
    year: 3,
    subject: "ENT",
    topic: "Nasal Polyps",
    question: "Samter's Triad (Aspirin-Exacerbated Respiratory Disease) consists of bronchial asthma, aspirin sensitivity, and which ENT manifestation?",
    options: [
      "Bilateral ethmoidal nasal polyps",
      "Atrophic rhinitis",
      "Deviated nasal septum",
      "Juvenile nasopharyngeal angiofibroma"
    ],
    correctAnswer: 0,
    explanation: "Samter's triad consists of asthma, nasal polyposis, and severe bronchospasm following aspirin/NSAID ingestion due to diversion of arachidonic acid to cysteinyl leukotrienes.",
    whyWrong: {
      1: "Atrophic rhinitis is characterized by foul-smelling nasal crusting and enlarged nasal cavities.",
      2: "Deviated nasal septum is a structural anatomical deformity.",
      3: "Juvenile nasopharyngeal angiofibroma is a benign, vascular tumor in adolescent males causing epistaxis."
    }
  },
  {
    id: 72,
    year: 3,
    subject: "Community Medicine",
    topic: "Screening Criteria",
    question: "According to Wilson and Jungner's principles, which of the following is an essential criterion for a disease to be suitable for population screening?",
    options: [
      "The condition should have a recognizable latent or early asymptomatic stage",
      "The disease should have low prevalence and low public health burden",
      "Treatment should only be available after irreversible damage occurs",
      "The screening test should be invasive and expensive"
    ],
    correctAnswer: 0,
    explanation: "Wilson and Jungner established that an effective screening program requires: a significant health problem, an acceptable safe test, a recognizable latent or early asymptomatic window, and effective treatment that improves prognosis when initiated early.",
    whyWrong: {
      1: "Screening for conditions with extremely low prevalence yields very low positive predictive value.",
      2: "There must be an accepted effective treatment available; screening without treatment is unethical.",
      3: "Screening tests must be safe, acceptable, inexpensive, and easily administered to healthy populations."
    }
  },
  {
    id: 3,
    year: 3,
    subject: "Ophthalmology",
    topic: "Diabetic Eye Disease",
    question: "What is the hallmark fundus finding that differentiates Proliferative Diabetic Retinopathy (PDR) from Non-Proliferative Diabetic Retinopathy (NPDR)?",
    options: [
      "Neovascularization at the optic disc (NVD) or elsewhere (NVE)",
      "Microaneurysms and dot-blot hemorrhages",
      "Hard exudates in a circinate pattern",
      "Cotton-wool spots (nerve fiber infarcts)"
    ],
    correctAnswer: 0,
    explanation: "Retinal ischemia triggers VEGF release. The transition to Proliferative Diabetic Retinopathy (PDR) is defined by neovascularization (NVD/NVE), which can hemorrhage into the vitreous or cause tractional retinal detachment, treated with pan-retinal photocoagulation.",
    whyWrong: {
      1: "Microaneurysms are the earliest fundus signs of mild Non-Proliferative Diabetic Retinopathy.",
      2: "Hard exudates represent lipoprotein deposits in NPDR.",
      3: "Cotton-wool spots represent focal retinal nerve fiber ischemia seen in moderate to severe NPDR."
    }
  },
  {
    id: 74,
    year: 3,
    subject: "ENT",
    topic: "Laryngeal Cancer",
    question: "A chronic heavy smoker presenting with progressive hoarseness of voice lasting more than 3 weeks must be investigated immediately to rule out:",
    options: [
      "Squamous cell carcinoma of the larynx (vocal cord cancer)",
      "Vocal cord nodules ('singer's nodes')",
      "Laryngomalacia",
      "Laryngeal papillomatosis"
    ],
    correctAnswer: 0,
    explanation: "Any adult smoker with persistent hoarseness of voice exceeding 2-3 weeks requires urgent indirect laryngoscopy / videolaryngoscopy to rule out glottic laryngeal cancer, which has high cure rates if treated early.",
    whyWrong: {
      1: "Vocal cord nodules are benign bilateral lesions caused by vocal abuse, usually in singers or teachers.",
      2: "Laryngomalacia is a congenital floppy supraglottic condition presenting in neonates with inspiratory stridor.",
      3: "Laryngeal papillomatosis is caused by HPV 6/11 and typically presents in children with recurrent lesions."
    }
  },
  {
    id: 75,
    year: 3,
    subject: "Community Medicine",
    topic: "Primary Health Care in India",
    question: "In India, approximately what population norm is covered by a Primary Health Centre (PHC) in plain areas?",
    options: [
      "30,000 population (20,000 in hilly/tribal areas)",
      "5,000 population",
      "120,000 population",
      "500,000 population"
    ],
    correctAnswer: 0,
    explanation: "In India's 3-tier rural healthcare system: Sub-centre covers 5,000 (3,000 hilly); Primary Health Centre (PHC) covers 30,000 (20,000 hilly); and Community Health Centre (CHC) covers 120,000 (80,000 hilly).",
    whyWrong: {
      1: "5,000 population is the standard coverage for a rural Sub-centre / Health & Wellness Centre.",
      2: "120,000 population is the norm for a Community Health Centre (CHC).",
      3: "500,000 population corresponds to sub-district or district hospital catchment levels."
    }
  },

  // --- YEAR 4: CLINICAL PART 2 (Medicine, Surgery, OBG, Paediatrics) ---
  {
    id: 76,
    year: 4,
    subject: "General Medicine",
    topic: "Cardiology - Myocardial Infarction",
    question: "Which cardiac biomarker is currently the most sensitive and specific preferred standard for diagnosing acute myocardial infarction?",
    options: [
      "Cardiac Troponin I or T (cTnI / cTnT)",
      "Creatine Kinase-MB (CK-MB)",
      "Myoglobin",
      "Aspartate aminotransferase (AST)"
    ],
    correctAnswer: 0,
    explanation: "High-sensitivity cardiac Troponins (cTnI and cTnT) are structural proteins unique to cardiac myocytes. They rise within 2-4 hours, peak at 24 hours, and stay elevated for 7-14 days, providing unmatched diagnostic sensitivity.",
    whyWrong: {
      1: "CK-MB was historical standard; it normalizes rapidly in 48-72 hours, making it useful for re-infarction.",
      2: "Myoglobin rises early (1-2 hours) but lacks cardiac specificity (also found in skeletal muscle).",
      3: "AST is a historical liver and non-specific muscle marker no longer used for cardiac diagnosis."
    }
  },
  {
    id: 77,
    year: 4,
    subject: "General Surgery",
    topic: "Acute Abdomen - Appendicitis",
    question: "Tenderness elicited at McBurney's point during abdominal palpation corresponds anatomically to the base of which organ?",
    options: [
      "Vermiform appendix",
      "Gallbladder",
      "Meckel's diverticulum",
      "Sigmoid colon"
    ],
    correctAnswer: 0,
    explanation: "McBurney's point lies at one-third the distance along the line from the right anterior superior iliac spine (ASIS) to the umbilicus. Maximum tenderness here corresponds to the inflamed base of the vermiform appendix.",
    whyWrong: {
      1: "Gallbladder tenderness is assessed at Murphy's point (intersection of right costal margin and midclavicular line).",
      2: "Meckel's diverticulum is an ileal outpouching located ~2 feet proximal to the ileocecal valve.",
      3: "Sigmoid colon tenderness is elicited in the left lower quadrant (diverticulitis)."
    }
  },
  {
    id: 78,
    year: 4,
    subject: "Obstetrics & Gynaecology",
    topic: "Obstetric Emergencies - Postpartum Hemorrhage",
    question: "What is the single most common cause of primary Postpartum Hemorrhage (PPH) occurring within 24 hours of delivery?",
    options: [
      "Uterine atony (failure of myometrium to contract)",
      "Retained placental tissue",
      "Genital tract lacerations",
      "Disseminated intravascular coagulation (DIC)"
    ],
    correctAnswer: 0,
    explanation: "Uterine atony accounts for >70-80% of all primary PPH cases. Without adequate myometrial contraction ('living ligatures'), the spiral arterioles exposed at the placental bed bleed profusely. First-line management is oxytocin and bimanual uterine massage.",
    whyWrong: {
      1: "Retained placenta accounts for ~10% of cases and requires manual removal.",
      2: "Genital tract tears account for ~20% of cases where the uterus remains firmly contracted.",
      3: "Coagulopathy is a rare primary cause, though it can develop secondarily in severe shock."
    }
  },
  {
    id: 79,
    year: 4,
    subject: "Paediatrics",
    topic: "Neonatology - APGAR Score",
    question: "Which of the following parameters is NOT one of the five components of the standard newborn APGAR score?",
    options: [
      "Blood glucose level",
      "Heart rate",
      "Respiratory effort",
      "Muscle tone and Reflex irritability"
    ],
    correctAnswer: 0,
    explanation: "The APGAR score evaluates 5 vital clinical signs at 1 and 5 minutes: Appearance (skin color), Pulse (heart rate), Grimace (reflex irritability), Activity (muscle tone), and Respiration (respiratory effort). Blood glucose is not a component.",
    whyWrong: {
      1: "Heart rate is a critical score component (0 = absent, 1 = <100 bpm, 2 = ≥100 bpm).",
      2: "Respiratory effort is an essential component (0 = absent, 1 = slow/irregular, 2 = vigorous cry).",
      3: "Muscle tone and reflex irritability are standard APGAR components."
    }
  },
  {
    id: 80,
    year: 4,
    subject: "General Medicine",
    topic: "Endocrinology - Diabetic Ketoacidosis",
    question: "What is the initial, most urgent priority in the emergency management of adult Diabetic Ketoacidosis (DKA)?",
    options: [
      "Aggressive intravenous fluid resuscitation with 0.9% isotonic saline",
      "High-dose subcutaneous insulin injection",
      "Intravenous sodium bicarbonate infusion",
      "Intravenous calcium gluconate"
    ],
    correctAnswer: 0,
    explanation: "Severe osmotic diuresis in DKA results in an average fluid deficit of 5-8 liters. Initial priority is restoring intravascular volume with isotonic (0.9%) saline to maintain renal perfusion before initiating low-dose regular insulin infusion.",
    whyWrong: {
      1: "Insulin should only be started after fluid resuscitation has begun and serum K⁺ is confirmed to be >3.3 mEq/L.",
      2: "Sodium bicarbonate is contraindicated unless arterial pH is <6.9, as it worsens intracellular acidosis.",
      3: "Calcium gluconate is used for hyperkalemic membrane stabilization, not initial DKA therapy."
    }
  },
  {
    id: 81,
    year: 4,
    subject: "General Surgery",
    topic: "Trauma - ATLS & Hemothorax",
    question: "A trauma patient presents with tracheal deviation to the right, hyperresonance, and absent breath sounds over the entire left hemithorax. What is the immediate life-saving procedure?",
    options: [
      "Immediate needle decompression with a large-bore cannula in the 2nd intercostal space",
      "Immediate portable chest radiography to confirm diagnosis",
      "Urgent endotracheal intubation with positive pressure ventilation",
      "Diagnostic thoracentesis for fluid analysis"
    ],
    correctAnswer: 0,
    explanation: "Tension pneumothorax is a clinical emergency characterized by a one-way valve effect causing elevated intrathoracic pressure, mediastinal shift, and caval compression. Immediate needle thoracostomy followed by chest tube insertion is mandatory without waiting for X-rays.",
    whyWrong: {
      1: "Waiting for chest radiography will delay resuscitation and cause fatal cardiac arrest.",
      2: "Positive pressure ventilation will rapidly worsen a tension pneumothorax.",
      3: "Diagnostic thoracentesis is for pleural effusion analysis, not tension pneumothorax."
    }
  },
  {
    id: 82,
    year: 4,
    subject: "Obstetrics & Gynaecology",
    topic: "Hypertension in Pregnancy - Eclampsia",
    question: "What is the anticonvulsant drug of choice for the prevention and treatment of seizures in severe pre-eclampsia and eclampsia?",
    options: [
      "Magnesium sulfate (Pritchard regimen)",
      "Diazepam",
      "Phenytoin",
      "Sodium valproate"
    ],
    correctAnswer: 0,
    explanation: "Magnesium sulfate (MgSO4) is superior to diazepam and phenytoin for treating and preventing eclamptic convulsions (supported by the Collaborative Eclampsia Trial). The deep tendon patellar reflex must be monitored to avoid toxicity.",
    whyWrong: {
      1: "Diazepam causes maternal respiratory depression and neonatal sedation without preventing recurrent seizures effectively.",
      2: "Phenytoin is inferior to magnesium sulfate in reducing eclamptic seizure recurrence.",
      3: "Valproate is teratogenic and ineffective for acute eclampsia management."
    }
  },
  {
    id: 83,
    year: 4,
    subject: "Paediatrics",
    topic: "Nutritional Disorders - Severe Acute Malnutrition",
    question: "Which clinical sign distinguishes Kwashiorkor from Marasmus in children with severe protein-energy malnutrition?",
    options: [
      "Bilateral pitting pedal edema",
      "Severe loss of subcutaneous fat and muscle wasting",
      "Voracious appetite",
      "Normal liver histology"
    ],
    correctAnswer: 0,
    explanation: "Kwashiorkor is characterized by inadequate protein intake despite adequate calories, leading to hypoalbuminemia and bilateral pitting dependent edema, 'flaky paint' dermatosis, and fatty hepatomegaly. Marasmus features severe non-edematous muscle wasting.",
    whyWrong: {
      1: "Severe loss of subcutaneous fat with an old man's face is classic for Marasmus.",
      2: "Marasmic children often have a voracious appetite, whereas children with Kwashiorkor are anorexic and apathetic.",
      3: "Fatty liver (steatosis) occurs in Kwashiorkor due to impaired apolipoprotein synthesis."
    }
  },
  {
    id: 84,
    year: 4,
    subject: "General Medicine",
    topic: "Infectious Diseases - Typhoid Fever",
    question: "Step-ladder fever pattern, relative bradycardia (Faget's sign), and pea-soup diarrhea in the second week are classic clinical features of:",
    options: [
      "Enteric (Typhoid) fever caused by Salmonella Typhi",
      "Malaria caused by Plasmodium vivax",
      "Dengue hemorrhagic fever",
      "Amebic liver abscess"
    ],
    correctAnswer: 0,
    explanation: "Salmonella enterica serotype Typhi invades Peyer's patches. It produces remittent step-ladder pyrexia, relative bradycardia (sphygmo-thermic dissociation / Faget's sign), splenomegaly, and faint rose spots on the trunk.",
    whyWrong: {
      1: "Malaria presents with paroxysmal chills, high fever, and drenching sweats at 48 or 72 hour intervals.",
      2: "Dengue causes sudden onset saddleback fever, severe retro-orbital headache, breakbone arthralgia, and rash.",
      3: "Amebic liver abscess presents with right upper quadrant pain, high fever, and 'anchovy sauce' aspirate."
    }
  },
  {
    id: 85,
    year: 4,
    subject: "General Surgery",
    topic: "Breast Disease - Carcinoma",
    question: "The 'peau d'orange' (orange peel) appearance of the skin overlying an advanced breast cancer is caused by:",
    options: [
      "Dermal lymphatic obstruction by malignant emboli",
      "Involvement and shortening of Cooper's suspensory ligaments",
      "Direct ulceration through the epidermis",
      "Bacterial mastitis secondary to Staphylococcus"
    ],
    correctAnswer: 0,
    explanation: "Carcinoma cells infiltrate and occlude dermal lymphatic vessels, causing local cutaneous lymphedema. Because hair follicles are tethered, the swollen skin bulges outward between the follicles, resembling orange peel (peau d'orange).",
    whyWrong: {
      1: "Shortening of Cooper's suspensory ligaments causes skin dimpling or tethering, not diffuse edema.",
      2: "Direct epidermal ulceration is late fungation of the tumor.",
      3: "Lactational mastitis causes warm tender erythema, not malignant lymphedema."
    }
  },
  {
    id: 86,
    year: 4,
    subject: "Obstetrics & Gynaecology",
    topic: "Early Pregnancy Complications - Ectopic",
    question: "What is the single most common anatomical site of an ectopic pregnancy in the female reproductive tract?",
    options: [
      "Ampulla of the fallopian tube",
      "Ovary",
      "Cervix",
      "Cornu of the uterus"
    ],
    correctAnswer: 0,
    explanation: "More than 95% of ectopic gestations occur in the fallopian tube. Among tubal sites, the wide ampulla accounts for ~70-80% of all ectopic implantations.",
    whyWrong: {
      1: "Primary ovarian ectopic pregnancy accounts for less than 1-2% of all cases.",
      2: "Cervical pregnancy accounts for <1% and carries high hemorrhage risk.",
      3: "Cornual (interstitial) pregnancies account for ~2-3% and can rupture catastrophically."
    }
  },
  {
    id: 87,
    year: 4,
    subject: "Paediatrics",
    topic: "Cardiology - Congenital Heart Disease",
    question: "Tetralogy of Fallot (TOF), the most common cyanotic congenital heart disease beyond infancy, consists of ventricular septal defect, overriding aorta, right ventricular hypertrophy, and:",
    options: [
      "Right ventricular outflow tract obstruction (Pulmonary infundibular stenosis)",
      "Atrial septal defect",
      "Patent ductus arteriosus",
      "Coarctation of the aorta"
    ],
    correctAnswer: 0,
    explanation: "Tetralogy of Fallot comprises: (1) Ventricular Septal Defect (VSD), (2) Pulmonary infundibular stenosis, (3) Overriding aorta, and (4) Secondary Right Ventricular Hypertrophy (RVH). Degree of pulmonary stenosis determines cyanosis severity.",
    whyWrong: {
      1: "An associated ASD makes the condition Pentalogy of Fallot.",
      2: "PDA provides a source of pulmonary blood flow and is maintained medically with alprostadil (PGE1) until surgery.",
      3: "Coarctation is an aortic narrowing associated with Turner syndrome, not part of TOF."
    }
  },
  {
    id: 88,
    year: 4,
    subject: "General Medicine",
    topic: "Pulmonology - Tuberculosis Treatment",
    question: "Which first-line antitubercular drug is notoriously associated with dose-dependent retrobulbar optic neuritis causing loss of red-green color discrimination?",
    options: [
      "Ethambutol",
      "Isoniazid",
      "Rifampicin",
      "Pyrazinamide"
    ],
    correctAnswer: 0,
    explanation: "Ethambutol can cause dose-dependent retrobulbar neuritis, manifesting as decreased visual acuity, central scotoma, and early impairment of red-green color perception. It should be discontinued immediately if visual symptoms occur.",
    whyWrong: {
      1: "Isoniazid causes peripheral neuropathy (prevented with Pyridoxine / B6) and drug-induced hepatitis.",
      2: "Rifampicin causes benign orange-red discoloration of body fluids and CYP450 induction.",
      3: "Pyrazinamide causes hyperuricemia (gout) and hepatotoxicity."
    }
  },
  {
    id: 89,
    year: 4,
    subject: "General Surgery",
    topic: "Thyroid Surgery - Complications",
    question: "Post-thyroidectomy hypocalcemia manifesting with carpopedal spasm (Trousseau's sign) and Chvostek's sign is caused by accidental devascularization or removal of:",
    options: [
      "Parathyroid glands",
      "Recurrent laryngeal nerve",
      "Thymic remnants",
      "Cervical sympathetic chain"
    ],
    correctAnswer: 0,
    explanation: "The parathyroid glands lie closely attached to the posterior capsule of the thyroid lobes. Accidental removal or ischemia reduces parathyroid hormone (PTH), causing acute hypocalcemia with neuromuscular irritability (tetany, Trousseau's and Chvostek's signs).",
    whyWrong: {
      1: "Recurrent laryngeal nerve injury causes hoarseness of voice or airway compromise, not tetany.",
      2: "Thymic remnants have no effect on acute serum calcium levels.",
      3: "Injury to the cervical sympathetic trunk produces Horner's syndrome (ptosis, miosis, anhidrosis)."
    }
  },
  {
    id: 90,
    year: 4,
    subject: "Obstetrics & Gynaecology",
    topic: "Normal Labor - Stages",
    question: "The second stage of labor is defined as the time interval between:",
    options: [
      "Full dilatation of the cervix (10 cm) and delivery of the baby",
      "Onset of true labor contractions and full cervical dilatation",
      "Delivery of the baby and complete expulsion of the placenta",
      "Delivery of the placenta and the first 2 hours postpartum"
    ],
    correctAnswer: 0,
    explanation: "Stage 1 extends from regular contractions to full (10 cm) cervical dilatation; Stage 2 spans full dilatation to delivery of the neonate; Stage 3 spans neonate delivery to placental expulsion; Stage 4 is the 1-2 hour observation period.",
    whyWrong: {
      1: "Onset of labor to full dilatation of cervix is the First stage of labor.",
      2: "Delivery of baby to expulsion of placenta is the Third stage of labor.",
      3: "The first 1-2 hours postpartum is the Fourth stage (recovery/observation stage)."
    }
  },
  {
    id: 91,
    year: 4,
    subject: "Paediatrics",
    topic: "Infectious Diseases - Measles",
    question: "Koplik's spots (tiny bluish-white grains on an erythematous buccal mucosa opposite the lower molars) are pathognomonic for:",
    options: [
      "Measles (Rubeola)",
      "Rubella (German measles)",
      "Chickenpox (Varicella)",
      "Scarlet fever"
    ],
    correctAnswer: 0,
    explanation: "Koplik spots appear during the prodromal stage of measles (accompanied by the 3 C's: cough, coryza, and conjunctivitis) 1-2 days before the generalized maculopapular rash begins at the hairline.",
    whyWrong: {
      1: "Rubella produces petechial spots on the soft palate (Forchheimer spots) and suboccipital lymphadenopathy.",
      2: "Chickenpox produces pleomorphic centripetal 'dewdrops on a rose petal' vesicular lesions.",
      3: "Scarlet fever presents with 'strawberry tongue' and a sandpaper-like rash caused by GAS."
    }
  },
  {
    id: 92,
    year: 4,
    subject: "General Medicine",
    topic: "Gastroenterology - Cirrhosis & Portal HTN",
    question: "What is the drug of choice for the primary medical prophylaxis of bleeding from large esophageal varices in cirrhotic patients?",
    options: [
      "Non-selective beta-blockers (e.g. Propranolol, Nadolol)",
      "Loop diuretics (Furosemide)",
      "Proton pump inhibitors (Omeprazole)",
      "Octreotide infusion"
    ],
    correctAnswer: 0,
    explanation: "Non-selective beta-blockers reduce portal pressure by blocking cardiac beta-1 receptors (reducing cardiac output) and blocking vascular beta-2 receptors (permitting unopposed alpha-1 splanchnic vasoconstriction).",
    whyWrong: {
      1: "Furosemide treats ascites and edema, not variceal hemorrhage risk directly.",
      2: "PPIs suppress gastric acid but have no effect on portal venous hypertension.",
      3: "Octreotide is used for acute active variceal hemorrhage, not routine long-term oral prophylaxis."
    }
  },
  {
    id: 93,
    year: 4,
    subject: "General Surgery",
    topic: "Vascular Surgery - Deep Vein Thrombosis",
    question: "Virchow's Triad, which describes the primary pathophysiological factors contributing to venous thrombosis, consists of endothelial injury, hypercoagulability, and:",
    options: [
      "Venous stasis (sluggish blood flow)",
      "Arterial hypertension",
      "Atheroma rupture",
      "Hypocalcemia"
    ],
    correctAnswer: 0,
    explanation: "Rudolf Virchow identified three key factors causing thrombosis: (1) Endothelial injury/damage, (2) Stasis or turbulence of blood flow, and (3) Hypercoagulability of blood.",
    whyWrong: {
      1: "Hypertension affects high-pressure arterial resistance vessels, not the low-pressure venous bed.",
      2: "Atheroma rupture causes arterial platelet thrombosis (myocardial infarction / stroke), not venous DVT.",
      3: "Hypocalcemia inhibits clotting (since factor IV is calcium); hypercoagulability promotes it."
    }
  },
  {
    id: 94,
    year: 4,
    subject: "Obstetrics & Gynaecology",
    topic: "Gynecological Oncology - Cervix",
    question: "High-risk oncogenic types of Human Papillomavirus (HPV) responsible for >70% of invasive cervical cancers worldwide are:",
    options: [
      "HPV types 16 and 18",
      "HPV types 6 and 11",
      "HPV types 1 and 2",
      "HPV types 5 and 8"
    ],
    correctAnswer: 0,
    explanation: "HPV-16 and HPV-18 encode oncoproteins E6 (degrades p53 tumor suppressor) and E7 (inactivates pRb), driving cell cycle progression into high-grade dysplasia and invasive squamous/adenocarcinoma of the cervix.",
    whyWrong: {
      1: "HPV 6 and 11 are low-risk types that cause benign genital warts (condyloma acuminata).",
      2: "HPV 1 and 2 cause common skin warts (verruca vulgaris) on the hands and feet.",
      3: "HPV 5 and 8 are associated with epidermodysplasia verruciformis in genetically susceptible individuals."
    }
  },
  {
    id: 95,
    year: 4,
    subject: "Paediatrics",
    topic: "Respiratory - Croup vs Epiglottitis",
    question: "A 2-year-old child presents with a barking seal-like cough, inspiratory stridor, and hoarseness. Frontal neck X-ray shows the classic subglottic 'steeple sign'. What is the diagnosis?",
    options: [
      "Acute Laryngotracheobronchitis (Viral Croup)",
      "Acute Epiglottitis",
      "Bacterial Tracheitis",
      "Foreign body aspiration"
    ],
    correctAnswer: 0,
    explanation: "Croup (laryngotracheobronchitis), usually caused by Parainfluenza virus, produces subglottic airway edema. The symmetric narrowing of the subglottic trachea appears like a church steeple on an AP neck radiograph.",
    whyWrong: {
      1: "Acute Epiglottitis shows the 'thumbprint sign' on lateral neck radiograph with absence of a barking cough.",
      2: "Bacterial tracheitis presents as a toxic, high-fever condition with copious thick airway secretions.",
      3: "Foreign body aspiration typically produces sudden unilateral wheeze and air trapping without viral prodrome."
    }
  },
  {
    id: 96,
    year: 4,
    subject: "General Medicine",
    topic: "Neurology - Stroke",
    question: "In eligible patients presenting with acute ischemic stroke, what is the approved therapeutic time window for administering intravenous recombinant tissue plasminogen activator (rt-PA / Alteplase)?",
    options: [
      "Within 4.5 hours of symptom onset",
      "Within 12 hours of symptom onset",
      "Within 24 hours of symptom onset",
      "Within 48 hours of symptom onset"
    ],
    correctAnswer: 0,
    explanation: "Standard guidelines support IV thrombolysis with rt-PA within 3 to 4.5 hours of stroke symptom onset in patients without contraindications (such as intracranial hemorrhage on non-contrast head CT, recent major surgery, or coagulopathy).",
    whyWrong: {
      1: "Beyond 4.5 hours, the risk of symptomatic intracerebral hemorrhage outweighs the reperfusion benefit for standard IV tPA.",
      2: "24 hours is the window for mechanical endovascular thrombectomy in selected large vessel occlusions, not IV tPA.",
      3: "48 hours is far outside thrombolysis guidelines and would cause catastrophic hemorrhagic transformation."
    }
  },
  {
    id: 97,
    year: 4,
    subject: "General Surgery",
    topic: "Burns - Fluid Resuscitation",
    question: "According to the Parkland formula, what is the total volume of Ringer's Lactate required in the first 24 hours for fluid resuscitation of a burn patient?",
    options: [
      "4 mL × Body Weight (kg) × % Total Body Surface Area (TBSA) burned",
      "2 mL × Body Weight (kg) × % TBSA burned",
      "10 mL × Body Weight (kg) × % TBSA burned",
      "1 mL × Body Weight (kg) × Height (cm)"
    ],
    correctAnswer: 0,
    explanation: "The Parkland formula prescribes 4 mL of Ringer's Lactate per kg body weight per percent TBSA of partial/full-thickness burns. Half of this calculated volume is administered over the first 8 hours (from time of burn injury), and the remaining half over the next 16 hours.",
    whyWrong: {
      1: "2 mL/kg/%TBSA is used in the modified Brooke formula, but 4 mL/kg/%TBSA is the classic Parkland standard.",
      2: "10 mL/kg/%TBSA is dangerously excessive and would cause severe pulmonary edema and compartment syndrome.",
      3: "Height is not a factor in the Parkland burn formula."
    }
  },
  {
    id: 98,
    year: 4,
    subject: "Obstetrics & Gynaecology",
    topic: "Obstetric Complications - Placenta Previa",
    question: "Painless, causeless, recurrent bright red vaginal bleeding in the third trimester of pregnancy is classic for:",
    options: [
      "Placenta previa",
      "Abruptio placentae",
      "Vasa previa",
      "Uterine rupture"
    ],
    correctAnswer: 0,
    explanation: "Placenta previa (placenta implanted over or near internal cervical os) characteristically presents as painless, causeless, recurrent bright red vaginal bleeding in late pregnancy. Digital vaginal examination is strictly contraindicated.",
    whyWrong: {
      1: "Abruptio placentae presents with painful, dark vaginal bleeding accompanied by a tender, hypertonic 'woody' uterus.",
      2: "Vasa previa causes fetal bradycardia and death upon membrane rupture as fetal vessels tear.",
      3: "Uterine rupture presents with sudden tearing pain during labor, cessation of contractions, and loss of fetal station."
    }
  },
  {
    id: 99,
    year: 4,
    subject: "Paediatrics",
    topic: "Gastroenterology - Dehydration Assessment",
    question: "According to WHO diarrhea guidelines, which combination of signs categorizes a child as having 'Severe Dehydration'?",
    options: [
      "Lethargic or unconscious, sunken eyes, skin pinch goes back very slowly (>2 seconds)",
      "Restless, irritable, thirsty, skin pinch goes back slowly (1-2 seconds)",
      "Alert, active, normal tears, normal skin turgor",
      "Weight gain with peripheral edema"
    ],
    correctAnswer: 0,
    explanation: "WHO classifies dehydration as: (1) No signs = No dehydration (Plan A); (2) Restless/irritable, sunken eyes, drinks eagerly = Some dehydration (Plan B); (3) Lethargic/unconscious, sunken eyes, unable to drink, skin pinch >2 sec = Severe dehydration (Plan C, requires immediate IV Ringer's Lactate).",
    whyWrong: {
      1: "Restless, irritable, and thirsty drinks eagerly defines 'Some Dehydration' treated with oral ORS (Plan B).",
      2: "Alert and active indicates 'No Dehydration' (Plan A).",
      3: "Weight gain with edema indicates fluid overload or malnutrition, not dehydration."
    }
  },
  {
    id: 100,
    year: 4,
    subject: "General Medicine",
    topic: "Rheumatology - Systemic Lupus Erythematosus",
    question: "Which autoantibody is considered the most specific (pathognomonic) serological marker for Systemic Lupus Erythematosus (SLE)?",
    options: [
      "Anti-Smith (Anti-Sm) and Anti-dsDNA antibodies",
      "Anti-Nuclear Antibodies (ANA)",
      "Rheumatoid Factor (RF)",
      "Anti-Centromere antibodies"
    ],
    correctAnswer: 0,
    explanation: "While ANA is the most sensitive screening test (>95%), Anti-Smith (Anti-Sm) antibodies and Anti-dsDNA antibodies are highly specific for SLE. Anti-dsDNA levels also correlate with lupus nephritis disease activity.",
    whyWrong: {
      1: "ANA is highly sensitive but non-specific; it is positive in many other autoimmune conditions and healthy individuals.",
      2: "Rheumatoid Factor is primarily associated with Rheumatoid Arthritis and Sjogren's syndrome.",
      3: "Anti-Centromere antibodies are characteristic of limited cutaneous systemic sclerosis (CREST syndrome)."
    }
  }
];

export const MBBS_100_QUESTIONS: MBBSQuestion[] = RAW_MBBS_100_QUESTIONS.map(shuffleQuestionOptions);

