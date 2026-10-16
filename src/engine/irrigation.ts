import { getCropData } from "../data/crops";
import { IrrigationMethod } from "./types";

export interface IrrigationWaterEstimate {
  cropId: string;
  areaAcre: number;
  irrigationMethod: IrrigationMethod;
  waterReqMm: number;
  efficiencyPercent: number;
  effectiveWaterMm: number;
  totalLitresPerAcre: number;
  totalLitresFarm: number;
  pumpHp: number;
  pumpDischargeLpm: number;
  totalPumpHours: number;
  weeklyPumpHoursAverage: number;
  estimatedEnergyKwh: number;
  estimatedCostElectricityRupees: number;
  estimatedCostDieselRupees: number;
  waterSavingVsFloodLitres: number;
  waterSavingPercent: number;
  summaryMr: string;
  summaryEn: string;
}

const METHOD_EFFICIENCIES: Record<IrrigationMethod, number> = {
  drip: 0.9, // 90% efficiency
  sprinkler: 0.75, // 75% efficiency
  flood: 0.5, // 50% efficiency
  rainfed: 0.8, // relies on natural monsoon
};

/**
 * Calculates water requirement, pump running hours and energy cost for a crop plan
 */
export function calculateIrrigationRequirements(
  cropId: string,
  areaAcre: number,
  method: IrrigationMethod = "drip",
  pumpHp: number = 5.0
): IrrigationWaterEstimate {
  const crop = getCropData(cropId);
  const baseWaterMm = crop.waterReqMm; // mm required over crop lifecycle

  const efficiency = METHOD_EFFICIENCIES[method] || 0.75;
  const floodEfficiency = METHOD_EFFICIENCIES.flood;

  // 1 mm over 1 acre = 4,047 Litres of water
  const LITRES_PER_ACRE_MM = 4047;

  // Gross water depth needed factoring in application efficiency
  const grossWaterDepthMm = baseWaterMm / efficiency;
  const floodWaterDepthMm = baseWaterMm / floodEfficiency;

  const totalLitresPerAcre = Math.round(grossWaterDepthMm * LITRES_PER_ACRE_MM);
  const totalLitresFarm = Math.round(totalLitresPerAcre * areaAcre);

  // Water savings relative to conventional flood irrigation
  const floodLitresFarm = Math.round(floodWaterDepthMm * LITRES_PER_ACRE_MM * areaAcre);
  const waterSavingVsFlood = Math.max(0, floodLitresFarm - totalLitresFarm);
  const waterSavingPercent = floodLitresFarm > 0 ? Math.round((waterSavingVsFlood / floodLitresFarm) * 100) : 0;

  // Pump discharge: 5 HP delivers ~ 350 LPM = 21,000 Litres/Hour
  // Formula: discharge LPM = pumpHp * 70
  const dischargeLpm = Math.max(100, Math.round(pumpHp * 70));
  const litresPerHour = dischargeLpm * 60;

  const totalPumpHours = method === "rainfed" ? 0 : Number((totalLitresFarm / litresPerHour).toFixed(1));

  const durationWeeks = Math.max(4, Math.round((crop.durationDaysMin + crop.durationDaysMax) / 2 / 7));
  const weeklyPumpHours = Number((totalPumpHours / durationWeeks).toFixed(1));

  // Electric power: 1 HP = 0.746 kW; Motor efficiency ~ 85%
  const powerKw = (pumpHp * 0.746) / 0.85;
  const estimatedKwh = Math.round(powerKw * totalPumpHours);

  // Tariff: Maharashtra agricultural subsidized power @ ~₹1.80/kWh
  const estimatedCostElectricity = Math.round(estimatedKwh * 1.8);

  // Diesel alternative: ~0.25 L diesel/HP/hr @ ₹92/L
  const dieselLitres = pumpHp * 0.25 * totalPumpHours;
  const estimatedCostDiesel = Math.round(dieselLitres * 92);

  const methodNamesMr: Record<IrrigationMethod, string> = {
    drip: "ठिबक सिंचन (Drip)",
    sprinkler: "तुषार सिंचन (Sprinkler)",
    flood: "पाटपाणी / पूर पद्धत (Flood)",
    rainfed: "कोरडवाहू (Rainfed)",
  };

  const summaryMr = `${methodNamesMr[method]} पद्धतीने एकूण ${totalLitresFarm.toLocaleString("en-IN")} लिटर पाण्याची गरज भासेल. ५ HP पंपाने सुमारे ${totalPumpHours} तास (दर आठवड्याला ${weeklyPumpHours} तास) पाणी द्यावे लागेल. पाटपाण्याच्या तुलनेत ${waterSavingPercent}% पाण्याची बचत होईल.`;
  const summaryEn = `Using ${method}, total farm requirement is ${totalLitresFarm.toLocaleString("en-IN")} Litres. At 5 HP pump, approximately ${totalPumpHours} hours runtime required (~${weeklyPumpHours} hrs/week). Saves ${waterSavingPercent}% water compared to flood irrigation.`;

  return {
    cropId,
    areaAcre,
    irrigationMethod: method,
    waterReqMm: baseWaterMm,
    efficiencyPercent: Math.round(efficiency * 100),
    effectiveWaterMm: Math.round(grossWaterDepthMm),
    totalLitresPerAcre,
    totalLitresFarm,
    pumpHp,
    pumpDischargeLpm: dischargeLpm,
    totalPumpHours,
    weeklyPumpHoursAverage: weeklyPumpHours,
    estimatedEnergyKwh: estimatedKwh,
    estimatedCostElectricityRupees: estimatedCostElectricity,
    estimatedCostDieselRupees: estimatedCostDiesel,
    waterSavingVsFloodLitres: waterSavingVsFlood,
    waterSavingPercent,
    summaryMr,
    summaryEn,
  };
}
