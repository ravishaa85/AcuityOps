const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/acuityops-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// SIMS Patient Acuity Tool Description Template (Page 1 & 2 of PDF)
const simsPatientAcuityTemplate = {
  id: 'tmpl-sims-acuity-v1',
  version: 1,
  title: 'SIMS Patient Acuity Tool Description (Hospital Standard)',
  isActive: true,
  createdAt: new Date().toISOString(),
  fields: [
    // 1. Activities of daily living & Vitals monitoring
    {
      id: 'param-adl',
      title: 'Activities of Daily Living (ADL)',
      category: 'Activities of daily living & Vitals monitoring',
      options: [
        { id: 'adl-0', label: 'None / Self-Care', score: 0 },
        { id: 'adl-1', label: 'Minimal assistance required for activities of daily living (independent patients)', score: 1 },
        { id: 'adl-2', label: 'Moderate assistance required for activities of daily living (partially dependent patients)', score: 2 },
        { id: 'adl-3', label: 'Complete assistance required activities of daily living (fully dependent)', score: 3 }
      ]
    },
    {
      id: 'param-vitals',
      title: 'Vitals Monitoring Frequency',
      category: 'Activities of daily living & Vitals monitoring',
      options: [
        { id: 'vit-0', label: 'Shift routine check', score: 0 },
        { id: 'vit-1', label: 'Routine vital monitoring', score: 1 },
        { id: 'vit-2', label: 'Vital signs Q 2h', score: 2 },
        { id: 'vit-3', label: 'Continuous vital monitoring', score: 3 }
      ]
    },

    // 2. Fall risk assessment
    {
      id: 'param-fall-risk',
      title: 'Fall Risk Assessment',
      category: 'Fall risk assessment',
      options: [
        { id: 'fall-0', label: 'No fall risk identified', score: 0 },
        { id: 'fall-1', label: 'Low risk', score: 1 },
        { id: 'fall-2', label: 'Moderate risk', score: 2 },
        { id: 'fall-3', label: 'High risk', score: 3 }
      ]
    },

    // 3. Basic Activities
    {
      id: 'param-feed',
      title: 'Feeding & Nutrition Route',
      category: 'Basic Activities',
      options: [
        { id: 'feed-0', label: 'Self oral feeding', score: 0 },
        { id: 'feed-1', label: 'Oral feed', score: 1 },
        { id: 'feed-2', label: 'Enteral feeding (NGT)', score: 2 },
        { id: 'feed-3', label: 'Enteral feeding (PEG)', score: 3 }
      ]
    },
    {
      id: 'param-catheter',
      title: 'Incontinence & Urinary Catheter Care',
      category: 'Basic Activities',
      options: [
        { id: 'cat-0', label: 'Continent / Self-toilet', score: 0 },
        { id: 'cat-1', label: 'Urinary catheter care', score: 1 },
        { id: 'cat-2', label: 'Incontinence care per shift', score: 2 },
        { id: 'cat-3', label: '5 frequency of incontinence care/shift', score: 3 }
      ]
    },
    {
      id: 'param-oral-trach',
      title: 'Oral & Tracheostomy / Restraint Care',
      category: 'Basic Activities',
      options: [
        { id: 'trach-0', label: 'Self oral hygiene', score: 0 },
        { id: 'trach-1', label: 'Oral care', score: 1 },
        { id: 'trach-2', label: 'Routine tracheostomy care', score: 2 },
        { id: 'trach-3', label: 'Confused / restrained / combative', score: 3 }
      ]
    },
    {
      id: 'param-mobility-skin',
      title: 'Activity, Mobility & Pressure Points',
      category: 'Basic Activities',
      options: [
        { id: 'mob-0', label: 'Full independent ambulation', score: 0 },
        { id: 'mob-1', label: 'Adequate activity & mobility', score: 1 },
        { id: 'mob-2', label: 'Position and care of pressure points', score: 2 },
        { id: 'mob-3', label: 'NA (Total immobility / High dependency)', score: 3 }
      ]
    },
    {
      id: 'param-tubes',
      title: 'Investigations, Post-Op & Chest Tube Care',
      category: 'Basic Activities',
      options: [
        { id: 'tube-0', label: 'No active labs or invasive tubes', score: 0 },
        { id: 'tube-1', label: 'Blood investigations', score: 1 },
        { id: 'tube-2', label: 'Pre and post operative care', score: 2 },
        { id: 'tube-3', label: 'Chest tube care', score: 3 }
      ]
    },
    {
      id: 'param-cardiac',
      title: 'Cardiac Rhythm Stability',
      category: 'Basic Activities',
      options: [
        { id: 'card-0', label: 'Stable sinus rhythm', score: 0 },
        { id: 'card-1', label: 'Routine cardiac observation', score: 1 },
        { id: 'card-2', label: 'Monitored stable telemetry', score: 2 },
        { id: 'card-3', label: 'Unstable rhythm (Atrial fibrillation)', score: 3 }
      ]
    },
    {
      id: 'param-oral-meds',
      title: 'Oral Medications Quantity',
      category: 'Basic Activities',
      options: [
        { id: 'omed-0', label: 'No oral medications', score: 0 },
        { id: 'omed-1', label: 'Oral medications < 10', score: 1 },
        { id: 'omed-2', label: 'Oral medications > 10 - 16', score: 2 },
        { id: 'omed-3', label: 'Oral medications > 16', score: 3 }
      ]
    },
    {
      id: 'param-iv-meds',
      title: 'IV Medications & Blood Products',
      category: 'Basic Activities',
      options: [
        { id: 'iv-0', label: 'No IV infusions', score: 0 },
        { id: 'iv-1', label: '1 IV med / fluid', score: 1 },
        { id: 'iv-2', label: '2 to 5 IV medications', score: 2 },
        { id: 'iv-3', label: '>5 IV meds Blood and Blood products', score: 3 }
      ]
    },
    {
      id: 'param-critical-infusions',
      title: 'Electrolyte & Infusion Protocols',
      category: 'Basic Activities',
      options: [
        { id: 'inf-0', label: 'Standard hydration', score: 0 },
        { id: 'inf-1', label: 'Routine hydration', score: 1 },
        { id: 'inf-2', label: 'K+ protocol', score: 2 },
        { id: 'inf-3', label: 'Insulin infusion', score: 3 }
      ]
    },
    {
      id: 'param-nebulisation',
      title: 'Nebulisation (Aerosol Therapy)',
      category: 'Basic Activities',
      options: [
        { id: 'neb-0', label: 'No nebulisation', score: 0 },
        { id: 'neb-1', label: 'PRN / Routine nebulisation', score: 1 },
        { id: 'neb-2', label: 'Nebulisation (single)', score: 2 },
        { id: 'neb-3', label: 'Nebulisation (multiple)', score: 3 }
      ]
    },
    {
      id: 'param-special-infusions',
      title: 'TPN & Chemotherapy Administration',
      category: 'Basic Activities',
      options: [
        { id: 'spec-0', label: 'Standard medication regimen', score: 0 },
        { id: 'spec-1', label: 'Standard oral/IV', score: 1 },
        { id: 'spec-2', label: 'TPN', score: 2 },
        { id: 'spec-3', label: 'Chemotherapy', score: 3 }
      ]
    },
    {
      id: 'param-pain',
      title: 'Pain Assessment & Continuous Monitoring',
      category: 'Basic Activities',
      options: [
        { id: 'pain-0', label: 'No pain reported', score: 0 },
        { id: 'pain-1', label: 'Pain medication with oral/IV 4th hourly monitoring', score: 1 },
        { id: 'pain-2', label: 'Patient controlled analgesia,epidural,nerve block 2nd hourly pain monitoring', score: 2 },
        { id: 'pain-3', label: 'uncontrolled pain with multiple pain control devices and continuous monitoring', score: 3 }
      ]
    },

    // 4. Therapeutic interventions
    {
      id: 'param-therapeutic',
      title: 'Therapeutic Interventions',
      category: 'Therapeutic interventions',
      options: [
        { id: 'ther-0', label: 'No specialized intervention required', score: 0 },
        { id: 'ther-1', label: 'Routine treatments and I/O monitoring (e.g. without oxygen administration and procedures)', score: 1 },
        { id: 'ther-2', label: 'Specialized treatments (e.g. dressing, nebulization more than 4 hourly, oxygen administration using NC, Mask, venturi)', score: 2 },
        { id: 'ther-3', label: 'Pediatric IV cannulation Intensive interventions (e.g. Tracheostomy care, suctioning, BIPAP, blood transfusion, nebulisation less than 4 hourly, assisting procedure)', score: 3 }
      ]
    },

    // 5. Admission /Discharge/Transfer
    {
      id: 'param-adt',
      title: 'Admission / Discharge / Transfer Phase',
      category: 'Admission /Discharge/Transfer',
      options: [
        { id: 'adt-0', label: 'Established stable inpatient stay', score: 0 },
        { id: 'adt-1', label: 'Routine patients / Patients waiting final billing', score: 1 },
        { id: 'adt-2', label: 'New admission / Transfer - in / Transfer -out', score: 2 },
        { id: 'adt-3', label: 'NA (Emergency resuscitation / Complex ICU transfer)', score: 3 }
      ]
    },

    // 6. Education and communication
    {
      id: 'param-edu',
      title: 'Education and Communication',
      category: 'Education and communication',
      options: [
        { id: 'edu-0', label: 'Fully comprehending / independent', score: 0 },
        { id: 'edu-1', label: 'Basic instruction or routine communication', score: 1 },
        { id: 'edu-2', label: 'Anxious / slightly agitated New meds, side effects, Discharge education', score: 2 },
        { id: 'edu-3', label: 'Confused, restless, combative.New trach / amputee Translator needed Inability to comprehend', score: 3 }
      ]
    }
  ]
};

// Set as active template
db.templates = [simsPatientAcuityTemplate];

// Update patients' acuity score and category to comply with SIMS scale (1-48, tiers 1-3)
db.patients = db.patients.map(p => {
  let score = p.currentAcuityScore || 1;
  let category = p.currentAcuityCategory || 1;

  // If score was from old 0-4 scale or 15+ scale
  if (category === 4 || score >= 25) {
    category = 3;
    if (score < 25) score = 28;
  } else if (category === 3) {
    if (score < 13) score = 19;
    category = score >= 25 ? 3 : 2;
  } else if (category === 2) {
    if (score < 13) score = 16;
    category = 2;
  } else {
    // Acuity 1: 1 - 12
    if (score > 12) score = 8;
    category = 1;
  }

  return {
    ...p,
    currentAcuityScore: score,
    currentAcuityCategory: category
  };
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully updated database with SIMS Patient Acuity Tool template and patient scale!');
