export type PathogenType =
  | "Fungal"
  | "Bacterial"
  | "Viral"
  | "Pest"
  | "Nutrient_Deficiency";

export type AffectedPlantPart =
  | "Leaf"
  | "Stem"
  | "Fruit_Pod"
  | "Root_Base"
  | "Flower"
  | "Whole_Plant";

export type ColorPattern =
  | "Yellowing"
  | "Brown_Black_Spots"
  | "White_Powder"
  | "Curling"
  | "Wilting"
  | "Holes_Chewed";

export type GrowthStage =
  | "Seedling"
  | "Vegetative"
  | "Flowering"
  | "Fruiting_Maturity"
  | "All_Stages";

export type DiseaseSeverity = "Low" | "Medium" | "High" | "Critical";

export interface PlantDiseaseDef {
  id: string;
  cropId: string;
  cropNameMr: string;
  cropNameEn: string;
  nameMr: string;
  nameEn: string;
  nameHi: string;
  scientificName?: string;
  pathogenType: PathogenType;
  pathogenTypeLabelMr: string;
  affectedPlantPart: AffectedPlantPart;
  affectedPlantPartLabelMr: string;
  colorPattern: ColorPattern;
  colorPatternLabelMr: string;
  growthStage: GrowthStage;
  severity: DiseaseSeverity;
  symptomsMr: string[];
  symptomsEn: string[];
  organicControlMr: string;
  organicControlEn: string;
  chemicalControlMr: string;
  chemicalControlEn: string;
  dosagePerLitre: string;
  knapsack15LDose: string;
  precautionMr: string;
  precautionEn: string;
  samplePresetLabel?: string;
  samplePhotoUrl?: string;
}

export const VERIFIED_DISEASES: PlantDiseaseDef[] = [
  // ==========================================
  // COTTON (कापूस)
  // ==========================================
  {
    id: "cotton-pink-bollworm",
    cropId: "cotton",
    cropNameMr: "कापूस",
    cropNameEn: "Cotton",
    nameMr: "गुलाबी बोंडअळी (Pink Bollworm)",
    nameEn: "Pink Bollworm (Pectinophora gossypiella)",
    nameHi: "गुलाबी सुंडी",
    scientificName: "Pectinophora gossypiella",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "कीड (बोंडअळी)",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "बोंडे व फुले",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "बोंडाला छिद्र व आत अळी",
    growthStage: "Flowering",
    severity: "Critical",
    symptomsMr: [
      "गुलाबी रंगाची लहान अळी बोंडामध्ये शिरून आतील सरकी व रुई खाते.",
      "डोमकळी (Rosette flower) तयार होऊन फुले पूर्ण उमलत नाहीत.",
      "बोंडावर छिद्र पडून बोंडे अकाली उमलतात व रुई काळी पडून गुणवत्ता खराब होते.",
    ],
    symptomsEn: [
      "Rosetted flowers that fail to open properly.",
      "Larvae bore inside bolls feeding on seeds and lint.",
      "Premature opening of defective, stained bolls.",
    ],
    organicControlMr:
      "प्रति एकरी ५ फेरोमोन ट्रॅप (Pheromone traps) लावा. ट्रायकोकार्ड (Trichogramma) १.५ लाख अंडी प्रति हेक्टरी ३ वेळा सोडा. ५% निंबोळी अर्काची फवारणी करा.",
    organicControlEn:
      "Install 5 pheromone traps per acre. Release Trichogramma parasitoid cards (60,000/acre). Spray 5% neem seed kernel extract (NSKE).",
    chemicalControlMr:
      "प्रादुर्भाव आर्थिक नुकसान पातळी (ETL - ८ पतंग सलग ३ दिवस) ओलांडल्यास: प्रोफेनोफॉस ५०% EC किंवा क्लोरँट्रानिलीप्रोल १८.५% SC फवारा.",
    chemicalControlEn:
      "If ETL is crossed (8 moths/trap for 3 consecutive nights): Spray Profenofos 50% EC or Chlorantraniliprole 18.5% SC.",
    dosagePerLitre: "०.३ मिली क्लोरँट्रानिलीप्रोल किंवा २ मिली प्रोफेनोफॉस प्रति लिटर पाणी",
    knapsack15LDose: "५ मिली क्लोरँट्रानिलीप्रोल किंवा ३० मिली प्रोफेनोफॉस प्रति १५ लिटर पंप",
    precautionMr:
      "सलग एकाच कीटकनाशकाची फवारणी करू नका. फरदड कापूस (ratoon cotton) घेणे टाळा. संध्याकाळी ५ नंतर फवारणी करा.",
    precautionEn:
      "Rotate chemical modes of action to prevent resistance. Terminate crop by December; avoid ratoon crop.",
    samplePresetLabel: "कापूस - गुलाबी बोंडअळी प्रात्यक्षिक",
  },
  {
    id: "cotton-sucking-pests",
    cropId: "cotton",
    cropNameMr: "कापूस",
    cropNameEn: "Cotton",
    nameMr: "रसशोषक किडी - मावा, तुडतुडे व फुलकिडे (Sucking Pests)",
    nameEn: "Sucking Pest Complex (Aphids, Jassids, Thrips)",
    nameHi: "रस चूसक कीट",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "रसशोषक कीड",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने",
    colorPattern: "Curling",
    colorPatternLabelMr: "पाने आकसणे व पिवळी पडणे",
    growthStage: "Vegetative",
    severity: "High",
    symptomsMr: [
      "पानांच्या कडा खाली किंवा वर वाकणे (कप सारखा आकार).",
      "पानांच्या मागून रस शोषल्याने पाने पिवळी पडून तांबूस होतात.",
      "झाडांची वाढ खुंटते आणि बोंडे लहान राहतात.",
    ],
    symptomsEn: [
      "Curling of leaf margins downwards/upwards (cupping symptom).",
      "Yellowing and bronzing along the leaf periphery.",
      "Stunted crop growth and delayed flowering.",
    ],
    organicControlMr:
      "पिवळे व निळे चिकट सापळे (Yellow & Blue Sticky Traps) प्रति एकरी १०-१२ लावा. व्हर्टिसिलियम लेकॅनी ५ ग्रॅम प्रति लिटर किंवा १०,००० पीपीएम निंबोळी तेल फवारा.",
    organicControlEn:
      "Install 10-12 yellow and blue sticky traps per acre. Spray Verticillium lecanii (5g/L) or Neem oil 10,000 ppm.",
    chemicalControlMr:
      "प्रादुर्भाव जास्त असल्यास: फ्लॉओनिकॅमिड ५०% WG (Flonicamid) किंवा ॲसिटामिप्रीड २०% SP फवारा.",
    chemicalControlEn: "Spray Flonicamid 50% WG or Acetamiprid 20% SP.",
    dosagePerLitre: "०.३ ग्रॅम फ्लॉओनिकॅमिड किंवा ०.२ ग्रॅम ॲसिटामिप्रीड प्रति लिटर पाणी",
    knapsack15LDose: "५ ग्रॅम फ्लॉओनिकॅमिड प्रति १५ लिटर पंप",
    precautionMr:
      "मधमाश्या व मित्रकिडींचे रक्षण करण्यासाठी तीव्र सिंथेटिक पायरेथ्रॉईड्स फवारू नका.",
    precautionEn: "Avoid broad-spectrum pyrethroids to protect natural predators.",
  },
  {
    id: "cotton-bacterial-blight",
    cropId: "cotton",
    cropNameMr: "कापूस",
    cropNameEn: "Cotton",
    nameMr: "काळा करपा / जिवाणूजन्य ठिपके (Bacterial Blight)",
    nameEn: "Bacterial Blight / Angular Leaf Spot (Xanthomonas)",
    nameHi: "जीवाणु झुलसा",
    scientificName: "Xanthomonas citri pv. malvacearum",
    pathogenType: "Bacterial",
    pathogenTypeLabelMr: "जिवाणूजन्य रोग",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने व फांद्या",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "कोनीय काळे ठिपके (Angular Spots)",
    growthStage: "Vegetative",
    severity: "Medium",
    symptomsMr: [
      "पानांवर शिरांमधील भागात कोनीय (Angular) काळपट-तपकिरी ठिपके.",
      "रोगाचा प्रादुर्भाव वाढल्यास फांद्या काळ्या पडून मोडतात (Black arm अवस्था).",
      "बोंडावर काळे पाणी भरल्यासारखे गोल डाग पडतात.",
    ],
    symptomsEn: [
      "Angular water-soaked spots bounded by veins on leaves.",
      "Blackening of stems causing branches to break (black arm).",
      "Sunken round brownish lesions on developing bolls.",
    ],
    organicControlMr:
      "स्यूडोमोनास फ्लुरोसन्स (Pseudomonas fluorescens) १० ग्रॅम प्रति लिटर पाणी फवारा.",
    organicControlEn: "Foliar spray of Pseudomonas fluorescens bio-agent @ 10g/L.",
    chemicalControlMr:
      "कॉपर ऑक्सिक्लोराईड ५०% WP (COC) + स्ट्रेप्टोमायसीन सल्फेट (Streptocycline) चे मिश्रण फवारा.",
    chemicalControlEn: "Copper Oxychloride 50% WP + Streptomycin Sulphate (Streptocycline).",
    dosagePerLitre: "२.५ ग्रॅम कॉपर ऑक्सिक्लोराईड + ०.१ ग्रॅम स्ट्रेप्टोसायक्लिन प्रति लिटर पाणी",
    knapsack15LDose: "४० ग्रॅम कॉपर ऑक्सिक्लोराईड + १.५ ग्रॅम स्ट्रेप्टोसायक्लिन प्रति १५ लिटर पंप",
    precautionMr: "सतत ढगाळ व पावसाळी हवेत रोगाचा प्रसार वेगाने होतो; त्वरित फवारणी करा.",
    precautionEn: "Spray immediately during continuous humid overcast spells.",
  },

  // ==========================================
  // SOYBEAN (सोयाबीन)
  // ==========================================
  {
    id: "soybean-yellow-mosaic",
    cropId: "soybean",
    cropNameMr: "सोयाबीन",
    cropNameEn: "Soybean",
    nameMr: "पिवळा मोझॅक रोग (Yellow Mosaic Virus)",
    nameEn: "Soybean Yellow Mosaic Virus (YMV)",
    nameHi: "पीला मोज़ेक वायरस",
    pathogenType: "Viral",
    pathogenTypeLabelMr: "विषाणूजन्य रोग (पांढऱ्या माशीद्वारे प्रसार)",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने",
    colorPattern: "Yellowing",
    colorPatternLabelMr: "पानांवर पिवळे व हिरवे चट्टे",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "पानांवर पिवळे आणि हिरवे अनियमित चट्टे दिसतात.",
      "संपूर्ण पान पिवळे पडून कडक होते व प्रकाशसंश्लेषण थांबते.",
      "शेंगा लहान राहतात किंवा शेंगांमध्ये दाणे भरत नाहीत.",
    ],
    symptomsEn: [
      "Bright yellow chlorotic patches alternating with dark green areas on leaves.",
      "Complete yellowing and rustling of the foliage.",
      "Poor pod setting and unfilled shrivelled grains.",
    ],
    organicControlMr:
      "रोगाचा प्रसार करणारी पांढरी माशी रोखण्यासाठी प्रति एकरी १० पिवळे चिकट सापळे लावा. ५% निंबोळी अर्क फवारा. बाधित झाडे उपटून नष्ट करा.",
    organicControlEn:
      "Install 10 yellow sticky traps per acre to control vector whiteflies. Rogue out and destroy infected plants.",
    chemicalControlMr:
      "विषाणूवर थेट औषध नसते; वाहक पांढरी माशी नियंत्रणासाठी: थायामेथोक्साम २५% WG किंवा बीटा-सायफ्लुथ्रीन + इमिडाक्लोप्रिड फवारा.",
    chemicalControlEn:
      "Control whitefly vector using Thiamethoxam 25% WG or Beta-cyfluthrin + Imidacloprid.",
    dosagePerLitre: "०.५ ग्रॅम थायामेथोक्साम प्रति लिटर पाणी",
    knapsack15LDose: "७.५ ग्रॅम थायामेथोक्साम प्रति १५ लिटर पंप",
    precautionMr: "बाधित झाडे शेतात न ठेवता गोळा करून जाळून नष्ट करा.",
    precautionEn: "Promptly rogue out infected plants to prevent field-wide vector spread.",
    samplePresetLabel: "सोयाबीन - पिवळा मोझॅक प्रात्यक्षिक",
  },
  {
    id: "soybean-spodoptera-armyworm",
    cropId: "soybean",
    cropNameMr: "सोयाबीन",
    cropNameEn: "Soybean",
    nameMr: "तंबाखूची पाने खाणारी अळी / लष्करी अळी (Spodoptera)",
    nameEn: "Spodoptera Tobacco Caterpillar / Armyworm",
    nameHi: "तंबाकू की इल्ली",
    scientificName: "Spodoptera litura",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "कीड (पाने खाणारी अळी)",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने व शेंगा",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "पाने चाळणीसारखी खाल्लेली",
    growthStage: "Vegetative",
    severity: "High",
    symptomsMr: [
      "लहान अळ्या पानांचा हिरवा पापुद्रा खरडून खातात, त्यामुळे पाने जाळीदार (Paper like) होतात.",
      "मोठ्या अळ्या संपूर्ण पाने फस्त करून केवळ शिरा शिल्लक ठेवतात (पाने चाळणीसारखी दिसतात).",
      "फुलोरा व कोवळ्या शेंगा कुरतडल्या जातात.",
    ],
    symptomsEn: [
      "Young larvae scrape chlorophyll leaving paper-white skeletonized patches.",
      "Grown larvae voraciously feed defoliating crops completely leaving only veins.",
      "Damage extends to flowers and tender green pods.",
    ],
    organicControlMr:
      "अंड्यांचे पुंजके गोळा करून नष्ट करा. एसएल एनपीव्ही (Sl-NPV) २५० एलई प्रति हेक्टरी किंवा नोमुरिया रिलेई (Nomuraea rileyi) ५ ग्रॅम/लिटर फवारा.",
    organicControlEn:
      "Collect and destroy egg masses. Spray Sl-NPV biological control or Nomuraea rileyi bio-fungus.",
    chemicalControlMr:
      "इमामेक्टिन बेन्झोएट ५% SG किंवा क्लोरँट्रानिलीप्रोल १८.५% SC फवारा.",
    chemicalControlEn: "Spray Emamectin Benzoate 5% SG or Chlorantraniliprole 18.5% SC.",
    dosagePerLitre: "०.४ ग्रॅम इमामेक्टिन बेन्झोएट प्रति लिटर पाणी",
    knapsack15LDose: "६ ग्रॅम इमामेक्टिन बेन्झोएट प्रति १५ लिटर पंप",
    precautionMr: "अळी रात्री जास्त सक्रिय असते; फवारणी दुपारनंतर ५ वाजेनंतर करावी.",
    precautionEn: "Caterpillars feed nocturnally; spray in the late afternoon.",
  },
  {
    id: "soybean-charcoal-rot",
    cropId: "soybean",
    cropNameMr: "सोयाबीन",
    cropNameEn: "Soybean",
    nameMr: "खोड कुजव्या / चारकोल रॉट (Charcoal Rot)",
    nameEn: "Charcoal Rot / Dry Root Rot (Macrophomina)",
    nameHi: "चारकोल सड़न",
    scientificName: "Macrophomina phaseolina",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य रोग",
    affectedPlantPart: "Stem",
    affectedPlantPartLabelMr: "खोड व मुळे",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "खोडावर काजळीसारखा काळा थर",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "पावसाचा दीर्घ खंड पडल्यास व तापमान जास्त असल्यास प्रादुर्भाव होतो.",
      "झाडाची पाने अचानक पिवळी पडून कोमेजतात आणि झाड वाळते.",
      "खोड सोलून पाहिल्यास आत कोळशासारखे बारीक काळे दाणे (Sclerotia) दिसतात.",
    ],
    symptomsEn: [
      "Premature drying of plants during prolonged dry spells and high temperatures.",
      "Stems show ash-grey to charcoal-black discolouration when split open.",
      "Pith tissue is disintegrating and full of minute black microsclerotia.",
    ],
    organicControlMr:
      "पेरणीपूर्वी ट्रायकोडर्मा हरझियानम (Trichoderma) ५ ग्रॅम प्रति किलो बियाण्याला चोळा.",
    organicControlEn: "Seed treatment with Trichoderma harzianum @ 5g/kg seed.",
    chemicalControlMr:
      "टेब्युकोनॅझोल १०% + सल्फर ६५% WG किंवा कार्बेन्डाझिम ५०% WP जमिनीजवळ खोडावर फवारा.",
    chemicalControlEn: "Spray Tebuconazole 10% + Sulphur 65% WG at the collar zone.",
    dosagePerLitre: "२ ग्रॅम टेब्युकोनॅझोल + सल्फर प्रति लिटर पाणी",
    knapsack15LDose: "३० ग्रॅम प्रति १५ लिटर पंप",
    precautionMr: "पाण्याचा ताण टाळा; हलके सिंचन देऊन जमिनीतील ओलावा टिकवा.",
    precautionEn: "Maintain soil moisture with light irrigation during pod development.",
  },

  // ==========================================
  // ONION (कांदा)
  // ==========================================
  {
    id: "onion-purple-blotch",
    cropId: "onion",
    cropNameMr: "कांदा",
    cropNameEn: "Onion",
    nameMr: "जांभळा करपा (Purple Blotch)",
    nameEn: "Purple Blotch (Alternaria porri)",
    nameHi: "बैंगनी धब्बा रोग",
    scientificName: "Alternaria porri",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य करपा",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने (पात)",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "जांभळट-तपकिरी लंबगोलाकार चट्टे",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "पातीवर सुरुवातीला पांढरट-राखाडी लहान पाण्याचे डाग पडतात.",
      "डागांचा मध्यभाग जांभळा-तपकिरी होतो आणि कडा पिवळसर होतात.",
      "जांभळे डाग वाढून पात मधोमध वाकते, करपून सुकते व कांद्याचा आकार लहान राहतो.",
    ],
    symptomsEn: [
      "Small sunken water-soaked spots with purple centres on onion scapes/leaves.",
      "Lesions coalesce, leaves break over and die back.",
      "Severe yield reduction and poor bulb formation.",
    ],
    organicControlMr:
      "ट्रायकोडर्मा व्हिरीडी १० ग्रॅम प्रति लिटर पाणी + ५% गोमूत्र अर्क फवारा. हवेतील आर्द्रता जास्त असताना ताक-हिंग द्रावण द्या.",
    organicControlEn:
      "Foliar spray of Trichoderma viride @ 10g/L + cow urine 5%. Use sour buttermilk spray.",
    chemicalControlMr:
      "मॅन्कोझेब ७५% WP किंवा अझॉक्सिस्ट्रॉबिन + डायफेनोकोनॅझोल (Amistar Top) फवारा. कांद्याच्या पातीवर औषध टिकण्यासाठी स्टिकर (Spreader/Sticker) नक्की वापरा.",
    chemicalControlEn:
      "Spray Mancozeb 75% WP or Azoxystrobin + Difenoconazole with agricultural non-ionic wetting sticker.",
    dosagePerLitre: "१ मिली अझॉक्सिस्ट्रॉबिन + डायफेनोकोनॅझोल + ०.५ मिली स्टिकर प्रति लिटर",
    knapsack15LDose: "१५ मिली Amistar Top + ७.५ मिली स्टिकर प्रति १५ लिटर पंप",
    precautionMr:
      "कांद्याची पात गुळगुळीत मेणासारखी असल्याने औषध निसटून जाते; चांगल्या दर्जाचा 'सिलिकॉन स्टिकर' वापरल्याशिवाय फवारणी करू नका.",
    precautionEn:
      "Onion foliage has a waxy cuticle; ALWAYS add a quality non-ionic silicone sticker to the tank.",
    samplePresetLabel: "कांदा - जांभळा करपा प्रात्यक्षिक",
  },
  {
    id: "onion-thrips",
    cropId: "onion",
    cropNameMr: "कांदा",
    cropNameEn: "Onion",
    nameMr: "कांद्यावरील फुलकिडे / थ्रिप्स (Onion Thrips)",
    nameEn: "Onion Thrips (Thrips tabaci)",
    nameHi: "प्याज के थ्रिप्स",
    scientificName: "Thrips tabaci",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "बारीक रसशोषक कीड",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पातीचा तळभाग",
    colorPattern: "White_Powder",
    colorPatternLabelMr: "पातीवर पांढुरके चंदेरी ओरखडे",
    growthStage: "Vegetative",
    severity: "High",
    symptomsMr: [
      "पातीवर पांढुरके, रुपेरी रंगाचे बारीक चट्टे किंवा ओरखडे दिसतात.",
      "पातीचा शेंडा वाकडा होऊन पात पिवळी पडते (टाकळी अवस्था).",
      "पातीच्या खोबणीत सूक्ष्म पिवळसर-तपकिरी किडे हालचाल करताना दिसतात.",
    ],
    symptomsEn: [
      "Silvery white streaks and blotches on foliage from cell sap scraping.",
      "Curled and distorted leaf scapes with burnt tips.",
      "Tiny slender yellow-brown insects visible inside the leaf sheaths.",
    ],
    organicControlMr:
      "प्रति एकरी १५-२० निळे चिकट सापळे (Blue Sticky Traps) लावा. ५% निंबोळी अर्क किंवा दशपर्णी अर्काची फवारणी करा.",
    organicControlEn:
      "Install 15-20 blue sticky traps per acre. Spray 5% neem seed kernel extract (NSKE).",
    chemicalControlMr:
      "फिप्रोनिल ५% SC किंवा स्पिनोसॅड ४५% SC किंवा थायामेथोक्साम २५% WG फवारा (स्टिकरसह).",
    chemicalControlEn:
      "Spray Fipronil 5% SC or Spinosad 45% SC or Thiamethoxam 25% WG with sticker.",
    dosagePerLitre: "१.५ मिली फिप्रोनिल किंवा ०.३ मिली स्पिनोसॅड प्रति लिटर पाणी",
    knapsack15LDose: "२२ मिली फिप्रोनिल किंवा ५ मिली स्पिनोसॅड प्रति १५ लिटर पंप",
    precautionMr:
      "फवारणी पातीच्या आतील खोबणीपर्यंत पोहोचेल अशा दाबाने नोजल लावून करावी.",
    precautionEn: "Direct nozzle inside the leaf axils for proper canopy penetration.",
  },

  // ==========================================
  // TOMATO (टोमॅटो)
  // ==========================================
  {
    id: "tomato-early-blight",
    cropId: "tomato",
    cropNameMr: "टोमॅटो",
    cropNameEn: "Tomato",
    nameMr: "लवकर येणारा करपा (Early Blight)",
    nameEn: "Early Blight (Alternaria solani)",
    nameHi: "अगेती झुलसा",
    scientificName: "Alternaria solani",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य करपा",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "खालची जुनी पाने",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "तपकिरी गोलाकार चक्राकार ठिपके (Target Board)",
    growthStage: "Vegetative",
    severity: "High",
    symptomsMr: [
      "सुरुवातीला झाडाच्या खालच्या जुन्या पानांवर काळे-तपकिरी गोल ठिपके पडतात.",
      "ठिपक्यांमध्ये एकमेकांभोवती बांगडीसारखी वलये (Target board rings) दिसतात.",
      "पाने पिवळी पडून गळतात आणि फळांच्या देठाभोवती काळे चट्टे पडून फळे सडतात.",
    ],
    symptomsEn: [
      "Concentric rings producing a characteristic 'target board' effect on leaves.",
      "Lower leaves develop dark brown to black circular lesions.",
      "Defoliation and dark leathery sunken lesions at the fruit stem end.",
    ],
    organicControlMr:
      "ट्रायकोडर्मा हरझियानम ५ ग्रॅम/लिटर किंवा तांब्याची भांडी ठेवलेले आंबट ताक फवारा.",
    organicControlEn:
      "Foliar spray of Trichoderma harzianum or fermented sour buttermilk (50ml/L).",
    chemicalControlMr:
      "मॅन्कोझेब ७५% WP (२.५ ग्रॅम/लिटर) किंवा क्लोरोथॅलोनिल ७५% WP किंवा अझॉक्सिस्ट्रॉबिन २३% SC फवारा.",
    chemicalControlEn: "Spray Mancozeb 75% WP or Chlorothalonil 75% WP or Azoxystrobin 23% SC.",
    dosagePerLitre: "१ मिली अझॉक्सिस्ट्रॉबिन किंवा २.५ ग्रॅम मॅन्कोझेब प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली अझॉक्सिस्ट्रॉबिन किंवा ४० ग्रॅम मॅन्कोझेब प्रति १५ लिटर पंप",
    precautionMr:
      "झाडाच्या बुंध्याकडील खालची पिवळी झालेली पाने काढून नष्ट करा, यामुळे बुरशीचा प्रसार रोखला जातो.",
    precautionEn: "Prune lower senescent leaves to improve air circulation and prevent soil splash.",
    samplePresetLabel: "टोमॅटो - लवकर येणारा करपा प्रात्यक्षिक",
  },
  {
    id: "tomato-late-blight",
    cropId: "tomato",
    cropNameMr: "टोमॅटो",
    cropNameEn: "Tomato",
    nameMr: "उशिरा येणारा करपा (Late Blight)",
    nameEn: "Late Blight (Phytophthora infestans)",
    nameHi: "पछेती झुलसा",
    scientificName: "Phytophthora infestans",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "घातक बुरशीजन्य करपा",
    affectedPlantPart: "Whole_Plant",
    affectedPlantPartLabelMr: "पाने, देठ व फळे",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "पानांवर पाणी भरल्यासारखे काळपट डाग व पांढरी बुरशी",
    growthStage: "Flowering",
    severity: "Critical",
    symptomsMr: [
      "ढगाळ, थंड व पावसाळी हवेत अचानक प्रादुर्भाव होतो.",
      "पानांच्या मागच्या बाजूला पांढऱ्या बुरशीची लव दिसते व पाने गरम पाण्याने भाजल्यासारखी काळी पडतात.",
      "हिरव्या कच्च्या फळांवर टणक तपकिरी-तपकिरी डाग पडून फळे नासतात; २-३ दिवसांत संपूर्ण पीक उद्ध्वस्त होते.",
    ],
    symptomsEn: [
      "Water-soaked irregular pale green lesions on leaves rapidly turning brown-black.",
      "White cottony fungal bloom on the underside of leaves during high humidity.",
      "Firm, rough dark brown decay on green fruits leading to total crop collapse.",
    ],
    organicControlMr:
      "रोगप्रतिकारक वाण वापरा. रोगाची सुरुवात होताच बोर्डो मिश्रण (Bordeaux Mixture 1%) फवारा.",
    organicControlEn: "Spray 1% freshly prepared Bordeaux mixture at first symptom appearance.",
    chemicalControlMr:
      "सिमोक्सॅनिल ८% + मॅन्कोझेब ६४% WP (Curzate) किंवा सायमोक्सॅनिल किंवा मेटॅलॅक्सिल + मॅन्कोझेब (Ridomil Gold) फवारा.",
    chemicalControlEn:
      "Spray Cymoxanil 8% + Mancozeb 64% WP or Metalaxyl-M 4% + Mancozeb 64% WP (Ridomil Gold).",
    dosagePerLitre: "२.५ ग्रॅम रिडोमिल गोल्ड किंवा २ ग्रॅम सायमोक्सॅनिल प्रति लिटर पाणी",
    knapsack15LDose: "३५ ग्रॅम रिडोमिल गोल्ड प्रति १५ लिटर पंप",
    precautionMr:
      "थंडीत धुके व ढगाळ हवामान असल्यास रोग वेगाने पसरतो; प्रतिबंधात्मक फवारणी वेळेत घ्या.",
    precautionEn:
      "High humidity and cool temperatures favour rapid epidemics; apply prophylactic sprays.",
  },

  // ==========================================
  // GRAPES (द्राक्षे)
  // ==========================================
  {
    id: "grapes-downy-mildew",
    cropId: "grapes",
    cropNameMr: "द्राक्षे",
    cropNameEn: "Grapes",
    nameMr: "केवडा / डाउनी मिल्ड्यू (Downy Mildew)",
    nameEn: "Downy Mildew (Plasmopara viticola)",
    nameHi: "डाउनी फफूंदी (केवड़ा)",
    scientificName: "Plasmopara viticola",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य रोग",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने व फुलोरा/घड",
    colorPattern: "Yellowing",
    colorPatternLabelMr: "पानांवर तेलकट पिवळे डाग व पाठीमागे पांढरी बुरशी",
    growthStage: "Flowering",
    severity: "Critical",
    symptomsMr: [
      "पानांच्या वरील भागावर तेलकट, पिवळसर पारदर्शक डाग (Oil spots) दिसतात.",
      "पानांच्या खालच्या बाजूला सकाळी पांढऱ्याशुभ्र बुरशीची लव दिसते.",
      "फुलोरा किंवा कोवळे घड बाधित झाल्यास घड तपकिरी पडून वाकतात व गळून पडतात.",
    ],
    symptomsEn: [
      "Translucent yellowish oily spots on upper leaf surfaces.",
      "Dense white downy cottony growth on the corresponding lower surface.",
      "Young blossom clusters turn brown, curl like a shepherd's crook, and dry out.",
    ],
    organicControlMr:
      "०.८% ते १% बोर्डो मिश्रण (Bordeaux Mixture) प्रतिबंधात्मक फवारा. ट्रायकोडर्मा व्हिरीडी ५ ग्रॅम/लिटर द्या.",
    organicControlEn:
      "Prophylactic spray of 0.8% - 1% Bordeaux mixture or Trichoderma viride.",
    chemicalControlMr:
      "प्रादुर्भाव सुरू झाल्यास: डायमेथोमॉर्फ ५०% WP किंवा सायमोक्सॅनिल + मॅन्कोझेब किंवा मेंडिप्रापॅमिड २३.४% SC फवारा.",
    chemicalControlEn:
      "Spray Dimethomorph 50% WP or Cymoxanil + Mancozeb or Mandipropamid 23.4% SC.",
    dosagePerLitre: "१ ग्रॅम डायमेथोमॉर्फ किंवा ०.८ मिली मेंडिप्रापॅमिड प्रति लिटर पाणी",
    knapsack15LDose: "१५ ग्रॅम डायमेथोमॉर्फ प्रति १५ लिटर पंप",
    precautionMr:
      "द्राक्ष बागेत हवा खेळती राहण्यासाठी कॅनोपी मॅनेजमेंट (वेलींची विरळणी) काटेकोर करा.",
    precautionEn: "Maintain canopy ventilation through de-shooting and shoot thinning.",
    samplePresetLabel: "द्राक्षे - केवडा (Downy Mildew) प्रात्यक्षिक",
  },
  {
    id: "grapes-powdery-mildew",
    cropId: "grapes",
    cropNameMr: "द्राक्षे",
    cropNameEn: "Grapes",
    nameMr: "भुरी रोग (Powdery Mildew)",
    nameEn: "Powdery Mildew (Erysiphe necator)",
    nameHi: "चूर्णिल आसिता (भूरी)",
    scientificName: "Erysiphe necator",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य भुरी",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "फळे (मणी) व पाने",
    colorPattern: "White_Powder",
    colorPatternLabelMr: "पांढऱ्या पावडरीचा थर",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "पाने, फांद्या आणि मण्यांवर पांढऱ्या राखाडी पावडरीचा दाट थर दिसतो.",
      "मण्यांवर भुरी आल्यास मण्यांची साल टणक होते, मणी तडकतात (Berry cracking) आणि सडतात.",
      "द्राक्षांना आंबट, कुजकट वास येतो व घड बाजारात विकण्यायोग्य राहत नाही.",
    ],
    symptomsEn: [
      "Powdery greyish-white ash-like coating on green berries and foliage.",
      "Infected berries become hard, crack open exposing seeds, and fail to mature.",
      "Musty mildew smell in the vineyard canopy.",
    ],
    organicControlMr:
      "विद्राव्य गंधक (Sulphur 80% WDG) २ ग्रॅम प्रति लिटर पाणी किंवा ॲम्पेलोमायसेस (Ampelomyces quisqualis) बायो-फंगस फवारा.",
    organicControlEn: "Water dispersible sulfur (80% WDG) @ 2g/L or Ampelomyces quisqualis bio-agent.",
    chemicalControlMr:
      "पेनकोनॅझोल १०% EC किंवा मायक्लोब्युटॅनिल १०% WP किंवा टेब्युकोनॅझोल २५.९% EC फवारा.",
    chemicalControlEn: "Spray Penconazole 10% EC or Myclobutanil 10% WP or Tebuconazole 25.9% EC.",
    dosagePerLitre: "०.५ मिली पेनकोनॅझोल किंवा ०.७५ मिली टेब्युकोनॅझोल प्रति लिटर पाणी",
    knapsack15LDose: "८ मिली पेनकोनॅझोल प्रति १५ लिटर पंप",
    precautionMr: "तापमान ३२°C पेक्षा जास्त असताना गंधक फवारल्यास पानांवर चटके बसतात; गंधक सकाळी फवारा.",
    precautionEn: "Do not spray sulfur at temperatures above 32°C to prevent phytotoxicity scorch.",
  },

  // ==========================================
  // POMEGRANATE (डाळिंब)
  // ==========================================
  {
    id: "pomegranate-bacterial-blight",
    cropId: "pomegranate",
    cropNameMr: "डाळिंब",
    cropNameEn: "Pomegranate",
    nameMr: "तेल्या रोग / जिवाणूजन्य करपा (Bacterial Blight / Telya)",
    nameEn: "Bacterial Blight / Black Spot / Telya (Xanthomonas)",
    nameHi: "तेलिया रोग",
    scientificName: "Xanthomonas axonopodis pv. punicae",
    pathogenType: "Bacterial",
    pathogenTypeLabelMr: "घातक जिवाणूजन्य रोग",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "फळे, पाने व खोड",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "फळांवर तेलकट काळे डाग व 'L' किंवा 'Y' आकाराच्या भेगा",
    growthStage: "Fruiting_Maturity",
    severity: "Critical",
    symptomsMr: [
      "पानांवर सुरुवातीला लहान काळे, तेलकट, पाण्याचे डाग पडतात जे नंतर एकत्र येतात.",
      "फळांवर काळे तेलकट चट्टे पडतात आणि फळांवर इंग्रजी 'L' किंवा 'Y' आकाराच्या खोल भेगा पडतात.",
      "खोडावर काळ्या गाठी व कॅन्कर (Canker) पडून झाडाची फांदी एकाएकी वाळते.",
    ],
    symptomsEn: [
      "Water-soaked dark lesions on leaves turning into oily angular black spots.",
      "Characteristic 'L' or 'Y' shaped cracks developing on infected fruit rinds.",
      "Canker lesions and splitting on branches leading to stem girdling.",
    ],
    organicControlMr:
      "छाटणी करताना हत्यारे कॉपर किंवा अल्कोहोलने निर्जंतुक करा. बोर्डो पेस्ट (Bordeaux Paste 10%) खोडावर लावा. बॅसिलस सबटिलिस ५ ग्रॅम/लिटर फवारा.",
    organicControlEn:
      "Sterilize pruning secateurs. Apply 10% Bordeaux paste to trunks and cut ends. Spray Bacillus subtilis.",
    chemicalControlMr:
      "स्ट्रेप्टोसायक्लिन (Streptocycline 500 ppm) + कॉपर ऑक्सिक्लोराईड किंवा कॉपर हायड्रॉक्साईड फवारा. सोबत २-ब्रोमो-२-नायट्रोप्रोपेन (Bacterimycin) फवारा.",
    chemicalControlEn:
      "Spray Streptomycin sulphate (0.5g/L) + Copper Oxychloride 50% WP (2.5g/L) + 2-bromo-2-nitropropane-1,3-diol (0.5g/L).",
    dosagePerLitre: "२.५ ग्रॅम कॉपर ऑक्सिक्लोराईड + ०.५ ग्रॅम स्ट्रेप्टोसायक्लिन प्रति लिटर",
    knapsack15LDose: "३५ ग्रॅम कॉपर + ७.५ ग्रॅम स्ट्रेप्टोसायक्लिन प्रति १५ लिटर पंप",
    precautionMr:
      "बागेतील पडलेली बाधित फळे व पाने त्वरित गोळा करून खड्ड्यात गाडून टाका; बागेत स्वच्छता ठेवा.",
    precautionEn: "Strict orchard sanitation: bury all infected fallen fruits and twigs in deep pits.",
    samplePresetLabel: "डाळिंब - तेल्या रोग (Telya) प्रात्यक्षिक",
  },

  // ==========================================
  // SUGARCANE (ऊस)
  // ==========================================
  {
    id: "sugarcane-early-shoot-borer",
    cropId: "sugarcane",
    cropNameMr: "ऊस",
    cropNameEn: "Sugarcane",
    nameMr: "खोडातील कीड / कांडी कीड (Early Shoot Borer)",
    nameEn: "Early Shoot Borer (Chilo infuscatellus)",
    nameHi: "तना छेदक",
    scientificName: "Chilo infuscatellus",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "खोडकीड",
    affectedPlantPart: "Stem",
    affectedPlantPartLabelMr: "उसाचा मुख्य पोंगा",
    colorPattern: "Wilting",
    colorPatternLabelMr: "मधला पोंगा सुकणे (Dead heart)",
    growthStage: "Seedling",
    severity: "High",
    symptomsMr: [
      "उसाचा मधला पोंगा सुकतो व पिवळा पडतो, याला 'डेड हार्ट' (Dead Heart) म्हणतात.",
      "सुकलेला पोंगा हाताने ओढल्यास सहज बाहेर येतो आणि त्याला घाण कुजका वास येतो.",
      "जमिनीलगत खोडावर बारीक छिद्र दिसते ज्यातून विष्ठा बाहेर पडलेली असते.",
    ],
    symptomsEn: [
      "Dead heart symptom: central shoot dries up and turns brown.",
      "The dried whorl can be easily pulled out with an offensive foul rotting odour.",
      "Entry bore-holes visible at the base of the shoot near ground level.",
    ],
    organicControlMr:
      "पेरणीनंतर ३०-४५ दिवसांनी उसाला हलकी भर द्या. ट्रायकोकार्ड (Trichogramma chilonis) प्रति एकरी २ वेळा लावा. ऊसाच्या पाचटाचे आच्छादन करा.",
    organicControlEn:
      "Earthing up at 35-45 days. Release Trichogramma chilonis egg parasitoid cards. Apply trash mulching.",
    chemicalControlMr:
      "लागवडीच्या वेळी किंवा खताच्या मात्रेसोबत क्लोरँट्रानिलीप्रोल ०.४% GR (Ferterra) ४ किलो प्रति एकर मातीत मिसळा किंवा क्लोरपायरीफॉस २०% EC फवारा.",
    chemicalControlEn:
      "Soil application of Chlorantraniliprole 0.4% GR @ 4 kg/acre or Chlorpyrifos 20% EC at the root zone.",
    dosagePerLitre: "२.५ मिली क्लोरपायरीफॉस प्रति लिटर पाणी (खोडाजवळ आळवणी)",
    knapsack15LDose: "३५ मिली क्लोरपायरीफॉस प्रति १५ लिटर पंप",
    precautionMr: "ऊस लागवडीनंतर पहिल्या ९० दिवसांत प्रादुर्भाव सर्वात जास्त असतो; पाण्याचा ताण पडू देऊ नका.",
    precautionEn: "Critical damage window is first 90 days after planting; ensure regular watering.",
  },
  {
    id: "sugarcane-red-rot",
    cropId: "sugarcane",
    cropNameMr: "ऊस",
    cropNameEn: "Sugarcane",
    nameMr: "लाल कूज रोग (Red Rot)",
    nameEn: "Sugarcane Red Rot (Colletotrichum falcatum)",
    nameHi: "लाल सड़न रोग",
    scientificName: "Colletotrichum falcatum",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य खोडकूज",
    affectedPlantPart: "Stem",
    affectedPlantPartLabelMr: "उसाचे कांडे व पाने",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "उसाचा आतील गाभा लाल होणे व मद्यासारखा वास",
    growthStage: "Fruiting_Maturity",
    severity: "Critical",
    symptomsMr: [
      "उसाची ३ री व ४ थी पाने शेंड्याकडून पिवळी पडून सुकतात.",
      "ऊस उभा चिरून पाहिल्यास आतील गाभा लालभडक दिसतो आणि त्यात पांढरे आडवे पट्टे दिसतात.",
      "उसाला आंबट, मद्यासारखा (Alcoholic) वास येतो व साखर उत्पादन शून्य होते.",
    ],
    symptomsEn: [
      "Third and fourth leaves from top show yellowing and drying along midribs.",
      "Internal stalk tissue turns dull red with distinctive crosswise white patches.",
      "Stalks emit a sour, fermented alcoholic smell.",
    ],
    organicControlMr:
      "बेणे प्रक्रिया: लागवडीपूर्वी बेणे ट्रायकोडर्मा ५ ग्रॅम/लिटर द्रावणात १५ मिनिटे बुडवून लावा. रोगप्रतिकारक वाण (Co 86032) वापरा.",
    organicControlEn:
      "Set treatment with Trichoderma viride. Plant disease-resistant varieties like Co 86032.",
    chemicalControlMr:
      "कार्बेन्डाझिम ५०% WP (१ ग्रॅम/लिटर) द्रावणात ऊस बेणे बुडवून लागवड करा. शेतात प्रादुर्भाव दिसल्यास खोडाजवळ थायोफॅनेट मिथाईल ७०% WP ची आळवणी करा.",
    chemicalControlEn:
      "Set treatment with Carbendazim 50% WP (1g/L). Drench infected root zone with Thiophanate-methyl 70% WP.",
    dosagePerLitre: "१.५ ग्रॅम थायोफॅनेट मिथाईल प्रति लिटर पाणी",
    knapsack15LDose: "२२ ग्रॅम थायोफॅनेट मिथाईल प्रति १५ लिटर पंप",
    precautionMr:
      "बाधित शेतातील ऊसाचे बेणे अजिबात वापरू नका. लागवडीपूर्वी ५०°C गरम पाण्यात बेणे प्रक्रिया फायदेशीर ठरते.",
    precautionEn:
      "Never use seed cane from infected plots. Treat sets with hot-water treatment before planting.",
  },

  // ==========================================
  // TUR / PIGEON PEA (तूर)
  // ==========================================
  {
    id: "tur-fusarium-wilt",
    cropId: "tur",
    cropNameMr: "तूर",
    cropNameEn: "Pigeonpea / Tur",
    nameMr: "तूर मर रोग (Fusarium Wilt)",
    nameEn: "Fusarium Wilt (Fusarium udum)",
    nameHi: "अरहर उकठा रोग",
    scientificName: "Fusarium udum",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "जमिनीतून पसर बुरशी",
    affectedPlantPart: "Whole_Plant",
    affectedPlantPartLabelMr: "संपूर्ण झाड",
    colorPattern: "Wilting",
    colorPatternLabelMr: "झाड अचानक कोमेजून वाळणे",
    growthStage: "Flowering",
    severity: "Critical",
    symptomsMr: [
      "झाडाची पाने हिरवी असतानाच अचानक मान टाकतात व झाड वाळते.",
      "खोडावर जमिनीलगत जांभळट-काळा पट्टा दिसतो.",
      "खोड किंवा मुळे उभी चिरल्यास आतील रक्तवाहिन्या (Xylem) काळ्या-तपकिरी पडलेल्या दिसतात.",
    ],
    symptomsEn: [
      "Sudden wilting and droopiness of foliage while leaves are still green.",
      "Purple-black longitudinal band running up the stem from soil line.",
      "Brown to black vascular discolouration visible when stem is split lengthwise.",
    ],
    organicControlMr:
      "बियाण्याला ट्रायकोडर्मा हरझियानम ५ ग्रॅम प्रति किलो चोळा. ज्वारी किंवा बाजरी सोबत आंतरपीक पद्धतीचा वापर करा (Intercropping).",
    organicControlEn:
      "Seed inoculation with Trichoderma harzianum @ 5g/kg seed. Intercrop with sorghum or pearl millet.",
    chemicalControlMr:
      "कार्बेन्डाझिम १२% + मॅन्कोझेब ६३% WP (SAAF) किंवा कॉपर ऑक्सिक्लोराईडची झाडाच्या मुळाजवळ आळवणी (Drenching) करा.",
    chemicalControlEn:
      "Drench root zone with Carbendazim 12% + Mancozeb 63% WP or Copper Oxychloride 50% WP.",
    dosagePerLitre: "२ ग्रॅम साफ (SAAF) प्रति लिटर पाणी (खोडाजवळ आळवणी)",
    knapsack15LDose: "३० ग्रॅम साफ प्रति १५ लिटर पंप",
    precautionMr: "मर रोगास बळी न पडणारे वाण (उदा. BDN 711, BSMR 736) पेरणीसाठी निवडा.",
    precautionEn: "Sow wilt-resistant varieties such as BDN 711 or BSMR 736.",
  },
  {
    id: "tur-pod-borer",
    cropId: "tur",
    cropNameMr: "तूर",
    cropNameEn: "Pigeonpea / Tur",
    nameMr: "शेंगा पोखरणारी अळी (Gram Pod Borer / Helicoverpa)",
    nameEn: "Gram / Pigeonpea Pod Borer (Helicoverpa armigera)",
    nameHi: "फली छेदक",
    scientificName: "Helicoverpa armigera",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "शेंग पोखरणारी अळी",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "शेंगा व फुले",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "शेंगेला गोल छिद्र व अळी बाहेर लोंबकळणारी",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "अळी शेंगेला गोल छिद्र पाडून अर्धे शरीर आत घालून आतील दाणे खाते.",
      "फुलोरा गळतो आणि शेंगांमध्ये पोचट दाणे तयार होतात.",
    ],
    symptomsEn: [
      "Caterpillar bores neat round holes in pods, thrusting its head inside while body remains outside.",
      "Heavy flower drop and completely hollowed out pods.",
    ],
    organicControlMr:
      "प्रति एकरी ५ हेलिल्यूर (Helilure) कामगंध सापळे लावा. ५% निंबोळी अर्क किंवा एचए एनपीव्ही (Ha-NPV) फवारा.",
    organicControlEn:
      "Install 5 Helilure pheromone traps per acre. Spray 5% NSKE or Ha-NPV viral suspension.",
    chemicalControlMr:
      "क्लोरँट्रानिलीप्रोल १८.५% SC (Coragen) किंवा इमामेक्टिन बेन्झोएट ५% SG किंवा फ्लुबेंडियामाइड ३९.३५% SC फवारा.",
    chemicalControlEn:
      "Spray Chlorantraniliprole 18.5% SC or Emamectin Benzoate 5% SG or Flubendiamide 39.35% SC.",
    dosagePerLitre: "०.३ मिली क्लोरँट्रानिलीप्रोल किंवा ०.४ ग्रॅम इमामेक्टिन प्रति लिटर पाणी",
    knapsack15LDose: "५ मिली क्लोरँट्रानिलीप्रोल प्रति १५ लिटर पंप",
    precautionMr: "५०% फुलोरा अवस्थेत पहिली प्रतिबंधात्मक फवारणी वेळेत पूर्ण करा.",
    precautionEn: "Apply first spray at 50% flowering to prevent larvae from entering developing pods.",
  },

  // ==========================================
  // GRAM / CHICKPEA (हरभरा)
  // ==========================================
  {
    id: "gram-pod-borer",
    cropId: "gram",
    cropNameMr: "हरभरा",
    cropNameEn: "Gram / Chickpea",
    nameMr: "घाटे अळी (Gram Pod Borer)",
    nameEn: "Chickpea Pod Borer (Helicoverpa armigera)",
    nameHi: "चने की इल्ली",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "घाटे अळी",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "घाटे (Pods)",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "घाट्याला छिद्र व आतील हरभरा दाणा फस्त",
    growthStage: "Fruiting_Maturity",
    severity: "Critical",
    symptomsMr: [
      "अळी कोवळ्या पानांवर, कळ्यांवर व फुलांवर उपजीविका करते.",
      "घाटे भरताना अळी घाट्याला छिद्र पाडते आणि आतील हरभऱ्याचा दाणा खाते.",
    ],
    symptomsEn: [
      "Young larvae feed on tender leaves, flower buds, and pods.",
      "Bored circular holes into pods, completely consuming the developing seed.",
    ],
    organicControlMr:
      "पक्षी थांबे (Bird perches) प्रति एकरी २०-२५ उभे करा जेणेकरून पक्षी अळ्या खातील. ५% निंबोळी अर्क फवारा.",
    organicControlEn:
      "Erect 20-25 'T'-shaped bird perches per acre. Spray 5% Neem seed kernel extract.",
    chemicalControlMr:
      "इमामेक्टिन बेन्झोएट ५% SG (०.४ ग्रॅम/लिटर) किंवा क्लोरँट्रानिलीप्रोल १८.५% SC (०.३ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Emamectin Benzoate 5% SG or Chlorantraniliprole 18.5% SC.",
    dosagePerLitre: "०.४ ग्रॅम इमामेक्टिन बेन्झोएट प्रति लिटर पाणी",
    knapsack15LDose: "६ ग्रॅम इमामेक्टिन बेन्झोएट प्रति १५ लिटर पंप",
    precautionMr: "अळी लहान (पहिल्या/दुसऱ्या अवस्थेत) असतानाच फवारणी करावी; मोठी अळी सहजासहजी मरत नाही.",
    precautionEn: "Spray early when larvae are small (1st/2nd instar) for maximum mortality.",
  },

  // ==========================================
  // BANANA (केळी)
  // ==========================================
  {
    id: "banana-sigatoka",
    cropId: "banana",
    cropNameMr: "केळी",
    cropNameEn: "Banana",
    nameMr: "सिगाटोका पानावरील करपा (Sigatoka Leaf Spot)",
    nameEn: "Black / Yellow Sigatoka (Mycosphaerella fijiensis)",
    nameHi: "सिगाटोका पत्ती धब्बा",
    scientificName: "Mycosphaerella fijiensis",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य करपा",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "पानांवर लांबट काळे डाग व पाने करपणे",
    growthStage: "Vegetative",
    severity: "High",
    symptomsMr: [
      "पानांवर शिरांना समांतर लांबट, पिवळसर-तपकिरी रंगाचे लहान डाग पडतात.",
      "डागांचा मध्यभाग राखाडी होतो व काळी किनार तयार होते.",
      "पाने वेगाने जळून वाळतात, त्यामुळे घड लहान राहतो आणि केळी अकाली पिकतात.",
    ],
    symptomsEn: [
      "Narrow reddish-brown streaks running parallel to leaf veins.",
      "Lesions enlarge with sunken grey centres and dark brown halos.",
      "Premature foliage collapse causing undersized bunches and unripe finger ripening.",
    ],
    organicControlMr:
      "बाधित सुकलेली पाने कापून बागेबाहेर नेऊन जाळा. १% बोर्डो मिश्रण किंवा पेट्रोलियम मिनरल ऑइल फवारा.",
    organicControlEn:
      "Deleafing: cut and burn heavily infected dead leaves. Spray 1% Bordeaux mixture or agricultural mineral oil.",
    chemicalControlMr:
      "प्रोपिकोनेझोल २५% EC (Tilt) किंवा कार्बेंडाझिम १२% + मॅन्कोझेब ६३% WP फवारा (खनिज तेलासोबत).",
    chemicalControlEn:
      "Spray Propiconazole 25% EC or Carbendazim + Mancozeb emulsified with mineral spray oil.",
    dosagePerLitre: "१ मिली प्रोपिकोनेझोल + ५ मिली मिनरल ऑइल प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली प्रोपिकोनेझोल प्रति १५ लिटर पंप",
    precautionMr: "बागेत साचलेले पाणी निचरा करून काढा; जास्त आर्द्रता रोगास पोषक ठरते.",
    precautionEn: "Ensure proper trench drainage in banana orchards to lower humidity.",
  },

  // ==========================================
  // GREEN CHILLI (हिरवी मिरची)
  // ==========================================
  {
    id: "chilli-leaf-curl",
    cropId: "green_chilli",
    cropNameMr: "हिरवी मिरची",
    cropNameEn: "Green Chilli",
    nameMr: "चुरडा-मुरडा रोग / बोकड्या (Chilli Leaf Curl Virus)",
    nameEn: "Chilli Leaf Curl Virus & Mite Complex (Murda Disease)",
    nameHi: "पत्ती मरोड़ रोग (चुरड़ा-मुरड़ा)",
    pathogenType: "Viral",
    pathogenTypeLabelMr: "विषाणू व सूक्ष्म कोळी प्रादुर्भाव",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "शेंड्याची कोवळी पाने",
    colorPattern: "Curling",
    colorPatternLabelMr: "पाने वरच्या किंवा खालच्या बाजूला बोटीसारखी वळणे",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "पाने वरच्या दिशेने वळतात (थ्रिप्समुळे - Cup shaped) किंवा खालच्या दिशेने वळतात (कोळी/माईट्समुळे - Inverted cup).",
      "पाने लहान व जाड होतात, झाडाचा शेंडा गुच्छ्यासारखा (Bunched) दिसतो.",
      "झाडाची वाढ खुंटते, फुले गळतात आणि मिरचीचे उत्पादन थांबते.",
    ],
    symptomsEn: [
      "Upward leaf curling (caused by thrips) or downward boat-like curling (caused by yellow mites).",
      "Stunted bushy apical growth with thickened, brittle foliage.",
      "Severe flower drop and cessation of pod fruit set.",
    ],
    organicControlMr:
      "दशपर्णी अर्क २० मिली/लिटर किंवा गोमूत्र ५० मिली/लिटर फवारा. निळे व पिवळे चिकट सापळे प्रति एकरी २० लावा.",
    organicControlEn:
      "Foliar spray of Dashparni extract (20ml/L) or neem oil. Install 20 yellow and blue sticky traps/acre.",
    chemicalControlMr:
      "कोळी व थ्रिप्सच्या एकत्रित नियंत्रणासाठी: डायाफेन्थिरॉन ५०% WP किंवा स्पायरोमेसीफेन २२.९% SC (Oberon) फवारा.",
    chemicalControlEn: "Spray Diafenthiuron 50% WP or Spiromesifen 22.9% SC (Oberon).",
    dosagePerLitre: "१.२ ग्रॅम डायाफेन्थिरॉन किंवा १ मिली स्पायरोमेसीफेन प्रति लिटर पाणी",
    knapsack15LDose: "१८ ग्रॅम डायाफेन्थिरॉन प्रति १५ लिटर पंप",
    precautionMr: "रोगग्रस्त पिवळी झालेली झाडे उपटून नष्ट करा जेणेकरून विषाणू इतर निरोगी रोपांना लागणार नाही.",
    precautionEn: "Rogue out heavily infested viral stunted plants to prevent further whitefly spread.",
    samplePresetLabel: "हिरवी मिरची - चुरडा मुरडा (Leaf Curl) प्रात्यक्षिक",
  },

  // ==========================================
  // WHEAT (गहू)
  // ==========================================
  {
    id: "wheat-brown-rust",
    cropId: "wheat",
    cropNameMr: "गहू",
    cropNameEn: "Wheat",
    nameMr: "तांबेरा रोग (Wheat Rust - Brown / Yellow Rust)",
    nameEn: "Wheat Rust (Puccinia triticina)",
    nameHi: "गेहूं का रतुआ रोग",
    scientificName: "Puccinia triticina",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य तांबेरा",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने व खोड",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "तांबूस-तपकिरी पावडरीचे ठिपके (Pustules)",
    growthStage: "Flowering",
    severity: "High",
    symptomsMr: [
      "पानांवर तांबूस, नारंगी किंवा तपकिरी रंगाचे पावडरीचे बारीक फोड (Pustules) दिसतात.",
      "बोटाने पुसल्यास हाताला तांबडी पावडर (बीजाणू) लागते.",
      "पाने करपून सुकतात आणि दाणे बारीक व पोचट राहतात.",
    ],
    symptomsEn: [
      "Small circular to oval orange-brown pustules scattered across leaf blades.",
      "Rust powder easily rubs off onto fingers when touched.",
      "Severe premature drying of leaves causing shrivelled kernels and yield reduction.",
    ],
    organicControlMr:
      "तांबेरा प्रतिकारक वाण (उदा. लोकवन, फुले समाधान, HD 2189) पेरा. ट्रायकोडर्मा व्हिरीडी फवारा.",
    organicControlEn: "Sow rust-resistant wheat varieties (HD 2189, Phule Samadhan). Spray Trichoderma.",
    chemicalControlMr:
      "प्रोपिकोनेझोल २५% EC (Tilt) किंवा टेब्युकोनॅझोल २५.९% EC फवारा.",
    chemicalControlEn: "Spray Propiconazole 25% EC (Tilt) or Tebuconazole 25.9% EC.",
    dosagePerLitre: "१ मिली प्रोपिकोनेझोल प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली प्रोपिकोनेझोल प्रति १५ लिटर पंप",
    precautionMr: "तापमान अचानक वाढल्यास किंवा धुक्यामुळे तांबेरा वेगाने पसरतो; लक्षणे दिसताच फवारणी करा.",
    precautionEn: "Spray immediately on initial appearance of pustules during cloudy humid winter spells.",
  },

  // ==========================================
  // MAIZE (मका)
  // ==========================================
  {
    id: "maize-fall-armyworm",
    cropId: "maize",
    cropNameMr: "मका",
    cropNameEn: "Maize / Corn",
    nameMr: "अमेरिकन लष्करी अळी (Fall Armyworm - FAW)",
    nameEn: "Fall Armyworm (Spodoptera frugiperda)",
    nameHi: "फॉल आर्मीवर्म",
    scientificName: "Spodoptera frugiperda",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "घातक लष्करी अळी",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "मक्याचा पोंगा (Whorl) व कणसे",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "पोंगा चाळणीसारखा खाल्लेला व भुसा भरलेला",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "अळी पोंग्यामध्ये (Whorl) लपून राहून पाने खाते; पाने उघडल्यावर पानांवर रांगेत मोठी छिद्रे दिसतात.",
      "पोंग्यामध्ये लाकडाच्या भुशासारखी करड्या रंगाची घाण व विष्ठा साचलेली दिसते.",
      "कणसांमध्ये शिरून कोवळे दाणे फस्त करते.",
    ],
    symptomsEn: [
      "Pinholes, shot holes, and torn ragged window-paning on unfurled leaves.",
      "Large quantities of sawdust-like frass accumulating in the central leaf whorl.",
      "Larvae bore directly into developing ears feeding on tender corn kernels.",
    ],
    organicControlMr:
      "पोंग्यात वाळू व राख (१:९) किंवा कोरडी माती टाका. मेटारायझियम किंवा बिव्हेरिया बॅसियाना ५ ग्रॅम/लिटर पोंग्यात टाका.",
    organicControlEn:
      "Apply dry sand and wood ash (1:9) into the whorl. Spray Metarhizium anisopliae or Beauveria bassiana.",
    chemicalControlMr:
      "क्लोरँट्रानिलीप्रोल १८.५% SC (०.४ मिली/लिटर) किंवा स्पिनोटोरम ११.७% SC (०.५ मिली/लिटर) पोंग्यात पोहोचेल असे फवारा.",
    chemicalControlEn:
      "Directed spray of Chlorantraniliprole 18.5% SC or Spinetoram 11.7% SC into the whorl.",
    dosagePerLitre: "०.४ मिली क्लोरँट्रानिलीप्रोल प्रति लिटर पाणी",
    knapsack15LDose: "६ मिली क्लोरँट्रानिलीप्रोल प्रति १५ लिटर पंप",
    precautionMr: "नोजल थेट मक्याच्या पोंग्यावर धरून फवारणी करावी; वरून मारल्यास अळीपर्यंत औषध पोहोचत नाही.",
    precautionEn: "Aim spray nozzle directly into the central plant whorl for direct contact.",
  },

  // ==========================================
  // GRAPE (द्राक्ष)
  // ==========================================
  {
    id: "grape-downy-mildew",
    cropId: "grape",
    cropNameMr: "द्राक्ष",
    cropNameEn: "Grape",
    nameMr: "डाऊनी मिल्ड्यू / केवडा (Downy Mildew)",
    nameEn: "Downy Mildew (Plasmopara viticola)",
    nameHi: "डाउनी मिल्ड्यू",
    scientificName: "Plasmopara viticola",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य रोग (जलद प्रसार)",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने व कोवळे घड",
    colorPattern: "Yellowing",
    colorPatternLabelMr: "पानांवर पिवळे तेलकट डाग व खाली पांढरी बुरशी",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "पानांच्या वरच्या बाजूवर पिवळसर तेलकट डाग (Oil spots) दिसतात.",
      "पानाच्या खालच्या बाजूवर पांढऱ्याशुभ्र कापसासारखी बुरशीची वाढ दिसते.",
      "कोवळ्या घडांवर प्रादुर्भाव झाल्यास मणी काळे पडून गळून पडतात.",
    ],
    symptomsEn: [
      "Yellow translucent oil spots on the upper leaf surface.",
      "White dense downy fungal cottony growth on the underside of leaves.",
      "Infected floral clusters and young berries turn brown and drop prematurely.",
    ],
    organicControlMr:
      "बोर्डो मिश्रण (१%) किंवा कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) फवारा. ट्रायकोडर्मा व्हिरीडी ५ ग्रॅम/लिटर फवारा.",
    organicControlEn: "Spray Bordeaux mixture (1%) or Copper Oxychloride 2.5 g/L. Apply Trichoderma.",
    chemicalControlMr:
      "सायमॉक्सॅनिल ८% + मॅन्कोझेब ६४% WP किंवा डायमेथोमॉर्फ ५०% WP फवारा.",
    chemicalControlEn: "Spray Cymoxanil 8% + Mancozeb 64% WP or Dimethomorph 50% WP.",
    dosagePerLitre: "२.५ ग्रॅम सायमॉक्सॅनिल + मॅन्कोझेब प्रति लिटर पाणी",
    knapsack15LDose: "३५ ते ४० ग्रॅम प्रति १५ लिटर पंप",
    precautionMr: "सतत पाऊस किंवा ढगाळ दमट हवामानात प्रतिबंधात्मक फवारणी वेळेवर करणे अत्यंत गरजेचे असते.",
    precautionEn: "Apply preventive sprays immediately after prolonged rain or high humidity.",
  },
  {
    id: "grape-powdery-mildew",
    cropId: "grape",
    cropNameMr: "द्राक्ष",
    cropNameEn: "Grape",
    nameMr: "भुरी रोग (Powdery Mildew)",
    nameEn: "Powdery Mildew (Erysiphe necator)",
    nameHi: "चूर्णिल आसिता (भूरी)",
    scientificName: "Erysiphe necator",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य रोग",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने, काड्या व द्राक्ष मणी",
    colorPattern: "White_Powder",
    colorPatternLabelMr: "पानांवर व मण्यांवर पांढरी भुकटी व मणी तडकणे",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "पानांवर, काड्यांवर आणि मण्यांवर पांढऱ्या राखेसारखी भुकटी दिसते.",
      "मण्यांची साल कडक होते आणि मणी तडकतात (Berry cracking).",
      "पाने वेडीवाकडी होऊन वाळतात.",
    ],
    symptomsEn: [
      "White powdery coating on foliage, canes, and fruit clusters.",
      "Skin of infected berries hardens and cracks open longitudinally.",
      "Leaves become distorted, dry up, and curl upwards.",
    ],
    organicControlMr:
      "द्रावणीय गंधक (८०% WDG) २ ग्रॅम/लिटर फवारा किंवा पोटॅशियम बायकार्बोनेट ५ ग्रॅम/लिटर फवारा.",
    organicControlEn: "Spray wettable sulphur 80% WDG @ 2 g/L or Potassium Bicarbonate @ 5 g/L.",
    chemicalControlMr:
      "टेब्युकोनॅझोल २५.९% EC (०.७५ मिली/लिटर) किंवा मायक्लोब्युटॅनिल १०% WP (०.४ ग्रॅम/लिटर) फवारा.",
    chemicalControlEn: "Spray Tebuconazole 25.9% EC @ 0.75 ml/L or Myclobutanil 10% WP @ 0.4 g/L.",
    dosagePerLitre: "०.७५ मिली टेब्युकोनॅझोल प्रति लिटर पाणी",
    knapsack15LDose: "११ ते १२ मिली टेब्युकोनॅझोल प्रति १५ लिटर पंप",
    precautionMr: "दुपारच्या कडक उन्हात गंधकाची फवारणी करू नये; मण्यांवर डाग पडू शकतात.",
    precautionEn: "Never spray sulfur during hot noon hours to prevent berry scorch.",
  },
  {
    id: "grape-anthracnose",
    cropId: "grape",
    cropNameMr: "द्राक्ष",
    cropNameEn: "Grape",
    nameMr: "करपा / काळा ठिपका (Anthracnose / Bird's Eye Spot)",
    nameEn: "Grape Anthracnose (Elsinoe ampelina)",
    nameHi: "अंगूर एन्थ्रेक्नोज",
    scientificName: "Elsinoe ampelina",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य काळा करपा",
    affectedPlantPart: "Stem",
    affectedPlantPartLabelMr: "काड्या, पाने व मणी",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "पक्ष्याच्या डोळ्यासारखे मध्यभागी राखडी खड्डे पडणे",
    growthStage: "Vegetative",
    severity: "High",
    symptomsMr: [
      "कोवळ्या काड्यांवर व पानांवर खोलगट काळे ठिपके पडतात.",
      "मण्यांवर पक्ष्याच्या डोळ्यासारखे (Bird's eye) मध्यभागी राखडी व कडेला गडद काळे चट्टे पडतात.",
      "काड्या करपून शेंडे वाळतात.",
    ],
    symptomsEn: [
      "Sunken crater-like black spots on young shoots and petioles.",
      "Bird's-eye spots on green berries with greyish center and purple-brown margins.",
      "Severe dieback and blighting of tender canes.",
    ],
    organicControlMr: "बोर्डो मिश्रण (०.८%) फवारा. बागेतील सुकलेल्या रोगट काड्या छाटून नष्ट करा.",
    organicControlEn: "Apply Bordeaux mixture (0.8%). Prune out and incinerate infected dead canes.",
    chemicalControlMr: "कार्बेन्डाझिम ५०% WP (१ ग्रॅम/लिटर) किंवा थायोफॅनेट मिथाईल ७०% WP (१ ग्रॅम/लिटर) फवारा.",
    chemicalControlEn: "Spray Carbendazim 50% WP or Thiophanate Methyl 70% WP @ 1 g/L.",
    dosagePerLitre: "१ ग्रॅम कार्बेन्डाझिम प्रति लिटर पाणी",
    knapsack15LDose: "१५ ग्रॅम कार्बेन्डाझिम प्रति १५ लिटर पंप",
    precautionMr: "छाटणीनंतर बोर्डो पेस्ट लावणे आवश्यक आहे.",
    precautionEn: "Apply Bordeaux paste on cuts immediately after vine pruning.",
  },
  {
    id: "grape-thrips",
    cropId: "grape",
    cropNameMr: "द्राक्ष",
    cropNameEn: "Grape",
    nameMr: "फुलकिडे / थ्रिप्स (Grape Thrips)",
    nameEn: "Grapevine Thrips (Scirtothrips dorsalis)",
    nameHi: "अंगूर थ्रिप्स",
    scientificName: "Scirtothrips dorsalis",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "रसशोषक कीटक",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "मण्यांची त्वचा व कोवळी पाने",
    colorPattern: "Curling",
    colorPatternLabelMr: "मण्यांवर चंदेरी-तपकिरी खवले व पाने होडीसारखी वळणे",
    growthStage: "Flowering",
    severity: "High",
    symptomsMr: [
      "मण्यांवर खरबडीत चंदेरी किंवा तपकिरी खपली (Scab) पडते, ज्याला कॉर्की रिंग म्हणतात.",
      "कोवळी पाने वरच्या दिशेने वळतात (Boat shape) आणि कडा करपतात.",
      "मण्यांचे बाजारमूल्य पूर्णपणे नष्ट होते.",
    ],
    symptomsEn: [
      "Corky scabrous scarring and silvering on berry skin around pedicel.",
      "Upward cupping and curling of tender leaves with brittle brown margins.",
      "Severe loss of cosmetic grade and export market value.",
    ],
    organicControlMr: "निंबोळी अर्क ५% किंवा व्हर्टिसिलियम लेकॅनी ५ ग्रॅम/लिटर फवारा. निळे चिकट सापळे लावा.",
    organicControlEn: "Spray 5% neem extract or Verticillium lecanii. Install blue sticky traps.",
    chemicalControlMr: "स्पिनोसॅड ४५% SC (०.३ मिली/लिटर) किंवा फिप्रोनिल ५% SC (१ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Spinosad 45% SC @ 0.3 ml/L or Fipronil 5% SC @ 1.0 ml/L.",
    dosagePerLitre: "०.३ मिली स्पिनोसॅड प्रति लिटर पाणी",
    knapsack15LDose: "४.५ मिली स्पिनोसॅड प्रति १५ लिटर पंप",
    precautionMr: "फुलोरा अवस्थेत मधमाशांचे रक्षण करण्यासाठी संध्याकाळी फवारणी करावी.",
    precautionEn: "Spray late evenings during flowering to protect honeybee pollinators.",
  },
  {
    id: "grape-mealybug",
    cropId: "grape",
    cropNameMr: "द्राक्ष",
    cropNameEn: "Grape",
    nameMr: "पिठ्या ढेकूण / मिलीबग (Mealybug)",
    nameEn: "Grape Mealybug (Maconellicoccus hirsutus)",
    nameHi: "मिलीबग",
    scientificName: "Maconellicoccus hirsutus",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "पांढरा मेणासारखा रसशोषक कीटक",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "घडांमधील मणी व खोड",
    colorPattern: "White_Powder",
    colorPatternLabelMr: "मण्यांवर चिकट पांढरे कापसासारखे पुंजके व काळी बुरशी",
    growthStage: "Fruiting_Maturity",
    severity: "Critical",
    symptomsMr: [
      "मण्यांच्या घडामध्ये पांढऱ्या मेणासारख्या किडींचे पुंजके दिसतात.",
      "किडीने सोडलेल्या गोड मधासारख्या विष्ठेवर काळी बुरशी (Sooty mold) वाढते.",
      "द्राक्षांचे घड खाण्यायोग्य किंवा विक्रीयोग्य राहत नाहीत.",
    ],
    symptomsEn: [
      "White waxy cottony masses covering berries and inside grape bunches.",
      "Sticky honeydew secretions colonised by dense black sooty mold fungus.",
      "Berries become mushy, unmarketable, and cluster rots set in.",
    ],
    organicControlMr: "क्रिप्टोलेमस (ऑस्ट्रेलियन लेडीबर्ड बीटल) परभक्षी कीटक बागेत सोडा. खोडाला चिकट पट्टी लावा.",
    organicControlEn: "Release Cryptolaemus montrouzieri predatory ladybirds. Band trunks with sticky barriers.",
    chemicalControlMr: "स्पिरोटेट्रामॅट १५.३१% w/w OD (०.७ मिली/लिटर) किंवा बुप्रोफेझिन २५% SC (१.५ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Spirotetramat 15.31% OD @ 0.7 ml/L or Buprofezin 25% SC @ 1.5 ml/L.",
    dosagePerLitre: "०.७ मिली स्पिरोटेट्रामॅट प्रति लिटर पाणी",
    knapsack15LDose: "१० ते ११ मिली प्रति १५ लिटर पंप",
    precautionMr: "घडांच्या आत औषध पोहोचण्यासाठी उच्च दाबाने फवारणी करावी.",
    precautionEn: "Ensure high-pressure penetration into dense fruit clusters.",
  },

  // ==========================================
  // POMEGRANATE (डाळिंब)
  // ==========================================
  {
    id: "pomegranate-bacterial-blight-telya",
    cropId: "pomegranate",
    cropNameMr: "डाळिंब",
    cropNameEn: "Pomegranate",
    nameMr: "तेल्या रोग / तेलकट डाग (Bacterial Blight / Telya)",
    nameEn: "Pomegranate Bacterial Blight (Xanthomonas axonopodis pv. punicae)",
    nameHi: "अनार का तेलिया रोग",
    scientificName: "Xanthomonas axonopodis pv. punicae",
    pathogenType: "Bacterial",
    pathogenTypeLabelMr: "विनाशकारी जिवाणू रोग",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "फळे, पाने व फांद्या",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "फळांवर तेलकट काळे त्रिकोणी चट्टे व फळे तडकणे ('L' किंवा 'Y' आकार)",
    growthStage: "Fruiting_Maturity",
    severity: "Critical",
    symptomsMr: [
      "पानांवर व फळांवर तेलकट, काळे, चमकणारे ठिपके पडतात जे प्रकाशात पारदर्शक दिसतात.",
      "फळांवर 'L' किंवा 'Y' आकाराचे खोलगट काळे तडे जातात.",
      "फांद्यांवर काळे गाठोडे चट्टे पडून फांदी वाळते (Canker).",
    ],
    symptomsEn: [
      "Water-soaked oily dark brown translucent spots on leaves, stems, and fruits.",
      "Characteristic 'L' or 'Y' shaped deep cracking across infected fruit rind.",
      "Nodal stem cankers leading to branch snapping and complete vine collapse.",
    ],
    organicControlMr:
      "तांबेयुक्त बुरशीनाशक + बॅक्टेरियोमायसीन. रोगट फळे गोळा करून खड्ड्यात गाडून नष्ट करा.",
    organicControlEn:
      "Copper hydroxide + biocides. Prune out and deeply bury all infected fruits and stems.",
    chemicalControlMr:
      "स्ट्रेप्टोमायसीन सल्फेट ९०% + टेट्रासायक्लिन १०% (०.५ ग्रॅम/लिटर) + कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) फवारा.",
    chemicalControlEn:
      "Spray Streptocycline (0.5 g/L) tank-mixed with Copper Oxychloride 50% WP (2.5 g/L).",
    dosagePerLitre: "०.५ ग्रॅम स्ट्रेप्टोसायक्लिन + २.५ ग्रॅम COC प्रति लिटर पाणी",
    knapsack15LDose: "७.५ ग्रॅम स्ट्रेप्टोसायक्लिन + ३५ ग्रॅम COC प्रति १५ लिटर पंप",
    precautionMr: "पावसाळ्यात बागेत पाणी साचू देऊ नये; छाटणीची हत्यारे सॅनिटायझरने निर्जंतुक करावीत.",
    precautionEn: "Disinfect secateurs with 10% sodium hypochlorite between every plant pruning.",
  },
  {
    id: "pomegranate-fruit-borer",
    cropId: "pomegranate",
    cropNameMr: "डाळिंब",
    cropNameEn: "Pomegranate",
    nameMr: "फळ पोखरणारी अळी / सुरसा (Anar Butterfly / Fruit Borer)",
    nameEn: "Pomegranate Butterfly (Deudorix isocrates)",
    nameHi: "अनार तितली / फल छेदक",
    scientificName: "Deudorix isocrates",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "फळ पोखरणारी अळी",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "फळातील दाणे",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "फळाला छिद्र व छिद्रातून विष्ठा व घाण बाहेर पडणे",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "फळाच्या सालीवर एकच गोलाकार छिद्र दिसते, ज्यातून दुर्गंधीयुक्त विष्ठा बाहेर पडते.",
      "अळी आत शिरून डाळिंबाचे दाणे खाऊन टाकते, त्यामुळे फळे आतून कुजतात.",
      "प्रादुर्भावग्रस्त फळे अकाली गळून पडतात.",
    ],
    symptomsEn: [
      "Single entry borehole on fruit rind plugged with offensive dark brown excreta.",
      "Larva consumes internal arils leading to secondary bacterial fruit rotting.",
      "Premature dropping of heavily infested rotting pomegranates.",
    ],
    organicControlMr:
      "फळांना बटर पेपर किंवा कॉटन बॅगने बॅगिंग (Bagging) करा. निंबोळी अर्क ५% फवारा.",
    organicControlEn: "Bag growing fruits with butter paper or cloth bags. Spray 5% neem seed kernel extract.",
    chemicalControlMr:
      "इमामेक्टिन बेन्झोएट ५% SG (०.४ ग्रॅम/लिटर) किंवा क्लोरँट्रानिलीप्रोल १८.५% SC (०.३ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Emamectin Benzoate 5% SG @ 0.4 g/L or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.",
    dosagePerLitre: "०.४ ग्रॅम इमामेक्टिन बेन्झोएट प्रति लिटर पाणी",
    knapsack15LDose: "६ ग्रॅम इमामेक्टिन प्रति १५ लिटर पंप",
    precautionMr: "अंडी अवस्थेतच फवारणी करावी; एकदा अळी फळात शिरल्यावर रासायनिक औषधांचा उपयोग होत नाही.",
    precautionEn: "Target sprays against early eggs and newly hatched larvae before they bore inside.",
  },
  {
    id: "pomegranate-wilt-ceratocystis",
    cropId: "pomegranate",
    cropNameMr: "डाळिंब",
    cropNameEn: "Pomegranate",
    nameMr: "खोडकूज व मर रोग (Ceratocystis Wilt)",
    nameEn: "Pomegranate Wilt (Ceratocystis fimbriata)",
    nameHi: "अनार उकठा रोग",
    scientificName: "Ceratocystis fimbriata",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "मुळांमधून पसरणारी घातक बुरशी",
    affectedPlantPart: "Root_Base",
    affectedPlantPartLabelMr: "झाडाचे मूळ, खोड व एका बाजूच्या फांद्या",
    colorPattern: "Wilting",
    colorPatternLabelMr: "झाडाची एका बाजूची पाने पिवळी पडून संपूर्ण झाड सुकणे",
    growthStage: "All_Stages",
    severity: "Critical",
    symptomsMr: [
      "सुरुवातीला झाडाच्या एकाच फांदीची पाने पिवळी पडतात आणि वाळतात.",
      "काही आठवड्यांत संपूर्ण झाड वाळते आणि पाने झाडावरच चिकटून राहतात.",
      "खोड कापल्यास आत काळपट-तपकिरी रंगाचे डाग किंवा पट्टे दिसतात.",
    ],
    symptomsEn: [
      "Initial unilateral yellowing and wilt of a single main scaffold limb.",
      "Complete rapid collapse of entire tree with dead leaves clinging to branches.",
      "Cross-section of trunk base shows dark grey-brown discoloured xylem vascular streaks.",
    ],
    organicControlMr:
      "ट्रायकोडर्मा व्हिरीडी किंवा टी. हार्झियानम (२५ ग्रॅम प्रति झाड) शेणखतात मिसळून मुळांशी ड्रेन्चिंग करा.",
    organicControlEn: "Root drenching with Trichoderma harzianum (25 g/tree) enriched in farmyard manure.",
    chemicalControlMr:
      "प्रोपिकोनेझोल २५% EC (२ मिली/लिटर) + क्लोरपायरीफॉस २०% EC (२ मिली/लिटर) मुळांशी आळवणी (Drenching) करा.",
    chemicalControlEn:
      "Soil drench around root zone with Propiconazole 25% EC (2 ml/L) mixed with Chlorpyrifos 20% EC.",
    dosagePerLitre: "२ मिली प्रोपिकोनेझोल प्रति लिटर पाणी",
    knapsack15LDose: "३० मिली प्रोपिकोनेझोल प्रति १५ लिटर पंप (मुळाशी ड्रेन्चिंग)",
    precautionMr: "बागेत पिनहोल बोरर (खोडकिडा) नियंत्रणात ठेवा; तो या बुरशीचा प्रसार करतो.",
    precautionEn: "Control shot-hole borers strictly as they vectors Ceratocystis fungus between trees.",
  },

  // ==========================================
  // BANANA (केळी)
  // ==========================================
  {
    id: "banana-sigatoka",
    cropId: "banana",
    cropNameMr: "केळी",
    cropNameEn: "Banana",
    nameMr: "सिगाटोका करपा (Sigatoka Leaf Spot)",
    nameEn: "Sigatoka Leaf Spot (Mycosphaerella musicola)",
    nameHi: "केला सिगाटोका",
    scientificName: "Mycosphaerella musicola",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य करपा",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "केळीची मोठी पाने",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "पानांवर लंबगोलाकार काळे चट्टे व पाने जळणे",
    growthStage: "Vegetative",
    severity: "High",
    symptomsMr: [
      "पानांवर लहान पिवळसर ठिपके पडतात, जे नंतर लंबगोलाकार काळे-तपकिरी होतात.",
      "ठिपक्यांचा मध्यभाग राखडी होतो आणि कडा पिवळ्या राहतात.",
      "मोठ्या प्रमाणावर पाने करपल्यामुळे घडाचे वजन कमी होते आणि केळी लवकर पिकतात.",
    ],
    symptomsEn: [
      "Small yellowish spots on leaf lamina enlarging into elongated dark brown spindles.",
      "Center of spot turns ash-grey with a distinct dark brown halo margin.",
      "Extensive leaf necrosis causes premature ripening and poor bunch filling.",
    ],
    organicControlMr: "खालची वाळलेली रोगट पाने कापून नष्ट करा. ताक व हिंगाचे द्रावण फवारा.",
    organicControlEn: "De-leaf and burn heavily infected dead lower fronds. Spray bio-fungicides.",
    chemicalControlMr:
      "प्रोपिकोनेझोल २५% EC (१ मिली/लिटर) किंवा कार्बेन्डाझिम १२% + मॅन्कोझेब ६३% WP (२ ग्रॅम/लिटर) फवारा.",
    chemicalControlEn: "Spray Propiconazole 25% EC @ 1 ml/L or Carbendazim + Mancozeb @ 2 g/L.",
    dosagePerLitre: "१ मिली प्रोपिकोनेझोल प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली प्रोपिकोनेझोल प्रति १५ लिटर पंप",
    precautionMr: "पानाच्या दोन्ही बाजू व्यवस्थित भिजतील अशा प्रकारे फवारणी करावी.",
    precautionEn: "Ensure thorough spray coverage on both abaxial and adaxial leaf surfaces.",
  },
  {
    id: "banana-panama-wilt",
    cropId: "banana",
    cropNameMr: "केळी",
    cropNameEn: "Banana",
    nameMr: "पनामा विल्ट / मर रोग (Panama Wilt)",
    nameEn: "Panama Wilt (Fusarium oxysporum f. sp. cubense)",
    nameHi: "केला पनामा उकठा",
    scientificName: "Fusarium oxysporum f. sp. cubense",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "जमिनीतील घातक बुरशी",
    affectedPlantPart: "Whole_Plant",
    affectedPlantPartLabelMr: "खोड व पाने",
    colorPattern: "Yellowing",
    colorPatternLabelMr: "खालची पाने पिवळी पडून देठाजवळ मोडणे (स्कर्टसारखी लटकणे)",
    growthStage: "All_Stages",
    severity: "Critical",
    symptomsMr: [
      "खालच्या जुन्या पानांच्या कडा पिवळ्या पडतात आणि पाने देठाजवळ मोडून खाली लटकतात.",
      "झाडाच्या खोडाला (Pseudostem) जमिनीलगत उभे तडे जातात.",
      "खोड कापल्यास आतील वाहिन्या लालसर-तपकिरी किंवा काळपट पडलेल्या दिसतात.",
    ],
    symptomsEn: [
      "Progressive yellowing of oldest leaves which buckle at petiole and hang like a skirt.",
      "Longitudinal splitting of the pseudo-stem base above ground level.",
      "Dark brown to purple continuous vascular discolouration inside the corm.",
    ],
    organicControlMr: "रोगमुक्त टिशू कल्चर रोपे लावा. लागवडीच्या वेळी ट्रायकोडर्मा व्हिरीडी (५० ग्रॅम/झाड) टाका.",
    organicControlEn: "Plant certified disease-free tissue culture plantlets. Add Trichoderma to planting pit.",
    chemicalControlMr: "कार्बेन्डाझिम ५०% WP (२ ग्रॅम/लिटर) द्रावणाने झाडाच्या बुंध्याभोवती आळवणी (Drenching) करा.",
    chemicalControlEn: "Drench soil around plant base with Carbendazim 50% WP @ 2 g/L.",
    dosagePerLitre: "२ ग्रॅम कार्बेन्डाझिम प्रति लिटर पाणी",
    knapsack15LDose: "३० ग्रॅम कार्बेन्डाझिम प्रति १५ लिटर पंप",
    precautionMr: "रोगट झाडे मुळासकट उपटून चुन्याची पावडर टाकून जाळून टाकावीत.",
    precautionEn: "Uproot infected mats, apply quicklime to the soil pit, and burn plant debris.",
  },

  // ==========================================
  // CHILLI (मिरची)
  // ==========================================
  {
    id: "chilli-leaf-curl-murda",
    cropId: "chilli",
    cropNameMr: "मिरची",
    cropNameEn: "Chilli",
    nameMr: "चुरडा-मुरडा / बोकड्या (Chilli Leaf Curl & Thrips/Mites Complex)",
    nameEn: "Chilli Leaf Curl (Begomovirus & Thrips Complex)",
    nameHi: "मिर्च का पर्ण कुंचन (चुरड़ा-मुरड़ा)",
    scientificName: "Chilli leaf curl virus",
    pathogenType: "Viral",
    pathogenTypeLabelMr: "विषाणू व रसशोषक कीटक संकुल",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "शेंड्याची कोवळी पाने",
    colorPattern: "Curling",
    colorPatternLabelMr: "पाने वरच्या किंवा खालच्या दिशेने बोकडणे व आकसणे",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "पाने वरच्या बाजूला वाटीसारखी वळतात (थ्रिप्समुळे) किंवा उलटी वळतात (कोळी/माईट्समुळे).",
      "झाडाची वाढ खुंटते, शेंडा गुच्छ्यासारखा (Rosette) होतो आणि फुलगळ होते.",
      "पाने लहान व जाड होऊन फळे वेडीवाकडी व लहान येतात.",
    ],
    symptomsEn: [
      "Upward cupping of leaves (thrips damage) or downward inverted curling (mite injury).",
      "Stunted bushy rosette growth habit with severe flower bud shedding.",
      "Thickened leathery crinkled leaves producing twisted misshapen tiny pods.",
    ],
    organicControlMr:
      "दशपर्णी अर्क किंवा निंबोळी अर्क ५% फवारा. पिवळे व निळे चिकट सापळे एकरी २० लावा.",
    organicControlEn: "Spray Dashparni ark or 5% neem seed kernel extract. Install 20 yellow/blue sticky traps/acre.",
    chemicalControlMr:
      "डायफेन्थियुरॉन ५०% WP (१.२ ग्रॅम/लिटर) किंवा फिप्रोनिल ५% SC (१.५ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Diafenthiuron 50% WP @ 1.2 g/L or Fipronil 5% SC @ 1.5 ml/L.",
    dosagePerLitre: "१.२ ग्रॅम डायफेन्थियुरॉन प्रति लिटर पाणी",
    knapsack15LDose: "१८ ग्रॅम डायफेन्थियुरॉन प्रति १५ लिटर पंप",
    precautionMr: "पांढरी माशी व थ्रिप्स या वाहक किडींचे सुरुवातीलाच नियंत्रण करणे आवश्यक आहे.",
    precautionEn: "Control whiteflies and thrips vectors at earliest transplanting stage.",
  },
  {
    id: "chilli-anthracnose-fruit-rot",
    cropId: "chilli",
    cropNameMr: "मिरची",
    cropNameEn: "Chilli",
    nameMr: "फळकुज व शेंडेमर (Anthracnose / Fruit Rot / Dieback)",
    nameEn: "Chilli Anthracnose (Colletotrichum capsici)",
    nameHi: "मिर्च फल गलन / डाईबैक",
    scientificName: "Colletotrichum capsici",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य फळकुज",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "पक्व मिरच्या व झाडाचे शेंडे",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "मिरचीवर गोलाकार काळे खड्डे पडणे व शेंडा वाळणे",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "पिकलेल्या लाल मिरच्यांवर गोलाकार खड्डे पडतात, ज्यावर काळी व नारंगी बुरशी दिसते.",
      "मिरच्या सुकून पांढुरक्या-तपकिरी होतात आणि दाणे काळे पडतात.",
      "फांद्या वरून खाली वाळत येतात (Dieback).",
    ],
    symptomsEn: [
      "Circular sunken necrotic spots with black concentric rings of acervuli on ripe fruits.",
      "Pods shrivel, turn straw-coloured or bleachy white with discoloured seeds.",
      "Twigs wither and dry out progressively downwards from top (dieback).",
    ],
    organicControlMr: "ट्रायकोडर्मा व्हिरीडी ५ ग्रॅम/लिटर फवारा. बियाण्यास बीजप्रक्रिया करा.",
    organicControlEn: "Spray Trichoderma viride @ 5 g/L. Treat seeds with bio-agent before nursery.",
    chemicalControlMr:
      "अझॉक्सीस्ट्रॉबिन १८.२% + डायफेनोकोनॅझोल ११.४% SC (१ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1.0 ml/L.",
    dosagePerLitre: "१ मिली अझॉक्सी + डायफेनो प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली प्रति १५ लिटर पंप",
    precautionMr: "पावसाळ्यात लाल मिरच्या झाडावर जास्त दिवस ठेवू नयेत; वेळेवर तोडणी करावी.",
    precautionEn: "Harvest ripe pods promptly without letting them over-mature on bush in humid weather.",
  },

  // ==========================================
  // GRAM / CHICKPEA (हरभरा)
  // ==========================================
  {
    id: "gram-pod-borer-helicoverpa",
    cropId: "gram",
    cropNameMr: "हरभरा",
    cropNameEn: "Gram / Chickpea",
    nameMr: "घाटेअळी (Chickpea Pod Borer)",
    nameEn: "Gram Pod Borer (Helicoverpa armigera)",
    nameHi: "चना फली छेदक (घंटी सुंडी)",
    scientificName: "Helicoverpa armigera",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "घाटे खाणारी अळी",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "हरभऱ्याचे घाटे व पाने",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "घाट्याला गोल छिद्र करून आत डोके घालून दाणे खाणे",
    growthStage: "Fruiting_Maturity",
    severity: "Critical",
    symptomsMr: [
      "अळी घाटा पोखरा करून आत अर्धे शरीर घालून कोवळे दाणे खाते.",
      "सुरुवातीला कोवळी पाने व फुले कुरतडते.",
      "घाट्यांमध्ये रिकामी पोचट टरफले शिल्लक राहतात.",
    ],
    symptomsEn: [
      "Caterpillar bores circular entry hole into pod, feeding with head inside and body outside.",
      "Early instars skeletonize leaves and damage tender flower buds.",
      "Pods hollowed out completely without grain formation.",
    ],
    organicControlMr:
      "हेलिकोव्हर्पा एनपीव्ही (HaNPV) १ मिली/लिटर किंवा निंबोळी अर्क ५% फवारा. शेतात 'टी' आकाराचे पक्षी थांबे (Bird perches) एकरी २० लावा.",
    organicControlEn: "Spray HaNPV @ 1 ml/L or 5% NSKE. Install 20 'T'-shaped bird perches per acre.",
    chemicalControlMr:
      "इमामेक्टिन बेन्झोएट ५% SG (०.४ ग्रॅम/लिटर) किंवा क्लोरँट्रानिलीप्रोल १८.५% SC (०.३ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Emamectin Benzoate 5% SG @ 0.4 g/L or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.",
    dosagePerLitre: "०.४ ग्रॅम इमामेक्टिन बेन्झोएट प्रति लिटर पाणी",
    knapsack15LDose: "६ ग्रॅम इमामेक्टिन प्रति १५ लिटर पंप",
    precautionMr: "आर्थिक नुकसानीची संकेत पातळी (ETL): १ घाटेअळी प्रति मीटर ओळ किंवा १ अळी प्रति झाड दिसताच फवारणी करावी.",
    precautionEn: "Initiate spray when pest reaches ETL: 1 larva per meter row length.",
  },
  {
    id: "gram-fusarium-wilt",
    cropId: "gram",
    cropNameMr: "हरभरा",
    cropNameEn: "Gram / Chickpea",
    nameMr: "मर रोग / उकठा (Fusarium Wilt)",
    nameEn: "Chickpea Wilt (Fusarium oxysporum f. sp. ciceris)",
    nameHi: "चना उकठा रोग",
    scientificName: "Fusarium oxysporum f. sp. ciceris",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "मुळातील बुरशीजन्य रोग",
    affectedPlantPart: "Root_Base",
    affectedPlantPartLabelMr: "मूळ व संपूर्ण रोप",
    colorPattern: "Wilting",
    colorPatternLabelMr: "झाड अचानक कोमेजणे व मुळे चिरल्यास आतील शीर काळी दिसणे",
    growthStage: "Seedling",
    severity: "High",
    symptomsMr: [
      "झाडाची पाने पिवळी न पडता अचानक हिरवेपणीच कोमेजून मान टाकतात.",
      "मुख्य मूळ उभे चिरून पाहिल्यास आतील मध्यभाग काळा किंवा तपकिरी पडलेला दिसतो.",
      "शेतात ठिकठिकाणी झाडांचे पट्टेच्या पट्टे वाळतात.",
    ],
    symptomsEn: [
      "Sudden drooping and wilting of plants while foliage retains greenish dull color.",
      "Splitting the collar and taproot reveals dark brown to black longitudinal vascular discoloration.",
      "Patches of drying plants spread across the field along irrigation furrows.",
    ],
    organicControlMr:
      "पेरणीपूर्वी ट्रायकोडर्मा व्हिरीडी (५ ग्रॅम प्रति किलो बियाणे) चोळा. विजय, फुले विक्रांत या मर प्रतिकारक जाती पेरा.",
    organicControlEn: "Seed treatment with Trichoderma viride @ 5 g/kg seed. Sow wilt-resistant cultivars.",
    chemicalControlMr:
      "कार्बोक्सिन ३७.५% + थायरम ३७.५% DS (२.५ ग्रॅम/किलो) बीजप्रक्रिया करा. शेतात कार्बेन्डाझिम (२ ग्रॅम/लिटर) आळवणी करा.",
    chemicalControlEn: "Seed treatment with Carboxin + Thiram @ 2.5 g/kg or Carbendazim soil drench.",
    dosagePerLitre: "२ ग्रॅम कार्बेन्डाझिम प्रति लिटर पाणी",
    knapsack15LDose: "३० ग्रॅम कार्बेन्डाझिम प्रति १५ लिटर पंप",
    precautionMr: "हरभऱ्याची लागवड एकाच शेतात सलग करू नये; ज्वारी किंवा बाजरीसोबत फेरपालट करावी.",
    precautionEn: "Practice crop rotation with jowar or bajra; avoid mono-cropping chickpeas.",
  },

  // ==========================================
  // PIGEONPEA / TUR (तूर)
  // ==========================================
  {
    id: "tur-pod-borer",
    cropId: "tur",
    cropNameMr: "तूर",
    cropNameEn: "Pigeonpea / Tur",
    nameMr: "तुरीवरील शेंग पोखरणारी अळी (Pigeonpea Pod Borer)",
    nameEn: "Pigeonpea Pod Borer (Helicoverpa armigera / Maruca vitrata)",
    nameHi: "अरहर फली छेदक",
    scientificName: "Helicoverpa armigera",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "शेंग पोखरणारी अळी",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "शेंगा व कळ्या",
    colorPattern: "Holes_Chewed",
    colorPatternLabelMr: "शेंगेला छिद्रे व कळ्यांचे जाळे तयार करणे",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "अळी कळ्या व फुलोरा एकत्र गुंफून जाळे तयार करते (Maruca) किंवा शेंगांना छिद्र पाडून दाणे खाते.",
      "शेंगांवर विष्ठेचे डाग पडतात व शेंग पोचट होते.",
      "फुलगळ मोठ्या प्रमाणात होते.",
    ],
    symptomsEn: [
      "Webbing together of flowers, buds, and young leaves with silk (web-worm).",
      "Large boreholes into developing pods with chewed seeds inside.",
      "Heavy premature drop of flower buds and green pods.",
    ],
    organicControlMr: "निंबोळी अर्क ५% किंवा बिव्हेरिया बॅसियाना ५ ग्रॅम/लिटर फवारा. कामगंध सापळे (फेरोमोन) ५/एकर लावा.",
    organicControlEn: "Spray 5% neem extract or Beauveria bassiana. Install 5 pheromone traps/acre.",
    chemicalControlMr:
      "क्लोरँट्रानिलीप्रोल १८.५% SC (०.३ मिली/लिटर) किंवा फ्लुबेन्डियामाईड ३९.३५% SC (०.२ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Flubendiamide 39.35% SC @ 0.2 ml/L.",
    dosagePerLitre: "०.३ मिली क्लोरँट्रानिलीप्रोल प्रति लिटर पाणी",
    knapsack15LDose: "४.५ मिली क्लोरँट्रानिलीप्रोल प्रति १५ लिटर पंप",
    precautionMr: "५०% फुलधारणा अवस्थेत पहिली फवारणी वेळेवर करणे उत्पादनासाठी निर्णायक असते.",
    precautionEn: "Apply first spray precisely at 50% flowering to protect developing pods.",
  },
  {
    id: "tur-fusarium-wilt",
    cropId: "tur",
    cropNameMr: "तूर",
    cropNameEn: "Pigeonpea / Tur",
    nameMr: "तुरीवरील मर रोग (Tur Fusarium Wilt)",
    nameEn: "Pigeonpea Wilt (Fusarium udum)",
    nameHi: "अरहर उकठा रोग",
    scientificName: "Fusarium udum",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "मुळातील बुरशीजन्य रोग",
    affectedPlantPart: "Root_Base",
    affectedPlantPartLabelMr: "खोड व मुळे",
    colorPattern: "Wilting",
    colorPatternLabelMr: "पाने पिवळी पडून झाड वाळणे व खोडावर काळी जांभळी रेघ दिसणे",
    growthStage: "Flowering",
    severity: "High",
    symptomsMr: [
      "फुलोरा किंवा शेंगा धरण्याच्या वेळी झाड एका बाजूने पिवळे पडून हळूहळू पूर्ण वाळते.",
      "खोड जमिनीलगत कापल्यास खोडावर काळी-जांभळी उभी रेघ (Purple vascular band) दिसते.",
      "मुळे सडून काळी पडतात.",
    ],
    symptomsEn: [
      "Gradual yellowing and unseasonal wilting of canopy during flowering or podding.",
      "Characteristic purple-black vertical band extending up from the collar on stem bark.",
      "Dark discoloration of xylem vessels when main stem is split.",
    ],
    organicControlMr: "फुले राजेश्वर, बीडीएन ७११ किंवा आशा या मर प्रतिकारक वाणांची निवड करा. ट्रायकोडर्मा व्हिरीडी बीजप्रक्रिया करा.",
    organicControlEn: "Sow wilt-resistant varieties like BDN 711 or BSMR 736. Treat seed with Trichoderma.",
    chemicalControlMr: "कार्बेन्डाझिम ५०% WP (२ ग्रॅम/किलो) बीजप्रक्रिया करा किंवा आळवणी करा.",
    chemicalControlEn: "Seed treatment with Carbendazim 50% WP @ 2 g/kg seed.",
    dosagePerLitre: "२ ग्रॅम कार्बेन्डाझिम प्रति लिटर पाणी",
    knapsack15LDose: "३० ग्रॅम कार्बेन्डाझिम प्रति १५ लिटर पंप",
    precautionMr: "ज्वारी + तूर आंतरपीक पद्धतीमुळे मर रोगाचा प्रादुर्भाव लक्षणीयरीत्या कमी होतो.",
    precautionEn: "Intercropping pigeonpea with sorghum significantly suppresses soil Fusarium inocula.",
  },

  // ==========================================
  // GROUNDNUT (भुईमूग)
  // ==========================================
  {
    id: "groundnut-tikka-leaf-spot",
    cropId: "groundnut",
    cropNameMr: "भुईमूग",
    cropNameEn: "Groundnut / Peanut",
    nameMr: "टिक्का रोग / पानांवरील ठिपके (Tikka Leaf Spot)",
    nameEn: "Groundnut Tikka Leaf Spot (Cercospora arachidicola)",
    nameHi: "मूंगफली टिक्का रोग",
    scientificName: "Cercospora arachidicola",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य ठिपके",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पाने व खोड",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "पानांवर काळे गोलाकार ठिपके व भोवती पिवळे कडे (Halo)",
    growthStage: "Vegetative",
    severity: "Medium",
    symptomsMr: [
      "पानांच्या दोन्ही बाजूंवर लहान तपकिरी-काळे गोलाकार ठिपके पडतात, ज्याभोवती पिवळे कडे असते.",
      "मोठ्या प्रमाणात प्रादुर्भाव झाल्यास पाने अकाली गळून पडतात.",
      "झाडाची पाने गळल्यामुळे शेंगा नीट भरत नाहीत आणि बारीक राहतात.",
    ],
    symptomsEn: [
      "Circular brown to dark brown spots surrounded by a bright yellow chlorotic halo.",
      "Premature severe defoliation leaving bare stems with only top tufts of leaves.",
      "Poor pod filling resulting in shrivelled seeds and low oil content.",
    ],
    organicControlMr: "ताक + हिंगाचे द्रावण किंवा निंबोळी तेल ५ मिली/लिटर फवारा. ट्रायकोडर्मा व्हिरीडी फवारा.",
    organicControlEn: "Spray buttermilk + asafoetida or neem oil @ 5 ml/L. Spray Trichoderma.",
    chemicalControlMr:
      "मॅन्कोझेब ७५% WP (२.५ ग्रॅम/लिटर) किंवा टेब्युकोनॅझोल + ट्रायफ्लॉक्सीस्ट्रॉबिन (०.७ ग्रॅम/लिटर) फवारा.",
    chemicalControlEn: "Spray Mancozeb 75% WP @ 2.5 g/L or Tebuconazole + Trifloxystrobin @ 0.7 g/L.",
    dosagePerLitre: "२.५ ग्रॅम मॅन्कोझेब प्रति लिटर पाणी",
    knapsack15LDose: "३५ ते ४० ग्रॅम मॅन्कोझेब प्रति १५ लिटर पंप",
    precautionMr: "पावसाळ्यात सतत ढगाळ दमट हवामान असल्यास ३५ दिवसांनंतर पहिली प्रतिबंधात्मक फवारणी करावी.",
    precautionEn: "Apply first spray at 35 days after sowing during wet cloudy conditions.",
  },
  {
    id: "groundnut-rust",
    cropId: "groundnut",
    cropNameMr: "भुईमूग",
    cropNameEn: "Groundnut / Peanut",
    nameMr: "तांबेरा रोग (Groundnut Rust)",
    nameEn: "Groundnut Rust (Puccinia arachidis)",
    nameHi: "मूंगफली का गेरुई (रस्ट)",
    scientificName: "Puccinia arachidis",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य तांबेरा",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "पानांची खालची बाजू",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "पानांच्या मागे नारंगी-तपकिरी रंगाचे पावडरी फोड",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "पानांच्या खालच्या बाजूवर नारंगी-तपकिरी रंगाचे बारीक पावडरी फोड (Pustules) दिसतात.",
      "हात लावल्यास तांबूस-तपकिरी बीजाणू बोटांना लागतात.",
      "पाने सुकून वाकडी होतात पण टिक्का रोगाप्रमाणे गळत नाहीत, झाडावरच सुकतात.",
    ],
    symptomsEn: [
      "Orange-brown circular raised pustules bursting primarily on abaxial leaf surfaces.",
      "Rust spores readily rub off onto fingers upon brushing.",
      "Infected leaves curl and dry up but remain attached to the plant unlike Tikka.",
    ],
    organicControlMr: "द्रावणीय गंधक (८०% WDG) २ ग्रॅम/लिटर फवारा. रोग प्रतिकारक वाण पेरा.",
    organicControlEn: "Spray wettable sulphur 80% WDG @ 2 g/L. Sow resistant varieties.",
    chemicalControlMr: "प्रोपिकोनेझोल २५% EC (१ मिली/लिटर) किंवा हेक्झाकोनॅझोल ५% SC (२ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Propiconazole 25% EC @ 1 ml/L or Hexaconazole 5% SC @ 2 ml/L.",
    dosagePerLitre: "१ मिली प्रोपिकोनेझोल प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली प्रोपिकोनेझोल प्रति १५ लिटर पंप",
    precautionMr: "टिक्का आणि तांबेरा अनेकदा एकत्र येतात; दोन्हीसाठी प्रोपिकोनेझोल किंवा टेब्युकोनॅझोल अत्यंत प्रभावी ठरते.",
    precautionEn: "Tikka and rust often co-occur; triazole fungicides control both simultaneously.",
  },

  // ==========================================
  // CITRUS / SWEET ORANGE (संत्रा / मोसंबी)
  // ==========================================
  {
    id: "citrus-canker",
    cropId: "citrus",
    cropNameMr: "संत्रा / मोसंबी",
    cropNameEn: "Citrus / Sweet Orange",
    nameMr: "खैरा / कॅंकर रोग (Citrus Canker)",
    nameEn: "Citrus Canker (Xanthomonas citri pv. citri)",
    nameHi: "नींबूवर्गीय कैंकर रोग",
    scientificName: "Xanthomonas citri pv. citri",
    pathogenType: "Bacterial",
    pathogenTypeLabelMr: "जिवाणूजन्य खैरा रोग",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "फळे, पाने व कोवळ्या फांद्या",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "खवलेदार खरबडीत तपकिरी खड्डे व भोवती पिवळे वलय",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "पानांवर, फांद्यांवर आणि फळांवर सुरुवातीला पिवळसर आणि नंतर खरबडीत तपकिरी खपल्यासारखे डाग पडतात.",
      "डागाचा मध्यभाग विवरासारखा (Crater-like) खोलगट होतो आणि भोवती पिवळे वलय (Yellow halo) दिसते.",
      "फळांची साल खराब होऊन बाजारात कवडीमोल भाव मिळतो.",
    ],
    symptomsEn: [
      "Raised corky blister-like lesions on leaves, twigs, and fruit rinds.",
      "Lesion center becomes crater-like and rough surrounded by an oily yellow ring halo.",
      "Severe fruit surface blemishes drastically degrading market quality.",
    ],
    organicControlMr: "बोर्डो मिश्रण (१%) किंवा कॉपर हायड्रॉक्साईड फवारा. रोगट फांद्या छाटून नष्ट करा.",
    organicControlEn: "Spray 1% Bordeaux mixture or Copper Hydroxide. Prune out cankerous twigs.",
    chemicalControlMr:
      "स्ट्रेप्टोसायक्लिन (०.५ ग्रॅम/लिटर) + कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) एकत्र फवारा.",
    chemicalControlEn: "Spray Streptocycline (0.5 g/L) + Copper Oxychloride 50% WP (2.5 g/L).",
    dosagePerLitre: "०.५ ग्रॅम स्ट्रेप्टोसायक्लिन + २.५ ग्रॅम COC प्रति लिटर पाणी",
    knapsack15LDose: "७.५ ग्रॅम स्ट्रेप्टोसायक्लिन + ३५ ग्रॅम COC प्रति १५ लिटर पंप",
    precautionMr: "पाने कुरतडणाऱ्या पानातील अळीचे (Leaf miner) नियंत्रण करा, कारण तिच्या जखमांतून जिवाणू शिरतात.",
    precautionEn: "Control citrus leaf miner strictly as larvae wounds provide entry for the canker bacteria.",
  },
  {
    id: "citrus-gummosis",
    cropId: "citrus",
    cropNameMr: "संत्रा / मोसंबी",
    cropNameEn: "Citrus / Sweet Orange",
    nameMr: "डिंक्या रोग / खोडकूज (Citrus Gummosis / Foot Rot)",
    nameEn: "Citrus Gummosis (Phytophthora nicotianae)",
    nameHi: "नींबू का गोंदिया रोग",
    scientificName: "Phytophthora nicotianae",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "पाण्यातील बुरशीजन्य रोग",
    affectedPlantPart: "Stem",
    affectedPlantPartLabelMr: "जमिनीलगतचे खोड व मुळे",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "खोडाच्या सालीतून तपकिरी डिंक पाझरणे व साल कुजणे",
    growthStage: "All_Stages",
    severity: "Critical",
    symptomsMr: [
      "जमिनीलगतच्या खोडाच्या सालीला तडे जातात आणि त्यातून तांबूस-तपकिरी डिंक पाझरतो.",
      "खोडाची साल सडून निघून जाते आणि आतील लाकूड काळपट पडते.",
      "झाडाची पाने पिवळी पडून गळतात आणि झाड हळूहळू वाळते.",
    ],
    symptomsEn: [
      "Bark cracking near collar region with profuse exudation of golden brown gum.",
      "Collar bark rots, sloughs off in patches, exposing blackened necrotic wood beneath.",
      "Chlorosis, intense twig dieback, and eventual tree death.",
    ],
    organicControlMr: "खोडाला जमिनीपासून २.५ फूट उंचीपर्यंत बोर्डो पेस्ट (Bordeaux paste) वर्षातून दोनदा लावा.",
    organicControlEn: "Paint tree trunk base up to 2.5 ft with Bordeaux paste twice annually.",
    chemicalControlMr:
      "मेटलॅक्झिल ८% + मॅन्कोझेब ६४% WP (२.५ ग्रॅम/लिटर) किंवा फॉसेटाइल-अल ८०% WP (२.५ ग्रॅम/लिटर) फवारा व आळवणी करा.",
    chemicalControlEn: "Spray and soil drench with Metalaxyl + Mancozeb @ 2.5 g/L or Fosetyl-Al @ 2.5 g/L.",
    dosagePerLitre: "२.५ ग्रॅम मेटलॅक्झिल + मॅन्कोझेब प्रति लिटर पाणी",
    knapsack15LDose: "३५ ते ४० ग्रॅम प्रति १५ लिटर पंप",
    precautionMr: "झाडाच्या खोडाला थेट पाणी लागू नये म्हणून दुहेरी आळे पद्धत (Double ring method) वापरावी.",
    precautionEn: "Adopt double-ring irrigation system to ensure water never touches the central tree trunk.",
  },

  // ==========================================
  // MANGO (आंबा)
  // ==========================================
  {
    id: "mango-powdery-mildew",
    cropId: "mango",
    cropNameMr: "आंबा",
    cropNameEn: "Mango",
    nameMr: "आंब्यावरील भुरी रोग (Mango Powdery Mildew)",
    nameEn: "Mango Powdery Mildew (Oidium mangiferae)",
    nameHi: "आम का चूर्णिल आसिता (भूरी)",
    scientificName: "Oidium mangiferae",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "मोहरावरील बुरशीजन्य भुरी",
    affectedPlantPart: "Flower",
    affectedPlantPartLabelMr: "आंब्याचा मोहर व कोवळी पाने",
    colorPattern: "White_Powder",
    colorPatternLabelMr: "मोहरावर पांढरी भुकटी पसरून मोहर काळा पडून गळणे",
    growthStage: "Flowering",
    severity: "Critical",
    symptomsMr: [
      "आंब्याच्या मोहरावर, फुलांवर आणि कोवळ्या फळांवर पांढऱ्या राखेसारखी भुकटी पसरते.",
      "प्रादुर्भावग्रस्त फुले काळी पडून गळतात आणि फळधारणा (Fruit set) होत नाही.",
      "मोहराच्या दांड्या काळ्या पडून वाळतात.",
    ],
    symptomsEn: [
      "White powdery fungal coating on panicles, flowers, and tender leaves.",
      "Blossoms turn black, dry up, and drop before fruit setting.",
      "Severe yield loss in Alphonso and Kesar mango orchards during flowering.",
    ],
    organicControlMr:
      "द्रावणीय गंधक (८०% WDG) २ ग्रॅम/लिटर फवारा किंवा पोटॅशियम बायकार्बोनेट ३ ग्रॅम/लिटर फवारा.",
    organicControlEn: "Spray wettable sulphur 80% WDG @ 2 g/L or Potassium Bicarbonate @ 3 g/L.",
    chemicalControlMr:
      "हेक्झाकोनॅझोल ५% EC (१ मिली/लिटर) किंवा डिनोकॅप ४८% EC (१ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Hexaconazole 5% EC @ 1 ml/L or Dinocap 48% EC @ 1 ml/L.",
    dosagePerLitre: "१ मिली हेक्झाकोनॅझोल प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली हेक्झाकोनॅझोल प्रति १५ लिटर पंप",
    precautionMr: "मोहर फुटताना पहिली गंधकाची फवारणी करावी; पूर्ण फुलोरा असताना कीटकनाशक फवारू नये कारण परागीकरण करणाऱ्या मधमाशा मरतात.",
    precautionEn: "Apply at panicle emergence; avoid insecticide spraying during peak bloom to protect pollinators.",
  },
  {
    id: "mango-anthracnose",
    cropId: "mango",
    cropNameMr: "आंबा",
    cropNameEn: "Mango",
    nameMr: "आंब्यावरील करपा (Mango Anthracnose)",
    nameEn: "Mango Anthracnose (Colletotrichum gloeosporioides)",
    nameHi: "आम का एन्थ्रेक्नोज (श्याम वर्ण)",
    scientificName: "Colletotrichum gloeosporioides",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य करपा",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "फळे व पाने",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "फळांवर काळे गोलाकार डाग व फळ सडणे",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "पानांवर व फळांवर काळे-तपकिरी अनियमित डाग पडतात, जे नंतर एकत्र येतात.",
      "पिकणाऱ्या फळांवर काळे खोलगट चट्टे पडून फळ आतून सडते.",
      "फांद्यांचे शेंडे करपून वाळतात.",
    ],
    symptomsEn: [
      "Dark brown to black circular lesions on tender foliage and fruit skin.",
      "Sunken black rot spots developing rapidly as harvested mangoes ripen.",
      "Tip dieback and blighting of tender terminal shoots.",
    ],
    organicControlMr: "बोर्डो मिश्रण (१%) किंवा कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) फवारा. सुकलेल्या फांद्या छाटा.",
    organicControlEn: "Spray 1% Bordeaux mixture or Copper Oxychloride 2.5 g/L. Prune dead wood.",
    chemicalControlMr:
      "अझॉक्सीस्ट्रॉबिन २३% SC (१ मिली/लिटर) किंवा कार्बेन्डाझिम ५०% WP (१ ग्रॅम/लिटर) फवारा.",
    chemicalControlEn: "Spray Azoxystrobin 23% SC @ 1 ml/L or Carbendazim 50% WP @ 1 g/L.",
    dosagePerLitre: "१ मिली अझॉक्सीस्ट्रॉबिन प्रति लिटर पाणी",
    knapsack15LDose: "१५ मिली अझॉक्सीस्ट्रॉबिन प्रति १५ लिटर पंप",
    precautionMr: "काढणीनंतर ५२ अंश सेल्सिअस गरम पाण्यात १० मिनिटे फळे बुडवल्यास (Hot water treatment) फळांवरील करपा थांबतो.",
    precautionEn: "Post-harvest hot water dip (52°C for 10 min) prevents transit anthracnose decay.",
  },
  {
    id: "mango-hopper",
    cropId: "mango",
    cropNameMr: "आंबा",
    cropNameEn: "Mango",
    nameMr: "तुडतुडे / भुंगा (Mango Hopper)",
    nameEn: "Mango Leafhopper (Amritodus atkinsoni / Idioscopus spp.)",
    nameHi: "आम का फुदका (हॉपर)",
    scientificName: "Amritodus atkinsoni",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "रसशोषक तुडतुडे",
    affectedPlantPart: "Flower",
    affectedPlantPartLabelMr: "मोहर, कळ्या व कोवळी पाने",
    colorPattern: "Curling",
    colorPatternLabelMr: "मोहरातून मधमाशीसारखा गोड चिकट द्रव पाझरणे व काळी बुरशी वाढणे",
    growthStage: "Flowering",
    severity: "Critical",
    symptomsMr: [
      "झाडाखाली चालताना मोहरातून तुडतुड्यांचे थवे उडताना दिसतात.",
      "मोहरातील रस शोषल्यामुळे मोहर सुकतो आणि फुलांची गळ होते.",
      "तुडतुड्यांच्या मधासारख्या चिकट विष्ठेवर काळी बुरशी (Sooty mold) वाढून पाने काळी पडतात.",
    ],
    symptomsEn: [
      "Large swarms of hoppers fluttering when tree branches are shaken.",
      "Sucking sap from inflorescence florets causing withering and premature drop.",
      "Honeydew excretions cover leaves in thick black sooty mold fungus.",
    ],
    organicControlMr: "व्हर्टिसिलियम लेकॅनी ५ ग्रॅम/लिटर किंवा निंबोळी तेल ५ मिली/लिटर फवारा.",
    organicControlEn: "Spray Verticillium lecanii @ 5 g/L or Neem oil @ 5 ml/L.",
    chemicalControlMr:
      "थायमेथोक्सम २५% WG (०.३ ग्रॅम/लिटर) किंवा इमिडाक्लोप्रिड १७.८% SL (०.४ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Thiamethoxam 25% WG @ 0.3 g/L or Imidacloprid 17.8% SL @ 0.4 ml/L.",
    dosagePerLitre: "०.३ ग्रॅम थायमेथोक्सम प्रति लिटर पाणी",
    knapsack15LDose: "४.५ ग्रॅम थायमेथोक्सम प्रति १५ लिटर पंप",
    precautionMr: "पहिला तुडतुडा मोहरावर दिसताच फवारणी करावी; विलंब झाल्यास मोहर पूर्ण जळून जातो.",
    precautionEn: "Initiate spray at the very first sighting of hoppers on newly emerging panicles.",
  },
  {
    id: "mango-fruit-fly",
    cropId: "mango",
    cropNameMr: "आंबा",
    cropNameEn: "Mango",
    nameMr: "फळमाशी (Oriental Fruit Fly)",
    nameEn: "Mango Fruit Fly (Bactrocera dorsalis)",
    nameHi: "आम की फल मक्खी",
    scientificName: "Bactrocera dorsalis",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "फळात अंडी घालणारी माशी",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "पक्व आंबे",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "आंब्यावर सुईसारखा बारीक डंख व फळातून पिवळा रस पाझरून आत किडे पडणे",
    growthStage: "Fruiting_Maturity",
    severity: "High",
    symptomsMr: [
      "फळाच्या सालीवर डंखाचा लहान काळा ठिपका दिसतो, ज्यातून पिवळसर रस पाझरतो.",
      "फळ कापल्यास आत असंख्य पांढऱ्या अळ्या (Maggots) वळवळताना दिसतात.",
      "फळ आतून नासते, मऊ पडते आणि झाडावरून खाली गळते.",
    ],
    symptomsEn: [
      "Punctures on maturing fruit surface with drops of sap oozing from oviposition site.",
      "Flesh breaks down into a soft foul-smelling mush infested with white maggots.",
      "Premature fruit drop of ripening mangoes.",
    ],
    organicControlMr: "मिथाईल युजेनॉल कामगंध सापळे (Methyl Eugenol traps) एकरी ६ लावा. गळालेली फळे गोळा करून नष्ट करा.",
    organicControlEn: "Hang 6 Methyl Eugenol pheromone lures/acre. Collect and destroy dropped fruits.",
    chemicalControlMr: "मॅलाथिऑन ५०% EC (२ मिली/लिटर) + गूळ (१० ग्रॅम/लिटर) विषारी आमिष (Bait spray) फवारा.",
    chemicalControlEn: "Apply bait spray: Malathion 50% EC (2 ml/L) mixed with jaggery (10 g/L).",
    dosagePerLitre: "२ मिली मॅलाथिऑन प्रति लिटर पाणी",
    knapsack15LDose: "३० मिली मॅलाथिऑन प्रति १५ लिटर पंप",
    precautionMr: "फळांवर थेट विषारी फवारणी टाळावी; विषारी आमिष खोडावर किंवा झाडाच्या एका बाजूला फवारावे.",
    precautionEn: "Apply poison bait in coarse droplets to lower canopy branches, never soaking harvest fruits.",
  },

  // ==========================================
  // GINGER & TURMERIC (आले व हळद)
  // ==========================================
  {
    id: "ginger-rhizome-rot",
    cropId: "ginger",
    cropNameMr: "आले",
    cropNameEn: "Ginger",
    nameMr: "कंदकुज / मऊ कुज (Ginger Rhizome Rot / Pythium Soft Rot)",
    nameEn: "Ginger Soft Rot (Pythium aphanidermatum)",
    nameHi: "अदरक का प्रकंद गलन",
    scientificName: "Pythium aphanidermatum",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "जमिनीतील पाणी साचल्यामुळे होणारी कंदकुज",
    affectedPlantPart: "Root_Base",
    affectedPlantPartLabelMr: "जमिनीतील कंद व खोड",
    colorPattern: "Wilting",
    colorPatternLabelMr: "पाने पिवळी पडून कंद मऊ पडून दुर्गंधी येणे",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "सुरुवातीला पानांचे शेंडे व कडा पिवळ्या पडतात आणि झाड कोमेgroupरून वाळते.",
      "जमिनीलगतचे खोड हाताने ओढल्यास सहज तुटून बाहेर येते.",
      "जमिनीतील आले मऊ पडून पाण्यासारखे कुजते आणि अत्यंत घाण दुर्गंधी येते.",
    ],
    symptomsEn: [
      "Leaf tips turn yellow advancing downwards to leaf margins and whole shoot withers.",
      "Pseudostem pulls away effortlessly from rhizome collar at soil line.",
      "Rhizomes become soft, water-soaked, rotted with offensive putrid odour.",
    ],
    organicControlMr:
      "लागवडीपूर्वी बेणे प्रक्रिया ट्रायकोडर्मा (१० ग्रॅम/लिटर) मध्ये करा. शेतात पाण्याचा उत्तम निचरा ठेवा.",
    organicControlEn: "Seed rhizome treatment with Trichoderma (10 g/L). Ensure raised bed drainage.",
    chemicalControlMr:
      "मेटलॅक्झिल ८% + मॅन्कोझेब ६४% WP (२.५ ग्रॅम/लिटर) किंवा कॉपर ऑक्सिक्लोराईड (३ ग्रॅम/लिटर) आळवणी (Drenching) करा.",
    chemicalControlEn: "Soil drench beds with Metalaxyl + Mancozeb @ 2.5 g/L or COC @ 3 g/L.",
    dosagePerLitre: "२.५ ग्रॅम मेटलॅक्झिल + मॅन्कोझेब प्रति लिटर पाणी",
    knapsack15LDose: "३५ ते ४० ग्रॅम प्रति १५ लिटर पंप",
    precautionMr: "पाऊस सुरू होताच वाफ्यांमध्ये पाणी साचू न देणे हाच या रोगाचा खरा बचाव आहे.",
    precautionEn: "Never allow standing water in rhizome beds during heavy monsoon downpours.",
  },
  {
    id: "turmeric-leaf-spot",
    cropId: "turmeric",
    cropNameMr: "हळद",
    cropNameEn: "Turmeric",
    nameMr: "हळदीवरील करपा / पानावरील ठिपके (Turmeric Leaf Spot)",
    nameEn: "Turmeric Leaf Spot (Colletotrichum capsici / Taphrina maculans)",
    nameHi: "हल्दी का पत्ती धब्बा रोग",
    scientificName: "Colletotrichum capsici",
    pathogenType: "Fungal",
    pathogenTypeLabelMr: "बुरशीजन्य करपा",
    affectedPlantPart: "Leaf",
    affectedPlantPartLabelMr: "हळदीची पाने",
    colorPattern: "Brown_Black_Spots",
    colorPatternLabelMr: "पानांवर लंबगोलाकार तपकिरी ठिपके व पाने जळणे",
    growthStage: "Vegetative",
    severity: "Medium",
    symptomsMr: [
      "पानांवर लंबगोलाकार करड्या किंवा तपकिरी रंगाचे डाग पडतात, ज्याभोवती पिवळे वलय असते.",
      "डाग एकत्र येऊन संपूर्ण पान करपून वाळते, त्यामुळे हळकुंडांची वाढ थांबते.",
      "हंगामाच्या अखेरीस शेतात करपलेली पाने मोठ्या प्रमाणावर दिसतात.",
    ],
    symptomsEn: [
      "Elliptical to oblong brown spots with grey centers and yellow halos on foliage.",
      "Coalescence of lesions causing extensive leaf scorching and reduced rhizome bulking.",
      "Significant reduction in curcumin content and cured rhizome yields.",
    ],
    organicControlMr: "सेंद्रिय गोमूत्र + ताक द्रावण फवारा. स्यूडोमोनास फ्लुरोसेन्स ५ ग्रॅम/लिटर फवारा.",
    organicControlEn: "Spray fermented cow urine + buttermilk. Spray Pseudomonas fluorescens @ 5 g/L.",
    chemicalControlMr:
      "मॅन्कोझेब ७५% WP (२.५ ग्रॅम/लिटर) किंवा प्रोपिकोनेझोल २५% EC (१ मिली/लिटर) फवारा.",
    chemicalControlEn: "Spray Mancozeb 75% WP @ 2.5 g/L or Propiconazole 25% EC @ 1 ml/L.",
    dosagePerLitre: "२.५ ग्रॅम मॅन्कोझेब प्रति लिटर पाणी",
    knapsack15LDose: "३५ ते ४० ग्रॅम मॅन्कोझेब प्रति १५ लिटर पंप",
    precautionMr: "लक्षणे दिसताच पहिली फवारणी ऑगस्ट-सप्टेंबर महिन्यात करावी.",
    precautionEn: "Apply preventive spray during humid August-September monsoon breaks.",
  },

  // ==========================================
  // PAPAYA (पपई)
  // ==========================================
  {
    id: "papaya-ring-spot-virus",
    cropId: "papaya",
    cropNameMr: "पपई",
    cropNameEn: "Papaya",
    nameMr: "रिंग स्पॉट व्हायरस / मोझॅक (Papaya Ring Spot Virus - PRSV)",
    nameEn: "Papaya Ringspot Virus (PRSV)",
    nameHi: "पपीता रिंग स्पॉट वायरस",
    scientificName: "Papaya ringspot virus",
    pathogenType: "Viral",
    pathogenTypeLabelMr: "मावा किडीने पसरवणारा विषाणू",
    affectedPlantPart: "Whole_Plant",
    affectedPlantPartLabelMr: "पाने, खोड व फळे",
    colorPattern: "Yellowing",
    colorPatternLabelMr: "फळांवर गोलाकार कड्यांचे चट्टे (Rings) व पाने आकसणे",
    growthStage: "Vegetative",
    severity: "Critical",
    symptomsMr: [
      "पानांवर पिवळे व हिरवे चट्टे (Mosaic) दिसतात, पाने लहान व धाग्यासारखी पातळ होतात (Shoe-string symptom).",
      "पानांच्या देठावर आणि खोडावर गडद हिरवे तेलकट उभे पट्टे दिसतात.",
      "फळांवर ठळक गोलाकार रिंगसारखे (Ring spots) डाग पडतात आणि फळांची गोडी कमी होते.",
    ],
    symptomsEn: [
      "Severe yellow mosaic mottling, distorted leaves reduced to narrow shoe-strings.",
      "Dark green oily water-soaked streaks on leaf petioles and upper stem trunk.",
      "Distinct concentric ringspot markings on developing green fruit surface.",
    ],
    organicControlMr:
      "रोगट झाडे त्वरित उपटून नष्ट करा. पपईभोवती मक्याचे किंवा बाजरीचे ३-४ ओळींचे कुंपण (Barrier crop) लावा.",
    organicControlEn: "Rogue out infected trees promptly. Grow maize or sorghum windbreak barriers.",
    chemicalControlMr:
      "विषाणूवर थेट रासायनिक औषध नसते; वाहक मावा (Aphid) नियंत्रणासाठी डायमेथोएट ३०% EC (१.५ मिली/लिटर) फवारा.",
    chemicalControlEn: "No viricide exists; control aphid vectors with Dimethoate 30% EC @ 1.5 ml/L.",
    dosagePerLitre: "१.५ मिली डायमेथोएट प्रति लिटर पाणी",
    knapsack15LDose: "२२ मिली डायमेथोएट प्रति १५ लिटर पंप",
    precautionMr: "रोगट झाडावरून निरोगी झाडावर मावा बसल्यास विषाणू काही मिनिटांत पसरतो; रोगट झाड शेतात ठेवू नका.",
    precautionEn: "Aphids transmit virus non-persistently within seconds; eradicate infected plants immediately.",
  },
  {
    id: "papaya-mealybug",
    cropId: "papaya",
    cropNameMr: "पपई",
    cropNameEn: "Papaya",
    nameMr: "पपईवरील पिठ्या ढेकूण (Papaya Mealybug)",
    nameEn: "Papaya Mealybug (Paracoccus marginatus)",
    nameHi: "पपीता मिलीबग",
    scientificName: "Paracoccus marginatus",
    pathogenType: "Pest",
    pathogenTypeLabelMr: "रसशोषक पांढरा कीटक",
    affectedPlantPart: "Fruit_Pod",
    affectedPlantPartLabelMr: "फळे, पानांची खालची बाजू व शेंडा",
    colorPattern: "White_Powder",
    colorPatternLabelMr: "पांढऱ्या कापसासारखा थर व फळे काळी पडून गळणे",
    growthStage: "All_Stages",
    severity: "High",
    symptomsMr: [
      "पानांच्या मागे आणि फळांवर पांढऱ्या मेणासारख्या किडींचा जाड थर जमा होतो.",
      "शेंडा गोळा होऊन झाडाची वाढ खुंटते.",
      "किडीच्या विष्ठेमुळे काळी बुरशी वाढून फळे पूर्ण काळी पडतात आणि गळतात.",
    ],
    symptomsEn: [
      "Dense white waxy cottony deposits clustering beneath leaves and along fruit stalks.",
      "Apical leaves bunch together, wrinkle, and growth ceases completely.",
      "Heavy honeydew secretion leads to thick sooty mold, fruit mummification, and drop.",
    ],
    organicControlMr: "अॅसिडोफॅगस पपया (Acerophagus papayae) हा परोपजीवी कीटक बागेत सोडा. साबणाचे पाणी (१० ग्रॅम/लिटर) फवारा.",
    organicControlEn: "Release Acerophagus papayae parasitoid wasps. Spray mild soap water (10 g/L).",
    chemicalControlMr:
      "प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) किंवा थायामेथोक्सम २५% WG (०.३ ग्रॅम/लिटर) फवारा.",
    chemicalControlEn: "Spray Profenofos 50% EC @ 2 ml/L or Thiamethoxam 25% WG @ 0.3 g/L.",
    dosagePerLitre: "२ मिली प्रोफेनोफॉस प्रति लिटर पाणी",
    knapsack15LDose: "३० मिली प्रोफेनोफॉस प्रति १५ लिटर पंप",
    precautionMr: "फळांवर जाड मेणाचे आवरण असल्यामुळे फवारणीत चिकट द्रव (Sticker / Spreader) मिसळणे अत्यंत आवश्यक आहे.",
    precautionEn: "Always mix an agricultural non-ionic wetting agent to penetrate waxy pest secretions.",
  },
];
