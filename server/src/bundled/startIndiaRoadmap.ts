// "How to start a startup in India": a free guide for every signed-in member.
// General guidance, not legal, tax or financial advice.
import type { RoadmapContent } from '../roadmapTypes.js';

export const START_IN_INDIA_ROADMAP: RoadmapContent = {
  "category": "cat-start-in-india",
  "phases": [
    {
      "no": 0,
      "name": "Idea and founders",
      "sub_stages": [
        "Validate the idea",
        "Founding team"
      ],
      "tasks": [
        {
          "id": "s0-1",
          "label": "Describe the problem and who has it",
          "detail": "Write down, in a page, the specific problem, who suffers from it, how often, and what they do about it today.",
          "sub_stage": "Validate the idea",
          "experts": "You; a mentor or domain expert",
          "resources": "Problem canvas; this platform's problems",
          "deliverable": "One-page problem",
          "depends_on": "",
          "duration": "1 week",
          "owner": "Founders"
        },
        {
          "id": "s0-2",
          "label": "Talk to at least 20 people who have the problem",
          "detail": "Interview patients, doctors, hospital staff or whoever the buyer or user is. Listen for pain, current workarounds and who would pay.",
          "sub_stage": "Validate the idea",
          "experts": "You; a clinical or domain advisor",
          "resources": "Interview guide; notes template",
          "deliverable": "Interview notes and a list of repeated pain points",
          "depends_on": "Problem",
          "duration": "2-3 weeks",
          "owner": "Founders"
        },
        {
          "id": "s0-3",
          "label": "Map existing alternatives",
          "detail": "List who else solves this, in India and abroad, and why their solution is not enough.",
          "sub_stage": "Validate the idea",
          "experts": "You",
          "resources": "Web research; competitor sheet",
          "deliverable": "Alternatives comparison",
          "depends_on": "Interview notes",
          "duration": "1 week",
          "owner": "Founders"
        },
        {
          "id": "s0-4",
          "label": "Decide: is this worth building?",
          "detail": "Look at the evidence and make an honest go or no-go decision before spending money.",
          "sub_stage": "Validate the idea",
          "experts": "You and your co-founders",
          "resources": "Evidence summary",
          "deliverable": "Go / no-go note",
          "depends_on": "Alternatives comparison",
          "duration": "2-3 days",
          "owner": "Founders",
          "gate": "GO / NO-GO"
        },
        {
          "id": "s0-5",
          "label": "Decide who the founders are",
          "detail": "Agree who is a founder, who is an advisor and who is an early hire. Founders are the people who will commit full time.",
          "sub_stage": "Founding team",
          "experts": "Founders",
          "resources": "Skills map",
          "deliverable": "Founder list with roles",
          "depends_on": "",
          "duration": "1 week",
          "owner": "Founders"
        },
        {
          "id": "s0-6",
          "label": "Agree how you will work together",
          "detail": "Talk through roles, time commitment, decision-making, how equity will be split and what happens if someone leaves. Write it down now; formal documents come later.",
          "sub_stage": "Founding team",
          "experts": "Founders; an experienced mentor",
          "resources": "Founder alignment checklist",
          "deliverable": "Founder alignment note",
          "depends_on": "Founder list",
          "duration": "1 week",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 1,
      "name": "Choose a legal structure",
      "sub_stages": [
        "Pick the structure",
        "Name and address"
      ],
      "tasks": [
        {
          "id": "s1-1",
          "label": "Compare company structures",
          "detail": "Understand the main options in India: private limited company, limited liability partnership (LLP), one person company (OPC), partnership and sole proprietorship. Most startups that plan to raise investment choose a private limited company. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Pick the structure",
          "experts": "A chartered accountant or company secretary",
          "resources": "MCA website; startup legal guides",
          "deliverable": "Structure decision with reasons",
          "depends_on": "",
          "duration": "3-5 days",
          "owner": "Founders"
        },
        {
          "id": "s1-2",
          "label": "Choose and check the company name",
          "detail": "Pick two or three names. Check availability with the Ministry of Corporate Affairs name search and search the trademark registry so you do not pick a name that is already protected.",
          "sub_stage": "Name and address",
          "experts": "You",
          "resources": "MCA name search; trademark public search",
          "deliverable": "Shortlist of available names",
          "depends_on": "Structure decision",
          "duration": "2-3 days",
          "owner": "Founders"
        },
        {
          "id": "s1-3",
          "label": "Decide the starting capital and shareholding",
          "detail": "Decide authorised and paid-up capital and how many shares each founder holds. Keep it simple and make sure it matches the founder alignment note.",
          "sub_stage": "Pick the structure",
          "experts": "Founders; a company secretary",
          "resources": "Cap table template",
          "deliverable": "Starting cap table",
          "depends_on": "Structure decision",
          "duration": "2-3 days",
          "owner": "Founders"
        },
        {
          "id": "s1-4",
          "label": "Arrange a registered office address",
          "detail": "You need an address in India with proof (for example a utility bill and a no-objection letter from the owner). Check what your state accepts.",
          "sub_stage": "Name and address",
          "experts": "Founders",
          "resources": "Rent agreement; utility bill; NOC from owner",
          "deliverable": "Address proof pack",
          "depends_on": "",
          "duration": "3-5 days",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 2,
      "name": "Incorporate the company",
      "sub_stages": [
        "Registration",
        "Right after incorporation"
      ],
      "tasks": [
        {
          "id": "s2-1",
          "label": "Get digital signature certificates",
          "detail": "Each director needs a digital signature certificate (DSC) to sign filings online.",
          "sub_stage": "Registration",
          "experts": "Founders",
          "resources": "Licensed certifying authority",
          "deliverable": "DSC for each director",
          "depends_on": "Structure decision",
          "duration": "1-3 days",
          "owner": "Founders"
        },
        {
          "id": "s2-2",
          "label": "Apply for incorporation",
          "detail": "File the integrated incorporation form (SPICe+) on the MCA portal with your memorandum and articles. It can also apply for PAN, TAN, EPFO and ESIC registrations and, optionally, GST and a bank account.",
          "sub_stage": "Registration",
          "experts": "A company secretary or CA",
          "resources": "MCA portal; SPICe+ form; MoA and AoA drafts",
          "deliverable": "Incorporation application filed",
          "depends_on": "Name; address; DSC",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s2-3",
          "label": "Receive the certificate of incorporation",
          "detail": "When approved, you receive the certificate of incorporation with the company's identification number, plus PAN and TAN.",
          "sub_stage": "Registration",
          "experts": "Company secretary",
          "resources": "MCA portal",
          "deliverable": "Certificate of incorporation, PAN and TAN",
          "depends_on": "Incorporation application filed",
          "duration": "3-7 days",
          "owner": "Founders",
          "gate": "GO / NO-GO"
        },
        {
          "id": "s2-4",
          "label": "Open the company bank account",
          "detail": "Open a current account in the company's name and deposit the subscribed share capital from the founders.",
          "sub_stage": "Right after incorporation",
          "experts": "Founders",
          "resources": "Bank KYC pack",
          "deliverable": "Bank account with share capital deposited",
          "depends_on": "Certificate of incorporation",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s2-5",
          "label": "File the commencement of business declaration",
          "detail": "Companies with share capital must file a declaration that the subscribed capital has been paid, within 180 days of incorporation, before starting business. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Right after incorporation",
          "experts": "Company secretary",
          "resources": "MCA portal",
          "deliverable": "Commencement of business filing",
          "depends_on": "Bank account",
          "duration": "2-3 days",
          "owner": "Founders"
        },
        {
          "id": "s2-6",
          "label": "Appoint the first auditor",
          "detail": "The board appoints the company's first auditor within 30 days of incorporation and the appointment is filed with the registrar. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Right after incorporation",
          "experts": "Company secretary; chartered accountant",
          "resources": "MCA portal",
          "deliverable": "Auditor appointment filed",
          "depends_on": "Certificate of incorporation",
          "duration": "1 week",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 3,
      "name": "Founders' paperwork",
      "sub_stages": [
        "Agreements",
        "Shares and records"
      ],
      "tasks": [
        {
          "id": "s3-1",
          "label": "Sign a founders' or shareholders' agreement",
          "detail": "Put in writing the equity split, vesting (commonly over four years with a one-year cliff), what happens when a founder leaves, decision rights and how disputes are settled.",
          "sub_stage": "Agreements",
          "experts": "A startup lawyer",
          "resources": "Agreement template; legal counsel",
          "deliverable": "Signed founders' agreement",
          "depends_on": "Founder alignment note",
          "duration": "2-3 weeks",
          "owner": "Founders"
        },
        {
          "id": "s3-2",
          "label": "Assign intellectual property to the company",
          "detail": "Make sure everything the founders built for the idea belongs to the company through a written IP assignment and confidentiality terms.",
          "sub_stage": "Agreements",
          "experts": "A startup lawyer",
          "resources": "IP assignment template",
          "deliverable": "Signed IP assignment",
          "depends_on": "Certificate of incorporation",
          "duration": "1 week",
          "owner": "Founders"
        },
        {
          "id": "s3-3",
          "label": "Issue share certificates and keep statutory records",
          "detail": "Issue share certificates and keep the registers a company must maintain (members, directors, minutes).",
          "sub_stage": "Shares and records",
          "experts": "Company secretary",
          "resources": "Statutory registers",
          "deliverable": "Share certificates and registers",
          "depends_on": "Certificate of incorporation",
          "duration": "1 week",
          "owner": "Founders"
        },
        {
          "id": "s3-4",
          "label": "Plan an employee stock option pool",
          "detail": "Decide whether to reserve options for early employees. Set the pool size, vesting and the approval route with your lawyer; it matters most before you raise money.",
          "sub_stage": "Agreements",
          "experts": "A startup lawyer",
          "resources": "ESOP plan template",
          "deliverable": "ESOP plan outline",
          "depends_on": "Founders' agreement",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s3-5",
          "label": "Put contracts in place for people who work with you",
          "detail": "Use employment letters, consulting agreements and non-disclosure agreements for staff, contractors and advisors.",
          "sub_stage": "Agreements",
          "experts": "A startup lawyer",
          "resources": "Contract templates",
          "deliverable": "Standard contract set",
          "depends_on": "Certificate of incorporation",
          "duration": "1 week",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 4,
      "name": "Tax and registrations",
      "sub_stages": [
        "Tax",
        "Other registrations",
        "Books"
      ],
      "tasks": [
        {
          "id": "s4-1",
          "label": "Understand your tax basics",
          "detail": "Know the taxes that will apply to you: income tax, tax deducted at source, goods and services tax and, in some states, professional tax. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Tax",
          "experts": "A chartered accountant",
          "resources": "Income Tax and GST portals",
          "deliverable": "Tax calendar for the year",
          "depends_on": "Certificate of incorporation",
          "duration": "3-5 days",
          "owner": "Founders"
        },
        {
          "id": "s4-2",
          "label": "Register for GST when it applies",
          "detail": "GST registration is required above turnover thresholds and in some cases earlier (for example some interstate or online supplies). Many startups register early to claim input tax credit. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Tax",
          "experts": "A chartered accountant",
          "resources": "GST portal",
          "deliverable": "GST registration or a written reason it is not needed yet",
          "depends_on": "Bank account",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s4-3",
          "label": "Register as a micro, small or medium enterprise",
          "detail": "Udyam registration is free, online and Aadhaar based, and helps with some schemes and tenders.",
          "sub_stage": "Other registrations",
          "experts": "You",
          "resources": "Udyam portal",
          "deliverable": "Udyam registration certificate",
          "depends_on": "Certificate of incorporation",
          "duration": "1-2 days",
          "owner": "Founders"
        },
        {
          "id": "s4-4",
          "label": "Get your local business licences",
          "detail": "Many states require registration under the Shops and Establishments Act or a trade licence, and some have professional tax. Check your state and city rules.",
          "sub_stage": "Other registrations",
          "experts": "A local CA or consultant",
          "resources": "State labour department portal",
          "deliverable": "Local registrations",
          "depends_on": "Address proof pack",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s4-5",
          "label": "Register for provident fund and ESI when you reach the thresholds",
          "detail": "Employee provident fund and state insurance apply when you reach set headcount and wage limits. Plan for them as you hire. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Other registrations",
          "experts": "A chartered accountant",
          "resources": "EPFO and ESIC portals",
          "deliverable": "PF and ESI registrations when due",
          "depends_on": "First hires",
          "duration": "1 week",
          "owner": "Founders"
        },
        {
          "id": "s4-6",
          "label": "Set up accounting and payroll",
          "detail": "Choose accounting software, keep every invoice and receipt, and agree with your accountant how books, payroll and monthly closing will run.",
          "sub_stage": "Books",
          "experts": "A chartered accountant or bookkeeper",
          "resources": "Accounting software",
          "deliverable": "Monthly books and a filing checklist",
          "depends_on": "Bank account",
          "duration": "1 week",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 5,
      "name": "Startup India recognition",
      "sub_stages": [
        "Recognition",
        "Benefits"
      ],
      "tasks": [
        {
          "id": "s5-1",
          "label": "Check if you qualify for DPIIT recognition",
          "detail": "The Department for Promotion of Industry and Internal Trade recognises startups that are incorporated as a private limited company, LLP or registered partnership, are working on innovation, and are within the age and turnover limits. Check the current criteria. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Recognition",
          "experts": "You; a company secretary",
          "resources": "Startup India portal",
          "deliverable": "Eligibility checklist",
          "depends_on": "Certificate of incorporation",
          "duration": "1-2 days",
          "owner": "Founders"
        },
        {
          "id": "s5-2",
          "label": "Apply for recognition on the Startup India portal",
          "detail": "Apply with your incorporation certificate, a short description of your innovation and supporting documents. Recognition gives you a certificate and access to schemes.",
          "sub_stage": "Recognition",
          "experts": "You",
          "resources": "Startup India portal",
          "deliverable": "DPIIT recognition certificate",
          "depends_on": "Eligibility checklist",
          "duration": "1-3 weeks",
          "owner": "Founders"
        },
        {
          "id": "s5-3",
          "label": "Learn what recognition gives you",
          "detail": "Understand the benefits available to recognised startups, such as self-certification under some labour and environment laws, faster and cheaper patent filing, easier public procurement, and access to funding schemes through incubators. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Benefits",
          "experts": "A chartered accountant; an incubator",
          "resources": "Startup India portal",
          "deliverable": "Benefits checklist",
          "depends_on": "Recognition certificate",
          "duration": "2-3 days",
          "owner": "Founders"
        },
        {
          "id": "s5-4",
          "label": "Apply for the income tax exemption if you are eligible",
          "detail": "Recognised startups can apply for a three-year income tax holiday under section 80-IAC within their first years, through the inter-ministerial board. Decide with your accountant whether it is worth applying. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Benefits",
          "experts": "A chartered accountant",
          "resources": "Startup India portal",
          "deliverable": "Exemption application or a note why not",
          "depends_on": "Recognition certificate",
          "duration": "2-4 weeks",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 6,
      "name": "Protect what you build",
      "sub_stages": [
        "Intellectual property",
        "Data and sector rules"
      ],
      "tasks": [
        {
          "id": "s6-1",
          "label": "Search and register your trademark",
          "detail": "Search the trademark registry for your name and logo, then file an application in the right classes. Recognised startups pay a reduced fee. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Intellectual property",
          "experts": "A trademark attorney",
          "resources": "Trademark registry public search",
          "deliverable": "Trademark application filed",
          "depends_on": "Name decision",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s6-2",
          "label": "Decide your patent and copyright plan",
          "detail": "Work out what is truly new in your product. Consider a provisional patent filing to secure a date, and keep source code, designs and content protected through copyright and confidentiality.",
          "sub_stage": "Intellectual property",
          "experts": "A patent attorney",
          "resources": "Patent search tools",
          "deliverable": "IP protection plan",
          "depends_on": "IP assignment",
          "duration": "2-4 weeks",
          "owner": "Founders"
        },
        {
          "id": "s6-3",
          "label": "Secure your domain names and handles",
          "detail": "Register the domain and social handles that match your company name.",
          "sub_stage": "Intellectual property",
          "experts": "You",
          "resources": "Domain registrar",
          "deliverable": "Domains and handles registered",
          "depends_on": "",
          "duration": "1 day",
          "owner": "Founders"
        },
        {
          "id": "s6-4",
          "label": "Plan for data protection",
          "detail": "If you handle personal data, especially health data, plan for consent, purpose limits, security and a privacy notice under India's data protection law and the sector rules that apply. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Data and sector rules",
          "experts": "A privacy lawyer",
          "resources": "DPDP Act and rules; sector guidance",
          "deliverable": "Privacy notice and data handling plan",
          "depends_on": "MVP scope",
          "duration": "2-3 weeks",
          "owner": "Founders"
        },
        {
          "id": "s6-5",
          "label": "Find the sector licences you need",
          "detail": "In healthcare, a product may be a medical device or software as a medical device, or need clinic, telemedicine or drug licences. Use this platform's sector roadmaps for medical devices and SaMD to find the route.",
          "sub_stage": "Data and sector rules",
          "experts": "A regulatory affairs expert",
          "resources": "NXT Health category roadmaps; CDSCO website",
          "deliverable": "Licence map for your product",
          "depends_on": "Problem",
          "duration": "1-2 weeks",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 7,
      "name": "Build, test, first users",
      "sub_stages": [
        "Build",
        "First users"
      ],
      "tasks": [
        {
          "id": "s7-1",
          "label": "Define the smallest useful version",
          "detail": "Decide what the first version must do to prove the idea and what you will leave out.",
          "sub_stage": "Build",
          "experts": "Founders",
          "resources": "MVP canvas",
          "deliverable": "MVP scope",
          "depends_on": "Go / no-go note",
          "duration": "1 week",
          "owner": "Founders"
        },
        {
          "id": "s7-2",
          "label": "Build the first version",
          "detail": "Build a working prototype or product that a real user can try.",
          "sub_stage": "Build",
          "experts": "Engineers or product developers",
          "resources": "Prototype tools",
          "deliverable": "Working first version",
          "depends_on": "MVP scope",
          "duration": "4-12 weeks",
          "owner": "Founders"
        },
        {
          "id": "s7-3",
          "label": "Run a pilot with real users",
          "detail": "Put the product in front of real users, for example a clinic or hospital, with clear success measures agreed in advance.",
          "sub_stage": "First users",
          "experts": "Founders; a clinical champion",
          "resources": "Pilot agreement; feedback form",
          "deliverable": "Pilot report",
          "depends_on": "Working first version",
          "duration": "4-8 weeks",
          "owner": "Founders"
        },
        {
          "id": "s7-4",
          "label": "Learn and decide what next",
          "detail": "Review what worked and what did not, and decide whether to change, continue or stop.",
          "sub_stage": "First users",
          "experts": "Founders; mentors",
          "resources": "Metrics sheet",
          "deliverable": "Learning review",
          "depends_on": "Pilot report",
          "duration": "1 week",
          "owner": "Founders",
          "gate": "GO / NO-GO"
        },
        {
          "id": "s7-5",
          "label": "Set your first pricing",
          "detail": "Test what customers will pay and set a price you can explain.",
          "sub_stage": "First users",
          "experts": "Founders",
          "resources": "Pricing worksheet",
          "deliverable": "Pricing decision",
          "depends_on": "Pilot report",
          "duration": "1-2 weeks",
          "owner": "Founders"
        }
      ]
    },
    {
      "no": 8,
      "name": "Funding",
      "sub_stages": [
        "Plan",
        "Raise"
      ],
      "tasks": [
        {
          "id": "s8-1",
          "label": "Work out how much money you need",
          "detail": "Build a simple budget for the next 12 to 18 months and decide how much you need and for what.",
          "sub_stage": "Plan",
          "experts": "Founders; a chartered accountant",
          "resources": "Budget template",
          "deliverable": "12-month budget and runway",
          "depends_on": "Pricing decision",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s8-2",
          "label": "Look at grants and non-dilutive money",
          "detail": "Look at government and institutional support for startups, such as BIRAC, DST schemes, ICMR and the Startup India Seed Fund Scheme through approved incubators, and state startup policies. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Plan",
          "experts": "An incubator; mentors",
          "resources": "Scheme websites; this platform's funded problems",
          "deliverable": "Grant shortlist",
          "depends_on": "12-month budget",
          "duration": "2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s8-3",
          "label": "Join an incubator or accelerator if it helps",
          "detail": "Incubators can offer space, mentoring, scheme access and introductions. Compare what each really provides.",
          "sub_stage": "Plan",
          "experts": "Founders",
          "resources": "Incubator listings",
          "deliverable": "Incubator application",
          "depends_on": "DPIIT recognition",
          "duration": "2-6 weeks",
          "owner": "Founders"
        },
        {
          "id": "s8-4",
          "label": "Prepare your pitch and data room",
          "detail": "Prepare a short deck, your financial model, cap table, key contracts and a folder investors can review.",
          "sub_stage": "Raise",
          "experts": "Founders; a mentor",
          "resources": "Pitch deck template; data room checklist",
          "deliverable": "Pitch deck and data room",
          "depends_on": "12-month budget",
          "duration": "2-3 weeks",
          "owner": "Founders"
        },
        {
          "id": "s8-5",
          "label": "Understand investment terms",
          "detail": "Learn valuation, liquidation preference, anti-dilution, board seats and the instruments used in India, such as equity, compulsorily convertible preference shares and convertible notes. Have a lawyer review any term sheet. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Raise",
          "experts": "A startup lawyer",
          "resources": "Term sheet guides",
          "deliverable": "Term sheet checklist",
          "depends_on": "Pitch deck",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s8-6",
          "label": "Close the round properly",
          "detail": "After you sign, complete the board and shareholder approvals, issue shares and make the required filings, including any foreign investment reporting. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Raise",
          "experts": "A lawyer; a company secretary",
          "resources": "MCA and RBI reporting portals",
          "deliverable": "Closing set and filings",
          "depends_on": "Term sheet signed",
          "duration": "2-4 weeks",
          "owner": "Founders",
          "gate": "GO / NO-GO"
        }
      ]
    },
    {
      "no": 9,
      "name": "Operate and stay compliant",
      "sub_stages": [
        "Compliance",
        "People"
      ],
      "tasks": [
        {
          "id": "s9-1",
          "label": "Set up a compliance calendar",
          "detail": "List every recurring filing and meeting: board meetings, annual general meeting, annual returns, financial statements, income tax, TDS and GST returns, and director KYC. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "Compliance",
          "experts": "A company secretary",
          "resources": "Compliance calendar template",
          "deliverable": "Compliance calendar",
          "depends_on": "Certificate of incorporation",
          "duration": "3-5 days",
          "owner": "Founders"
        },
        {
          "id": "s9-2",
          "label": "Hold your meetings and keep minutes",
          "detail": "Hold the required board meetings and the annual general meeting, and keep proper minutes.",
          "sub_stage": "Compliance",
          "experts": "Company secretary",
          "resources": "Minute book",
          "deliverable": "Meeting minutes",
          "depends_on": "",
          "duration": "Ongoing",
          "owner": "Founders"
        },
        {
          "id": "s9-3",
          "label": "File your annual returns and accounts",
          "detail": "Prepare audited financial statements and file your annual returns with the registrar and your income tax return every year.",
          "sub_stage": "Compliance",
          "experts": "Chartered accountant; company secretary",
          "resources": "MCA and income tax portals",
          "deliverable": "Annual filings completed",
          "depends_on": "Accounting set up",
          "duration": "Ongoing",
          "owner": "Founders"
        },
        {
          "id": "s9-4",
          "label": "Hire properly",
          "detail": "Give written offer letters, follow minimum wage and leave rules, register for provident fund and ESI when due, and set up a policy against workplace harassment where it applies. Rules, fees and thresholds change — confirm the current position with a chartered accountant or company secretary.",
          "sub_stage": "People",
          "experts": "An HR advisor or lawyer",
          "resources": "HR templates",
          "deliverable": "Hiring pack and policies",
          "depends_on": "Contracts in place",
          "duration": "1-2 weeks",
          "owner": "Founders"
        },
        {
          "id": "s9-5",
          "label": "Review the company's health every quarter",
          "detail": "Check cash, runway, compliance status and progress against goals, and update your plan.",
          "sub_stage": "Compliance",
          "experts": "Founders",
          "resources": "Dashboard sheet",
          "deliverable": "Quarterly review",
          "depends_on": "",
          "duration": "Ongoing",
          "owner": "Founders"
        }
      ]
    }
  ],
  "playbook": {
    "model": [],
    "cost_inputs": [
      {
        "category": "Company registration",
        "input": "Government fees plus professional fees; varies by state and capital",
        "why": "You cannot open a bank account or sign contracts as a company without it.",
        "approach": "Get a fixed quote from a company secretary or CA before you start."
      },
      {
        "category": "Trademark",
        "input": "Government fee per class; lower for recognised startups",
        "why": "Protects your name and logo before you build a brand.",
        "approach": "File in the classes that match what you sell."
      },
      {
        "category": "Legal documents",
        "input": "Founders' agreement, contracts and IP assignment",
        "why": "Disputes between founders are a common reason startups fail.",
        "approach": "Agree a fixed fee for a standard set from a startup lawyer."
      },
      {
        "category": "Accounting and compliance",
        "input": "Monthly bookkeeping, tax and annual filings",
        "why": "Missed filings bring penalties and put off investors.",
        "approach": "Hire a part-time CA or an accounting firm for startups."
      }
    ],
    "how_to_use": [
      "This is a free guide for every signed-in member. Work through the phases in order; each one lists the tasks, who can help and what you should have at the end.",
      "Tick the steps you have completed and your progress is saved to your account.",
      "It is written as general guidance for founders in India, not legal, tax or financial advice. Rules, fees and thresholds change, so confirm the current position with a chartered accountant, company secretary or lawyer before you act.",
      "Healthcare products often need extra licences. When you reach the sector rules step, use the medical device and SaMD roadmaps on this platform."
    ]
  }
};
