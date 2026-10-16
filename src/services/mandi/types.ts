// Types for Mandi Market Intelligence & Price Discovery

export interface MandiPriceRecord {
  id: string;
  mandiId: string;
  mandiNameEn: string;
  mandiNameMr: string;
  district: string;
  state: string;
  cropId: string;
  cropNameEn: string;
  cropNameMr: string;
  variety: string;
  date: string; // YYYY-MM-DD
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  arrivalQuintals: number;
  marketFeePercent: number;
  hamaliPerQuintal: number;
  distanceKm: number;
  source: "AGMARKNET_LIVE" | "MAHA_AGRI_SEED";
  provenance: {
    type: "live" | "demo" | "estimate";
    sourceText: string;
    dateText: string;
  };
}

export interface MandiHistoricalPoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalQuintals: number;
}

export interface WarehouseFacility {
  id: string;
  nameEn: string;
  nameMr: string;
  type: "COLD_STORAGE" | "WAREHOUSE" | "GOVT_GODOWN" | "FPO_COLLECTION";
  district: string;
  taluka: string;
  address: string;
  capacityMetricTonnes: number;
  availableCapacityMT: number;
  monthlyRatePerQuintal: number;
  hasWdraAccreditation: boolean; // Enables Negotiable Warehouse Receipts (e-NWR) for 7% interest subvention loans
  contactPerson: string;
  contactPhone: string;
  suitableCrops: string[];
}

export interface MandiDashboardResponse {
  cropId: string;
  cropNameEn: string;
  cropNameMr: string;
  farmerDistrict: string;
  stateAverageModalPrice: number;
  stateChange7dPercent: number;
  totalArrivalsQuintalsToday: number;
  bestMandi: MandiPriceRecord;
  nearestMandi: MandiPriceRecord;
  allMandis: MandiPriceRecord[];
  trend7d: {
    direction: "UP" | "DOWN" | "FLAT";
    directionLabelMr: string;
    directionLabelEn: string;
    percentChange: number;
    points: MandiHistoricalPoint[];
  };
  trend30d: {
    direction: "UP" | "DOWN" | "FLAT";
    directionLabelMr: string;
    directionLabelEn: string;
    percentChange: number;
    points: MandiHistoricalPoint[];
  };
  trend90d: {
    direction: "UP" | "DOWN" | "FLAT";
    directionLabelMr: string;
    directionLabelEn: string;
    percentChange: number;
    points: MandiHistoricalPoint[];
  };
  warehousesNearby: WarehouseFacility[];
  provenance: {
    type: "live" | "demo";
    sourceText: string;
    lastUpdated: string;
  };
}
