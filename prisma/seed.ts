import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CROPS_MASTER } from "../src/data/crops";
import { calculateCropPlan, generatePlanTasks } from "../src/engine";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KisanSaathi initial skeleton and Phase 3 crop data...");

  // 1. Create or update default demo farmer account
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("farmer123", salt);

  const demoUser = await prisma.user.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      username: "demo",
      phone: "9876543210",
      passwordHash,
      role: "farmer",
      profile: {
        create: {
          fullName: "तुकाराम पाटील (Tukaram Patil)",
          preferredLanguage: "mr",
          state: "Maharashtra",
          district: "Nashik",
          taluka: "Niphad",
          village: "Pimpalgaon Baswant",
          pincode: "422209",
          latitude: 20.1743,
          longitude: 73.9877,
          category: "OBC",
          experienceYears: 15,
          riskAppetite: "medium",
          budgetCapacity: 75000.0,
          farms: {
            create: [
              {
                name: "गट क्र. ४२ - विहीर शेत (Gat 42 - Well Plot)",
                surveyNumber: "42/1A",
                ulpin: "MH261412345678",
                ownershipType: "owned",
                areaAcre: 2.5,
                soilType: "Medium_Black",
                soilPh: 7.2,
                soilEc: 0.45,
                soilOrganicCarbon: 0.65,
                terrain: "Flat",
                waterSources: {
                  create: [
                    {
                      sourceType: "Open_Well",
                      seasonality: "Perennial",
                      hasDrip: true,
                      hasSprinkler: false,
                      electricityHoursDaily: 8.0,
                      pumpHorsepower: 5.0,
                    },
                    {
                      sourceType: "Farm_Pond",
                      seasonality: "Kharif_Rabi",
                      hasDrip: true,
                      hasSprinkler: true,
                      electricityHoursDaily: 6.0,
                      pumpHorsepower: 3.0,
                    },
                  ],
                },
              },
              {
                name: "गट क्र. ८८ - बोरवेल शेत (Gat 88 - Borewell Plot)",
                surveyNumber: "88/2",
                ulpin: "MH261487654321",
                ownershipType: "owned",
                areaAcre: 1.5,
                soilType: "Red_Sandy",
                soilPh: 6.8,
                terrain: "Gentle_Slope",
                waterSources: {
                  create: [
                    {
                      sourceType: "Borewell",
                      seasonality: "Perennial",
                      hasDrip: true,
                      electricityHoursDaily: 7.0,
                      pumpHorsepower: 5.0,
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    include: {
      profile: {
        include: {
          farms: true,
        },
      },
    },
  });

  console.log(`✅ Seeded demo user: ${demoUser.username} (ID: ${demoUser.id})`);

  // 2. Upsert master crops and varieties
  console.log("🌾 Upserting master crops into database...");
  for (const cropData of Object.values(CROPS_MASTER)) {
    await prisma.crop.upsert({
      where: { id: cropData.id },
      update: {
        nameEn: cropData.nameEn,
        nameMr: cropData.nameMr,
        nameHi: cropData.nameHi,
        category: cropData.category,
        season: cropData.season,
        durationDaysMin: cropData.durationDaysMin,
        durationDaysMax: cropData.durationDaysMax,
        baseYieldPerAcre: cropData.baseYieldQuintalsPerAcre,
        seedRateKgPerAcre: cropData.seedRateKgPerAcre,
        basePricePerQtl: cropData.basePricePerQuintal,
        waterReqMm: cropData.waterReqMm,
      },
      create: {
        id: cropData.id,
        nameEn: cropData.nameEn,
        nameMr: cropData.nameMr,
        nameHi: cropData.nameHi,
        category: cropData.category,
        season: cropData.season,
        durationDaysMin: cropData.durationDaysMin,
        durationDaysMax: cropData.durationDaysMax,
        baseYieldPerAcre: cropData.baseYieldQuintalsPerAcre,
        seedRateKgPerAcre: cropData.seedRateKgPerAcre,
        basePricePerQtl: cropData.basePricePerQuintal,
        waterReqMm: cropData.waterReqMm,
      },
    });

    for (const v of cropData.varieties) {
      const existingVar = await prisma.cropVariety.findFirst({
        where: { cropId: cropData.id, varietyName: v.name },
      });
      if (!existingVar) {
        await prisma.cropVariety.create({
          data: {
            cropId: cropData.id,
            varietyName: v.name,
            durationDays: v.durationDays,
            yieldPotential: v.yieldPotentialQuintals,
          },
        });
      }
    }
  }

  // 3. Seed an initial active Crop Plan for Gat 42 (Well Plot)
  const gat42Farm = demoUser.profile?.farms.find((f) => f.name.includes("४२"));
  if (gat42Farm) {
    const existingPlan = await prisma.cropPlan.findFirst({
      where: { farmId: gat42Farm.id },
    });

    if (!existingPlan) {
      console.log("📝 Generating active demo Crop Plan for Gat 42 (Rabi Onion)...");
      const sowingDate = new Date();
      sowingDate.setDate(sowingDate.getDate() - 25); // Sown 25 days ago (currently in vegetative stage)

      const calcResult = calculateCropPlan({
        cropId: "onion",
        areaAcre: 2.5,
        sowingDate,
        soilType: "Medium_Black",
        irrigationMethod: "drip",
      });

      const harvestDate = new Date(calcResult.harvestDate);

      const createdPlan = await prisma.cropPlan.create({
        data: {
          farmId: gat42Farm.id,
          cropId: "onion",
          areaAcre: 2.5,
          sowingDate,
          harvestDate,
          irrigationMethod: "drip",
          status: "active",
          estTotalCost: calcResult.totalCost,
          estExpectedYield: calcResult.totalExpectedYieldQuintals,
          estExpectedPrice: calcResult.effectivePricePerQuintal,
          estGrossRevenue: calcResult.grossRevenue,
          estNetProfit: calcResult.netProfit,
        },
      });

      // Generate dated tasks for this plan
      const planTasks = generatePlanTasks("onion", sowingDate, 2.5);
      for (const t of planTasks) {
        // Mark tasks whose due date has passed as completed for realistic demonstration
        const isPast = new Date(t.dueDate).getTime() < Date.now();
        await prisma.planTask.create({
          data: {
            planId: createdPlan.id,
            dueDate: t.dueDate,
            titleEn: t.titleEn,
            titleMr: t.titleMr,
            titleHi: t.titleHi,
            category: t.category,
            quantityDesc: t.descriptionMr,
            isCompleted: isPast,
            completedAt: isPast ? new Date(t.dueDate) : null,
          },
        });
      }
      console.log(`✅ Seeded demo Crop Plan (ID: ${createdPlan.id}) with ${planTasks.length} tasks!`);
    }
  }

  console.log("🌾 KisanSaathi Phase 3 database seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
