import type { CorpusDocument, PresetQuery, StyleProposalMeta } from '../types/agent';

export const MEDICAL_DISCLAIMER =
  "Avertissement médical : Les informations générées proviennent exclusivement du corpus pharmacologique local indexé. Elles sont destinées à la recherche documentaire et ne constituent ni un avis médical, ni une prescription, ni un substitut à l'évaluation d'un professionnel de santé.";

export const CORPUS_DOCUMENTS: CorpusDocument[] = [
  {
    filename: 'dailymed-apixaban.md',
    title: 'Apixaban — Monographie clinique (Facteur Xa)',
    authority: 'DailyMed / FDA',
    therapeuticClass: 'Anticoagulant oral direct (AOD)',
    updatedAt: '2026-04',
    summary:
      "Inhibiteur sélectif et réversible du facteur Xa libre et lié au caillot, réduisant la génération de thrombine et l'extension du thrombus.",
    excerpts: [
      "L'apixaban est un inhibiteur puissant, oral, réversible, direct et hautement sélectif du site actif du facteur Xa. En inhibant le facteur Xa, l'apixaban diminue la génération de thrombine et le développement du thrombus.",
      "La thrombine joue un rôle central dans la cascade de coagulation et peut également induire l'agrégation plaquettaire via l'activation des récepteurs PAR-1.",
      "Chez les patients âgés ou présentant une insuffisance rénale modérée à sévère (ClCr 15–29 mL/min), une réduction de posologie à 2,5 mg deux fois par jour est indiquée lorsque au moins deux critères (âge ≥ 80 ans, poids ≤ 60 kg, créatinine sérique ≥ 1,5 mg/dL) sont réunis."
    ],
    keywords: [
      'apixaban',
      'facteur xa',
      'anticoagulant',
      'thrombus',
      'thrombine',
      'agrégation',
      'coagulation',
      'rénale',
      'âgé',
      'posologie',
      'hémorragique',
      'antithrombotique'
    ]
  },
  {
    filename: 'has-antithrombotiques.md',
    title: 'Classement comparatif des antithrombotiques',
    authority: 'Haute Autorité de Santé',
    therapeuticClass: 'Référentiel transversal',
    updatedAt: '2026-02',
    summary:
      'Distinction mécanistique entre antiagrégants plaquettaires (thrombus blanc artériel), anticoagulants (cascade de fibrine) et thrombolytiques (lyse du caillot constitué).',
    excerpts: [
      "Les antiagrégants plaquettaires (aspirine, clopidogrel, prasugrel, ticagrélor) ciblent l'hémostase primaire en inhibant l'activation ou l'agrégation des plaquettes, prévenant la formation du clou plaquettaire surtout dans le territoire artériel.",
      "Les anticoagulants (héparines, AVK, AOD comme l'apixaban) agissent sur l'hémostase secondaire en bloquant des facteurs de coagulation plasmatiques pour freiner la formation de fibrine et l'extension du thrombus.",
      "Les thrombolytiques ou fibrinolytiques (altéplase, ténectéplase) n'empêchent pas la formation initiale du caillot : ils activent le plasminogène en plasmine afin de dissoudre rapidement un thrombus déjà constitué lors d'urgences vasculaires aiguës."
    ],
    keywords: [
      'différences',
      'différence',
      'anticoagulant',
      'antiagrégant',
      'plaquettaire',
      'thrombolytique',
      'fibrinolytique',
      'fibrine',
      'hémostase',
      'thrombus',
      'coagulation',
      'agrégation'
    ]
  },
  {
    filename: 'ansm-clopidogrel.md',
    title: 'Clopidogrel & Aspirine — Risques et interactions',
    authority: 'ANSM',
    therapeuticClass: 'Antiagrégants plaquettaires',
    updatedAt: '2026-03',
    summary:
      "Inhibition irréversible du récepteur P2Y12 à l'ADP par le métabolite actif du clopidogrel et précautions lors d'une bithérapie antiplaquettaire.",
    excerpts: [
      "Le clopidogrel est une prodrogue nécessitant une bioactivation hépatique par le CYP2C19 pour inhiber de manière sélective et irréversible le récepteur plaquettaire P2Y12 à l'ADP.",
      "L'association clopidogrel + acide acétylsalicylique (bithérapie antiagrégante) majore le risque de saignement digestif et intracrânien par rapport à une monothérapie, imposant une évaluation du risque hémorragique individuel.",
      "L'administration concomitante d'oméprazole ou d'ésoméprazole est déconseillée en raison d'une inhibition compétitive du CYP2C19 réduisant l'exposition au métabolite actif du clopidogrel."
    ],
    keywords: [
      'clopidogrel',
      'aspirine',
      'antiagrégant',
      'plaquettaire',
      'p2y12',
      'cyp2c19',
      'oméprazole',
      'hémorragique',
      'hémorragiques',
      'saignement',
      'bithérapie',
      'ipp'
    ]
  },
  {
    filename: 'ema-alteplase.md',
    title: 'Altéplase (rt-PA) — Fibrinolyse en phase aiguë',
    authority: 'EMA',
    therapeuticClass: 'Thrombolytique',
    updatedAt: '2026-01',
    summary:
      'Activateur tissulaire recombinant du plasminogène convertissant le plasminogène lié à la fibrine en plasmine active pour recanaliser les vaisseaux obstrués.',
    excerpts: [
      "L'altéplase est une glycoprotéine recombinante qui se lie à la fibrine du thrombus et convertit le plasminogène adsorbé en plasmine, entraînant la dégradation protéolytique de la matrice de fibrine.",
      "Son utilisation est strictement réservée aux urgences thrombotiques aiguës (accident vasculaire cérébral ischémique dans la fenêtre thérapeutique, embolie pulmonaire massive, infarctus du myocarde) en milieu hospitalier surveillé.",
      "La principale complication redoutée est l'hémorragie grave, notamment intracrânienne, ce qui impose d'exclure formellement toute hémorragie active ou chirurgie majeure récente avant administration."
    ],
    keywords: [
      'altéplase',
      'alteplase',
      'rt-pa',
      'thrombolytique',
      'fibrinolyse',
      'plasminogène',
      'plasmine',
      'infarctus',
      'avc',
      'embolie',
      'fibrine',
      'caillot'
    ]
  },
  {
    filename: 'dailymed-enoxaparine.md',
    title: 'Énoxaparine — Héparine de bas poids moléculaire',
    authority: 'DailyMed / ANSM',
    therapeuticClass: 'Anticoagulant parentéral (HBPM)',
    updatedAt: '2026-05',
    summary:
      "Potentialisation de l'antithrombine III avec activité préférentielle anti-Xa par rapport à l'activité anti-IIa, administrée par voie sous-cutanée.",
    excerpts: [
      "L'énoxaparine exerce son effet anticoagulant en se liant à l'antithrombine III, accélérant l'inactivation du facteur Xa et, dans une moindre mesure, de la thrombine (facteur IIa).",
      "Contrairement aux héparines non fractionnées, les HBPM présentent une biodisponibilité sous-cutanée élevée et prévisible ne nécessitant pas de surveillance systématique du TCA chez le sujet à fonction rénale normale.",
      "Une surveillance régulière de la numération plaquettaire reste recommandée afin de dépister précocement une thrombopénie induite par l'héparine (TIH) de type II."
    ],
    keywords: [
      'enoxaparine',
      'énoxaparine',
      'hbpm',
      'héparine',
      'antithrombine',
      'anticoagulant',
      'plaquettaire',
      'tih',
      'thrombopénie',
      'sous-cutanée'
    ]
  }
];

export const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'preset-antithrombotiques',
    label: 'Différences entre antithrombotiques',
    question:
      'Explique les différences entre anticoagulant, antiagrégant plaquettaire et thrombolytique.',
    category: 'Mécanismes comparés',
    expectedScope: 'in_scope'
  },
  {
    id: 'preset-apixaban',
    label: "Apixaban chez le sujet âgé",
    question:
      "Quelle est l'action de l'apixaban et quelles précautions s'appliquent chez le sujet âgé ou insuffisant rénal ?",
    category: 'Posologie & Facteur Xa',
    expectedScope: 'in_scope'
  },
  {
    id: 'preset-clopidogrel',
    label: 'Clopidogrel, aspirine et interactions',
    question:
      "Quels sont les risques hémorragiques et interactions médicamenteuses du clopidogrel associé à l'aspirine ?",
    category: 'Pharmacovigilance',
    expectedScope: 'in_scope'
  },
  {
    id: 'preset-alteplase',
    label: "Fibrinolyse par l'altéplase",
    question:
      "Quel est le mécanisme d'action de l'altéplase dans la lyse d'un thrombus aigu ?",
    category: 'Urgence vasculaire',
    expectedScope: 'in_scope'
  },
  {
    id: 'preset-out-of-scope',
    label: 'Hors périmètre (test de garde-fou)',
    question:
      'Quel est le protocole de chimiothérapie adjuvante recommandé pour le mélanome métastatique ?',
    category: 'Test hors corpus',
    expectedScope: 'out_of_scope'
  }
];

export const STYLE_PROPOSALS: StyleProposalMeta[] = [
  {
    id: 'obsidian-glass',
    index: '01',
    name: 'Obsidienne Verre',
    shortName: 'Obsidienne Verre',
    tagline: 'Console sombre haute précision, verre dépoli et halo réactif au curseur.',
    mode: 'dark',
    typography: 'Outfit + DM Sans + JetBrains Mono',
    palette: 'Obsidienne #07090E · Verre #111827 · Cyan #06B6D4',
    motionSignature: 'Halo lumineux fluide, vague de particules et verre dépoli',
    idealFor: 'Environnement de recherche immersif et postes de veille nocturne',
    swatches: ['#07090E', '#06B6D4', '#E2E8F0']
  },
  {
    id: 'clinical-light',
    index: '02',
    name: 'Clinique Clair',
    shortName: 'Clinique Clair',
    tagline: 'Glassmorphisme nacré, Neumorphisme doux & préparation Liquid Glass.',
    mode: 'light',
    typography: 'Plus Jakarta Sans + JetBrains Mono',
    palette: 'Perle #F6F7FB · Pervenche #6366F1 · Rose irisé #F9A8D4',
    motionSignature: 'Halo Liquid Glass irisé en préparation et boutons Soft UI tactiles',
    idealFor: 'Expérience lumineuse haut de gamme avec retour visuel immersif',
    swatches: ['#F6F7FB', '#6366F1', '#F9A8D4']
  }
];
