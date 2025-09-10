import { storage } from "./storage";

async function seedDemoData() {
  console.log("🌱 Starting demo data seeding...");

  try {
    // Seed NAMASTE codes
    console.log("📊 Seeding NAMASTE codes...");
    const namasteCodes = [
      // Ayurveda codes
      {
        code: "AYU-DIG-001",
        display: "Agnimandya (Digestive Fire Weakness)",
        definition: "Condition characterized by impaired digestive fire leading to indigestion and poor metabolism",
        system: "http://namaste.gov.in/CodeSystem",
        category: "AYU",
        subCategory: "DIG"
      },
      {
        code: "AYU-DIG-002", 
        display: "Ajirna (Indigestion)",
        definition: "Acute or chronic indigestion due to improper food consumption or weak digestive capacity",
        system: "http://namaste.gov.in/CodeSystem",
        category: "AYU",
        subCategory: "DIG"
      },
      {
        code: "AYU-RES-001",
        display: "Kasa (Cough)",
        definition: "Cough disorder involving vitiated Prana and Udana Vata with Kapha imbalance",
        system: "http://namaste.gov.in/CodeSystem", 
        category: "AYU",
        subCategory: "RES"
      },
      {
        code: "AYU-RES-002",
        display: "Swasa (Dyspnea)",
        definition: "Breathing difficulty due to obstruction of respiratory channels by vitiated Kapha",
        system: "http://namaste.gov.in/CodeSystem",
        category: "AYU", 
        subCategory: "RES"
      },
      {
        code: "AYU-NEU-001",
        display: "Shirashoola (Headache)",
        definition: "Head pain due to vitiated Vata dosha affecting cranial nerves and blood vessels",
        system: "http://namaste.gov.in/CodeSystem",
        category: "AYU",
        subCategory: "NEU"
      },
      {
        code: "AYU-MUS-001", 
        display: "Sandhivata (Arthritis)",
        definition: "Joint disorder characterized by pain, swelling and stiffness due to Vata vitiation",
        system: "http://namaste.gov.in/CodeSystem",
        category: "AYU",
        subCategory: "MUS"
      },

      // Siddha codes
      {
        code: "SID-DIG-001",
        display: "Sothai (Digestive Disorder)",
        definition: "Digestive disturbance due to imbalanced Azhal humor affecting gastric fire",
        system: "http://namaste.gov.in/CodeSystem",
        category: "SID",
        subCategory: "DIG"
      },
      {
        code: "SID-RES-001",
        display: "Irumal (Cough)",
        definition: "Respiratory disorder involving vitiated Vatham affecting lung function",
        system: "http://namaste.gov.in/CodeSystem",
        category: "SID", 
        subCategory: "RES"
      },
      {
        code: "SID-NEU-001",
        display: "Thalainokkadu (Headache)",
        definition: "Cranial pain disorder due to Vatham and Pitham humor imbalance",
        system: "http://namaste.gov.in/CodeSystem",
        category: "SID",
        subCategory: "NEU"
      },
      {
        code: "SID-MUS-001",
        display: "Keelvayu (Arthritis)",
        definition: "Joint inflammation and pain due to vitiated Vatham humor",
        system: "http://namaste.gov.in/CodeSystem",
        category: "SID",
        subCategory: "MUS"
      },

      // Unani codes
      {
        code: "UNA-DIG-001",
        display: "Su-e-Hazm (Dyspepsia)",
        definition: "Digestive disorder characterized by impaired gastric function and heat imbalance",
        system: "http://namaste.gov.in/CodeSystem",
        category: "UNA",
        subCategory: "DIG"
      },
      {
        code: "UNA-RES-001", 
        display: "Sual (Cough)",
        definition: "Respiratory affliction involving abnormal temperament of lungs and bronchi",
        system: "http://namaste.gov.in/CodeSystem",
        category: "UNA",
        subCategory: "RES"
      },
      {
        code: "UNA-NEU-001",
        display: "Waja-ur-Ras (Headache)",
        definition: "Cephalic pain due to temperamental imbalance affecting head and brain",
        system: "http://namaste.gov.in/CodeSystem",
        category: "UNA",
        subCategory: "NEU"
      },
      {
        code: "UNA-MUS-001",
        display: "Waja-ul-Mafasil (Arthritis)", 
        definition: "Joint pain and inflammation due to cold and moist temperament",
        system: "http://namaste.gov.in/CodeSystem",
        category: "UNA",
        subCategory: "MUS"
      }
    ];

    for (const code of namasteCodes) {
      try {
        await storage.createNamasteCode(code);
      } catch (error) {
        // Ignore duplicates
        console.log(`Skipping duplicate NAMASTE code: ${code.code}`);
      }
    }

    // Seed ICD-11 codes
    console.log("🏥 Seeding ICD-11 TM2 codes...");
    const icd11Codes = [
      {
        code: "TM2-YM25",
        display: "Digestive system disorders, traditional medicine conditions",
        definition: "Traditional medicine conditions affecting digestive system including functional dyspepsia",
        system: "http://id.who.int/icd/release/11/mms",
        module: "TM2"
      },
      {
        code: "TM2-YM26", 
        display: "Respiratory system disorders, traditional medicine conditions",
        definition: "Traditional medicine conditions affecting respiratory system including cough and breathing difficulties",
        system: "http://id.who.int/icd/release/11/mms",
        module: "TM2"
      },
      {
        code: "TM2-YM27",
        display: "Nervous system disorders, traditional medicine conditions", 
        definition: "Traditional medicine conditions affecting nervous system including headaches and neurological symptoms",
        system: "http://id.who.int/icd/release/11/mms",
        module: "TM2"
      },
      {
        code: "TM2-YM28",
        display: "Musculoskeletal disorders, traditional medicine conditions",
        definition: "Traditional medicine conditions affecting musculoskeletal system including joint and muscle disorders",
        system: "http://id.who.int/icd/release/11/mms", 
        module: "TM2"
      }
    ];

    for (const code of icd11Codes) {
      try {
        await storage.createIcd11Code(code);
      } catch (error) {
        // Ignore duplicates
        console.log(`Skipping duplicate ICD-11 code: ${code.code}`);
      }
    }

    // Seed concept mappings
    console.log("🔗 Seeding concept mappings...");
    const mappings = [
      // Digestive mappings
      {
        sourceCode: "AYU-DIG-001",
        sourceSystem: "http://namaste.gov.in/CodeSystem",
        targetCode: "TM2-YM25",
        targetSystem: "http://id.who.int/icd/release/11/mms",
        equivalence: "equivalent",
        confidence: 85,
        mappingType: "ai-generated",
        createdBy: "demo-system"
      },
      {
        sourceCode: "SID-DIG-001", 
        sourceSystem: "http://namaste.gov.in/CodeSystem",
        targetCode: "TM2-YM25",
        targetSystem: "http://id.who.int/icd/release/11/mms",
        equivalence: "equivalent",
        confidence: 82,
        mappingType: "ai-generated",
        createdBy: "demo-system"
      },
      {
        sourceCode: "UNA-DIG-001",
        sourceSystem: "http://namaste.gov.in/CodeSystem", 
        targetCode: "TM2-YM25",
        targetSystem: "http://id.who.int/icd/release/11/mms",
        equivalence: "equivalent",
        confidence: 88,
        mappingType: "ai-generated", 
        createdBy: "demo-system"
      },
      
      // Respiratory mappings
      {
        sourceCode: "AYU-RES-001",
        sourceSystem: "http://namaste.gov.in/CodeSystem",
        targetCode: "TM2-YM26",
        targetSystem: "http://id.who.int/icd/release/11/mms",
        equivalence: "equivalent",
        confidence: 90,
        mappingType: "ai-generated",
        createdBy: "demo-system"
      },
      {
        sourceCode: "SID-RES-001",
        sourceSystem: "http://namaste.gov.in/CodeSystem",
        targetCode: "TM2-YM26", 
        targetSystem: "http://id.who.int/icd/release/11/mms",
        equivalence: "equivalent",
        confidence: 87,
        mappingType: "ai-generated",
        createdBy: "demo-system"
      },
      
      // Neurological mappings
      {
        sourceCode: "AYU-NEU-001",
        sourceSystem: "http://namaste.gov.in/CodeSystem",
        targetCode: "TM2-YM27",
        targetSystem: "http://id.who.int/icd/release/11/mms",
        equivalence: "equivalent", 
        confidence: 85,
        mappingType: "ai-generated",
        createdBy: "demo-system"
      },
      
      // Musculoskeletal mappings
      {
        sourceCode: "AYU-MUS-001",
        sourceSystem: "http://namaste.gov.in/CodeSystem",
        targetCode: "TM2-YM28",
        targetSystem: "http://id.who.int/icd/release/11/mms",
        equivalence: "equivalent",
        confidence: 92,
        mappingType: "ai-generated",
        createdBy: "demo-system"
      }
    ];

    for (const mapping of mappings) {
      try {
        await storage.createConceptMapping(mapping);
      } catch (error) {
        // Ignore duplicates
        console.log(`Skipping duplicate mapping: ${mapping.sourceCode} -> ${mapping.targetCode}`);
      }
    }

    // Seed sample problem entries
    console.log("📋 Seeding sample problem entries...");
    const problemEntries = [
      {
        patientId: "patient-001",
        problemCode: "AYU-DIG-001",
        problemSystem: "http://namaste.gov.in/CodeSystem",
        problemDisplay: "Agnimandya (Digestive Fire Weakness)",
        severity: "moderate",
        status: "active",
        onsetDate: new Date("2024-01-15"),
        notes: "Patient reports poor appetite and feeling of heaviness after meals. Prescribed Agni deepana herbs.",
        createdBy: "demo-practitioner"
      },
      {
        patientId: "patient-002", 
        problemCode: "SID-RES-001",
        problemSystem: "http://namaste.gov.in/CodeSystem",
        problemDisplay: "Irumal (Cough)",
        severity: "mild",
        status: "active",
        onsetDate: new Date("2024-02-10"),
        notes: "Chronic dry cough worse in mornings. Recommended Vatham balancing formulations.",
        createdBy: "demo-practitioner"
      },
      {
        patientId: "patient-003",
        problemCode: "UNA-NEU-001",
        problemSystem: "http://namaste.gov.in/CodeSystem", 
        problemDisplay: "Waja-ur-Ras (Headache)",
        severity: "severe",
        status: "active",
        onsetDate: new Date("2024-01-20"),
        notes: "Recurrent tension headaches with stress. Prescribed temperament balancing therapy.",
        createdBy: "demo-practitioner"
      }
    ];

    for (const entry of problemEntries) {
      try {
        await storage.createProblemEntry(entry);
      } catch (error) {
        // Ignore duplicates
        console.log(`Skipping duplicate problem entry for patient: ${entry.patientId}`);
      }
    }

    // Seed sample audit entries
    console.log("📊 Seeding audit entries...");
    const auditEntries = [
      {
        operation: "terminology.search",
        details: { query: "digestive", results: 5 },
        userId: "demo-user",
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        operation: "mapping.suggest",
        details: { code: "AYU-DIG-001", mappings: 1 },
        userId: "demo-user",
        timestamp: new Date(Date.now() - 1800000) // 30 mins ago
      },
      {
        operation: "fhir.valueset.expand",
        details: { url: "http://namaste.gov.in/ValueSet/ayurveda", concepts: 25 },
        userId: "demo-user", 
        timestamp: new Date(Date.now() - 900000) // 15 mins ago
      }
    ];

    for (const entry of auditEntries) {
      try {
        await storage.createAuditEntry(entry);
      } catch (error) {
        // Ignore duplicates
        console.log(`Skipping duplicate audit entry: ${entry.operation}`);
      }
    }

    // Seed sample chat messages
    console.log("💬 Seeding chat messages...");
    const sessionId = "demo-session-001";
    const chatMessages = [
      {
        sessionId,
        role: "user" as const,
        content: "What is the difference between Agnimandya in Ayurveda and Su-e-Hazm in Unani?",
        timestamp: new Date(Date.now() - 600000) // 10 mins ago
      },
      {
        sessionId,
        role: "assistant" as const,
        content: "Both Agnimandya (Ayurveda) and Su-e-Hazm (Unani) refer to digestive disorders, but they differ in their conceptual frameworks:\n\n**Agnimandya (AYU-DIG-001)**:\n- Characterized by weakened digestive fire (Agni)\n- Involves Vata, Pitta, and Kapha dosha imbalances\n- Treatment focuses on rekindling digestive fire\n\n**Su-e-Hazm (UNA-DIG-001)**:\n- Refers to poor digestion due to temperamental imbalance\n- Involves disruption of natural heat (Hararat-e-Ghariziya)\n- Treatment aims at correcting temperamental balance\n\nBoth map to ICD-11 TM2-YM25 for traditional digestive disorders.",
        timestamp: new Date(Date.now() - 580000) // 9m 40s ago
      },
      {
        sessionId,
        role: "user" as const,
        content: "How do I search for respiratory conditions across all AYUSH systems?",
        timestamp: new Date(Date.now() - 300000) // 5 mins ago
      },
      {
        sessionId,
        role: "assistant" as const,
        content: "You can search for respiratory conditions using the Terminology Search API:\n\n1. **General search**: Use query parameter `q=respiratory` or `q=breathing`\n2. **Include ICD-11**: Add `include_icd=true` for cross-system mapping\n3. **System-specific**: Search for 'Kasa' (Ayurveda), 'Irumal' (Siddha), or 'Sual' (Unani)\n\nExample API call:\n```\nGET /api/search?q=cough&include_icd=true\n```\n\nThis will return NAMASTE codes like:\n- AYU-RES-001: Kasa (Cough)\n- SID-RES-001: Irumal (Cough)  \n- UNA-RES-001: Sual (Cough)\n\nAll mapping to ICD-11 TM2-YM26 for traditional respiratory disorders.",
        timestamp: new Date(Date.now() - 280000) // 4m 40s ago
      }
    ];

    for (const message of chatMessages) {
      try {
        await storage.createChatMessage(message);
      } catch (error) {
        // Ignore duplicates
        console.log(`Skipping duplicate chat message in session: ${message.sessionId}`);
      }
    }

    console.log("✅ Demo data seeding completed successfully!");
    console.log("📊 Data summary:");
    console.log(`   - ${namasteCodes.length} NAMASTE codes`);
    console.log(`   - ${icd11Codes.length} ICD-11 TM2 codes`);
    console.log(`   - ${mappings.length} concept mappings`);
    console.log(`   - ${problemEntries.length} problem entries`);
    console.log(`   - ${auditEntries.length} audit entries`);
    console.log(`   - ${chatMessages.length} chat messages`);

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedDemoData()
    .then(() => {
      console.log("🎉 Demo data seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Demo data seeding failed:", error);
      process.exit(1);
    });
}

export { seedDemoData };