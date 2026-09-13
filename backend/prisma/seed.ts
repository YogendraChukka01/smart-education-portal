import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  ROLES,
  OPPORTUNITY_TYPES,
  AUDIENCE_TYPES,
  APPLICATION_STATUS,
  SKILL_CATEGORIES,
  PORTFOLIO_ITEM_TYPES,
  MENTORSHIP_EVENT_TYPES,
  ENGINEERING_DEPARTMENTS,
  ENGINEERING_BRANCHES,
  ALUMNI_POST_TYPES,
  ALUMNI_POST_STATUS,
} from '@ayush-portal/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Engineering Academia-Industry Database Seeding...');

  // Clean existing tables in correct FK dependency order
  await prisma.auditLog.deleteMany();
  await prisma.mentorshipRequest.deleteMany();
  await prisma.companyPlacementStat.deleteMany();
  await prisma.resumeDraft.deleteMany();
  await prisma.alumniPostLike.deleteMany();
  await prisma.alumniPostComment.deleteMany();
  await prisma.alumniPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.codingSubmission.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.placedStudent.deleteMany();
  await prisma.internshipOutcomeStory.deleteMany();
  await prisma.alumniProfile.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.studentSkillScore.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.mentorshipEvent.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.careerRole.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.academicianProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.department.deleteMany();
  await prisma.company.deleteMany();
  await prisma.institution.deleteMany();

  console.log('🧹 Cleaned up existing database records.');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed the primary institution: Audisankara University
  const audisankara = await prisma.institution.create({
    data: {
      name: 'Audisankara University',
      type: 'Deemed-to-be University with Audisankara College of Engineering & Technology (ASCET)',
      location: 'Andhra Pradesh, India',
      code: 'ASU-AP-01',
      address: 'Audisankara University campus, Andhra Pradesh, India',
      website: 'https://audisankarauniversity.edu.in',
    },
  });

  const coepSecondary = await prisma.institution.create({
    data: {
      name: 'COEP Technological University, Pune',
      type: 'Premier State Technological University',
      location: 'Shivajinagar, Pune, Maharashtra',
      code: 'COEP-PUN-02',
      address: 'Wellesley Rd, Shivajinagar, Pune, Maharashtra 411005',
      website: 'https://www.coep.org.in',
      placementOfficerName: 'Dr. S. K. Joshi',
      placementOfficerEmail: 'placement@coeptech.ac.in',
      placementOfficerPhone: '+91 20 2550 7000',
    },
  });

  // 2. Seed Academic Hierarchy: Departments & Branches
  const deptRecords: Record<string, any> = {};
  const branchRecords: Record<string, any> = {};

  const deptCodes: Record<string, string> = {
    'Computer Science & Engineering': 'CSE',
    'Information Technology': 'IT',
    'Electronics & Telecommunication': 'ENTC',
    'Mechanical Engineering': 'MECH',
    'Civil Engineering': 'CIVIL',
    'Electrical Engineering': 'EE',
  };

  for (const deptName of ENGINEERING_DEPARTMENTS) {
    const dept = await prisma.department.create({
      data: {
        institutionId: audisankara.id,
        name: deptName,
        code: deptCodes[deptName] || 'DEPT',
      },
    });
    deptRecords[deptName] = dept;

    const branches = ENGINEERING_BRANCHES[deptName] || [deptName];
    for (const bName of branches) {
      const branch = await prisma.branch.create({
        data: {
          departmentId: dept.id,
          name: bName,
          code: bName.split(' ').map((w) => w[0]).join('').toUpperCase(),
        },
      });
      branchRecords[bName] = branch;
    }
  }

  console.log('🏛️ Seeded Engineering Departments & Branches for Audisankara University.');

  // 3. Seed Companies Across Engineering Sectors
  const tcs = await prisma.company.create({
    data: {
      name: 'Tata Consultancy Services (TCS Digital Labs)',
      industryType: 'Enterprise Software & Cloud Systems',
      description: 'Global IT and engineering solutions leader driving enterprise digital transformation.',
      website: 'https://www.tcs.com',
      location: 'Pune & Bengaluru, India',
      companySize: '100,000+ employees',
      recruiterName: 'Anand Kulkarni (Head University Relations)',
      recruiterEmail: 'university.hiring@tcs.com',
      hiringDomains: JSON.stringify(['Cloud Architecture', 'Java Microservices', 'Full Stack', 'AI/ML']),
    },
  });

  const bosch = await prisma.company.create({
    data: {
      name: 'Bosch Mobility Solutions India',
      industryType: 'Automotive, IoT & Embedded Engineering',
      description: 'Pioneering automotive technologies, autonomous driving, and industrial IoT systems.',
      website: 'https://www.bosch.in',
      location: 'Bengaluru & Pune, India',
      companySize: '50,000+ employees',
      recruiterName: 'Neha Sharma (Campus Talent Acquisition)',
      recruiterEmail: 'campus.talent@in.bosch.com',
      hiringDomains: JSON.stringify(['Embedded Systems', 'Robotics', 'AUTOSAR', 'CAD/CAM']),
    },
  });

  const lnt = await prisma.company.create({
    data: {
      name: 'Larsen & Toubro (L&T Engineering)',
      industryType: 'Infrastructure, Heavy Engineering & BIM',
      description: "India's leading multinational conglomerate in technology, engineering, and construction.",
      website: 'https://www.larsentoubro.com',
      location: 'Mumbai & Chennai, India',
      companySize: '50,000+ employees',
      recruiterName: 'Rajesh Nair',
      recruiterEmail: 'careers@larsentoubro.com',
      hiringDomains: JSON.stringify(['Structural Design', 'STAAD.Pro', 'Heavy Machinery', 'BIM Modelling']),
    },
  });

  const aws = await prisma.company.create({
    data: {
      name: 'Amazon Web Services (AWS India)',
      industryType: 'Cloud Infrastructure & Distributed Systems',
      description: "World's most comprehensive and broadly adopted cloud platform.",
      website: 'https://aws.amazon.com',
      location: 'Hyderabad & Bengaluru, India',
      companySize: '10,000+ employees',
      recruiterName: 'Priya Iyer',
      recruiterEmail: 'aws-university@amazon.com',
      hiringDomains: JSON.stringify(['Cloud DevOps', 'Serverless', 'Distributed DBs', 'Kubernetes']),
    },
  });

  const qualcomm = await prisma.company.create({
    data: {
      name: 'Qualcomm Wireless R&D India',
      industryType: 'Semiconductors, 5G & VLSI Design',
      description: 'Global leader in wireless technology and semiconductor processor architecture.',
      website: 'https://www.qualcomm.com',
      location: 'Bengaluru & Hyderabad, India',
      companySize: '20,000+ employees',
      recruiterName: 'Vikram Mehta',
      recruiterEmail: 'university-india@qualcomm.com',
      hiringDomains: JSON.stringify(['VLSI Design', 'ARM Architecture', 'SystemVerilog', 'DSP']),
    },
  });

  // 4. Seed Standardized Engineering Skills
  const skillsData = [
    // Programming & Frameworks
    { name: 'Java & Object-Oriented Programming', category: SKILL_CATEGORIES.PROGRAMMING, dept: 'Computer Science & Engineering', weight: 1.5 },
    { name: 'Data Structures & Algorithms', category: SKILL_CATEGORIES.PROGRAMMING, dept: 'Computer Science & Engineering', weight: 1.6 },
    { name: 'Spring Boot & Microservices', category: SKILL_CATEGORIES.FRAMEWORKS, dept: 'Computer Science & Engineering', weight: 1.4 },
    { name: 'React & Modern Frontend', category: SKILL_CATEGORIES.FRAMEWORKS, dept: 'Computer Science & Engineering', weight: 1.3 },
    { name: 'Node.js & Express REST APIs', category: SKILL_CATEGORIES.FRAMEWORKS, dept: 'Computer Science & Engineering', weight: 1.3 },
    { name: 'Python & FastApi Architecture', category: SKILL_CATEGORIES.PROGRAMMING, dept: 'Computer Science & Engineering', weight: 1.4 },
    { name: 'C++ & Low-Level Systems Programming', category: SKILL_CATEGORIES.PROGRAMMING, dept: 'Computer Science & Engineering', weight: 1.4 },

    // Databases & Cloud
    { name: 'SQL & Relational Database Design', category: SKILL_CATEGORIES.DATABASES, dept: 'Computer Science & Engineering', weight: 1.3 },
    { name: 'Docker & Containerization', category: SKILL_CATEGORIES.CLOUD_DEVOPS, dept: 'Computer Science & Engineering', weight: 1.4 },
    { name: 'AWS Cloud Architecture', category: SKILL_CATEGORIES.CLOUD_DEVOPS, dept: 'Computer Science & Engineering', weight: 1.5 },
    { name: 'Kubernetes & CI/CD Pipelines', category: SKILL_CATEGORIES.CLOUD_DEVOPS, dept: 'Computer Science & Engineering', weight: 1.4 },
    { name: 'Cybersecurity & Network Security', category: SKILL_CATEGORIES.CLOUD_DEVOPS, dept: 'Computer Science & Engineering', weight: 1.4 },

    // AI & Data Science
    { name: 'Machine Learning & Python Analytics', category: SKILL_CATEGORIES.AI_ML_DATA, dept: 'Computer Science & Engineering', weight: 1.4 },
    { name: 'Deep Learning & Neural Networks', category: SKILL_CATEGORIES.AI_ML_DATA, dept: 'Computer Science & Engineering', weight: 1.4 },
    { name: 'Data Engineering & Apache Spark', category: SKILL_CATEGORIES.AI_ML_DATA, dept: 'Computer Science & Engineering', weight: 1.3 },
    { name: 'MLOps & Model Deployment', category: SKILL_CATEGORIES.AI_ML_DATA, dept: 'Computer Science & Engineering', weight: 1.3 },

    // Core Engineering: Mechanical
    { name: 'SolidWorks & 3D CAD Modeling', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Mechanical Engineering', weight: 1.5 },
    { name: 'Finite Element Analysis (FEA / ANSYS)', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Mechanical Engineering', weight: 1.4 },
    { name: 'Robotics & ROS Automation', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Mechanical Engineering', weight: 1.3 },
    { name: 'Manufacturing Processes & CNC Machining', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Mechanical Engineering', weight: 1.3 },

    // Core Engineering: ENTC & Electrical
    { name: 'Embedded C & ARM Microcontrollers', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Electronics & Telecommunication', weight: 1.5 },
    { name: 'VLSI & Verilog Hardware Design', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Electronics & Telecommunication', weight: 1.4 },
    { name: 'IoT Protocols & Sensor Interfacing', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Electronics & Telecommunication', weight: 1.3 },
    { name: 'Power Systems & MATLAB Simulation', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Electrical Engineering', weight: 1.4 },
    { name: 'PLC Automation & SCADA Systems', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Electrical Engineering', weight: 1.3 },

    // Core Engineering: Civil
    { name: 'Structural Analysis & STAAD.Pro', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Civil Engineering', weight: 1.5 },
    { name: 'BIM & Autodesk Revit Design', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Civil Engineering', weight: 1.4 },
    { name: 'Geotechnical & Construction Management', category: SKILL_CATEGORIES.CORE_ENGINEERING, dept: 'Civil Engineering', weight: 1.3 },

    // Common Aptitude & Soft Skills
    { name: 'Quantitative & Logical Aptitude', category: SKILL_CATEGORIES.APTITUDE_SOFT_SKILLS, dept: 'Common', weight: 1.2 },
    { name: 'Technical Communication & Leadership', category: SKILL_CATEGORIES.APTITUDE_SOFT_SKILLS, dept: 'Common', weight: 1.1 },
  ];

  const skillRecords: Record<string, any> = {};
  for (const sk of skillsData) {
    const s = await prisma.skill.create({
      data: {
        name: sk.name,
        category: sk.category,
        departmentName: sk.dept,
        description: `Standardized engineering competency for ${sk.name}`,
        industryDemandWeight: sk.weight,
      },
    });
    skillRecords[sk.name] = s;
  }

  console.log(`⚡ Seeded ${Object.keys(skillRecords).length} Standardized Engineering Skills.`);

  // 5. Seed Comprehensive Branch-Aware Career Roles
  const careerRolesData = [
    // CSE / IT Careers
    {
      title: 'Java Backend Developer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      description: 'Designs and builds enterprise microservices, REST APIs, and scalable relational data pipelines.',
      requiredSkills: [
        { skillName: 'Java & Object-Oriented Programming', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Data Structures & Algorithms', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'Spring Boot & Microservices', minLevel: 75, weight: 5, isMandatory: true },
        { skillName: 'SQL & Relational Database Design', minLevel: 70, weight: 4, isMandatory: true },
        { skillName: 'Docker & Containerization', minLevel: 50, weight: 3, isMandatory: false },
      ],
      preferredSkills: ['AWS Cloud Architecture', 'Docker & Containerization'],
      recommendedProjects: [
        'Build a multi-tenant REST API with Spring Boot, Spring Security, and JWT Auth',
        'Containerize a multi-service architecture using Docker Compose & PostgreSQL',
      ],
      minCgpa: 7.0,
    },
    {
      title: 'Full Stack Developer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      description: 'Builds responsive frontends with React and robust backend microservices with Node.js/Java.',
      requiredSkills: [
        { skillName: 'React & Modern Frontend', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Node.js & Express REST APIs', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'SQL & Relational Database Design', minLevel: 70, weight: 4, isMandatory: true },
        { skillName: 'Data Structures & Algorithms', minLevel: 70, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Docker & Containerization', 'AWS Cloud Architecture'],
      recommendedProjects: [
        'Real-time collaborative Kanban board with React, Node.js, and WebSockets',
      ],
      minCgpa: 6.8,
    },
    {
      title: 'Frontend Developer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      description: 'Creates modern, high-performance web applications, component libraries, and interactive UIs.',
      requiredSkills: [
        { skillName: 'React & Modern Frontend', minLevel: 85, weight: 5, isMandatory: true },
        { skillName: 'Data Structures & Algorithms', minLevel: 65, weight: 3, isMandatory: true },
        { skillName: 'Technical Communication & Leadership', minLevel: 70, weight: 2, isMandatory: false },
      ],
      preferredSkills: ['Node.js & Express REST APIs'],
      recommendedProjects: ['Production-ready SaaS UI design system with Tailwind CSS and React Query'],
      minCgpa: 6.5,
    },
    {
      title: 'Backend Developer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      description: 'Engineers high-throughput APIs, caching layers, database indexing, and event queues.',
      requiredSkills: [
        { skillName: 'Java & Object-Oriented Programming', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'SQL & Relational Database Design', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Data Structures & Algorithms', minLevel: 75, weight: 4, isMandatory: true },
      ],
      preferredSkills: ['Docker & Containerization', 'Kubernetes & CI/CD Pipelines'],
      recommendedProjects: ['Distributed URL shortener with Redis caching and rate-limiting middleware'],
      minCgpa: 7.0,
    },
    {
      title: 'Cloud & DevOps Engineer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      description: 'Automates infrastructure provisioning, container orchestration, and multi-region CI/CD pipelines.',
      requiredSkills: [
        { skillName: 'AWS Cloud Architecture', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Docker & Containerization', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Kubernetes & CI/CD Pipelines', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'Python & FastApi Architecture', minLevel: 65, weight: 3, isMandatory: false },
      ],
      preferredSkills: ['Cybersecurity & Network Security'],
      recommendedProjects: ['Terraform IaC deployment of scalable microservices on AWS EKS with Prometheus monitoring'],
      minCgpa: 7.0,
    },
    {
      title: 'Cybersecurity Engineer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Cyber Security',
      description: 'Secures networks, performs vulnerability assessments, and implements zero-trust authorization.',
      requiredSkills: [
        { skillName: 'Cybersecurity & Network Security', minLevel: 85, weight: 5, isMandatory: true },
        { skillName: 'Python & FastApi Architecture', minLevel: 70, weight: 3, isMandatory: true },
        { skillName: 'AWS Cloud Architecture', minLevel: 70, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Docker & Containerization'],
      recommendedProjects: ['Automated vulnerability scanner and intrusion detection system using Python & Snort'],
      minCgpa: 7.0,
    },

    // AI & Data Science Careers
    {
      title: 'Data Scientist & ML Engineer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Artificial Intelligence & Machine Learning',
      description: 'Develops predictive statistical models, deep neural architectures, and intelligent data pipelines.',
      requiredSkills: [
        { skillName: 'Machine Learning & Python Analytics', minLevel: 85, weight: 5, isMandatory: true },
        { skillName: 'Deep Learning & Neural Networks', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'Data Structures & Algorithms', minLevel: 70, weight: 3, isMandatory: true },
        { skillName: 'SQL & Relational Database Design', minLevel: 70, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['MLOps & Model Deployment', 'Data Engineering & Apache Spark'],
      recommendedProjects: [
        'End-to-end sentiment and multi-class classification API with PyTorch, FastAPI, and Docker',
      ],
      minCgpa: 7.2,
    },
    {
      title: 'Data Analyst',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Data Science',
      description: 'Extracts business intelligence, creates executive dashboards, and performs cohort analytics.',
      requiredSkills: [
        { skillName: 'SQL & Relational Database Design', minLevel: 85, weight: 5, isMandatory: true },
        { skillName: 'Machine Learning & Python Analytics', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'Quantitative & Logical Aptitude', minLevel: 80, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Python & FastApi Architecture'],
      recommendedProjects: ['Interactive sales conversion dashboard with PostgreSQL and Python Streamlit'],
      minCgpa: 6.5,
    },
    {
      title: 'Data Engineer',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Data Science',
      description: 'Builds petabyte-scale data pipelines, ETL workflows, and distributed data lakes.',
      requiredSkills: [
        { skillName: 'Data Engineering & Apache Spark', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'SQL & Relational Database Design', minLevel: 80, weight: 4, isMandatory: true },
        { skillName: 'Python & FastApi Architecture', minLevel: 75, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['AWS Cloud Architecture', 'Docker & Containerization'],
      recommendedProjects: ['Streaming analytics pipeline with Apache Kafka, Spark Streaming, and Delta Lake'],
      minCgpa: 7.0,
    },

    // Mechanical Engineering Careers
    {
      title: 'CAD Mechanical Design Engineer',
      departmentName: 'Mechanical Engineering',
      branchName: 'Mechanical Engineering',
      description: 'Performs precision 3D CAD modeling, FEA stress analysis, and mechanical assembly simulations.',
      requiredSkills: [
        { skillName: 'SolidWorks & 3D CAD Modeling', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Finite Element Analysis (FEA / ANSYS)', minLevel: 75, weight: 5, isMandatory: true },
        { skillName: 'Quantitative & Logical Aptitude', minLevel: 70, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Robotics & ROS Automation', 'Manufacturing Processes & CNC Machining'],
      recommendedProjects: ['Design a planetary gearbox assembly with stress simulation in ANSYS'],
      minCgpa: 6.8,
    },
    {
      title: 'Robotics & Automation Engineer',
      departmentName: 'Mechanical Engineering',
      branchName: 'Robotics & Automation',
      description: 'Integrates kinematic robotic manipulators, ROS2 control loops, and industrial sensors.',
      requiredSkills: [
        { skillName: 'Robotics & ROS Automation', minLevel: 85, weight: 5, isMandatory: true },
        { skillName: 'Embedded C & ARM Microcontrollers', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'SolidWorks & 3D CAD Modeling', minLevel: 70, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Python & FastApi Architecture'],
      recommendedProjects: ['Autonomous mobile robot navigation and obstacle avoidance using ROS2 and LiDAR'],
      minCgpa: 7.0,
    },
    {
      title: 'Manufacturing & Production Engineer',
      departmentName: 'Mechanical Engineering',
      branchName: 'Mechanical Engineering',
      description: 'Optimizes production line throughput, CNC toolpaths, and quality assurance workflows.',
      requiredSkills: [
        { skillName: 'Manufacturing Processes & CNC Machining', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'SolidWorks & 3D CAD Modeling', minLevel: 70, weight: 4, isMandatory: true },
        { skillName: 'Quantitative & Logical Aptitude', minLevel: 75, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Finite Element Analysis (FEA / ANSYS)'],
      recommendedProjects: ['Toolpath optimization for multi-axis CNC milling to reduce cycle time by 20%'],
      minCgpa: 6.5,
    },

    // ENTC & Electronics Careers
    {
      title: 'Embedded Systems & Firmware Engineer',
      departmentName: 'Electronics & Telecommunication',
      branchName: 'VLSI & Embedded Systems',
      description: 'Develops real-time firmware, device drivers, and ARM Cortex microcontroller integrations.',
      requiredSkills: [
        { skillName: 'Embedded C & ARM Microcontrollers', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'VLSI & Verilog Hardware Design', minLevel: 70, weight: 4, isMandatory: true },
        { skillName: 'Data Structures & Algorithms', minLevel: 65, weight: 3, isMandatory: false },
      ],
      preferredSkills: ['IoT Protocols & Sensor Interfacing'],
      recommendedProjects: ['Bare-metal UART & SPI communication driver for ARM Cortex-M4'],
      minCgpa: 7.0,
    },
    {
      title: 'VLSI Design Engineer',
      departmentName: 'Electronics & Telecommunication',
      branchName: 'VLSI & Embedded Systems',
      description: 'Synthesizes RTL Verilog modules, executes timing closure, and validates FPGA designs.',
      requiredSkills: [
        { skillName: 'VLSI & Verilog Hardware Design', minLevel: 85, weight: 5, isMandatory: true },
        { skillName: 'Embedded C & ARM Microcontrollers', minLevel: 70, weight: 4, isMandatory: true },
        { skillName: 'Quantitative & Logical Aptitude', minLevel: 75, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['C++ & Low-Level Systems Programming'],
      recommendedProjects: ['Pipelined 32-bit RISC-V processor core implementation in Verilog on Xilinx FPGA'],
      minCgpa: 7.2,
    },
    {
      title: 'IoT & Connected Systems Engineer',
      departmentName: 'Electronics & Telecommunication',
      branchName: 'Electronics & Telecommunication Engineering',
      description: 'Builds edge-to-cloud IoT architectures, MQTT telemetry pipelines, and sensor nodes.',
      requiredSkills: [
        { skillName: 'IoT Protocols & Sensor Interfacing', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Embedded C & ARM Microcontrollers', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'AWS Cloud Architecture', minLevel: 65, weight: 3, isMandatory: false },
      ],
      preferredSkills: ['Python & FastApi Architecture'],
      recommendedProjects: ['Industrial vibration monitoring node with ESP32, MQTT, and AWS IoT Core'],
      minCgpa: 6.8,
    },

    // Civil Engineering Careers
    {
      title: 'Structural Design Engineer',
      departmentName: 'Civil Engineering',
      branchName: 'Structural & Construction Engineering',
      description: 'Designs multi-story concrete and steel frames, seismic dampers, and foundation layouts.',
      requiredSkills: [
        { skillName: 'Structural Analysis & STAAD.Pro', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'BIM & Autodesk Revit Design', minLevel: 75, weight: 4, isMandatory: true },
        { skillName: 'Quantitative & Logical Aptitude', minLevel: 75, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Geotechnical & Construction Management'],
      recommendedProjects: ['Seismic analysis and design of a G+12 residential building in STAAD.Pro'],
      minCgpa: 6.8,
    },
    {
      title: 'BIM & Civil Construction Engineer',
      departmentName: 'Civil Engineering',
      branchName: 'Civil Engineering',
      description: 'Coordinates 4D BIM construction schedules, quantity surveying, and digital site models.',
      requiredSkills: [
        { skillName: 'BIM & Autodesk Revit Design', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'Geotechnical & Construction Management', minLevel: 75, weight: 4, isMandatory: true },
      ],
      preferredSkills: ['Structural Analysis & STAAD.Pro'],
      recommendedProjects: ['Parametric 3D BIM coordination model with clash detection in Autodesk Revit'],
      minCgpa: 6.5,
    },

    // Electrical Engineering Careers
    {
      title: 'Power Systems & Grid Engineer',
      departmentName: 'Electrical Engineering',
      branchName: 'Electrical Engineering',
      description: 'Simulates high-voltage transmission grids, renewable integration, and protection relays.',
      requiredSkills: [
        { skillName: 'Power Systems & MATLAB Simulation', minLevel: 80, weight: 5, isMandatory: true },
        { skillName: 'PLC Automation & SCADA Systems', minLevel: 70, weight: 4, isMandatory: true },
        { skillName: 'Quantitative & Logical Aptitude', minLevel: 75, weight: 3, isMandatory: true },
      ],
      preferredSkills: ['Embedded C & ARM Microcontrollers'],
      recommendedProjects: ['Solar PV microgrid simulation with MPPT algorithm in MATLAB Simulink'],
      minCgpa: 6.8,
    },
    {
      title: 'Control Systems & PLC Engineer',
      departmentName: 'Electrical Engineering',
      branchName: 'Electrical Engineering',
      description: 'Programs industrial PLC ladders, SCADA monitoring screens, and feedback servo controls.',
      requiredSkills: [
        { skillName: 'PLC Automation & SCADA Systems', minLevel: 85, weight: 5, isMandatory: true },
        { skillName: 'Power Systems & MATLAB Simulation', minLevel: 70, weight: 4, isMandatory: true },
      ],
      preferredSkills: ['IoT Protocols & Sensor Interfacing'],
      recommendedProjects: ['Automated bottling plant control system using Siemens PLC and WinCC SCADA'],
      minCgpa: 6.8,
    },
  ];

  for (const cr of careerRolesData) {
    await prisma.careerRole.create({
      data: {
        title: cr.title,
        departmentName: cr.departmentName,
        branchName: cr.branchName,
        description: cr.description,
        requiredSkillsJson: JSON.stringify(cr.requiredSkills),
        preferredSkillsJson: JSON.stringify(cr.preferredSkills),
        recommendedProjectsJson: JSON.stringify(cr.recommendedProjects),
        minCgpa: cr.minCgpa,
      },
    });
  }

  console.log(`🎯 Seeded ${careerRolesData.length} Branch-Aware Career Roles.`);

  // 6. Seed Coding & MCQ Assessment Questions
  const codingQuestions = [
    {
      skillName: 'Data Structures & Algorithms',
      questionType: 'coding',
      questionText: 'Two Sum Problem (Optimized Hash Map Solution)',
      scenarioText: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You must implement an O(N) single-pass hash map algorithm.',
      difficulty: 'easy',
      departmentName: 'Computer Science & Engineering',
      marks: 20,
      constraints: '2 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
      ],
    },
    {
      skillName: 'Data Structures & Algorithms',
      questionType: 'coding',
      questionText: 'Binary Search in Rotated Sorted Array',
      scenarioText: 'Given the sorted array `nums` possibly rotated at an unknown pivot index, and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`. Algorithm must achieve O(log N) runtime.',
      difficulty: 'medium',
      departmentName: 'Computer Science & Engineering',
      marks: 25,
      constraints: '1 <= nums.length <= 5000, -10^4 <= nums[i] <= 10^4, All values of nums are unique.',
      examples: [
        { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
        { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
      ],
    },
    {
      skillName: 'Spring Boot & Microservices',
      questionType: 'coding',
      questionText: 'Spring Boot REST Controller for Student Enrollment',
      scenarioText: 'Write a Spring Boot `@RestController` with endpoints `POST /api/students` (with `@Valid` DTO) and `GET /api/students/{id}` with proper `@ExceptionHandler` for `StudentNotFoundException`.',
      difficulty: 'medium',
      departmentName: 'Computer Science & Engineering',
      marks: 30,
      constraints: 'Java 17+, Spring Boot 3.x, Include Swagger annotations if applicable.',
      examples: [
        { input: 'POST /api/students with body: {"name": "Roshan", "email": "roshan@mitaoe.ac.in", "cgpa": 8.2}', output: 'HTTP 201 Created with JSON representation' },
      ],
    },
    {
      skillName: 'Embedded C & ARM Microcontrollers',
      questionType: 'coding',
      questionText: 'Bare-Metal UART Initialization & Ring Buffer Driver',
      scenarioText: 'Implement a non-blocking UART transmit and receive driver in Embedded C for ARM Cortex-M4 utilizing circular ring buffers and interrupt service routines (ISR).',
      difficulty: 'hard',
      departmentName: 'Electronics & Telecommunication',
      marks: 35,
      constraints: 'Standard ANSI C99, MISRA-C compliant, baud rate calculation macro included.',
      examples: [
        { input: 'uart_init(115200); uart_write_buffer("HELLO\\r\\n", 7);', output: 'Transmitted via USART TX interrupt ring buffer without blocking CPU.' },
      ],
    },
  ];

  for (const q of codingQuestions) {
    const skill = skillRecords[q.skillName];
    if (skill) {
      await prisma.assessmentQuestion.create({
        data: {
          skillId: skill.id,
          questionType: q.questionType,
          questionText: q.questionText,
          scenarioText: q.scenarioText,
          optionsJson: '[]',
          difficulty: q.difficulty,
          departmentName: q.departmentName,
          marks: q.marks,
          constraints: q.constraints,
          examplesJson: JSON.stringify(q.examples),
          isActive: true,
        },
      });
    }
  }

  // 7. Seed Core Users & Profiles (All 6 Demo Accounts)

  // Student 1: Roshan Shinde (CSE)
  const student1User = await prisma.user.create({
    data: {
      email: 'student.demo@edubridge.local',
      passwordHash,
      role: ROLES.STUDENT,
      institutionId: audisankara.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Also create student@demo.com alias user
  const student1Alias = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      passwordHash,
      role: ROLES.STUDENT,
      institutionId: audisankara.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student1Profile = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      name: 'Roshan Shinde',
      degree: 'B.Tech',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      year: 3,
      semester: 6,
      rollNumber: '112103045',
      enrollmentNumber: 'EN2103045',
      cgpa: 8.2,
      academicRank: 4,
      departmentRank: 3,
      branchRank: 2,
      batchRank: 5,
      graduationYear: 2026,
      portfolioSlug: 'roshan-shinde-mitaoe',
      bio: 'Pre-final year Computer Engineering student at Audisankara University. Passionate about scalable distributed systems, Spring Boot microservices, and database optimization.',
      careerGoal: 'Java Backend Engineer / Cloud Systems Architect at leading technology firms.',
      githubUrl: 'https://github.com/roshanshinde',
      linkedinUrl: 'https://linkedin.com/in/roshanshinde-mitaoe',
      resumeUrl: '/uploads/resumes/Roshan_Shinde_Resume.pdf',
      profileCompletedPct: 85,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: student1Alias.id,
      name: 'Roshan Shinde',
      degree: 'B.Tech',
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      year: 3,
      semester: 6,
      rollNumber: '112103045',
      enrollmentNumber: 'EN2103045',
      cgpa: 8.2,
      academicRank: 4,
      departmentRank: 3,
      branchRank: 2,
      batchRank: 5,
      graduationYear: 2026,
      portfolioSlug: 'roshan-shinde-mitaoe-demo',
      bio: 'Pre-final year Computer Engineering student at Audisankara University. Passionate about scalable distributed systems, Spring Boot microservices, and database optimization.',
      careerGoal: 'Java Backend Engineer / Cloud Systems Architect at leading technology firms.',
      githubUrl: 'https://github.com/roshanshinde',
      linkedinUrl: 'https://linkedin.com/in/roshanshinde-mitaoe',
      resumeUrl: '/uploads/resumes/Roshan_Shinde_Resume.pdf',
      profileCompletedPct: 85,
    },
  });

  // Assign Skill Scores for Student 1
  const student1Skills = [
    { name: 'Java & Object-Oriented Programming', score: 85 },
    { name: 'Data Structures & Algorithms', score: 82 },
    { name: 'SQL & Relational Database Design', score: 78 },
    { name: 'React & Modern Frontend', score: 74 },
    { name: 'Spring Boot & Microservices', score: 52 }, // Deficit for role
    { name: 'Docker & Containerization', score: 40 },   // Deficit for role
    { name: 'AWS Cloud Architecture', score: 35 },
    { name: 'Quantitative & Logical Aptitude', score: 88 },
    { name: 'Technical Communication & Leadership', score: 80 },
  ];

  for (const sk of student1Skills) {
    if (skillRecords[sk.name]) {
      await prisma.studentSkillScore.create({
        data: {
          studentId: student1Profile.id,
          skillId: skillRecords[sk.name].id,
          score: sk.score,
          source: sk.score >= 80 ? 'verified' : 'assessed',
        },
      });
    }
  }

  // Student 1 Projects & Certifications
  const proj1 = await prisma.portfolioItem.create({
    data: {
      studentId: student1Profile.id,
      type: PORTFOLIO_ITEM_TYPES.PROJECT,
      title: 'High-Throughput E-Commerce Microservices Engine',
      issuer: 'MITAOE Computer Engineering Capstone',
      description: 'Architected distributed backend with Spring Boot, Redis caching, and PostgreSQL. Implemented JWT authentication and Kafka event-driven order queues handling 5,000 req/sec.',
      technologies: 'Java, Spring Boot, PostgreSQL, Redis, Kafka, Docker',
      role: 'Lead Backend Architect',
      startDate: 'Aug 2025',
      endDate: 'Dec 2025',
      githubUrl: 'https://github.com/roshanshinde/ecommerce-microservices',
      verified: true,
    },
  });

  await prisma.portfolioItem.create({
    data: {
      studentId: student1Profile.id,
      type: PORTFOLIO_ITEM_TYPES.PROJECT,
      title: 'Real-Time Telemetry IoT Dashboard',
      issuer: 'MITAOE Hackathon 2025',
      description: 'Built a responsive analytics dashboard with React, WebSockets, and Node.js for industrial IoT telemetry with automated alerting.',
      technologies: 'React, Node.js, WebSockets, Chart.js, Tailwind CSS',
      role: 'Full Stack Developer',
      startDate: 'Jan 2026',
      endDate: 'Feb 2026',
      githubUrl: 'https://github.com/roshanshinde/iot-telemetry',
      verified: true,
    },
  });

  await prisma.portfolioItem.create({
    data: {
      studentId: student1Profile.id,
      type: PORTFOLIO_ITEM_TYPES.INTERNSHIP_COMPLETION,
      title: 'Software Engineering Intern — Cloud Systems',
      issuer: 'Persistent Systems, Pune',
      description: 'Implemented automated REST test suites, enhanced SQL indexing queries, and contributed to CI/CD pipeline automation.',
      technologies: 'Java, Spring Boot, MySQL, Git, Jenkins',
      role: 'Backend Engineering Intern',
      startDate: 'May 2025',
      endDate: 'Jul 2025',
      verified: true,
    },
  });

  await prisma.portfolioItem.create({
    data: {
      studentId: student1Profile.id,
      type: PORTFOLIO_ITEM_TYPES.CERTIFICATE,
      title: 'Oracle Certified Professional: Java SE 17 Developer',
      issuer: 'Oracle University',
      description: 'Demonstrated mastery of Java language features, concurrency APIs, functional programming, and memory architecture.',
      verified: true,
    },
  });

  // Seed Pre-saved Resume Draft for Roshan Shinde
  await prisma.resumeDraft.create({
    data: {
      studentId: student1Profile.id,
      title: 'Roshan Shinde — Placement Resume',
      targetRole: 'Java Backend Developer',
      templateId: 'ats',
      summary: 'Pre-final year Computer Engineering student at Audisankara University with strong expertise in Java, DSA, Spring Boot microservices, and database architecture. Proven track record in building high-concurrency distributed applications and securing top ranks in technical assessments.',
      careerObjective: 'Aspiring to join an innovative technology organization as a Software Engineer / Java Backend Developer where I can leverage my distributed systems and cloud skills to engineer robust enterprise systems.',
      selectedSkillIdsJson: JSON.stringify([
        skillRecords['Java & Object-Oriented Programming']?.id,
        skillRecords['Data Structures & Algorithms']?.id,
        skillRecords['Spring Boot & Microservices']?.id,
        skillRecords['SQL & Relational Database Design']?.id,
        skillRecords['Docker & Containerization']?.id,
      ].filter(Boolean)),
      selectedProjectIdsJson: JSON.stringify([proj1.id]),
      isPrimary: true,
    },
  });

  // Student 2: Aman Verma (Mechanical)
  const student2User = await prisma.user.create({
    data: {
      email: 'student.mech@demo.com',
      passwordHash,
      role: ROLES.STUDENT,
      institutionId: audisankara.id,
    },
  });

  const student2Profile = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      name: 'Aman Verma',
      degree: 'B.Tech',
      departmentName: 'Mechanical Engineering',
      branchName: 'Mechanical Engineering',
      year: 3,
      semester: 6,
      rollNumber: '112108012',
      cgpa: 8.25,
      academicRank: 2,
      departmentRank: 2,
      branchRank: 1,
      batchRank: 3,
      graduationYear: 2026,
      portfolioSlug: 'aman-verma-mitaoe',
      bio: 'Mechanical Engineering scholar at Audisankara University specializing in 3D CAD modeling, FEA simulations, and automotive powertrain design.',
      profileCompletedPct: 85,
    },
  });

  // Faculty User: Dr. Anjali Joshi (HOD CSE)
  const academicianUser = await prisma.user.create({
    data: {
      email: 'faculty.demo@edubridge.local',
      passwordHash,
      role: ROLES.ACADEMICIAN,
      institutionId: audisankara.id,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const academicianAlias = await prisma.user.create({
    data: {
      email: 'academician@demo.com',
      passwordHash,
      role: ROLES.ACADEMICIAN,
      institutionId: audisankara.id,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const academicianProfile = await prisma.academicianProfile.create({
    data: {
      userId: academicianUser.id,
      name: 'Dr. Anjali Joshi',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science & Engineering',
      designation: 'Professor & Head of Department',
      experienceYears: 18,
      specialization: 'Distributed Cloud Systems & Microservices Architecture',
      researchInterests: JSON.stringify(['Cloud Computing', 'Fault-Tolerant Systems', 'Curriculum Modernization']),
      publications: JSON.stringify([
        'Scalable Transaction Management in Multi-Cloud Microservices (IEEE Trans. 2024)',
        'Adaptive Skill Mapping Framework for Engineering Education (Springer 2025)',
      ]),
      labExpertise: JSON.stringify(['High Performance Computing Lab', 'Cloud & IoT Research Center']),
      expertiseTags: JSON.stringify(['Distributed Systems', 'Cloud Architecture', 'Java Microservices']),
      bio: 'Senior Professor & HOD of Computer Engineering at Audisankara University. Active researcher in distributed cloud systems and AICTE curriculum reforms.',
    },
  });

  await prisma.academicianProfile.create({
    data: {
      userId: academicianAlias.id,
      name: 'Dr. Anjali Joshi',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science & Engineering',
      designation: 'Professor & Head of Department',
      experienceYears: 18,
      specialization: 'Distributed Cloud Systems & Microservices Architecture',
      researchInterests: JSON.stringify(['Cloud Computing', 'Fault-Tolerant Systems', 'Curriculum Modernization']),
      publications: JSON.stringify([
        'Scalable Transaction Management in Multi-Cloud Microservices (IEEE Trans. 2024)',
        'Adaptive Skill Mapping Framework for Engineering Education (Springer 2025)',
      ]),
      labExpertise: JSON.stringify(['High Performance Computing Lab', 'Cloud & IoT Research Center']),
      expertiseTags: JSON.stringify(['Distributed Systems', 'Cloud Architecture', 'Java Microservices']),
      bio: 'Senior Professor & HOD of Computer Engineering at Audisankara University. Active researcher in distributed cloud systems and AICTE curriculum reforms.',
    },
  });

  // Industry User: TCS Digital Labs Recruiter
  const industryUser = await prisma.user.create({
    data: {
      email: 'recruiter.demo@edubridge.local',
      passwordHash,
      role: ROLES.INDUSTRY,
      companyId: tcs.id,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.create({
    data: {
      email: 'industry@demo.com',
      passwordHash,
      role: ROLES.INDUSTRY,
      companyId: tcs.id,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Placement Cell Admin: MITAOE Dean & TPO
  const adminUser = await prisma.user.create({
    data: {
      email: 'placement.demo@edubridge.local',
      passwordHash,
      role: ROLES.INSTITUTION_ADMIN,
      institutionId: audisankara.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      role: ROLES.INSTITUTION_ADMIN,
      institutionId: audisankara.id,
    },
  });

  // Alumni Demo User 1: Rahul Patil (Software Engineer at Microsoft, Class of 2024)
  const alumniUser = await prisma.user.create({
    data: {
      email: 'alumni.demo@edubridge.local',
      passwordHash,
      role: ROLES.ALUMNI,
      institutionId: audisankara.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const alumniAlias = await prisma.user.create({
    data: {
      email: 'alumni@demo.com',
      passwordHash,
      role: ROLES.ALUMNI,
      institutionId: audisankara.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.alumniProfile.create({
    data: {
      userId: alumniUser.id,
      name: 'Rahul Patil',
      graduationYear: 2024,
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      company: 'Microsoft',
      role: 'Software Engineer',
      experienceYears: 2,
      location: 'Hyderabad, India',
      skills: JSON.stringify(['Java', 'Distributed Systems', 'Azure', 'System Design', 'Data Structures']),
      linkedinUrl: 'https://linkedin.com/in/rahul-patil-msft',
      githubUrl: 'https://github.com/rahulpatil',
      bio: 'MITAOE CSE 2024 Alum. Software Engineer at Microsoft. Open for 1:1 resume reviews, system design preparation, and mock placement interviews.',
      careerStoryQuote: 'Building strong foundations in DSA and real-world microservice projects in 3rd year was the turning point for cracking product company rounds.',
      isAvailableForMentorship: true,
    },
  });

  await prisma.alumniProfile.create({
    data: {
      userId: alumniAlias.id,
      name: 'Rahul Patil',
      graduationYear: 2024,
      departmentName: 'Computer Science & Engineering',
      branchName: 'Computer Science & Engineering',
      company: 'Microsoft',
      role: 'Software Engineer',
      experienceYears: 2,
      location: 'Hyderabad, India',
      skills: JSON.stringify(['Java', 'Distributed Systems', 'Azure', 'System Design', 'Data Structures']),
      linkedinUrl: 'https://linkedin.com/in/rahul-patil-msft',
      githubUrl: 'https://github.com/rahulpatil',
      bio: 'MITAOE CSE 2024 Alum. Software Engineer at Microsoft. Open for 1:1 resume reviews, system design preparation, and mock placement interviews.',
      careerStoryQuote: 'Building strong foundations in DSA and real-world microservice projects in 3rd year was the turning point for cracking product company rounds.',
      isAvailableForMentorship: true,
    },
  });

  // Alumni 2: Rohan Deshmukh (Bosch)
  const alumni2User = await prisma.user.create({
    data: {
      email: 'alumni.mech@demo.com',
      passwordHash,
      role: ROLES.ALUMNI,
      institutionId: audisankara.id,
    },
  });

  await prisma.alumniProfile.create({
    data: {
      userId: alumni2User.id,
      name: 'Rohan Deshmukh',
      graduationYear: 2021,
      departmentName: 'Mechanical Engineering',
      branchName: 'Robotics & Automation',
      company: 'Bosch Mobility Solutions',
      role: 'Senior Autonomous Systems Lead',
      experienceYears: 5,
      location: 'Pune, India',
      skills: JSON.stringify(['ROS2', 'SolidWorks', 'C++', 'Computer Vision', 'FEA']),
      linkedinUrl: 'https://linkedin.com/in/rohan-deshmukh-bosch',
      bio: 'MITAOE Mechanical & Robotics Alum. Working on camera-radar sensor fusion algorithms for ADAS.',
      careerStoryQuote: 'Practical simulation experience with ANSYS and ROS was the key differentiator during campus placement rounds.',
      isAvailableForMentorship: true,
    },
  });

  // Alumni Admin: Prof. Rajesh Verma
  const alumniAdminUser = await prisma.user.create({
    data: {
      email: 'alumni.admin@edubridge.local',
      passwordHash,
      role: ROLES.ALUMNI_ADMIN,
      institutionId: audisankara.id,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('👥 Seeded Users for all 6 Verified Roles (Student, Faculty, Industry, Placement, Alumni, Alumni Admin).');

  // 8. Seed Realistic Alumni Posts (Thoughts & Advice)
  const post1 = await prisma.alumniPost.create({
    data: {
      authorUserId: alumniUser.id,
      title: 'How I Prepared for Backend & Distributed Systems Interviews at Microsoft',
      content: `Here is the exact step-by-step roadmap I used during my 3rd and 4th year at MITAOE to crack Microsoft Azure engineering rounds:

1. Data Structures & Algorithms: Mastered HashMaps, Trees, Graphs, and Dynamic Programming on LeetCode (solved ~250 problems focusing on medium-hard problems).
2. Concurrency & Java Internals: Deeply studied JVM memory structure, multithreading, and thread-safe collections.
3. System Design: Practiced designing distributed rate limiters, caching layers with Redis, and Kafka event streaming queues.
4. Capstone Project: Built an end-to-end e-commerce microservices engine and containerized it with Docker.

Advice for 3rd year students: Take your semester capstone project seriously! Recruiters spend 70% of technical interviews asking deep dive questions about your architectural design decisions.`,
      postType: ALUMNI_POST_TYPES.PLACEMENT_EXPERIENCE,
      company: 'Microsoft India',
      role: 'Senior Software Engineer (Azure Core)',
      branchName: 'Computer Science & Engineering',
      graduationYear: 2022,
      tagsJson: JSON.stringify(['Microsoft', 'System Design', 'Java', 'Distributed Systems', 'Interview Tips']),
      status: ALUMNI_POST_STATUS.PUBLISHED,
      isFeatured: true,
      likesCount: 24,
    },
  });

  await prisma.alumniPostComment.create({
    data: {
      postId: post1.id,
      userId: student1User.id,
      content: 'Thank you Pooja maam! This is super helpful. How much focus was on low-level design vs high-level design?',
    },
  });

  await prisma.alumniPostComment.create({
    data: {
      postId: post1.id,
      userId: alumniUser.id,
      content: 'For freshers, Round 1 is mostly LLD (OOPs, design patterns, clean code) followed by HLD basics in Round 2.',
    },
  });

  await prisma.alumniPost.create({
    data: {
      authorUserId: alumni2User.id,
      title: 'Autonomous Vehicles & ADAS: What Mechanical & Robotics Students Should Learn in Sem 6',
      content: `The automotive industry is rapidly pivoting towards software-defined vehicles and autonomous systems.

Top skills demanded at Bosch and global OEMs:
- SolidWorks & 3D Assembly Design for sensor mounts and thermal packaging.
- FEA simulation in ANSYS for vibrational load testing.
- ROS2 (Robot Operating System) and basic C++ for sensor integration.

If you are in Mechanical or ENTC, taking an elective in ROS or embedded programming will significantly differentiate your profile in campus placement drives!`,
      postType: ALUMNI_POST_TYPES.INDUSTRY_TRENDS,
      company: 'Bosch Mobility Solutions',
      role: 'Senior Autonomous Systems Lead',
      branchName: 'Mechanical Engineering',
      graduationYear: 2021,
      tagsJson: JSON.stringify(['Bosch', 'Robotics', 'ROS2', 'SolidWorks', 'Automotive']),
      status: ALUMNI_POST_STATUS.PUBLISHED,
      isFeatured: true,
      likesCount: 18,
    },
  });

  await prisma.alumniPost.create({
    data: {
      authorUserId: alumniUser.id,
      title: 'Campus Placements: 5 Mistakes to Avoid in Your Engineering Placement Resume',
      content: `After reviewing over 100+ engineering resumes, here are the top 5 mistakes that get resumes rejected:

1. Generic skill bars (e.g. "Java 90%") — use verified assessment scores or project proof instead.
2. Missing GitHub or live demo links for projects.
3. Not quantifying impact (e.g. say "handled 5,000 req/sec with Redis caching" instead of "used Redis").
4. Visual clutter — ATS scanners prefer clean, structured, single-column or clean two-column layouts.
5. Inconsistent dates or missing course details.

Use the EduBridge Resume Builder to ensure your resume is ATS-friendly and backed by platform-verified credentials!`,
      postType: ALUMNI_POST_TYPES.CAREER_ADVICE,
      company: 'Microsoft India',
      role: 'Senior Software Engineer',
      branchName: 'Computer Science & Engineering',
      graduationYear: 2022,
      tagsJson: JSON.stringify(['Resume Tips', 'ATS Friendly', 'Placements', 'Career Advice']),
      status: ALUMNI_POST_STATUS.PUBLISHED,
      isFeatured: false,
      likesCount: 31,
    },
  });

  console.log('📝 Seeded Realistic Alumni Posts & Knowledge Insights.');

  // 9. Seed Industry Opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      type: OPPORTUNITY_TYPES.INTERNSHIP,
      postedByCompanyId: tcs.id,
      title: 'Java Backend Engineering Intern (Summer 2026)',
      description: 'Join the TCS Digital Labs team building high-concurrency microservices and cloud connectors. Work directly with senior enterprise architects.',
      location: 'Pune / Hybrid',
      workMode: 'Hybrid',
      stipendOrSalary: '₹35,000 / month',
      durationWeeks: 12,
      minCgpa: 7.0,
      eligibleDepartmentsJson: JSON.stringify(['Computer Science & Engineering', 'Information Technology']),
      eligibleBranchesJson: JSON.stringify(['Computer Science & Engineering', 'Artificial Intelligence & Machine Learning', 'Information Technology']),
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords['Java & Object-Oriented Programming']?.id, level: 80, weight: 5 },
        { skillId: skillRecords['Spring Boot & Microservices']?.id, level: 75, weight: 4 },
        { skillId: skillRecords['SQL & Relational Database Design']?.id, level: 70, weight: 3 },
      ]),
      status: 'active',
      openings: 15,
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      type: OPPORTUNITY_TYPES.INTERNSHIP,
      postedByCompanyId: bosch.id,
      title: 'Mechanical Design & Simulation Engineering Intern',
      description: 'Contribute to next-generation electronic power steering systems and thermal casing design using SolidWorks and FEA analysis.',
      location: 'Pune / Onsite',
      workMode: 'Onsite',
      stipendOrSalary: '₹30,000 / month',
      durationWeeks: 16,
      minCgpa: 6.8,
      eligibleDepartmentsJson: JSON.stringify(['Mechanical Engineering']),
      eligibleBranchesJson: JSON.stringify(['Mechanical Engineering', 'Robotics & Automation']),
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords['SolidWorks & 3D CAD Modeling']?.id, level: 80, weight: 5 },
        { skillId: skillRecords['Finite Element Analysis (FEA / ANSYS)']?.id, level: 75, weight: 4 },
      ]),
      status: 'active',
      openings: 8,
    },
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      type: OPPORTUNITY_TYPES.JOB,
      postedByCompanyId: aws.id,
      title: 'Cloud Infrastructure & DevOps Engineer (Graduate Placement)',
      description: 'Full-time campus placement for graduating engineers to build and automate hyper-scale cloud services.',
      location: 'Hyderabad, India',
      workMode: 'Hybrid',
      stipendOrSalary: '₹22.5 LPA',
      durationWeeks: 52,
      minCgpa: 7.5,
      eligibleDepartmentsJson: JSON.stringify(['Computer Science & Engineering', 'Information Technology', 'Electronics & Telecommunication']),
      eligibleBranchesJson: JSON.stringify(['Computer Science & Engineering', 'Information Technology', 'VLSI & Embedded Systems']),
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords['AWS Cloud Architecture']?.id, level: 80, weight: 5 },
        { skillId: skillRecords['Docker & Containerization']?.id, level: 75, weight: 4 },
        { skillId: skillRecords['Data Structures & Algorithms']?.id, level: 75, weight: 4 },
      ]),
      status: 'active',
      openings: 10,
    },
  });

  // 10. Seed Applications & Status History
  const app1 = await prisma.application.create({
    data: {
      opportunityId: opp1.id,
      applicantUserId: student1User.id,
      status: APPLICATION_STATUS.SHORTLISTED,
      matchScorePct: 88.5,
      coverNote: 'Excited to contribute to TCS Digital Labs microservices and high-throughput backend systems.',
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app1.id,
      status: APPLICATION_STATUS.APPLIED,
      notes: 'Application received via EduBridge Portal.',
      changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app1.id,
      status: APPLICATION_STATUS.SHORTLISTED,
      notes: 'Candidate meets 8.2 CGPA requirement and possesses verified Java & SQL proficiencies.',
      changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 11. Seed Placed Students Records for Audisankara University
  const placedStudentsData = [
    {
      name: 'Aditya Deshmukh',
      branch: 'Computer Science & Engineering',
      cgpa: 9.12,
      company: 'Amazon Web Services (AWS India)',
      role: 'Cloud Support Associate',
      package: 24.5,
      type: 'On-Campus',
      year: '2025-2026',
      skills: ['AWS Cloud Architecture', 'Docker & Containerization', 'Java'],
      quote: 'The Curriculum Gap Radar helped our batch focus on Docker and Cloud electives early in Sem 5!',
    },
    {
      name: 'Sneha Kulkarni',
      branch: 'Computer Science & Engineering',
      cgpa: 8.85,
      company: 'Tata Consultancy Services (TCS Digital)',
      role: 'Digital Software Engineer',
      package: 9.5,
      type: 'On-Campus',
      year: '2025-2026',
      skills: ['Java & Object-Oriented Programming', 'Spring Boot', 'SQL'],
      quote: 'Verified project credentials on EduBridge gave recruiters immediate proof of my microservices work.',
    },
    {
      name: 'Pranav Kadam',
      branch: 'Mechanical Engineering',
      cgpa: 8.70,
      company: 'Bosch Mobility Solutions',
      role: 'Graduate Trainee Engineer',
      package: 11.2,
      type: 'On-Campus',
      year: '2025-2026',
      skills: ['SolidWorks & 3D CAD Modeling', 'Finite Element Analysis (FEA / ANSYS)'],
      quote: 'Hands-on CAD modeling and FEA projects during my internship sealed the PPO offer.',
    },
    {
      name: 'Tanvi Joshi',
      branch: 'Electronics & Telecommunication',
      cgpa: 8.92,
      company: 'Qualcomm Wireless R&D',
      role: 'Associate Hardware Engineer',
      package: 22.0,
      type: 'On-Campus',
      year: '2025-2026',
      skills: ['Embedded C & ARM Microcontrollers', 'VLSI & Verilog Hardware Design'],
      quote: "ARM Cortex assembly and driver projects directly matched Qualcomm's technical interview rounds.",
    },
    {
      name: 'Siddharth Patil',
      branch: 'Civil Engineering',
      cgpa: 8.45,
      company: 'Larsen & Toubro (L&T Construction)',
      role: 'Graduate Engineer Trainee',
      package: 8.5,
      type: 'On-Campus',
      year: '2025-2026',
      skills: ['Structural Analysis & STAAD.Pro', 'Quantitative Aptitude'],
      quote: 'L&T assessed our structural modeling simulations and offered campus placements on Day 1.',
    },
  ];

  for (const p of placedStudentsData) {
    await prisma.placedStudent.create({
      data: {
        institutionId: audisankara.id,
        studentName: p.name,
        branchName: p.branch,
        cgpa: p.cgpa,
        companyName: p.company,
        role: p.role,
        packageLpa: p.package,
        placementType: p.type,
        academicYear: p.year,
        skillsJson: JSON.stringify(p.skills),
        isPublicStory: true,
        storyQuote: p.quote,
      },
    });
  }

  // 12. Seed Company Placement Statistics
  const companyStatsData = [
    {
      companyName: 'Tata Consultancy Services (TCS)',
      academicYear: '2025-2026',
      departmentName: 'Computer Science & Engineering',
      eligibleStudents: 180,
      appeared: 165,
      shortlisted: 65,
      interviewed: 52,
      offersCount: 45,
      acceptedCount: 42,
      highestPackage: 11.5,
      averagePackage: 8.2,
      medianPackage: 7.5,
    },
    {
      companyName: 'Amazon Web Services (AWS)',
      academicYear: '2025-2026',
      departmentName: 'Computer Science & Engineering',
      eligibleStudents: 140,
      appeared: 120,
      shortlisted: 28,
      interviewed: 22,
      offersCount: 14,
      acceptedCount: 14,
      highestPackage: 24.5,
      averagePackage: 21.0,
      medianPackage: 20.5,
    },
    {
      companyName: 'Bosch Mobility Solutions',
      academicYear: '2025-2026',
      departmentName: 'Mechanical Engineering',
      eligibleStudents: 95,
      appeared: 85,
      shortlisted: 32,
      interviewed: 24,
      offersCount: 18,
      acceptedCount: 16,
      highestPackage: 12.0,
      averagePackage: 9.8,
      medianPackage: 9.2,
    },
    {
      companyName: 'Qualcomm Wireless R&D',
      academicYear: '2025-2026',
      departmentName: 'Electronics & Telecommunication',
      eligibleStudents: 75,
      appeared: 68,
      shortlisted: 18,
      interviewed: 14,
      offersCount: 9,
      acceptedCount: 9,
      highestPackage: 22.0,
      averagePackage: 18.5,
      medianPackage: 18.0,
    },
  ];

  for (const cs of companyStatsData) {
    await prisma.companyPlacementStat.create({
      data: {
        institutionId: audisankara.id,
        ...cs,
      },
    });
  }

  // 13. Seed Faculty Mentorship Events
  const event1 = await prisma.mentorshipEvent.create({
    data: {
      hostAcademicianId: academicianProfile.id,
      title: 'Masterclass: Cracking High-Throughput System Design & Microservices',
      type: MENTORSHIP_EVENT_TYPES.WORKSHOP,
      description: 'Hands-on architectural deep dive into Kafka partitioning, database sharding, and resilience patterns for campus placement rounds.',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '04:00 PM',
      endTime: '06:00 PM',
      mode: 'Online (Google Meet)',
      locationOrLink: 'https://meet.google.com/mitaoe-sys-design',
      relevantBranch: 'Computer Science & Engineering, IT',
      relevantSkillsJson: JSON.stringify(['Java & Object-Oriented Programming', 'Spring Boot & Microservices', 'SQL & Relational Database Design']),
      maxAttendees: 150,
    },
  });

  await prisma.eventRegistration.create({
    data: {
      eventId: event1.id,
      userId: student1User.id,
      registeredAt: new Date(),
    },
  });

  // 14. Seed Notifications & Messages
  await prisma.notification.create({
    data: {
      userId: student1User.id,
      title: 'Application Shortlisted!',
      message: 'TCS Digital Labs has shortlisted your profile for Java Backend Engineering Intern.',
      type: 'application',
      linkUrl: '/student/applications',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: student1User.id,
      title: 'New Masterclass Scheduled',
      message: 'Dr. Anjali Joshi scheduled "Cracking High-Throughput System Design" for Thursday.',
      type: 'event',
      linkUrl: '/student/events',
      read: true,
    },
  });

  // 15. Seed Sample Mentorship Requests
  await prisma.mentorshipRequest.create({
    data: {
      studentUserId: student1User.id,
      mentorUserId: alumniUser.id,
      topic: 'Microsoft Azure Backend Interview & System Design Preparation',
      message: 'Hi Rahul Sir, I am preparing for product company campus drives. Would love your feedback on my Spring Boot capstone project and system design preparation strategy.',
      status: 'pending',
    },
  });

  await prisma.mentorshipRequest.create({
    data: {
      studentUserId: student2User.id,
      mentorUserId: alumni2User.id,
      topic: 'Robotics & ROS2 Automation Career Guidance',
      message: 'Hello Rohan Sir, I am in 3rd year Mechanical focusing on ROS2 and autonomous robots. Seeking your advice on core automotive hardware-software roles at Bosch.',
      status: 'accepted',
      responseNotes: 'Happy to connect! Let us review your ROS simulation repos on GitHub this Saturday at 5 PM.',
    },
  });

  console.log('✅ Database Seeding completed successfully for Audisankara University!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
