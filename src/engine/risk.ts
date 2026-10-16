// Comprehensive Agricultural Multi-Factor Risk Evaluation Engine

export interface CropRiskProfile {
  cropId: string;
  overallRating: "Low" | "Medium" | "High";
  overallRatingLabelMr: string;
  overallRatingLabelEn: string;
  overallBadgeColor: string; // Tailwind class
  priceVolatility: {
    level: "Low" | "Medium" | "High";
    score: number; // 1 to 3
    descMr: string;
    descEn: string;
  };
  weatherSensitivity: {
    level: "Low" | "Medium" | "High";
    score: number; // 1 to 3
    descMr: string;
    descEn: string;
  };
  pestDiseaseRisk: {
    level: "Low" | "Medium" | "High";
    score: number; // 1 to 3
    descMr: string;
    descEn: string;
  };
  capitalExposure: {
    level: "Low" | "Medium" | "High";
    score: number; // 1 to 3
    descMr: string;
    descEn: string;
  };
  verdictMr: string;
  verdictEn: string;
}

export function getCropRiskProfile(cropId: string, totalCost: number = 30000): CropRiskProfile {
  switch (cropId) {
    case "onion":
      return {
        cropId,
        overallRating: "Medium",
        overallRatingLabelMr: "मध्यम जोखीम",
        overallRatingLabelEn: "Moderate Risk",
        overallBadgeColor: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700",
        priceVolatility: {
          level: "High",
          score: 3,
          descMr: "बाजारभावात तीव्र चढ-उतार (₹८ ते ₹४५/किलो), आवक जास्त झाल्यास दर कोसळण्याची शक्यता.",
          descEn: "High price fluctuations (₹8 to ₹45/kg) driven by arrival volumes.",
        },
        weatherSensitivity: {
          level: "Medium",
          score: 2,
          descMr: "पावसाळ्यात सड व पाणी साचल्यास नुकसान. काढणीवेळी कोरडे हवामान आवश्यक.",
          descEn: "Susceptible to bulb rot in waterlogged conditions; requires dry harvest.",
        },
        pestDiseaseRisk: {
          level: "Medium",
          score: 2,
          descMr: "फुलकिडे (थ्रिप्स) व जांभळा करपा रोग नियतकालिक फवारणीने नियंत्रणात येतो.",
          descEn: "Thrips and purple blotch manageable with timely spray schedules.",
        },
        capitalExposure: {
          level: "Medium",
          score: 2,
          descMr: "मध्यम भांडवल (₹४०k-₹५०k/एकर), रोपे तयार करणे व काढणीचा मजुरी खर्च जास्त.",
          descEn: "Moderate investment (₹40k-₹50k/acre) mainly in nursery & harvesting labor.",
        },
        verdictMr: "भांडवल मध्यम आहे पण बाजारभावाचा अंदाज घेऊन विक्री नियोजन आवश्यक.",
        verdictEn: "Good returns possible but watch market arrival cycles carefully.",
      };

    case "tomato":
      return {
        cropId,
        overallRating: "High",
        overallRatingLabelMr: "उच्च जोखीम (नफा संभाव्य)",
        overallRatingLabelEn: "High Risk / High Return",
        overallBadgeColor: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700",
        priceVolatility: {
          level: "High",
          score: 3,
          descMr: "अति-चंचल बाजारभाव (₹४ ते ₹६०/किलो), साठवणूक क्षमता कमी असल्याने त्वरित विक्री करावी लागते.",
          descEn: "Extreme price volatility (₹4-60/kg); perishable with zero on-farm storage.",
        },
        weatherSensitivity: {
          level: "High",
          score: 3,
          descMr: "अतिवृष्टी किंवा ढगाळ वातावरणात फुलगळ व करपा रोगाचा तीव्र प्रादुर्भाव.",
          descEn: "High sensitivity to heavy rains, cloudy weather, and fungal blights.",
        },
        pestDiseaseRisk: {
          level: "High",
          score: 3,
          descMr: "नागअळी, फळपोखरणारी अळी व विषाणूजन्य (Tospovirus) रोगांचा मोठा धोका.",
          descEn: "Susceptible to leaf miner, fruit borer and viral leaf curl.",
        },
        capitalExposure: {
          level: "High",
          score: 3,
          descMr: "मोठे भांडवल (₹६५k-₹८५k/एकर) - मल्चिंग, ठिबक, तार-काठ्या व औषधांचा मोठा खर्च.",
          descEn: "Heavy upfront investment in staking, mulching, drip, and crop protection.",
        },
        verdictMr: "मोठा नफा मिळण्याची क्षमता असली तरी नियमित देखरेख व बाजार जोखीम सांभाळावी लागते.",
        verdictEn: "High profit potential but demands intensive care and active market tracking.",
      };

    case "soybean":
      return {
        cropId,
        overallRating: "Low",
        overallRatingLabelMr: "कमी जोखीम (सुरक्षित)",
        overallRatingLabelEn: "Low Risk / Safe",
        overallBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700",
        priceVolatility: {
          level: "Low",
          score: 1,
          descMr: "शासकीय हमीभाव (MSP) व तेलगिरण्यांची कायमस्वरूपी खात्रीशीर मागणी.",
          descEn: "Solid downside protection from Govt MSP and steady oil mill demand.",
        },
        weatherSensitivity: {
          level: "Low",
          score: 1,
          descMr: "पावसाचा १५-२० दिवसांचा ताण सहन करू शकते. कमी पाण्यात येणारे पीक.",
          descEn: "Drought hardy; can withstand 15-20 days dry spell in black soil.",
        },
        pestDiseaseRisk: {
          level: "Medium",
          score: 2,
          descMr: "उंटअळी व चकती भुंगा प्रादुर्भाव - साध्या कीटकनाशकांनी नियंत्रण शक्य.",
          descEn: "Semilooper and girdle beetle controllable with standard integrated sprays.",
        },
        capitalExposure: {
          level: "Low",
          score: 1,
          descMr: "कमी भांडवल (₹२०k-₹२५k/एकर), अल्पभूधारक शेतकऱ्यांसाठी अतिशय सुरक्षित.",
          descEn: "Low capital barrier (₹20k-₹25k/acre), safe for smallholders.",
        },
        verdictMr: "कमी खर्च, हमीभाव आणि हवामानाचा ताण सहन करण्याची उत्तम क्षमता.",
        verdictEn: "Dependable backbone crop with MSP security and low input cost.",
      };

    case "cotton":
      return {
        cropId,
        overallRating: "Medium",
        overallRatingLabelMr: "मध्यम जोखीम",
        overallRatingLabelEn: "Moderate Risk",
        overallBadgeColor: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700",
        priceVolatility: {
          level: "Medium",
          score: 2,
          descMr: "कापूस महामंडळ (CCI) हमीभाव आधार, पण जागतिक कापूस दरांवर भाव अवलंबून.",
          descEn: "Backed by CCI procurement MSP; exports influence market peaks.",
        },
        weatherSensitivity: {
          level: "Medium",
          score: 2,
          descMr: "मध्यम पाणी लागते; अतिवृष्टीत पाणी साचल्यास पातेगळ होते.",
          descEn: "Medium water requirement; waterlogging triggers square/boll shedding.",
        },
        pestDiseaseRisk: {
          level: "High",
          score: 3,
          descMr: "गुलाबी बोंडअळी (Pink Bollworm) व रसशोषक किडींचे काटेकोर नियंत्रण आवश्यक.",
          descEn: "High vulnerability to pink bollworm and sucking pest complex.",
        },
        capitalExposure: {
          level: "Medium",
          score: 2,
          descMr: "मध्यम-जास्त भांडवल (₹३०k-₹४०k/एकर), बियाणे व वेचणी मजुरी खर्च.",
          descEn: "Moderate capital; harvesting/picking wages account for major share.",
        },
        verdictMr: "दीर्घ मुदतीचे नगदी पीक, बोंडअळी व्यवस्थापन केल्यास चांगला परतावा.",
        verdictEn: "Good cash crop if pink bollworm monitoring is strictly adhered to.",
      };

    case "sugarcane":
      return {
        cropId,
        overallRating: "Medium",
        overallRatingLabelMr: "पाणी जोखीम (किंमत सुरक्षित)",
        overallRatingLabelEn: "High Water Risk / Safe Price",
        overallBadgeColor: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700",
        priceVolatility: {
          level: "Low",
          score: 1,
          descMr: "साखर कारखान्यांकडून शासन निश्चित FRP हमीदर थेट खात्यात जमा होतो.",
          descEn: "Guaranteed statutory FRP payments linked to factory sugar recovery.",
        },
        weatherSensitivity: {
          level: "High",
          score: 3,
          descMr: "बारामाही मुबलक पाण्याची आवश्यकता (१६००-२२०० मिमी). दुष्काळात पूर्ण पीक वाया जाण्याची भीती.",
          descEn: "Heavy water dependency; susceptible to total failure under drought.",
        },
        pestDiseaseRisk: {
          level: "Low",
          score: 1,
          descMr: "खोडकिडा व पांढरी माशी वगळता कीड-रोगांचे प्रमाण कमी.",
          descEn: "Relatively pest resistant; shoot borer manageable with earthing up.",
        },
        capitalExposure: {
          level: "Medium",
          score: 2,
          descMr: "१२-१५ महिन्यांचा मोठा कालावधी; भांडवल दीर्घकाळ अडकून राहते.",
          descEn: "12-15 month long lock-in period for capital and land.",
        },
        verdictMr: "शाश्वत पाणीपुरवठा (विहीर/कॅनॉल) असेल तर सर्वात सुरक्षित उत्पन्न.",
        verdictEn: "Guaranteed income if and only if year-round irrigation is assured.",
      };

    case "tur":
    case "gram":
    case "jowar":
    case "bajra":
    case "wheat":
      return {
        cropId,
        overallRating: "Low",
        overallRatingLabelMr: "कमी जोखीम (शाश्वत)",
        overallRatingLabelEn: "Low Risk",
        overallBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700",
        priceVolatility: {
          level: "Low",
          score: 1,
          descMr: "शासकीय हमीभाव व घरगुती अन्नाची कायमस्वरूपी स्थानिक मागणी.",
          descEn: "Steady local foodgrain demand backed by Govt MSP procurement.",
        },
        weatherSensitivity: {
          level: "Low",
          score: 1,
          descMr: "कमी पाण्यात येणारे, कोरडवाहू व दुष्काळ सहनशील पीक.",
          descEn: "Highly resilient to moisture stress and low rainfall.",
        },
        pestDiseaseRisk: {
          level: "Low",
          score: 1,
          descMr: "किमान कीटकनाशक फवारणी; रोगप्रतिकारशक्ती चांगली.",
          descEn: "Minimal spraying needed; hardy against local diseases.",
        },
        capitalExposure: {
          level: "Low",
          score: 1,
          descMr: "अतिशय कमी भांडवली खर्च (₹१५k-₹२२k/एकर).",
          descEn: "Low capital exposure (₹15k-₹22k/acre).",
        },
        verdictMr: "कमी भांडवल व कमी पाणी असणाऱ्या क्षेत्रासाठी सर्वोत्तम व सुरक्षित पर्याय.",
        verdictEn: "Safest crop choice for water-scarce or low-capital conditions.",
      };

    case "grapes":
    case "pomegranate":
    case "banana":
      return {
        cropId,
        overallRating: "High",
        overallRatingLabelMr: "उच्च जोखीम (मोठी गुंतवणूक)",
        overallRatingLabelEn: "High Capital Risk",
        overallBadgeColor: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700",
        priceVolatility: {
          level: "Medium",
          score: 2,
          descMr: "गुणवत्ता व निर्यातीवर चांगला भाव, स्थानिक बाजारात चढ-उतार.",
          descEn: "Premium prices for export quality; variable local rates.",
        },
        weatherSensitivity: {
          level: "High",
          score: 3,
          descMr: "गारपीट, अवकाळी पाऊस किंवा पाण्याचा ताण यामुळे लाखो रुपयांचे नुकसान संभाव्य.",
          descEn: "Hailstorms, unseasonal rain, or drought can devastate standing crop.",
        },
        pestDiseaseRisk: {
          level: "High",
          score: 3,
          descMr: "डाऊनी, भुरी, तेल्या रोगासाठी सतत तज्ज्ञ सल्ला व महागडी औषधे आवश्यक.",
          descEn: "Demands rigorous fungicidal schedules (downy, oily spot, sigatoka).",
        },
        capitalExposure: {
          level: "High",
          score: 3,
          descMr: "फार मोठी गुंतवणूक (₹८०k ते ₹१.५ लाख/एकर), तांत्रिक ज्ञान गरजेचे.",
          descEn: "Large capital outlay (₹80k-₹1.5L/acre); requires expert management.",
        },
        verdictMr: "अनुभवी शेतकऱ्यांसाठी अत्यंत फायदेशीर; नवशिक्या शेतकऱ्यांनी विमा संरक्षण घ्यावे.",
        verdictEn: "Very lucrative for experienced farmers with drip and crop insurance.",
      };

    default:
      return {
        cropId,
        overallRating: totalCost > 45000 ? "Medium" : "Low",
        overallRatingLabelMr: totalCost > 45000 ? "मध्यम जोखीम" : "कमी जोखीम",
        overallRatingLabelEn: totalCost > 45000 ? "Moderate Risk" : "Low Risk",
        overallBadgeColor: totalCost > 45000 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-emerald-100 text-emerald-800 border-emerald-300",
        priceVolatility: {
          level: "Medium",
          score: 2,
          descMr: "स्थानिक बाजार समितीतील आवक-जावकनुसार दर ठरतात.",
          descEn: "Prices fluctuate based on local APMC mandi arrivals.",
        },
        weatherSensitivity: {
          level: "Medium",
          score: 2,
          descMr: "योग्य वेळी सिंचन व निचरा व्यवस्थापन आवश्यक.",
          descEn: "Requires well-drained soil and scheduled irrigation.",
        },
        pestDiseaseRisk: {
          level: "Medium",
          score: 2,
          descMr: "एकात्मिक कीड व्यवस्थापन (IPM) पद्धतीचा वापर फायदेशीर.",
          descEn: "Manageable with integrated pest management practices.",
        },
        capitalExposure: {
          level: totalCost > 45000 ? "Medium" : "Low",
          score: totalCost > 45000 ? 2 : 1,
          descMr: `अंदाजित भांडवल ₹${Math.round(totalCost).toLocaleString("en-IN")}.`,
          descEn: `Estimated capital ₹${Math.round(totalCost).toLocaleString("en-IN")}.`,
        },
        verdictMr: "संतुलित जोखीम व उत्पादनाचे योग्य नियोजन करा.",
        verdictEn: "Balanced profile; plan sowing according to local season.",
      };
  }
}
