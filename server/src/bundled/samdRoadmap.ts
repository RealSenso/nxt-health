// SaMD startup checklist (NXT Platform → SaMD sheet), bundled so it loads on every start.
import type { RoadmapContent } from '../roadmapTypes.js';

export const SAMD_ROADMAP: RoadmapContent = {
  "category": "cat-samd",
  "phases": [
    {
      "no": 0,
      "name": "Product Strategy",
      "sub_stages": [
        "Gate 0"
      ],
      "tasks": [
        {
          "id": "t0-1",
          "label": "Define medical purpose",
          "detail": "Define exactly what the software does medically, intended users, patients, setting and clinical workflow.",
          "sub_stage": "Gate 0",
          "experts": "Clinical product lead + SaMD RA",
          "resources": "Clinician interviews; workflow mapping",
          "deliverable": "Intended Purpose Statement",
          "depends_on": "Problem definition",
          "duration": "1-2 weeks",
          "gate": "Gate 0",
          "owner": ""
        },
        {
          "id": "t0-2",
          "label": "Define clinical claims",
          "detail": "Define detection/diagnosis/triage/prediction/decision-support claims and evidence needed for each.",
          "sub_stage": "Gate 0",
          "experts": "Clinical affairs + RA",
          "resources": "Claims matrix; literature",
          "deliverable": "Clinical Claims Matrix",
          "depends_on": "Intended purpose",
          "duration": "1-2 weeks",
          "gate": "Gate 0",
          "owner": ""
        },
        {
          "id": "t0-3",
          "label": "Determine whether it is SaMD",
          "detail": "Establish whether software itself performs a medical function rather than merely storing, transmitting or administrating data.",
          "sub_stage": "Gate 0",
          "experts": "SaMD regulatory specialist",
          "resources": "MDR 2017; CDSCO; IMDRF SaMD framework",
          "deliverable": "SaMD Qualification Memo",
          "depends_on": "Intended purpose",
          "duration": "1-2 weeks",
          "gate": "Gate 0",
          "owner": ""
        }
      ]
    },
    {
      "no": 1,
      "name": "Classification",
      "sub_stages": [
        "Gate 1"
      ],
      "tasks": [
        {
          "id": "t1-1",
          "label": "Determine Indian regulatory status",
          "detail": "Assess whether the software falls under India's medical-device framework.",
          "sub_stage": "Gate 1",
          "experts": "SaMD regulatory affairs",
          "resources": "Current CDSCO rules/guidance",
          "deliverable": "India Regulatory Status Memo",
          "depends_on": "SaMD qualification",
          "duration": "1-2 weeks",
          "gate": "Gate 1",
          "owner": ""
        },
        {
          "id": "t1-2",
          "label": "Determine risk class",
          "detail": "Apply current Indian classification rules and document the A/B/C/D rationale. (Applies to: Risk-dependent)",
          "sub_stage": "Gate 1",
          "experts": "RA + clinical expert",
          "resources": "CDSCO classification framework",
          "deliverable": "SaMD Classification Justification",
          "depends_on": "Regulatory status",
          "duration": "1-3 weeks",
          "gate": "Gate 1",
          "owner": ""
        },
        {
          "id": "t1-3",
          "label": "Assess clinical decision impact",
          "detail": "Determine whether output affects diagnosis, screening, monitoring, treatment, triage or prognosis and how serious an incorrect output could be. (Applies to: Risk-dependent)",
          "sub_stage": "Gate 1",
          "experts": "Clinical safety expert",
          "resources": "Clinical risk analysis; IMDRF framework",
          "deliverable": "Decision Impact Assessment",
          "depends_on": "Intended purpose",
          "duration": "1-2 weeks",
          "gate": "Gate 1",
          "owner": ""
        },
        {
          "id": "t1-4",
          "label": "Assess autonomous vs assistive use",
          "detail": "Document whether AI assists a clinician or produces an autonomous clinical output. (Applies to: Risk-dependent)",
          "sub_stage": "Gate 1",
          "experts": "Clinical AI lead + RA",
          "resources": "Workflow analysis",
          "deliverable": "Human Oversight/Autonomy Assessment",
          "depends_on": "Decision impact",
          "duration": "1-2 weeks",
          "gate": "Gate 1",
          "owner": ""
        },
        {
          "id": "t1-5",
          "label": "Check predicate/regulatory precedent",
          "detail": "Identify comparable Indian and international regulated software and evidence expectations.",
          "sub_stage": "Gate 1",
          "experts": "Regulatory intelligence specialist",
          "resources": "CDSCO/FDA/other databases",
          "deliverable": "Predicate/Precedent Report",
          "depends_on": "Classification",
          "duration": "2-4 weeks",
          "gate": "Gate 1",
          "owner": ""
        }
      ]
    },
    {
      "no": 2,
      "name": "Clinical & Product Requirements",
      "sub_stages": [
        "Gate 2"
      ],
      "tasks": [
        {
          "id": "t2-1",
          "label": "Map clinical workflow",
          "detail": "Map how images/data enter, AI processes them, output is displayed and clinician acts on it.",
          "sub_stage": "Gate 2",
          "experts": "Radiologist/physician + workflow expert",
          "resources": "PACS/RIS/EMR workflow mapping",
          "deliverable": "Clinical Workflow Specification",
          "depends_on": "User definition",
          "duration": "2-4 weeks",
          "gate": "Gate 2",
          "owner": ""
        },
        {
          "id": "t2-2",
          "label": "Software requirements specification",
          "detail": "Define functional, performance, safety, latency, availability and interface requirements.",
          "sub_stage": "Gate 2",
          "experts": "Product manager + software architect",
          "resources": "PRD; requirements tool",
          "deliverable": "SRS",
          "depends_on": "Workflow",
          "duration": "2-6 weeks",
          "gate": "Gate 2",
          "owner": ""
        },
        {
          "id": "t2-3",
          "label": "Clinical safety requirements",
          "detail": "Define unacceptable failures, false positives/negatives, alert behaviour, escalation and fallback.",
          "sub_stage": "Gate 2",
          "experts": "Clinical safety engineer + clinician",
          "resources": "Hazard analysis; FMEA",
          "deliverable": "Clinical Safety Requirements",
          "depends_on": "Workflow + risk",
          "duration": "2-6 weeks",
          "gate": "Gate 2",
          "owner": ""
        },
        {
          "id": "t2-4",
          "label": "Interoperability requirements",
          "detail": "Define DICOM, HL7/FHIR, PACS/RIS/HIS/EMR integration where applicable. (Applies to: Conditional)",
          "sub_stage": "Gate 2",
          "experts": "Healthcare interoperability architect",
          "resources": "DICOM/HL7/FHIR specs; sandbox",
          "deliverable": "Interoperability Specification",
          "depends_on": "Workflow",
          "duration": "2-8 weeks",
          "gate": "Gate 2",
          "owner": ""
        }
      ]
    },
    {
      "no": 3,
      "name": "QMS & Software Lifecycle",
      "sub_stages": [
        "Gate 3"
      ],
      "tasks": [
        {
          "id": "t3-1",
          "label": "Establish software QMS",
          "detail": "Implement design control, document control, change control, CAPA, complaints, release and maintenance processes.",
          "sub_stage": "Gate 3",
          "experts": "QA/RA lead",
          "resources": "ISO 13485-aligned QMS",
          "deliverable": "Operational QMS",
          "depends_on": "Regulatory strategy",
          "duration": "4-12 weeks",
          "gate": "Gate 3",
          "owner": ""
        },
        {
          "id": "t3-2",
          "label": "Software lifecycle",
          "detail": "Control requirements, architecture, coding, review, verification, validation, release and maintenance.",
          "sub_stage": "Gate 3",
          "experts": "Software QA lead",
          "resources": "IEC 62304 lifecycle framework; Git/CI",
          "deliverable": "Software Lifecycle Plan",
          "depends_on": "QMS",
          "duration": "3-8 weeks",
          "gate": "Gate 3",
          "owner": ""
        },
        {
          "id": "t3-3",
          "label": "Version/configuration control",
          "detail": "Make every production software/model build uniquely identifiable and reproducible.",
          "sub_stage": "Gate 3",
          "experts": "DevOps + QA",
          "resources": "Git; CI/CD; artifact repository",
          "deliverable": "Configuration Management System",
          "depends_on": "Lifecycle",
          "duration": "1-3 weeks",
          "gate": "Gate 3",
          "owner": ""
        },
        {
          "id": "t3-4",
          "label": "Software change control",
          "detail": "Assess clinical/regulatory impact of code, UI, algorithm, threshold, training-data and model changes.",
          "sub_stage": "Gate 3",
          "experts": "QA + RA + clinical",
          "resources": "Change-control SOP; model registry",
          "deliverable": "Software Change Control Process",
          "depends_on": "QMS",
          "duration": "2-4 weeks",
          "gate": "Gate 3",
          "owner": ""
        }
      ]
    },
    {
      "no": 4,
      "name": "AI/ML",
      "sub_stages": [
        "Gate 4"
      ],
      "tasks": [
        {
          "id": "t4-1",
          "label": "AI intended-function specification",
          "detail": "Document inputs, outputs, operating conditions, decision role and limitations. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "ML lead + clinical AI expert",
          "resources": "Algorithm specification; model card",
          "deliverable": "AI Intended Function Specification",
          "depends_on": "Clinical claim",
          "duration": "2-4 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-2",
          "label": "Dataset governance",
          "detail": "Document source, provenance, consent/legal basis, ownership, inclusion/exclusion and representativeness. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "Clinical data scientist + privacy/legal",
          "resources": "Data inventory; data-use agreements",
          "deliverable": "Dataset Governance Plan",
          "depends_on": "AI function",
          "duration": "3-8 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-3",
          "label": "Dataset curation & annotation",
          "detail": "Define annotation protocol, adjudication, label definitions and quality controls. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "Radiologists/clinicians + data scientist",
          "resources": "Annotation platform; adjudication SOP",
          "deliverable": "Dataset Curation Protocol",
          "depends_on": "Dataset governance",
          "duration": "3-12 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-4",
          "label": "Prevent data leakage",
          "detail": "Separate training/validation/test data at appropriate patient level and document leakage controls. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "ML scientist + biostatistician",
          "resources": "Data pipeline; audit logs",
          "deliverable": "Data Split/Leakage Report",
          "depends_on": "Curation",
          "duration": "1-3 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-5",
          "label": "Representativeness & bias",
          "detail": "Assess scanner, site, population, demographic, disease-severity and acquisition variability. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "Clinical AI scientist + statistician",
          "resources": "Stratification/fairness analysis",
          "deliverable": "Representativeness/Bias Report",
          "depends_on": "Dataset",
          "duration": "2-6 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-6",
          "label": "Model development controls",
          "detail": "Document architecture, preprocessing, training, hyperparameters, reproducibility and experiment history. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "ML engineer + software QA",
          "resources": "Code repo; experiment tracking",
          "deliverable": "Model Development Record",
          "depends_on": "Dataset",
          "duration": "4-16 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-7",
          "label": "Model performance",
          "detail": "Predefine clinically meaningful sensitivity, specificity, PPV, NPV, AUROC, calibration or segmentation metrics. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "Biostatistician + clinical AI expert",
          "resources": "Statistical analysis plan",
          "deliverable": "Model Performance Report",
          "depends_on": "Model development",
          "duration": "2-6 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-8",
          "label": "Subgroup performance",
          "detail": "Evaluate clinically relevant subgroups and document limitations. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "Biostatistician + clinical expert",
          "resources": "Subgroup analysis",
          "deliverable": "Subgroup Performance Report",
          "depends_on": "Model performance",
          "duration": "2-6 weeks",
          "gate": "Gate 4",
          "owner": ""
        },
        {
          "id": "t4-9",
          "label": "Model update strategy",
          "detail": "Determine locked vs periodically updated vs continuously learning model and regulatory impact of updates. (Applies to: AI/ML)",
          "sub_stage": "Gate 4",
          "experts": "ML lead + RA",
          "resources": "Model governance plan",
          "deliverable": "AI Change/Update Plan",
          "depends_on": "Change control",
          "duration": "2-4 weeks",
          "gate": "Gate 4",
          "owner": ""
        }
      ]
    },
    {
      "no": 5,
      "name": "Cybersecurity & Privacy",
      "sub_stages": [
        "Gate 5"
      ],
      "tasks": [
        {
          "id": "t5-1",
          "label": "Threat modelling",
          "detail": "Identify threats to patient data, clinical workflow, model integrity and availability.",
          "sub_stage": "Gate 5",
          "experts": "Cybersecurity architect",
          "resources": "Threat modelling; attack surface map",
          "deliverable": "Threat Model",
          "depends_on": "Architecture",
          "duration": "2-6 weeks",
          "gate": "Gate 5",
          "owner": ""
        },
        {
          "id": "t5-2",
          "label": "Secure SDLC",
          "detail": "Implement secure coding, dependency management, vulnerability scanning, secrets management and code review.",
          "sub_stage": "Gate 5",
          "experts": "Security engineer + DevSecOps",
          "resources": "SAST/DAST; SBOM; CI/CD",
          "deliverable": "Secure SDLC Evidence",
          "depends_on": "Threat model",
          "duration": "4-12 weeks",
          "gate": "Gate 5",
          "owner": ""
        },
        {
          "id": "t5-3",
          "label": "Privacy/data assessment",
          "detail": "Assess patient-data collection, access, retention, hosting and transfers under applicable Indian requirements.",
          "sub_stage": "Gate 5",
          "experts": "Privacy counsel + security lead",
          "resources": "Data-flow map; privacy assessment",
          "deliverable": "Privacy/Data Protection Assessment",
          "depends_on": "Architecture",
          "duration": "2-6 weeks",
          "gate": "Gate 5",
          "owner": ""
        },
        {
          "id": "t5-4",
          "label": "Access/audit controls",
          "detail": "Role-based access, authentication, authorisation, audit logs and privileged access.",
          "sub_stage": "Gate 5",
          "experts": "Security architect",
          "resources": "IAM; logging/SIEM",
          "deliverable": "Security Control Evidence",
          "depends_on": "Architecture",
          "duration": "2-6 weeks",
          "gate": "Gate 5",
          "owner": ""
        },
        {
          "id": "t5-5",
          "label": "Business continuity",
          "detail": "Define uptime, backup, disaster recovery, downtime and clinical fallback.",
          "sub_stage": "Gate 5",
          "experts": "Cloud/security architect + clinical ops",
          "resources": "BCP/DR environment",
          "deliverable": "BCP/DR Plan",
          "depends_on": "Architecture",
          "duration": "2-6 weeks",
          "gate": "Gate 5",
          "owner": ""
        }
      ]
    },
    {
      "no": 6,
      "name": "Verification & Validation",
      "sub_stages": [
        "Gate 6"
      ],
      "tasks": [
        {
          "id": "t6-1",
          "label": "Software V&V plan",
          "detail": "Define traceable testing of requirements, architecture, code, interfaces, performance and errors.",
          "sub_stage": "Gate 6",
          "experts": "Software V&V lead",
          "resources": "Test management system",
          "deliverable": "Software V&V Plan",
          "depends_on": "SRS",
          "duration": "2-4 weeks",
          "gate": "Gate 6",
          "owner": ""
        },
        {
          "id": "t6-2",
          "label": "Software testing",
          "detail": "Execute unit, integration, system and regression testing with traceable evidence.",
          "sub_stage": "Gate 6",
          "experts": "Software QA",
          "resources": "Automated/manual test framework",
          "deliverable": "Test Reports",
          "depends_on": "V&V plan",
          "duration": "4-12 weeks",
          "gate": "Gate 6",
          "owner": ""
        },
        {
          "id": "t6-3",
          "label": "Clinical performance validation",
          "detail": "Demonstrate that the software achieves its claimed performance in intended-use conditions.",
          "sub_stage": "Gate 6",
          "experts": "Clinical validation lead + radiologists/physicians",
          "resources": "Representative clinical datasets/sites",
          "deliverable": "Clinical Performance Validation Report",
          "depends_on": "Clinical protocol",
          "duration": "8-24+ weeks",
          "gate": "Gate 6",
          "owner": ""
        },
        {
          "id": "t6-4",
          "label": "Usability validation",
          "detail": "Demonstrate intended users can correctly interpret and act on outputs without unacceptable use-related risk.",
          "sub_stage": "Gate 6",
          "experts": "Human factors engineer + clinicians",
          "resources": "Simulated-use environment",
          "deliverable": "Usability Validation Report",
          "depends_on": "UI + risk",
          "duration": "4-12 weeks",
          "gate": "Gate 6",
          "owner": ""
        },
        {
          "id": "t6-5",
          "label": "Integration validation",
          "detail": "Validate patient/image/result association and PACS/RIS/HIS/EMR interfaces. (Applies to: Conditional)",
          "sub_stage": "Gate 6",
          "experts": "Healthcare integration engineer",
          "resources": "Hospital sandbox; DICOM tools",
          "deliverable": "Integration Validation Report",
          "depends_on": "Integration build",
          "duration": "4-12 weeks",
          "gate": "Gate 6",
          "owner": ""
        }
      ]
    },
    {
      "no": 7,
      "name": "Clinical Evidence",
      "sub_stages": [
        "Gate 7"
      ],
      "tasks": [
        {
          "id": "t7-1",
          "label": "Clinical evidence plan",
          "detail": "Choose retrospective, reader study, prospective/multi-centre and post-market evidence strategy.",
          "sub_stage": "Gate 7",
          "experts": "Clinical affairs + biostatistician",
          "resources": "Clinical evidence matrix",
          "deliverable": "Clinical Evidence Plan",
          "depends_on": "Risk + claims",
          "duration": "2-4 weeks",
          "gate": "Gate 7",
          "owner": ""
        },
        {
          "id": "t7-2",
          "label": "Independent retrospective validation",
          "detail": "Validate on data not used for development, representative of intended population. (Applies to: AI/ML)",
          "sub_stage": "Gate 7",
          "experts": "Clinical AI scientist + statistician",
          "resources": "Independent dataset; blinded evaluation",
          "deliverable": "Retrospective Validation Report",
          "depends_on": "Locked model",
          "duration": "4-12 weeks",
          "gate": "Gate 7",
          "owner": ""
        },
        {
          "id": "t7-3",
          "label": "Reader study",
          "detail": "Where appropriate, compare clinician performance with and without AI assistance. (Applies to: AI diagnosis/CDS)",
          "sub_stage": "Gate 7",
          "experts": "Clinical trial lead + radiologists + biostatistician",
          "resources": "Reader platform; protocol",
          "deliverable": "Reader Study Report",
          "depends_on": "Clinical question",
          "duration": "8-24 weeks",
          "gate": "Gate 7",
          "owner": ""
        },
        {
          "id": "t7-4",
          "label": "Prospective/multi-centre study",
          "detail": "Demonstrate real-world performance across sites/users where required or strategically necessary. (Applies to: Risk-dependent)",
          "sub_stage": "Gate 7",
          "experts": "Clinical operations + CRO + investigators",
          "resources": "Hospitals; EDC; monitoring",
          "deliverable": "Clinical Study Report",
          "depends_on": "Clinical strategy",
          "duration": "6-18+ months",
          "gate": "Gate 7",
          "owner": ""
        },
        {
          "id": "t7-5",
          "label": "Statistical analysis plan",
          "detail": "Predefine endpoints, sample size, subgroup analyses, confidence intervals and acceptance criteria.",
          "sub_stage": "Gate 7",
          "experts": "Biostatistician",
          "resources": "SAP; statistical software",
          "deliverable": "SAP",
          "depends_on": "Clinical evidence plan",
          "duration": "1-3 weeks",
          "gate": "Gate 7",
          "owner": ""
        }
      ]
    },
    {
      "no": 8,
      "name": "Regulatory",
      "sub_stages": [
        "Gate 8"
      ],
      "tasks": [
        {
          "id": "t8-1",
          "label": "Build SaMD technical file",
          "detail": "Compile intended purpose, architecture, lifecycle, risk, cybersecurity, V&V, clinical evidence, labelling and PMS.",
          "sub_stage": "Gate 8",
          "experts": "SaMD RA + technical writer",
          "resources": "Technical file; traceability matrix",
          "deliverable": "SaMD Technical Documentation",
          "depends_on": "V&V + clinical",
          "duration": "6-12 weeks",
          "gate": "Gate 8",
          "owner": ""
        },
        {
          "id": "t8-2",
          "label": "Software risk management",
          "detail": "Address false positive/negative, delayed output, wrong patient/image, integration failure and cybersecurity-related hazards.",
          "sub_stage": "Gate 8",
          "experts": "Software risk engineer + clinical safety",
          "resources": "ISO 14971 framework; FMEA/FTA",
          "deliverable": "Software Risk Management File",
          "depends_on": "Requirements",
          "duration": "3-8 weeks",
          "gate": "Gate 8",
          "owner": ""
        },
        {
          "id": "t8-3",
          "label": "Essential principles compliance",
          "detail": "Map applicable Indian safety/performance principles to objective evidence.",
          "sub_stage": "Gate 8",
          "experts": "Regulatory affairs",
          "resources": "Compliance matrix; reports",
          "deliverable": "Essential Principles Matrix",
          "depends_on": "Technical file",
          "duration": "2-4 weeks",
          "gate": "Gate 8",
          "owner": ""
        },
        {
          "id": "t8-4",
          "label": "Label/IFU",
          "detail": "State intended use, user qualifications, limitations, warnings, interpretation, contraindications and software identification/version as applicable.",
          "sub_stage": "Gate 8",
          "experts": "Regulatory labelling + medical writer",
          "resources": "IFU; approved UI/artwork",
          "deliverable": "Approved Label/IFU",
          "depends_on": "Risk + claims",
          "duration": "2-4 weeks",
          "gate": "Gate 8",
          "owner": ""
        },
        {
          "id": "t8-5",
          "label": "Determine CDSCO route",
          "detail": "Select applicable Indian manufacturing/import licence route based on final classification and business model.",
          "sub_stage": "Gate 8",
          "experts": "SaMD regulatory specialist",
          "resources": "CDSCO portal; MDR forms",
          "deliverable": "Regulatory Submission Plan",
          "depends_on": "Classification",
          "duration": "1-2 weeks",
          "gate": "Gate 8",
          "owner": ""
        },
        {
          "id": "t8-6",
          "label": "Indian manufacturing route",
          "detail": "If Indian legal manufacturer, prepare applicable manufacturing licence documentation and QMS/technical file. (Applies to: Conditional)",
          "sub_stage": "Gate 8",
          "experts": "CDSCO regulatory specialist + QA",
          "resources": "DMF; QMS; software documentation",
          "deliverable": "Manufacturing Licence",
          "depends_on": "Technical file",
          "duration": "4-16+ weeks",
          "gate": "Gate 8",
          "owner": ""
        },
        {
          "id": "t8-7",
          "label": "Import route",
          "detail": "For foreign-manufactured SaMD, prepare applicable Indian import/authorised-agent documentation. (Applies to: Conditional)",
          "sub_stage": "Gate 8",
          "experts": "Import regulatory specialist",
          "resources": "Foreign manufacturer docs; DMF; QMS",
          "deliverable": "Import Licence",
          "depends_on": "Business model",
          "duration": "4-16+ weeks",
          "gate": "Gate 8",
          "owner": ""
        },
        {
          "id": "t8-8",
          "label": "Novel/no-predicate pathway",
          "detail": "If no appropriate predicate, determine whether clinical investigation/novel-device pathway applies. (Applies to: Conditional)",
          "sub_stage": "Gate 8",
          "experts": "Regulatory + clinical affairs",
          "resources": "Predicate search; clinical plan",
          "deliverable": "Novel SaMD Regulatory Strategy",
          "depends_on": "Classification",
          "duration": "2-6 weeks",
          "gate": "Gate 8",
          "owner": ""
        }
      ]
    },
    {
      "no": 9,
      "name": "Deployment",
      "sub_stages": [
        "Gate 9"
      ],
      "tasks": [
        {
          "id": "t9-1",
          "label": "Cloud/on-prem architecture",
          "detail": "Define hosting, network, data residency, latency, uptime and hospital IT requirements.",
          "sub_stage": "Gate 9",
          "experts": "Cloud architect + healthcare IT",
          "resources": "Architecture; hospital IT checklist",
          "deliverable": "Deployment Architecture",
          "depends_on": "Security",
          "duration": "2-6 weeks",
          "gate": "Gate 9",
          "owner": ""
        },
        {
          "id": "t9-2",
          "label": "PACS/RIS integration",
          "detail": "Validate image/worklist retrieval, processing and result routing where applicable. (Applies to: Radiology)",
          "sub_stage": "Gate 9",
          "experts": "Healthcare integration engineer",
          "resources": "PACS/RIS sandbox; DICOM tools",
          "deliverable": "Hospital Integration Pack",
          "depends_on": "Integration validation",
          "duration": "4-12 weeks",
          "gate": "Gate 9",
          "owner": ""
        },
        {
          "id": "t9-3",
          "label": "Hospital IT/security approval",
          "detail": "Complete hospital cybersecurity, privacy, network and vendor assessment.",
          "sub_stage": "Gate 9",
          "experts": "Hospital IT/security + vendor security",
          "resources": "Security questionnaire; architecture diagrams",
          "deliverable": "Hospital IT Approval",
          "depends_on": "Security package",
          "duration": "2-8 weeks",
          "gate": "Gate 9",
          "owner": ""
        },
        {
          "id": "t9-4",
          "label": "User training",
          "detail": "Train users on intended use, limitations, errors, escalation and human oversight.",
          "sub_stage": "Gate 9",
          "experts": "Clinical education + product specialist",
          "resources": "Training modules; competency assessment",
          "deliverable": "Training Records",
          "depends_on": "Validated product",
          "duration": "1-4 weeks",
          "gate": "Gate 9",
          "owner": ""
        },
        {
          "id": "t9-5",
          "label": "Clinical pilot",
          "detail": "Run a controlled pilot with predefined clinical, workflow and economic endpoints.",
          "sub_stage": "Gate 9",
          "experts": "Clinical implementation lead + KOL",
          "resources": "Pilot protocol; data collection",
          "deliverable": "Pilot Report",
          "depends_on": "Regulatory-ready product",
          "duration": "4-16 weeks",
          "gate": "Gate 9",
          "owner": ""
        }
      ]
    },
    {
      "no": 10,
      "name": "Commercial",
      "sub_stages": [
        "Gate 10"
      ],
      "tasks": [
        {
          "id": "t10-1",
          "label": "Pricing & SaaS model",
          "detail": "Define per-site/per-study/subscription pricing, implementation, support and renewal economics.",
          "sub_stage": "Gate 10",
          "experts": "MedTech commercial + finance",
          "resources": "Unit economics; competitor analysis",
          "deliverable": "Pricing Model",
          "depends_on": "Pilot economics",
          "duration": "2-4 weeks",
          "gate": "Gate 10",
          "owner": ""
        },
        {
          "id": "t10-2",
          "label": "Hospital procurement pack",
          "detail": "Regulatory documents, clinical evidence, cybersecurity pack, pricing and service terms.",
          "sub_stage": "Gate 10",
          "experts": "Hospital BD + regulatory",
          "resources": "Procurement templates",
          "deliverable": "Hospital Procurement Pack",
          "depends_on": "Regulatory approval",
          "duration": "2-6 weeks",
          "gate": "Gate 10",
          "owner": ""
        },
        {
          "id": "t10-3",
          "label": "Claims/marketing review",
          "detail": "Ensure website, sales deck and demos stay within approved intended use and evidence.",
          "sub_stage": "Gate 10",
          "experts": "RA + medical affairs + marketing",
          "resources": "Claims matrix",
          "deliverable": "Approved Marketing Claims",
          "depends_on": "Regulatory file",
          "duration": "1-3 weeks",
          "gate": "Gate 10",
          "owner": ""
        },
        {
          "id": "t10-4",
          "label": "SLA/service readiness",
          "detail": "Define uptime, support, incident response, cybersecurity notification and model-performance escalation.",
          "sub_stage": "Gate 10",
          "experts": "Customer success + security + clinical",
          "resources": "SLA; support platform",
          "deliverable": "SLA/Support Package",
          "depends_on": "Deployment",
          "duration": "2-4 weeks",
          "gate": "Gate 10",
          "owner": ""
        }
      ]
    },
    {
      "no": 11,
      "name": "PMS & AI Monitoring",
      "sub_stages": [
        "Gate 11"
      ],
      "tasks": [
        {
          "id": "t11-1",
          "label": "PMS plan",
          "detail": "Define complaints, clinical feedback, performance monitoring, literature and regulatory signal monitoring.",
          "sub_stage": "Gate 11",
          "experts": "PMS/vigilance + clinical affairs",
          "resources": "PMS SOP; CRM",
          "deliverable": "PMS Plan",
          "depends_on": "Launch readiness",
          "duration": "2-4 weeks",
          "gate": "Gate 11",
          "owner": ""
        },
        {
          "id": "t11-2",
          "label": "AI performance monitoring",
          "detail": "Monitor drift, sensitivity/specificity, false positives/negatives, subgroup performance and data shift. (Applies to: AI/ML)",
          "sub_stage": "Gate 11",
          "experts": "ML monitoring + clinical safety",
          "resources": "Monitoring dashboard; reference dataset",
          "deliverable": "AI Performance Monitoring Plan",
          "depends_on": "Locked model",
          "duration": "2-6 weeks",
          "gate": "Gate 11",
          "owner": ""
        },
        {
          "id": "t11-3",
          "label": "Cybersecurity monitoring",
          "detail": "Vulnerability management, patching, incident detection and response.",
          "sub_stage": "Gate 11",
          "experts": "Security operations",
          "resources": "SIEM; vulnerability scanner",
          "deliverable": "Cybersecurity PMS Record",
          "depends_on": "Security controls",
          "duration": "Ongoing",
          "gate": "Gate 11",
          "owner": ""
        },
        {
          "id": "t11-4",
          "label": "Complaint/adverse-event process",
          "detail": "Triage clinical incidents and determine investigation, CAPA and regulatory reporting.",
          "sub_stage": "Gate 11",
          "experts": "Vigilance/QA + clinical safety",
          "resources": "Complaint system; CAPA",
          "deliverable": "Vigilance SOP",
          "depends_on": "PMS",
          "duration": "2-4 weeks",
          "gate": "Gate 11",
          "owner": ""
        },
        {
          "id": "t11-5",
          "label": "Software FSCA/recall",
          "detail": "Define rollback, patch, disablement, customer notification and clinical mitigation.",
          "sub_stage": "Gate 11",
          "experts": "QA/RA + cybersecurity + clinical safety",
          "resources": "Recall/FSCA SOP; deployment controls",
          "deliverable": "Software FSCA Plan",
          "depends_on": "PMS",
          "duration": "2-4 weeks",
          "gate": "Gate 11",
          "owner": ""
        }
      ]
    },
    {
      "no": 12,
      "name": "AI Change & Scale",
      "sub_stages": [
        "Gate 12"
      ],
      "tasks": [
        {
          "id": "t12-1",
          "label": "Model change impact assessment",
          "detail": "Assess retraining, thresholds, new data, new indication or algorithm changes for V&V and regulatory impact. (Applies to: AI/ML)",
          "sub_stage": "Gate 12",
          "experts": "RA + ML + clinical affairs",
          "resources": "Change-control matrix; model registry",
          "deliverable": "AI Change Assessment",
          "depends_on": "AI governance",
          "duration": "Ongoing",
          "gate": "Gate 12",
          "owner": ""
        },
        {
          "id": "t12-2",
          "label": "New indication management",
          "detail": "Treat a new disease, modality, anatomy, population or claim as a new regulatory/clinical assessment.",
          "sub_stage": "Gate 12",
          "experts": "RA + clinical affairs",
          "resources": "Claims matrix; evidence plan",
          "deliverable": "New Indication Assessment",
          "depends_on": "Change control",
          "duration": "Variable",
          "gate": "Gate 12",
          "owner": ""
        },
        {
          "id": "t12-3",
          "label": "Scale across hospitals",
          "detail": "Validate infrastructure, interoperability, training, performance and support at scale.",
          "sub_stage": "Gate 12",
          "experts": "Implementation + engineering + clinical",
          "resources": "Deployment playbook; monitoring",
          "deliverable": "Scale Deployment Playbook",
          "depends_on": "Successful pilot",
          "duration": "4-16 weeks",
          "gate": "Gate 12",
          "owner": ""
        }
      ]
    }
  ],
  "playbook": {
    "model": [
      {
        "component": "Detection",
        "question": "Find suspected lesion/pathology — Sensitivity, specificity, false positives/negatives, site/scanner variability?",
        "output": "Independent multi-site validation; subgroup analysis; reader study where appropriate"
      },
      {
        "component": "Classification",
        "question": "Classify disease/finding — Class definitions, calibration, clinically meaningful thresholds?",
        "output": "Independent test set; error analysis"
      },
      {
        "component": "Segmentation",
        "question": "Delineate anatomy/lesion — Dice/IoU clinically adequate? Boundary errors?",
        "output": "Independent annotated dataset"
      },
      {
        "component": "Triage",
        "question": "Prioritise urgent cases — Missed urgent cases? Time-to-review benefit? Workflow safety?",
        "output": "Prospective workflow validation"
      },
      {
        "component": "Report generation",
        "question": "Generate draft findings/report — Hallucination/error rate? Human verification?",
        "output": "Groundedness/error evaluation; human factors"
      },
      {
        "component": "Clinical decision support",
        "question": "Recommend next action — Does recommendation materially influence diagnosis/treatment?",
        "output": "Clinical utility/decision-impact evidence"
      },
      {
        "component": "Prognosis/risk prediction",
        "question": "Predict outcome/risk — Calibration, discrimination, clinical utility, population shift?",
        "output": "External validation; prospective evidence where needed"
      }
    ],
    "cost_inputs": [
      {
        "category": "Regulatory strategy/classification",
        "input": "Base ₹1 lakh to ₹4 lakh",
        "why": "Complex classification/intended-use work costs more.",
        "approach": "Multiply by 1.25× for AI radiology, 1× for clinical decision support."
      },
      {
        "category": "QMS / ISO 13485 setup",
        "input": "Base ₹2 lakh to ₹8 lakh",
        "why": "Depends on existing regulated-QMS maturity.",
        "approach": "Multiply by 1.25× for AI radiology, 1.25× for clinical decision support."
      },
      {
        "category": "Software lifecycle documentation",
        "input": "Base ₹2 lakh to ₹10 lakh",
        "why": "Requirements, architecture, traceability, V&V and release controls.",
        "approach": "Multiply by 1.5× for AI radiology, 1.25× for clinical decision support."
      },
      {
        "category": "Cybersecurity",
        "input": "Base ₹1.5 lakh to ₹10 lakh",
        "why": "Threat model, secure SDLC, testing, SBOM, cloud controls.",
        "approach": "Multiply by 1.5× for AI radiology, 1.5× for clinical decision support."
      },
      {
        "category": "Clinical data/annotation",
        "input": "Base ₹2 lakh to ₹30 lakh",
        "why": "AI radiology can be data-intensive.",
        "approach": "Multiply by 2× for AI radiology, 1.5× for clinical decision support."
      },
      {
        "category": "Algorithm development/validation",
        "input": "Base ₹5 lakh to ₹50 lakh",
        "why": "Excludes large engineering payroll.",
        "approach": "Multiply by 3× for AI radiology, 2× for clinical decision support."
      },
      {
        "category": "Clinical validation",
        "input": "Base ₹5 lakh to ₹50 lakh",
        "why": "Reader/prospective studies can dominate cost.",
        "approach": "Multiply by 3× for AI radiology, 2× for clinical decision support."
      },
      {
        "category": "Regulatory submission/consulting",
        "input": "Base ₹1.5 lakh to ₹8 lakh",
        "why": "Statutory fees should be added separately.",
        "approach": "Multiply by 1.5× for AI radiology, 1.25× for clinical decision support."
      },
      {
        "category": "Cloud/integration",
        "input": "Base ₹2 lakh to ₹20 lakh",
        "why": "Hospital integration can be significant.",
        "approach": "Multiply by 2× for AI radiology, 1.5× for clinical decision support."
      },
      {
        "category": "Hospital pilots",
        "input": "Base ₹2 lakh to ₹15 lakh",
        "why": "Implementation, training, support and data collection.",
        "approach": "Multiply by 1.5× for AI radiology, 1.5× for clinical decision support."
      },
      {
        "category": "Commercial launch",
        "input": "Base ₹3 lakh to ₹20 lakh",
        "why": "Sales, KOLs, procurement and support.",
        "approach": "Multiply by 1.5× for AI radiology, 1.5× for clinical decision support."
      },
      {
        "category": "Working capital/runway",
        "input": "Base ₹10 lakh to ₹50 lakh",
        "why": "Sales cycle and team costs can dominate.",
        "approach": "Multiply by 2× for AI radiology, 1.5× for clinical decision support."
      }
    ],
    "how_to_use": [
      "Purpose: a checklist for software that itself performs a medical function, including AI radiology diagnosis, detection, triage, prediction and clinical decision support (version Oct 2026).",
      "Core principle: software engineering, clinical evidence, regulatory affairs, cybersecurity and AI governance must be developed as one system.",
      "AI radiology: detection, diagnosis, triage, segmentation, reporting and decision support have different clinical endpoints and evidence requirements.",
      "AI updates: a continuously learning model needs explicit model governance and change-control strategy; retraining is not automatically a routine software patch.",
      "Assign an owner, dates, costs and status to every task. Use each gate as a Go / No-Go / Conditional decision.",
      "This is a planning tool, not legal or regulatory advice. Exact Indian requirements depend on intended purpose, classification, predicate status, evidence and current CDSCO notices.",
      "SaMD qualification — Does software itself perform a medical purpose? Route: MDR 2017 + current CDSCO position Owner: SaMD RA. Cloud delivery does not by itself make software non-medical.",
      "Risk classification — What A/B/C/D class applies? Route: Current CDSCO classification framework Owner: RA + clinical. Document rule and clinical-risk rationale.",
      "Indian manufacture — Who is legal manufacturer? Route: Applicable MDR manufacturing licence pathway Owner: RA + QA. Route depends on final classification.",
      "Import — Is foreign manufacturer/importer route applicable? Route: MD-14 → MD-15 where applicable Owner: Import RA. Authorised agent and foreign documentation may be required.",
      "Clinical investigation — Is Indian clinical evidence/study required? Route: Device-specific; novel/no-predicate route may apply Owner: Clinical RA. Foreign approval is not automatically an Indian licence.",
      "QMS — Is software lifecycle controlled? Route: MDR requirements; ISO 13485 commonly used Owner: QA/RA. Integrate software QA into the device QMS.",
      "Software lifecycle — Are development/V&V/release processes controlled? Route: IEC 62304 is a key international framework Owner: Software QA. Confirm current Indian applicability for the device.",
      "Risk management — Are clinical/software hazards controlled? Route: ISO 14971 is key international framework Owner: Safety/RA. Include wrong output, delay, wrong patient/image and integration failures.",
      "Cybersecurity — Can the product be securely deployed and maintained? Route: Applicable device requirements + recognized practices Owner: Security. Hospitals increasingly require detailed security evidence.",
      "Privacy — How is patient data collected/used/stored? Route: Applicable Indian privacy/data-protection requirements Owner: Privacy/legal. Assess separately from device safety.",
      "AI/ML governance — How are datasets, models, drift and updates controlled? Route: Device-specific regulatory + clinical evidence strategy Owner: AI/ML + RA. Do not treat model retraining as an ordinary software patch.",
      "PMS — How are complaints, incidents and AI performance monitored? Route: Applicable MDR/PMS/vigilance requirements Owner: PMS/RA. AI monitoring should feed clinical safety and CAPA."
    ]
  }
};
