import { WeatherCurrent, DailyForecastItem, AgroAlert } from "./types";

export function generateAgroAdvisories(
  current: WeatherCurrent,
  dailyForecast: DailyForecastItem[]
): AgroAlert[] {
  const alerts: AgroAlert[] = [];
  const today = dailyForecast[0];
  const tomorrow = dailyForecast[1];

  // 1. Foliar Spraying Window Rule
  const tomorrowRainProb = tomorrow ? tomorrow.precipitationProbabilityMax : 0;
  const tomorrowRainSum = tomorrow ? tomorrow.precipitationSum : 0;

  if (tomorrowRainProb >= 50 || tomorrowRainSum >= 5) {
    alerts.push({
      id: "no-spray-rain-expected",
      severity: "warning",
      titleEn: "Do Not Spray Pesticides Today",
      titleMr: "आज औषध फवारणी करू नका",
      titleHi: "आज कीटनाशक का छिड़काव न करें",
      messageEn: `Rain expected tomorrow (${tomorrowRainProb}% probability, ~${tomorrowRainSum}mm). Sprayed chemicals will wash away.`,
      messageMr: `उद्या पावसाची शक्यता आहे (${tomorrowRainProb}% शक्यता, ~${tomorrowRainSum} मिमी). आज फवारलेले औषध वाहून जाऊन नुकसान होईल.`,
      messageHi: `कल बारिश की संभावना है (${tomorrowRainProb}% संभावना, ~${tomorrowRainSum} मिमी). आज किया गया छिड़काव धुल जाएगा.`,
      actionEn: "Postpone spraying until weather clears.",
      actionMr: "हवामान निरभ्र होईपर्यंत फवारणी पुढे ढकला.",
      actionHi: "मौसम साफ होने तक छिड़काव टालें.",
      iconName: "alert-triangle",
    });
  } else if (current.windSpeed > 15) {
    alerts.push({
      id: "wind-spray-drift",
      severity: "warning",
      titleEn: "High Wind Speed - Delay Spraying",
      titleMr: "वेगाने वाहणारा वारा - फवारणी टाळा",
      titleHi: "तेज हवा - छिड़काव रोकें",
      messageEn: `Current wind speed is ${current.windSpeed} km/h. Spray droplets will drift and cause chemical wastage.`,
      messageMr: `सध्या वाऱ्याचा वेग ${current.windSpeed} किमी/तास आहे. फवारणीचे तुषार उडून औषध वाया जाईल.`,
      messageHi: `वर्तमान में हवा की गति ${current.windSpeed} किमी/घंटा है. छिड़काव बहने से दवा बर्बाद होगी.`,
      actionEn: "Spray during calm morning (7-10 AM) or evening hours.",
      actionMr: "सकाळच्या शांत वेळी (७ ते १०) किंवा संध्याकाळी फवारणी करा.",
      actionHi: "सुबह (७ से १०) या शाम के समय शांत हवा में छिड़काव करें.",
      iconName: "wind",
    });
  } else {
    alerts.push({
      id: "optimal-spray-window",
      severity: "success",
      titleEn: "Optimal Foliar Spraying Window",
      titleMr: "फवारणीसाठी अनुकूल वेळ",
      titleHi: "छिड़काव के लिए अनुकूल समय",
      messageEn: "Low wind speed and clear skies. Ideal window for nutrient and crop protection spray.",
      messageMr: "मंद वारा आणि निरभ्र आकाश. खते व कीटकनाशक फवारणीसाठी आजचा दिवस उत्तम आहे.",
      messageHi: "मंद हवा और साफ मौसम. पोषक तत्व और फसल सुरक्षा छिड़काव के लिए आज का दिन सही है.",
      actionEn: "Complete foliar spraying before 11 AM or after 4 PM.",
      actionMr: "सकाळी ११ च्या आधी किंवा दुपारी ४ नंतर फवारणी पूर्ण करा.",
      actionHi: "सुबह ११ बजे से पहले या शाम ४ बजे के बाद छिड़काव पूरा करें.",
      iconName: "check-circle",
    });
  }

  // 2. Fungal Blight / Downy Mildew Pathogen Humidity Rule
  if (current.relativeHumidity >= 75 && current.temperature >= 18 && current.temperature <= 28) {
    alerts.push({
      id: "fungal-pathogen-humidity",
      severity: "warning",
      titleEn: "High Fungal Blight Risk (Onion & Grapes)",
      titleMr: "बुरशीजन्य करपा रोगाचा धोका (कांदा व द्राक्ष)",
      titleHi: "फफूंद रोग व झुलसा का खतरा (प्याज व अंगूर)",
      messageEn: `Relative humidity is high (${current.relativeHumidity}%) with moderate temperature (${current.temperature}°C). Favorable conditions for downy mildew and purple blotch.`,
      messageMr: `हवेत जास्त आर्द्रता (${current.relativeHumidity}%) व मध्यम तापमान (${current.temperature}°C) असल्याने करपा, भुरी व डाऊनी रोगाचा प्रादुर्भाव वाढू शकतो.`,
      messageHi: `हवा में अधिक नमी (${current.relativeHumidity}%) और मध्यम तापमान (${current.temperature}°C) से झुलसा और डाउनी फफूंद का खतरा बढ़ सकता है.`,
      actionEn: "Apply preventive bio-fungicide (Trichoderma) or copper oxychloride.",
      actionMr: "प्रतिबंधात्मक उपाय म्हणून ट्रायकोडर्मा किंवा कॉपर ऑक्सिक्लोराईड फवारणी करा.",
      actionHi: "बचाव के लिए ट्राइकोडर्मा या कॉपर ऑक्सीक्लोराइड का छिड़काव करें.",
      iconName: "alert-circle",
    });
  }

  // 3. Evapotranspiration & Irrigation Postponement Rule
  if (today && today.precipitationSum >= 12) {
    alerts.push({
      id: "postpone-irrigation-rainfall",
      severity: "info",
      titleEn: "Postpone Irrigation (Rainfall Received)",
      titleMr: "पाण्याची पाळी पुढे ढकला (पाऊस झाला)",
      titleHi: "सिंचाई टालें (बारिश दर्ज)",
      messageEn: `Rainfall recorded (~${today.precipitationSum} mm). Natural root moisture is sufficient.`,
      messageMr: `शेतजमिनीत सुमारे ${today.precipitationSum} मिमी पाऊस झाला आहे. मुळांशी पुरेसा ओलावा आहे.`,
      messageHi: `खेत में लगभग ${today.precipitationSum} मिमी बारिश हुई है. जड़ों में पर्याप्त नमी है.`,
      actionEn: "Postpone pump operation for 48 hours to conserve electricity.",
      actionMr: "पुढील ४८ तास मोटार बंद ठेवा, वीजबिल व पाण्याची बचत करा.",
      actionHi: "अगले ४८ घंटे पंप बंद रखें और बिजली बचाएं.",
      iconName: "droplet",
    });
  } else if (today && today.et0Sum >= 5.0) {
    alerts.push({
      id: "high-evapotranspiration-water",
      severity: "warning",
      titleEn: "High Water Loss (Evapotranspiration)",
      titleMr: "जास्त बाष्पीभवन - पाण्याचे नियोजन",
      titleHi: "अधिक वाष्पीकरण - सिंचाई की जरूरत",
      messageEn: `High reference evapotranspiration (${today.et0Sum.toFixed(1)} mm/day). Soil loses moisture faster in this heat.`,
      messageMr: `आज बाष्पीभवनाचा वेग जास्त (${today.et0Sum.toFixed(1)} मिमी/दिवस) आहे. जमिनीतील ओलावा वेगाने कमी होईल.`,
      messageHi: `आज वाष्पीकरण अधिक (${today.et0Sum.toFixed(1)} मिमी/दिन) है. मिट्टी की नमी तेजी से घटेगी.`,
      actionEn: "Run drip irrigation early morning to prevent plant wilting.",
      actionMr: "पिके कोमेजू नयेत म्हणून सकाळी लवकर ठिबक सिंचन सुरू करा.",
      actionHi: "पौधों को मुरझाने से बचाने के लिए सुबह जल्दी ड्रिप चलाएं.",
      iconName: "sun",
    });
  }

  // 4. Extreme Temperature Alerts (Heatwave / Cold Wave)
  if (current.temperature >= 38) {
    alerts.push({
      id: "heatwave-alert",
      severity: "danger",
      titleEn: "Heatwave Warning (उष्णतेची लाट)",
      titleMr: "उष्णतेची लाट - पिकांचे संरक्षण करा",
      titleHi: "लू / भीषण गर्मी की चेतावनी",
      messageEn: `Extreme temperature recorded (${current.temperature}°C). High heat stress on flowering crops and nurseries.`,
      messageMr: `तीव्र तापमान (${current.temperature}°C) नोंदवले गेले आहे. फुले गळणे आणि रोपांचे नुकसान होऊ शकते.`,
      messageHi: `अत्यधिक तापमान (${current.temperature}°C) दर्ज. फूलों और नर्सरी पर प्रतिकूल प्रभाव.`,
      actionEn: "Maintain soil moisture with light micro-sprinkler misting.",
      actionMr: "तुषार सिंचनाने हलके पाणी उडवून शेतातील तापमान नियंत्रित ठेवा.",
      actionHi: "हल्की सिंचाई से खेत का तापमान नियंत्रित रखें.",
      iconName: "flame",
    });
  } else if (current.temperature <= 10) {
    alerts.push({
      id: "cold-frost-alert",
      severity: "warning",
      titleEn: "Cold Stress Alert (थंडीचा कडाका)",
      titleMr: "थंडीचा कडाका - द्राक्ष व भाजीपाला काळजी",
      titleHi: "अत्यधिक ठंड / पाला पड़ने की आशंका",
      messageEn: `Low night temperature (${current.temperature}°C). Threat of frost on vineyards and sensitive crops.`,
      messageMr: `रात्रीचे तापमान (${current.temperature}°C) खूप खाली गेले आहे. द्राक्ष मणी तडकणे व सुप्तावस्थेचा धोका संभवतो.`,
      messageHi: `रात का तापमान (${current.temperature}°C) बहुत कम. फसलों पर पाले का खतरा.`,
      actionEn: "Provide light night irrigation to raise soil temperature.",
      actionMr: "रात्रीच्या वेळी हलके पाणी द्यावे जेणेकरून मुळांशी उबदारपणा राहील.",
      actionHi: "रात में हल्की सिंचाई करें ताकि मिट्टी का तापमान बना रहे.",
      iconName: "snowflake",
    });
  }

  return alerts;
}
