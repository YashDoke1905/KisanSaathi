import { CROPS_MASTER, getCropData, GrowthStageDef } from "../data/crops";

export interface NutrientRequirements {
  nitrogenKg: number; // N
  phosphorusKg: number; // P2O5
  potassiumKg: number; // K2O
}

export interface FertilizerStoichiometryResult {
  dapKg: number;
  dapBags50kg: number;
  ureaKg: number;
  ureaBags50kg: number;
  mopKg: number;
  mopBags50kg: number;
  nitrogenSuppliedByDapKg: number;
  remainingNitrogenFromUreaKg: number;
  totalFertilizerKg: number;
  explanationMr: string;
  explanationEn: string;
}

export interface GeneratedPlanTask {
  stageNumber: number;
  stageNameMr: string;
  stageNameEn: string;
  category: "Irrigation" | "Fertilizer" | "PestControl" | "Labour" | "Harvesting" | "General";
  dueDate: Date;
  dueDateStr: string;
  titleMr: string;
  titleEn: string;
  titleHi: string;
  descriptionMr: string;
  descriptionEn: string;
  isCompleted: boolean;
}

/**
 * Converts pure N-P-K nutrient recommendations (kg/acre) into commercial
 * fertilizer quantities (DAP 18:46:0, Urea 46:0:0, MOP 0:0:60)
 */
export function calculateFertilizerStoichiometry(
  requiredN: number,
  requiredP: number,
  requiredK: number,
  areaAcre: number = 1.0
): FertilizerStoichiometryResult {
  const scaledP = Math.max(0, requiredP * areaAcre);
  const scaledN = Math.max(0, requiredN * areaAcre);
  const scaledK = Math.max(0, requiredK * areaAcre);

  // 1. Fulfill P2O5 requirement using DAP (18% N, 46% P2O5)
  const dapKg = scaledP > 0 ? Number((scaledP / 0.46).toFixed(1)) : 0;
  const nitrogenSuppliedByDap = Number((dapKg * 0.18).toFixed(1));

  // 2. Fulfill remaining Nitrogen using Urea (46% N)
  const remainingNitrogen = Math.max(0, scaledN - nitrogenSuppliedByDap);
  const ureaKg = remainingNitrogen > 0 ? Number((remainingNitrogen / 0.46).toFixed(1)) : 0;

  // 3. Fulfill Potassium using MOP (60% K2O)
  const mopKg = scaledK > 0 ? Number((scaledK / 0.6).toFixed(1)) : 0;

  const totalKg = Number((dapKg + ureaKg + mopKg).toFixed(1));

  const dapBags = Math.ceil(dapKg / 50);
  const ureaBags = Math.ceil(ureaKg / 50);
  const mopBags = Math.ceil(mopKg / 50);

  const explanationMr = `खतांचे रासायनिक संतुलन: फॉस्फरससाठी ${dapKg} किलो DAP (${dapBags} पोती), त्यातून मिळणारा नत्र वजा जाता उर्वरित नत्रासाठी ${ureaKg} किलो युरिया (${ureaBags} पोती), आणि पालाशसाठी ${mopKg} किलो MOP (${mopBags} पोती) आवश्यक ठरते.`;
  const explanationEn = `Nutrient stoichiometry: ${dapKg} kg DAP (${dapBags} bags) supplies full P2O5 and ${nitrogenSuppliedByDap} kg N; balance N is met by ${ureaKg} kg Urea (${ureaBags} bags); K2O is met by ${mopKg} kg MOP (${mopBags} bags).`;

  return {
    dapKg,
    dapBags50kg: dapBags,
    ureaKg,
    ureaBags50kg: ureaBags,
    mopKg,
    mopBags50kg: mopBags,
    nitrogenSuppliedByDapKg: nitrogenSuppliedByDap,
    remainingNitrogenFromUreaKg: Number(remainingNitrogen.toFixed(1)),
    totalFertilizerKg: totalKg,
    explanationMr,
    explanationEn,
  };
}

/**
 * Calculates seed requirement based on area, germination percentage, and spacing
 */
export function calculateSeedRequirement(
  cropId: string,
  areaAcre: number,
  germinationPct: number = 85
): {
  seedKg: number;
  costEstimate: number;
  seedRateKgPerAcre: number;
} {
  const crop = getCropData(cropId);
  const baseRate = crop.seedRateKgPerAcre;

  // Standard germination baseline is 85%
  const germinationFactor = germinationPct < 85 ? (85 / Math.max(50, germinationPct)) : 1.0;
  const seedKg = Number((baseRate * areaAcre * germinationFactor).toFixed(2));
  const costEstimate = Math.round(seedKg * crop.seedCostPerKg);

  return {
    seedKg,
    costEstimate,
    seedRateKgPerAcre: baseRate,
  };
}

/**
 * Generates an automated calendar of tasks across all growth stages from sowingDate
 */
export function generatePlanTasks(
  cropId: string,
  sowingDate: Date | string,
  areaAcre: number
): GeneratedPlanTask[] {
  const crop = getCropData(cropId);
  const baseDate = new Date(sowingDate);
  const tasks: GeneratedPlanTask[] = [];

  crop.stages.forEach((stage: GrowthStageDef) => {
    // 1. Stage Start Task (General & Land Prep / Sowing)
    const stageStartDate = new Date(baseDate);
    stageStartDate.setDate(stageStartDate.getDate() + stage.startDay - 1);
    const dateStr = stageStartDate.toISOString().split("T")[0];

    tasks.push({
      stageNumber: stage.stageNumber,
      stageNameMr: stage.nameMr,
      stageNameEn: stage.nameEn,
      category: stage.stageNumber === 1 ? "General" : "Labour",
      dueDate: stageStartDate,
      dueDateStr: dateStr,
      titleMr: `टप्पा ${stage.stageNumber}: ${stage.nameMr}`,
      titleEn: `Stage ${stage.stageNumber}: ${stage.nameEn}`,
      titleHi: `चरण ${stage.stageNumber}: ${stage.nameEn}`,
      descriptionMr: `कालावधी: पेरणीनंतर दिवस ${stage.startDay} ते ${stage.endDay}. अंदाजे मजूर दिवस: ${Math.round(stage.labourDaysPerAcre * areaAcre)}.`,
      descriptionEn: `Duration: Days ${stage.startDay} to ${stage.endDay} post-sowing. Estimated labour days: ${Math.round(stage.labourDaysPerAcre * areaAcre)}.`,
      isCompleted: false,
    });

    // 2. Fertilizer Task if this stage has doses
    if (stage.fertilizerDose.ureaKg > 0 || stage.fertilizerDose.dapKg > 0 || stage.fertilizerDose.mopKg > 0) {
      const fertDate = new Date(stageStartDate);
      fertDate.setDate(fertDate.getDate() + 2); // Apply 2 days into the stage
      const fertUrea = Math.round(stage.fertilizerDose.ureaKg * areaAcre);
      const fertDap = Math.round(stage.fertilizerDose.dapKg * areaAcre);
      const fertMop = Math.round(stage.fertilizerDose.mopKg * areaAcre);

      tasks.push({
        stageNumber: stage.stageNumber,
        stageNameMr: stage.nameMr,
        stageNameEn: stage.nameEn,
        category: "Fertilizer",
        dueDate: fertDate,
        dueDateStr: fertDate.toISOString().split("T")[0],
        titleMr: `खत व्यवस्थापन (टप्पा ${stage.stageNumber})`,
        titleEn: `Fertilizer Application (Stage ${stage.stageNumber})`,
        titleHi: `उर्वरक प्रबंधन (चरण ${stage.stageNumber})`,
        descriptionMr: `${stage.fertilizerDose.descriptionMr} (एकूण मात्रा: युरिया ${fertUrea} kg, DAP ${fertDap} kg, MOP ${fertMop} kg)`,
        descriptionEn: `${stage.fertilizerDose.descriptionEn} (Total: Urea ${fertUrea}kg, DAP ${fertDap}kg, MOP ${fertMop}kg)`,
        isCompleted: false,
      });
    }

    // 3. Pest Watch Task if this stage has pests
    if (stage.pestWatch && stage.pestWatch.length > 0) {
      const pestDate = new Date(stageStartDate);
      pestDate.setDate(pestDate.getDate() + 5);
      const pestNames = stage.pestWatch.map((p) => p.pestNameMr).join(", ");
      const pestDetails = stage.pestWatch
        .map((p) => `• ${p.pestNameMr}: ${p.symptomsMr} सेंद्रिय उपाय: ${p.organicControlMr}`)
        .join("\n");

      tasks.push({
        stageNumber: stage.stageNumber,
        stageNameMr: stage.nameMr,
        stageNameEn: stage.nameEn,
        category: "PestControl",
        dueDate: pestDate,
        dueDateStr: pestDate.toISOString().split("T")[0],
        titleMr: `कीड व रोग पाहणी: ${pestNames}`,
        titleEn: `Pest & Disease Scouting (Stage ${stage.stageNumber})`,
        titleHi: `कीट एवं रोग निगरानी (चरण ${stage.stageNumber})`,
        descriptionMr: `पिकाची पाहणी करून खालील लक्षणे तपासा:\n${pestDetails}`,
        descriptionEn: `Scout field for: ${pestNames}. Apply organic control if ETL crossed.`,
        isCompleted: false,
      });
    }

    // 4. Irrigation Advisory Task
    if (stage.irrigationFrequencyDays > 0) {
      const waterDate = new Date(stageStartDate);
      waterDate.setDate(waterDate.getDate() + 1);

      tasks.push({
        stageNumber: stage.stageNumber,
        stageNameMr: stage.nameMr,
        stageNameEn: stage.nameEn,
        category: "Irrigation",
        dueDate: waterDate,
        dueDateStr: waterDate.toISOString().split("T")[0],
        titleMr: `पाणी व्यवस्थापन (दर ${stage.irrigationFrequencyDays} दिवसांनी)`,
        titleEn: `Irrigation Round (Every ${stage.irrigationFrequencyDays} days)`,
        titleHi: `सिंचाई चक्र (प्रत्येक ${stage.irrigationFrequencyDays} दिन)`,
        descriptionMr: `या टप्प्यात पिकाचा पाण्याचा गुणांक Kc = ${stage.kcFactor} आहे. जमिनीतील ओलावा तपासून दर ${stage.irrigationFrequencyDays} दिवसांनी पाणी द्यावे.`,
        descriptionEn: `Crop Kc coefficient is ${stage.kcFactor}. Irrigate every ${stage.irrigationFrequencyDays} days based on soil moisture.`,
        isCompleted: false,
      });
    }
  });

  return tasks;
}
