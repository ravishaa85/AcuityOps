const http = require('http');

async function testAcuityAPIs() {
  console.log('--- Testing SIMS Acuity APIs and Calculations ---');

  // Test 1: Fetch active acuity template
  const getTemplateRes = await fetch('http://localhost:3000/api/acuity-forms');
  const templateJson = await getTemplateRes.json();
  console.log('Template Active:', templateJson.data.active.title);
  console.log('Total Fields:', templateJson.data.active.fields.length);
  if (templateJson.data.active.fields.length !== 18) {
    throw new Error(`Expected 18 parameters from PDF, got ${templateJson.data.active.fields.length}`);
  }
  console.log('✓ PASS: All 18 PDF parameters present in active template.');

  // Test 2: Submit assessment for Acuity 3 (score 28)
  const getPatientRes1 = await fetch('http://localhost:3000/api/patients');
  const patientJson1 = await getPatientRes1.json();
  const testPatient = patientJson1.data[0];
  console.log('Testing with patient:', testPatient.name, 'ID:', testPatient.id);

  const postAcuity3Res = await fetch('http://localhost:3000/api/acuity-assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: testPatient.id,
      wardId: testPatient.wardId,
      score: 28,
      notes: 'Test Acuity 3 high dependency assessment'
    })
  });
  const assess3Json = await postAcuity3Res.json();
  console.log('Score 28 -> Category:', assess3Json.data.category, 'N:P Ratio:', assess3Json.data.npRatio);
  if (assess3Json.data.category !== 3 || assess3Json.data.npRatio !== '1:4') {
    throw new Error(`Expected Category 3 and N:P 1:4 for score 28, got Category ${assess3Json.data.category} and N:P ${assess3Json.data.npRatio}`);
  }
  console.log('✓ PASS: Score 28 correctly calculated as Acuity III (1:4 Ratio).');

  // Test 3: Submit assessment for Acuity 2 (score 18)
  const postAcuity2Res = await fetch('http://localhost:3000/api/acuity-assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: testPatient.id,
      wardId: testPatient.wardId,
      score: 18,
      notes: 'Test Acuity 2 moderate assessment'
    })
  });
  const assess2Json = await postAcuity2Res.json();
  console.log('Score 18 -> Category:', assess2Json.data.category, 'N:P Ratio:', assess2Json.data.npRatio);
  if (assess2Json.data.category !== 2 || assess2Json.data.npRatio !== '1:5') {
    throw new Error(`Expected Category 2 and N:P 1:5 for score 18, got Category ${assess2Json.data.category} and N:P ${assess2Json.data.npRatio}`);
  }
  console.log('✓ PASS: Score 18 correctly calculated as Acuity II (1:5 Ratio).');

  // Test 4: Submit assessment for Acuity 1 (score 8)
  const postAcuity1Res = await fetch('http://localhost:3000/api/acuity-assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: testPatient.id,
      wardId: testPatient.wardId,
      score: 8,
      notes: 'Test Acuity 1 minimal care assessment'
    })
  });
  const assess1Json = await postAcuity1Res.json();
  console.log('Score 8 -> Category:', assess1Json.data.category, 'N:P Ratio:', assess1Json.data.npRatio);
  if (assess1Json.data.category !== 1 || assess1Json.data.npRatio !== '1:6') {
    throw new Error(`Expected Category 1 and N:P 1:6 for score 8, got Category ${assess1Json.data.category} and N:P ${assess1Json.data.npRatio}`);
  }
  console.log('✓ PASS: Score 8 correctly calculated as Acuity 1 (1:6 Ratio).');

  // Test 5: Verify patient updated
  const getPatientRes2 = await fetch('http://localhost:3000/api/patients');
  const patientJson2 = await getPatientRes2.json();
  const updatedPatient = patientJson2.data.find(p => p.id === testPatient.id);
  console.log(`Patient ${updatedPatient.name} updated score:`, updatedPatient.currentAcuityScore, 'Category:', updatedPatient.currentAcuityCategory);
  if (updatedPatient.currentAcuityScore !== 8 || updatedPatient.currentAcuityCategory !== 1) {
    throw new Error(`Expected score 8 and category 1, got ${updatedPatient.currentAcuityScore} and ${updatedPatient.currentAcuityCategory}`);
  }
  console.log('✓ PASS: Patient directory state updated accurately in database.');

  console.log('\nALL 5 SIMS ACUITY FORM & CALCULATION TESTS PASSED SUCCESSFULLY! 🎉');
}

testAcuityAPIs().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
