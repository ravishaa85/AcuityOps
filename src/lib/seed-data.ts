import { Ward, Nurse, Patient, AcuityFormTemplate, DutyRosterItem } from '@/types';
import { simsPatientAcuityTemplate } from './acuity-tool';

export const initialWards: Ward[] = [
  { id: 'his-w-ivf', code: 'IVF', name: 'IVF', floor: 'Main Block', bedCapacity: 3, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["LW 1","LW 2","LW 3"], createdAt: '2026-09-12' },
  { id: 'his-w-ot', code: 'OT', name: 'OPERATION THEATRE', floor: '3rd Floor', bedCapacity: 46, departmentType: 'Surgical', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["EOT 01","OT 01","OT 02","OT 03","OT 04","OT 05","OT 06","OT 07","OT 08","OT 09","OT 10","OT 11","OT 12","OT 13","OT 14","OT 15","OTH 01","OTH 02","OTH 03","OTH 04","OTH 05","OTH 06","OTH 07","OTH 08","OTH 09","OTH 10","OTH 11","OTH 12","OTH 13","OTH 14","OTH 15","OTH 16","OTH 17","OTH 18","OTH 19","OTH 20","OTH 21","OTH 22","OTH 23","OTH 24","OTH 25","OTH 26","OTH 27","OTH 28","OTH 29","OTH 30"], createdAt: '2026-09-12' },
  { id: 'his-w-2fnicu', code: '2F-NICU', name: 'SECOND FLOOR NEURO ICU', floor: '2nd Floor', bedCapacity: 8, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["NEURO 01","NEURO 02","NEURO 03","NEURO 04","NEURO 05","NEURO 06","NEURO 07","NEURO 08-D"], createdAt: '2026-09-12' },
  { id: 'his-w-2fticu', code: '2F-TICU', name: 'SECOND FLOOR TRANSPLANT ICU', floor: '2nd Floor', bedCapacity: 4, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["TICU 01","TICU 02","TICU 03","TICU 04"], createdAt: '2026-09-12' },
  { id: 'his-w-pow', code: 'POW', name: 'Post Operative Ward', floor: 'Main Block', bedCapacity: 17, departmentType: 'Surgical', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["RE 01","RE 02","RE 03","RE 04","RE 05","RE 06","RE 07","RE 08","RE 09","RE 10","RE 11","RE 12","RE 13","RE 15","RE 16","RE 17","RE14"], createdAt: '2026-09-12' },
  { id: 'his-w-emrg', code: 'EMRG', name: 'EMERGENCY', floor: 'Ground Floor', bedCapacity: 22, departmentType: 'Emergency', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["EMR 07","EMR 08","EMR 09","EMR 10","EMR 11","EMR 12","EMR 13","EMR 14","EMR 15","EMR 16","EMR 17","EMR 18","EMR 19","EMR 20","EMR 21-D","EMR 22-D","EMRR 04","EMRR 05","EMRR 06","EMRT 01","EMRT 02","EMRT 03"], createdAt: '2026-09-12' },
  { id: 'his-w-3fmgw', code: '3F-MGW', name: 'THIRD FLOOR MALE GENERAL WARD', floor: '3rd Floor', bedCapacity: 11, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["3015","3016","3017","3018","3019","3020","3021","3022","3023","3024","3025"], createdAt: '2026-09-12' },
  { id: 'his-w-4fa', code: '4F-A', name: 'FOURTH FLOOR A WING', floor: '4th Floor', bedCapacity: 23, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["4101","4102","4103","4104","4105","4106","4107","4108","4109","4110","4111","4112","4113 A","4113 B","4114 A","4114 B","4115 A","4115 B","4117","4118","4119","4120","4121"], createdAt: '2026-09-12' },
  { id: 'his-w-4fb', code: '4F-B', name: 'FOURTH FLOOR B WING', floor: '4th Floor', bedCapacity: 24, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["4201","4202","4203","4204","4205","4206","4207","4208","4209","4210","4211","4212","4213","4214 A","4214 B","4215 A","4215 B","4216 A","4216 B","4218","4219","4221","4222","4223"], createdAt: '2026-09-12' },
  { id: 'his-w-3ffgw', code: '3F-FGW', name: 'THIRD FLOOR FEMALE  GENERAL WARD', floor: '3rd Floor', bedCapacity: 10, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["3002","3004","3005","3006","3007","3008","3009","3010","3011","3012"], createdAt: '2026-09-12' },
  { id: 'his-w-raffles', code: 'RAFFLES', name: 'RAFFLES WARD', floor: 'Main Block', bedCapacity: 11, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["5301","5302","5303","5303 A","5303 B","5303 C","5304","5305","5306","5307","5309"], createdAt: '2026-09-12' },
  { id: 'his-w-3fonc', code: '3F-ONC', name: 'ONCOLOGY DAY CARE UNIT THIRD FLOOR', floor: '3rd Floor', bedCapacity: 7, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["DC 01","DC 02","DC 03","DC 04","DC 05","DC 06","DC 07-D"], createdAt: '2026-09-12' },
  { id: 'his-w-4fc', code: '4F-C', name: 'FOURTH FLOOR C WING', floor: '4th Floor', bedCapacity: 24, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["4301","4302","4303","4304","4305","4306","4307","4308","4309","4310","4311","4312","4313","4314 A","4314 B","4315 A","4315 B","4316 A","4316 B","4318","4319","4322","4323","CRADLE BED 02"], createdAt: '2026-09-12' },
  { id: 'his-w-4fd', code: '4F-D', name: 'FOURTH FLOOR D WING', floor: '4th Floor', bedCapacity: 19, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["4401","4402","4403","4404","4405","4406","4407","4408","4409","4410","4411","4412","4413","4414 A","4414 B","4415 A","4415 B","4416 A","4416 B"], createdAt: '2026-09-12' },
  { id: 'his-w-3fmicu', code: '3F-MICU', name: 'THIRD FLOOR  MEDICAL ICU', floor: '3rd Floor', bedCapacity: 8, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["MICU 01","MICU 02","MICU 03","MICU 04","MICU 05","MICU 06","MICU 07","MICU 08"], createdAt: '2026-09-12' },
  { id: 'his-w-3fsicu', code: '3F-SICU', name: 'THIRD FLOOR  SURGICAL ICU', floor: '3rd Floor', bedCapacity: 5, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["SICU 01","SICU 02","SICU 03","SICU 05","SICU DD01"], createdAt: '2026-09-12' },
  { id: 'his-w-3fpicu', code: '3F-PICU', name: 'THIRD FLOOR PEAD ICU', floor: '3rd Floor', bedCapacity: 5, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["PICU 01","PICU 02","PICU 03","PICU 04","PICU 05"], createdAt: '2026-09-12' },
  { id: 'his-w-3ficu', code: '3F-ICU', name: 'THIRD FLOOR ICU', floor: '3rd Floor', bedCapacity: 10, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["ICU 01","ICU 02","ICU 03","ICU 04","ICU 05","ICU 06","ICU 07 HDU","ICU 08 HDU","ISO 01","ISO 02"], createdAt: '2026-09-12' },
  { id: 'his-w-hdu', code: 'HDU', name: 'HDU', floor: 'Main Block', bedCapacity: 9, departmentType: 'Step-down', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["3027","3028","3029","HDU01","HDU02","HDU03","HDU04","HDU05","HDU08-D"], createdAt: '2026-09-12' },
  { id: 'his-w-nicu', code: 'NICU', name: 'NICU', floor: 'Main Block', bedCapacity: 9, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["CRADLE BED 1","CRADLE BED 7","NHDU 01","NHDU 02","NICU 01","NICU 02","NICU 03","NSDU 01","NSDU 02"], createdAt: '2026-09-12' },
  { id: 'his-w-2fcticu', code: '2F-CTICU', name: 'SECOND FLOOR CTICU', floor: '2nd Floor', bedCapacity: 9, departmentType: 'ICU', targetUtilization: 80, isActive: true, source: 'HIS', beds: ["CRADLE BED 15","CTICU 01","CTICU 02","CTICU 03","CTICU 04","CTICU 05","CTICU 06","CTICU 07","CTICU 08"], createdAt: '2026-09-12' },
  { id: 'his-w-3fendo', code: '3F-ENDO', name: 'THIRD FLOOR ENDOSCOPY ROOM', floor: '3rd Floor', bedCapacity: 10, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["ENDO 01","ENDO 02","ENDO 03","ENDO 04","ENDO 05","ENDO 06","ENDO 07","ENDO 08","ENDO 09","ENDO 10"], createdAt: '2026-09-12' },
  { id: 'his-w-5fb', code: '5F-B', name: 'FIFTH FLOOR B WING', floor: '5th Floor', bedCapacity: 31, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["5201","5201 A","5201 B","5202","5202 A","5202 B","5203","5203 A","5203 B","5204","5204 A","5204 B","5205","5205 A","5205 B","5206","5206 A","5206 B","5207","5207 A","5207 B","5208","5209","5211","5212","5214","5215","5217","5218","5219","CRADLE BED 10"], createdAt: '2026-09-12' },
  { id: 'his-w-5fa', code: '5F-A', name: 'FIFTH FLOOR A WING', floor: '5th Floor', bedCapacity: 27, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["5101","5101 A","5101 B","5102","5102 A","5102 B","5103","5103 A","5103 B","5104","5104 A","5104 B","5105","5105 A","5105 B","5106","5107 A","5107 B","5108 A","5108 B","5109 A","5109 B","5111","5112","5113","5114","5115"], createdAt: '2026-09-12' },
  { id: 'his-w-5fd', code: '5F-D', name: 'FIFTH FLOOR D WING', floor: '5th Floor', bedCapacity: 26, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["5401","5401 A","5401 B","5402","5403","5403 A","5403 B","5404","5404 A","5404 B","5405","5406","5407","5408","5410 A","5410 B","5411 A","5411 B","5412 A","5412 B","5413","5414","5415","5416","5417","5418"], createdAt: '2026-09-12' },
  { id: 'his-w-bmt', code: 'BMT', name: 'BMT', floor: 'Main Block', bedCapacity: 2, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["BMT 03","SCT 1"], createdAt: '2026-09-12' },
  { id: 'his-w-twrd', code: 'T-WRD', name: 'T Ward', floor: 'Main Block', bedCapacity: 4, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["I 01","I 02","I 03","I 04"], createdAt: '2026-09-12' },
  { id: 'his-w-gfdcu', code: 'GF-DCU', name: 'DAY CARE UNIT-GROUND FLOOR', floor: 'Ground Floor', bedCapacity: 7, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["DC1","DC2","DC3","DC4","DC5","RAD-01","RAD-02"], createdAt: '2026-09-12' },
  { id: 'his-w-anxa', code: 'ANX-A', name: 'A ANNEX A WING', floor: 'Main Block', bedCapacity: 6, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["3501","3502","3503","3504","3505","3506"], createdAt: '2026-09-12' },
  { id: 'his-w-anxb', code: 'ANX-B', name: 'A ANNEX B WING', floor: 'Main Block', bedCapacity: 8, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["3507","3508","3509","3510","3511","3512","3514","CRADLE BED 01"], createdAt: '2026-09-12' },
  { id: 'his-w-atnd', code: 'ATND', name: 'ATTENDANT ROOM', floor: 'Main Block', bedCapacity: 7, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["4116","4217","4317","5110","5210","5213","5409"], createdAt: '2026-09-12' },
  { id: 'his-w-spanx', code: 'SP-ANX', name: 'SPECIAL ANNEX SHARING', floor: 'Main Block', bedCapacity: 11, departmentType: 'General', targetUtilization: 85, isActive: true, source: 'HIS', beds: ["2501","2502","2503","2504","2505","2506","2507","2508","2509","2510","2511"], createdAt: '2026-09-12' },
];

export const initialNurses: Nurse[] = [
  // Third Floor Male General Ward (3F-MGW)
  { id: 'n-101', employeeId: 'NUR-0101', name: 'Sr. Ananya Nair', competency: 'Competent', wardId: 'his-w-3fmgw', contactNumber: '+91 98471 23401', email: 'ananya.n@simshospitals.com', experienceYears: 3.5, maxAcuityCapacity: 10, status: 'Active', shiftPreference: 'Morning', createdAt: '2023-03-15' },
  { id: 'n-102', employeeId: 'NUR-0102', name: 'Staff Reshma V', competency: 'Advanced Beginner', wardId: 'his-w-3fmgw', contactNumber: '+91 98471 23402', email: 'reshma.v@simshospitals.com', experienceYears: 1.5, maxAcuityCapacity: 7, status: 'Active', shiftPreference: 'Morning', createdAt: '2023-08-10' },
  { id: 'n-103', employeeId: 'NUR-0103', name: 'Staff Rahul George', competency: 'Advanced Beginner', wardId: 'his-w-3fmgw', contactNumber: '+91 98471 23403', email: 'rahul.g@simshospitals.com', experienceYears: 1.8, maxAcuityCapacity: 7, status: 'Active', shiftPreference: 'Evening', createdAt: '2023-06-20' },
  { id: 'n-104', employeeId: 'NUR-0104', name: 'Staff Nimisha Paul', competency: 'Advanced Beginner', wardId: 'his-w-3fmgw', contactNumber: '+91 98471 23404', email: 'nimisha.p@simshospitals.com', experienceYears: 1.2, maxAcuityCapacity: 7, status: 'Active', shiftPreference: 'Night', createdAt: '2024-01-10' },

  // Fifth Floor A Wing (5F-A)
  { id: 'n-201', employeeId: 'NUR-0201', name: 'Sr. Soniya K.P.', competency: 'Expert', wardId: 'his-w-5fa', contactNumber: '+91 98471 23411', email: 'soniya.kp@simshospitals.com', experienceYears: 9.0, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Morning', createdAt: '2021-02-12' },
  { id: 'n-202', employeeId: 'NUR-0202', name: 'Sr. Blessey Thomas', competency: 'Expert', wardId: 'his-w-5fa', contactNumber: '+91 98471 23412', email: 'blessey.t@simshospitals.com', experienceYears: 8.5, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Evening', createdAt: '2021-05-18' },

  // Second Floor Neuro ICU (2F-NICU)
  { id: 'n-301', employeeId: 'NUR-0301', name: 'Sr. Deepthi Mathew', competency: 'Expert', wardId: 'his-w-2fnicu', contactNumber: '+91 98471 23421', email: 'deepthi.m@simshospitals.com', experienceYears: 10.0, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Morning', createdAt: '2020-04-10' },
  { id: 'n-302', employeeId: 'NUR-0302', name: 'Sr. Priya Varma', competency: 'Expert', wardId: 'his-w-2fnicu', contactNumber: '+91 98471 23422', email: 'priya.v@simshospitals.com', experienceYears: 7.5, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Night', createdAt: '2022-01-15' },
  { id: 'n-303', employeeId: 'NUR-0303', name: 'Staff Akhil Das', competency: 'Advanced Beginner', wardId: 'his-w-2fnicu', contactNumber: '+91 98471 23423', email: 'akhil.d@simshospitals.com', experienceYears: 1.4, maxAcuityCapacity: 7, status: 'Active', shiftPreference: 'Evening', createdAt: '2023-11-01' },

  // Post Operative Ward (POW)
  { id: 'n-401', employeeId: 'NUR-0401', name: 'Sr. Sunitha S', competency: 'Expert', wardId: 'his-w-pow', contactNumber: '+91 98471 23431', email: 'sunitha.s@simshospitals.com', experienceYears: 8.0, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Morning', createdAt: '2021-08-01' },
  { id: 'n-402', employeeId: 'NUR-0402', name: 'Staff Aswathi R', competency: 'Advanced Beginner', wardId: 'his-w-pow', contactNumber: '+91 98471 23432', email: 'aswathi.r@simshospitals.com', experienceYears: 1.9, maxAcuityCapacity: 7, status: 'Active', shiftPreference: 'Evening', createdAt: '2023-09-12' },

  // Second Floor CTICU (2F-CTICU)
  { id: 'n-501', employeeId: 'NUR-0501', name: 'Sr. Merlin Baby', competency: 'Proficient', wardId: 'his-w-2fcticu', contactNumber: '+91 98471 23441', email: 'merlin.b@simshospitals.com', experienceYears: 5.5, maxAcuityCapacity: 15, status: 'Active', shiftPreference: 'Morning', createdAt: '2022-03-01' },
  { id: 'n-502', employeeId: 'NUR-0502', name: 'Sr. Sharon Joseph', competency: 'Expert', wardId: 'his-w-2fcticu', contactNumber: '+91 98471 23442', email: 'sharon.j@simshospitals.com', experienceYears: 9.2, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Evening', createdAt: '2020-09-15' },

  // Third Floor Medical ICU (3F-MICU)
  { id: 'n-601', employeeId: 'NUR-0601', name: 'Sr. Jincy Philip', competency: 'Expert', wardId: 'his-w-3fmicu', contactNumber: '+91 98471 23451', email: 'jincy.p@simshospitals.com', experienceYears: 11.0, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Morning', createdAt: '2019-11-20' },
  { id: 'n-602', employeeId: 'NUR-0602', name: 'Sr. Rekha Menon', competency: 'Proficient', wardId: 'his-w-3fmicu', contactNumber: '+91 98471 23452', email: 'rekha.m@simshospitals.com', experienceYears: 6.0, maxAcuityCapacity: 15, status: 'Active', shiftPreference: 'Night', createdAt: '2022-04-10' },

  // Fourth Floor C Wing (4F-C)
  { id: 'n-701', employeeId: 'NUR-0701', name: 'Sr. Sujatha Nair', competency: 'Expert', wardId: 'his-w-4fc', contactNumber: '+91 98471 23461', email: 'sujatha.n@simshospitals.com', experienceYears: 12.0, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Flexible', createdAt: '2018-05-15' },
  { id: 'n-702', employeeId: 'NUR-0702', name: 'Sr. Geethu Rajan', competency: 'Expert', wardId: 'his-w-4fc', contactNumber: '+91 98471 23462', email: 'geethu.r@simshospitals.com', experienceYears: 8.8, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Morning', createdAt: '2021-06-01' },
  { id: 'n-703', employeeId: 'NUR-0703', name: 'Sr. Remya Mohan', competency: 'Proficient', wardId: 'his-w-4fc', contactNumber: '+91 98471 23463', email: 'remya.m@simshospitals.com', experienceYears: 5.0, maxAcuityCapacity: 15, status: 'Active', shiftPreference: 'Evening', createdAt: '2022-10-01' },

  // NICU & Third Floor Pead ICU (3F-PICU)
  { id: 'n-801', employeeId: 'NUR-0801', name: 'Sr. Kavitha Pillai', competency: 'Proficient', wardId: 'his-w-nicu', contactNumber: '+91 98471 23471', email: 'kavitha.p@simshospitals.com', experienceYears: 6.2, maxAcuityCapacity: 15, status: 'Active', shiftPreference: 'Morning', createdAt: '2022-02-14' },
  { id: 'n-802', employeeId: 'NUR-0802', name: 'Sr. Mary Grace', competency: 'Expert', wardId: 'his-w-3fpicu', contactNumber: '+91 98471 23472', email: 'mary.g@simshospitals.com', experienceYears: 10.5, maxAcuityCapacity: 20, status: 'Active', shiftPreference: 'Morning', createdAt: '2020-01-20' },
  { id: 'n-803', employeeId: 'NUR-0803', name: 'Sr. Divya Krishna', competency: 'Proficient', wardId: 'his-w-3fpicu', contactNumber: '+91 98471 23473', email: 'divya.k@simshospitals.com', experienceYears: 5.8, maxAcuityCapacity: 15, status: 'Active', shiftPreference: 'Flexible', createdAt: '2022-07-15' },
];

export const initialPatients: Patient[] = [
  // Ward B7 Patients (Slide 6 exact breakdown: 8 Patients, Acuity: 1x Acuity 1, 1x Acuity 2, 4x Acuity 3, 2x Acuity 4. Total Acuity = 23)
  {
    id: 'p-1',
    uhid: 'SIMS-2024-8841',
    admissionNumber: 'IP-7804',
    name: 'Mohammed Haneef',
    age: 62,
    gender: 'Male',
    roomBed: '7804-A',
    doctorName: 'Dr. K. Rajagopal',
    wardId: 'w-b7',
    admissionDate: '2024-10-06',
    diagnosis: 'Post-op Total Hip Replacement, Type 2 Diabetes',
    currentAcuityScore: 19,
    currentAcuityCategory: 2,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-101', nurseName: 'Sr. Ananya Nair', competency: 'Competent' },
    nextShiftStaff: null
  },
  {
    id: 'p-2',
    uhid: 'SIMS-2024-8842',
    admissionNumber: 'IP-7825',
    name: 'Savitri Amma',
    age: 74,
    gender: 'Female',
    roomBed: '7825-B',
    doctorName: 'Dr. Suresh Babu',
    wardId: 'w-b7',
    admissionDate: '2024-10-07',
    diagnosis: 'Polytrauma, Pelvic Fracture, High Fall Risk',
    currentAcuityScore: 34,
    currentAcuityCategory: 3,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-101', nurseName: 'Sr. Ananya Nair', competency: 'Competent' },
    nextShiftStaff: null
  },
  {
    id: 'p-3',
    uhid: 'SIMS-2024-8843',
    admissionNumber: 'IP-7807',
    name: 'Varghese Kurian',
    age: 58,
    gender: 'Male',
    roomBed: '7807',
    doctorName: 'Dr. Manoj Kumar',
    wardId: 'w-b7',
    admissionDate: '2024-10-08',
    diagnosis: 'Cervical Spine Fixation, Neuro Monitoring Required',
    currentAcuityScore: 31,
    currentAcuityCategory: 3,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-101', nurseName: 'Sr. Ananya Nair', competency: 'Competent' },
    nextShiftStaff: null
  },
  {
    id: 'p-4',
    uhid: 'SIMS-2024-8844',
    admissionNumber: 'IP-7820',
    name: 'Deepa Nambiar',
    age: 45,
    gender: 'Female',
    roomBed: '7820',
    doctorName: 'Dr. Sunita Rao',
    wardId: 'w-b7',
    admissionDate: '2024-10-08',
    diagnosis: 'Compound Tibial Fracture with External Fixator',
    currentAcuityScore: 18,
    currentAcuityCategory: 2,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-102', nurseName: 'Staff Reshma V', competency: 'Advanced Beginner' },
    nextShiftStaff: null
  },
  {
    id: 'p-5',
    uhid: 'SIMS-2024-8845',
    admissionNumber: 'IP-7815',
    name: 'Abdul Rasheed',
    age: 69,
    gender: 'Male',
    roomBed: '7815-A',
    doctorName: 'Dr. K. Rajagopal',
    wardId: 'w-b7',
    admissionDate: '2024-10-09',
    diagnosis: 'Compartment Syndrome post crush injury',
    currentAcuityScore: 21,
    currentAcuityCategory: 2,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-102', nurseName: 'Staff Reshma V', competency: 'Advanced Beginner' },
    nextShiftStaff: null
  },
  {
    id: 'p-6',
    uhid: 'SIMS-2024-8846',
    admissionNumber: 'IP-7816',
    name: 'Fathima Beevi',
    age: 52,
    gender: 'Female',
    roomBed: '7816-B',
    doctorName: 'Dr. Suresh Babu',
    wardId: 'w-b7',
    admissionDate: '2024-10-09',
    diagnosis: 'Lumbar Laminectomy, PCA Pump for pain control',
    currentAcuityScore: 15,
    currentAcuityCategory: 2,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-103', nurseName: 'Staff Rahul George', competency: 'Advanced Beginner' },
    nextShiftStaff: null
  },
  {
    id: 'p-7',
    uhid: 'SIMS-2024-8847',
    admissionNumber: 'IP-7819',
    name: 'K. Unnikrishnan',
    age: 60,
    gender: 'Male',
    roomBed: '7819',
    doctorName: 'Dr. Manoj Kumar',
    wardId: 'w-b7',
    admissionDate: '2024-10-09',
    diagnosis: 'Knee Arthroplasty with drainage monitor',
    currentAcuityScore: 16,
    currentAcuityCategory: 2,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-103', nurseName: 'Staff Rahul George', competency: 'Advanced Beginner' },
    nextShiftStaff: null
  },
  {
    id: 'p-8',
    uhid: 'SIMS-2024-8848',
    admissionNumber: 'IP-7821',
    name: 'Radhika S',
    age: 38,
    gender: 'Female',
    roomBed: '7821',
    doctorName: 'Dr. Sunita Rao',
    wardId: 'w-b7',
    admissionDate: '2024-10-10',
    diagnosis: 'Closed Radius Fracture Reduction, Stable',
    currentAcuityScore: 7,
    currentAcuityCategory: 1,
    lastAcuityUpdate: '11:46 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-103', nurseName: 'Staff Rahul George', competency: 'Advanced Beginner' },
    nextShiftStaff: null
  },

  // Patients in C5E (Oncology HDU - 19 patients, total acuity 47)
  {
    id: 'p-9',
    uhid: 'SIMS-2024-8851',
    admissionNumber: 'IP-5011',
    name: 'Thomas Joseph',
    age: 55,
    gender: 'Male',
    roomBed: '5011',
    doctorName: 'Dr. Harish Kumar',
    wardId: 'w-c5e',
    admissionDate: '2024-10-05',
    diagnosis: 'Acute Myeloid Leukemia, Neutropenic Sepsis Protocol',
    currentAcuityScore: 38,
    currentAcuityCategory: 3,
    lastAcuityUpdate: '10:15 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-201', nurseName: 'Sr. Soniya K.P.', competency: 'Expert' },
    nextShiftStaff: null
  },
  {
    id: 'p-10',
    uhid: 'SIMS-2024-8852',
    admissionNumber: 'IP-5012',
    name: 'Lathika Pillai',
    age: 63,
    gender: 'Female',
    roomBed: '5012',
    doctorName: 'Dr. Harish Kumar',
    wardId: 'w-c5e',
    admissionDate: '2024-10-07',
    diagnosis: 'Metastatic Colorectal Ca, Continuous Chemotherapy Infusion',
    currentAcuityScore: 28,
    currentAcuityCategory: 3,
    lastAcuityUpdate: '10:30 AM, 10-10-2024',
    currentShiftStaff: { nurseId: 'n-202', nurseName: 'Sr. Blessey Thomas', competency: 'Expert' },
    nextShiftStaff: null
  }
];

export const defaultAcuityFormTemplate: AcuityFormTemplate = simsPatientAcuityTemplate;

export const initialDutyRosters: DutyRosterItem[] = [
  // Morning shift
  { id: 'dr-1', nurseId: 'n-101', wardId: 'his-w-3fmgw', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-2', nurseId: 'n-102', wardId: 'his-w-3fmgw', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-3', nurseId: 'n-201', wardId: 'his-w-5fa', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-4', nurseId: 'n-301', wardId: 'his-w-2fnicu', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-5', nurseId: 'n-401', wardId: 'his-w-pow', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-6', nurseId: 'n-501', wardId: 'his-w-2fcticu', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-7', nurseId: 'n-601', wardId: 'his-w-3fmicu', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-8', nurseId: 'n-701', wardId: 'his-w-4fc', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-9', nurseId: 'n-702', wardId: 'his-w-4fc', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-10', nurseId: 'n-801', wardId: 'his-w-nicu', assignmentDate: '2024-10-10', shiftType: 'Morning' },
  { id: 'dr-11', nurseId: 'n-802', wardId: 'his-w-3fpicu', assignmentDate: '2024-10-10', shiftType: 'Morning' },

  // Evening shift
  { id: 'dr-12', nurseId: 'n-103', wardId: 'his-w-3fmgw', assignmentDate: '2024-10-10', shiftType: 'Evening' },
  { id: 'dr-13', nurseId: 'n-202', wardId: 'his-w-5fa', assignmentDate: '2024-10-10', shiftType: 'Evening' },
  { id: 'dr-14', nurseId: 'n-303', wardId: 'his-w-2fnicu', assignmentDate: '2024-10-10', shiftType: 'Evening' },
  { id: 'dr-15', nurseId: 'n-402', wardId: 'his-w-pow', assignmentDate: '2024-10-10', shiftType: 'Evening' },
  { id: 'dr-16', nurseId: 'n-502', wardId: 'his-w-2fcticu', assignmentDate: '2024-10-10', shiftType: 'Evening' },
  { id: 'dr-17', nurseId: 'n-703', wardId: 'his-w-4fc', assignmentDate: '2024-10-10', shiftType: 'Evening' },

  // Night shift
  { id: 'dr-18', nurseId: 'n-104', wardId: 'his-w-3fmgw', assignmentDate: '2024-10-10', shiftType: 'Night' },
  { id: 'dr-19', nurseId: 'n-302', wardId: 'his-w-2fnicu', assignmentDate: '2024-10-10', shiftType: 'Night' },
  { id: 'dr-20', nurseId: 'n-602', wardId: 'his-w-3fmicu', assignmentDate: '2024-10-10', shiftType: 'Night' },

  // Week-off, Leave, Unassigned
  { id: 'dr-21', nurseId: 'n-803', wardId: 'his-w-3fpicu', assignmentDate: '2024-10-10', shiftType: 'Week-off' }
];
