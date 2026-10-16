import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Sprout
} from 'lucide-react';
import { api } from '../services/api';
import type { DiseaseDiagnosisResponse, CropRecommendationResponse } from '../types';

export const AiAdvisorPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'disease' | 'recommendation'>('disease');

  // Disease Scanner State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiseaseDiagnosisResponse | null>(null);
  const [diseaseError, setDiseaseError] = useState<string | null>(null);

  // Crop Recommendation State
  const [recInputs, setRecInputs] = useState({
    nitrogen: 80,
    phosphorus: 48,
    potassium: 40,
    temperature: 24,
    humidity: 78,
    ph: 6.5,
    rainfall: 1450,
  });
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<CropRecommendationResponse | null>(null);
  const [recError, setRecError] = useState<string | null>(null);

  // Helper to create synthetic test leaf image
  const generateSampleImage = (type: string, filename: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (type === 'healthy') {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, 0, 160, 160);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(80, 80, 60, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'early_blight') {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(0, 0, 160, 160);
        // brown necrotic lesions
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(60, 50, 30, 0, Math.PI * 2);
        ctx.arc(110, 100, 25, 0, Math.PI * 2);
        ctx.fill();
        // yellow halo
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(60, 50, 35, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === 'powdery_mildew') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, 160, 160);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(70, 70, 40, 0, Math.PI * 2);
        ctx.arc(120, 50, 25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(0, 0, 160, 160);
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.arc(80, 80, 35, 0, Math.PI * 2);
        ctx.fill();
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], filename, { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          handleDiagnoseImage(file);
        }
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      handleDiagnoseImage(file);
    }
  };

  const handleDiagnoseImage = async (file: File) => {
    setIsDiagnosing(true);
    setDiseaseError(null);
    try {
      const res = await api.diagnoseDisease(file);
      setDiagnosisResult(res);
    } catch (err: any) {
      setDiseaseError(err.message || 'Diagnosis failed. Please try again.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleRecommendCrops = async () => {
    setIsRecommending(true);
    setRecError(null);
    try {
      const res = await api.recommendCrops(recInputs);
      setRecommendationResult(res);
    } catch (err: any) {
      setRecError(err.message || 'Crop recommendation failed.');
    } finally {
      setIsRecommending(false);
    }
  };

  const setPreset = (presetName: string) => {
    if (presetName === 'alluvial') {
      setRecInputs({ nitrogen: 88, phosphorus: 52, potassium: 44, temperature: 24, humidity: 80, ph: 6.6, rainfall: 1650 });
    } else if (presetName === 'black_soil') {
      setRecInputs({ nitrogen: 110, phosphorus: 45, potassium: 25, temperature: 26, humidity: 72, ph: 7.2, rainfall: 780 });
    } else if (presetName === 'arid') {
      setRecInputs({ nitrogen: 35, phosphorus: 22, potassium: 75, temperature: 29, humidity: 30, ph: 7.8, rainfall: 250 });
    } else if (presetName === 'tropical_hill') {
      setRecInputs({ nitrogen: 95, phosphorus: 30, potassium: 35, temperature: 22, humidity: 75, ph: 5.8, rainfall: 1800 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">AI Agronomy & Pathology Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Machine learning diagnostics for leaf diseases and soil-to-crop matching.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('disease')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'disease'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Leaf Disease Scanner
          </button>
          <button
            onClick={() => setActiveSubTab('recommendation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'recommendation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-4 h-4 text-teal-600" />
            Crop Recommendation
          </button>
        </div>
      </div>

      {/* SUBTAB 1: LEAF DISEASE SCANNER */}
      {activeSubTab === 'disease' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload & Sample Selector */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Leaf Pathology Input</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a clear image of an affected leaf, or select a sample image below to run diagnostics.
                </p>

                {/* Dropzone */}
                <label className="mt-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="text-center">
                      <img
                        src={previewUrl}
                        alt="Leaf preview"
                        className="w-36 h-36 object-cover rounded-xl mx-auto shadow-md border border-slate-200"
                      />
                      <span className="text-xs text-slate-600 mt-2 block font-medium">Click to select a different photo</span>
                      {selectedFile && <span className="text-[11px] text-slate-500 font-mono mt-0.5 block truncate max-w-[200px] mx-auto">{selectedFile.name}</span>}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 block">Upload Leaf Photo</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">Supports PNG, JPG, WEBP</span>
                    </div>
                  )}
                </label>

                {/* Quick Test Samples */}
                <div className="mt-5">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Quick Test Preset Leaves:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => generateSampleImage('healthy', 'healthy_leaf.jpg')}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors text-left"
                    >
                      🌿 Healthy Leaf
                    </button>
                    <button
                      onClick={() => generateSampleImage('early_blight', 'tomato_early_blight.jpg')}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors text-left"
                    >
                      🍂 Early Blight
                    </button>
                    <button
                      onClick={() => generateSampleImage('powdery_mildew', 'powdery_mildew.jpg')}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition-colors text-left"
                    >
                      ⚪ Powdery Mildew
                    </button>
                    <button
                      onClick={() => generateSampleImage('rust', 'leaf_rust.jpg')}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition-colors text-left"
                    >
                      🌰 Common Leaf Rust
                    </button>
                  </div>
                </div>
              </div>

              {diseaseError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {diseaseError}
                </div>
              )}
            </div>

            {/* Diagnostic Results Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pathology Diagnosis Report</h3>
                  <p className="text-xs text-slate-500">Computer vision spectroscopic & lesion classification</p>
                </div>
                {isDiagnosing && (
                  <span className="text-xs font-semibold text-emerald-600 animate-pulse">
                    Analyzing leaf pixels...
                  </span>
                )}
              </div>

              {!diagnosisResult && !isDiagnosing && (
                <div className="py-16 text-center text-slate-400">
                  <BrainCircuit className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                  <p className="text-xs">No image analyzed yet. Upload or click a test sample on the left.</p>
                </div>
              )}

              {diagnosisResult && (
                <div className="mt-4 space-y-5">
                  {/* Diagnosis Banner */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    diagnosisResult.is_healthy 
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                      : 'bg-amber-50/70 border-amber-300 text-amber-950'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          diagnosisResult.is_healthy ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                        }`}>
                          Severity: {diagnosisResult.severity}
                        </span>
                        <span className="text-xs text-slate-500">Target Crop: {diagnosisResult.affected_crop}</span>
                      </div>
                      <h4 className="text-lg font-extrabold mt-1">{diagnosisResult.disease_detected}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black">{diagnosisResult.confidence_score}%</span>
                      <p className="text-[10px] text-slate-500">Confidence</p>
                    </div>
                  </div>

                  {/* Symptoms Checklist */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Identified Pathology Symptoms</h5>
                    <div className="space-y-1.5">
                      {diagnosisResult.symptoms.map((sym, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{sym}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organic & Chemical Treatments Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                      <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        Organic Remedies
                      </h5>
                      <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
                        {diagnosisResult.organic_remedies.map((rem, i) => (
                          <li key={i}>{rem}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <h5 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        Chemical / Agronomic Treatments
                      </h5>
                      <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                        {diagnosisResult.chemical_treatments.map((chem, i) => (
                          <li key={i}>{chem}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cultural Prevention Guidelines */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Cultural & Preventive Practices</h5>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {diagnosisResult.prevention_tips.map((tip, i) => (
                        <span key={i} className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700">
                          ✓ {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CROP RECOMMENDATION */}
      {activeSubTab === 'recommendation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Parameters Panel */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Soil & Climate Parameters</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure soil nutrients and local climate to receive matching crop candidates.
                </p>

                {/* Presets */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Load Soil Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setPreset('alluvial')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Alluvial Plains
                    </button>
                    <button
                      onClick={() => setPreset('black_soil')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Black Soil
                    </button>
                    <button
                      onClick={() => setPreset('tropical_hill')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Tropical Rain
                    </button>
                    <button
                      onClick={() => setPreset('arid')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Arid Semi-Dry
                    </button>
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Nitrogen (N)</span>
                    <span className="text-emerald-700">{recInputs.nitrogen} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    value={recInputs.nitrogen}
                    onChange={(e) => setRecInputs({ ...recInputs, nitrogen: Number(e.target.value) })}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Phosphorus (P)</span>
                    <span className="text-teal-700">{recInputs.phosphorus} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="140"
                    value={recInputs.phosphorus}
                    onChange={(e) => setRecInputs({ ...recInputs, phosphorus: Number(e.target.value) })}
                    className="w-full accent-teal-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Potassium (K)</span>
                    <span className="text-blue-700">{recInputs.potassium} kg/ha</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="160"
                    value={recInputs.potassium}
                    onChange={(e) => setRecInputs({ ...recInputs, potassium: Number(e.target.value) })}
                    className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Soil pH</span>
                    <span className="text-purple-700">{recInputs.ph}</span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.1"
                    value={recInputs.ph}
                    onChange={(e) => setRecInputs({ ...recInputs, ph: Number(e.target.value) })}
                    className="w-full accent-purple-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Average Rainfall</span>
                    <span className="text-blue-700">{recInputs.rainfall} mm</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="50"
                    value={recInputs.rainfall}
                    onChange={(e) => setRecInputs({ ...recInputs, rainfall: Number(e.target.value) })}
                    className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      value={recInputs.temperature}
                      onChange={(e) => setRecInputs({ ...recInputs, temperature: Number(e.target.value) })}
                      className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Humidity (%)</label>
                    <input
                      type="number"
                      value={recInputs.humidity}
                      onChange={(e) => setRecInputs({ ...recInputs, humidity: Number(e.target.value) })}
                      className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleRecommendCrops}
                disabled={isRecommending}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isRecommending ? 'Calculating Agronomic Fit...' : 'Recommend Optimal Crops'}
              </button>

              {recError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {recError}
                </div>
              )}
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-7 space-y-4">
              {!recommendationResult && !isRecommending && (
                <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center text-slate-400">
                  <Sprout className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                  <p className="text-xs">Adjust soil parameters and click "Recommend Optimal Crops" to view tailored recommendations.</p>
                </div>
              )}

              {recommendationResult && (
                <>
                  {/* Soil Health Banner */}
                  <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-3xl">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Soil Chemistry Assessment</h4>
                    <p className="text-xs text-emerald-800 mt-1">{recommendationResult.soil_health_assessment}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-emerald-900 border border-emerald-200">
                        N: {recommendationResult.nutrient_status.nitrogen_status}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-emerald-900 border border-emerald-200">
                        P: {recommendationResult.nutrient_status.phosphorus_status}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-emerald-900 border border-emerald-200">
                        K: {recommendationResult.nutrient_status.potassium_status}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-emerald-900 border border-emerald-200">
                        pH: {recommendationResult.nutrient_status.ph_character}
                      </span>
                    </div>
                  </div>

                  {/* Crop Recommendations Cards */}
                  <div className="space-y-3">
                    {recommendationResult.recommended_crops.map((crop, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400">RANK #{idx + 1}</span>
                            <h4 className="text-lg font-bold text-slate-900">{crop.crop}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-teal-600">{crop.match_score}%</span>
                            <span className="text-[10px] text-slate-400 block">Match Score</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-2">{crop.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-3 text-[11px]">
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-slate-400 block">Sowing Season:</span>
                            <span className="font-semibold text-slate-800">{crop.season}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-slate-400 block">Water Need:</span>
                            <span className="font-semibold text-slate-800">{crop.water_requirement}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-slate-400 block">Ideal Soil:</span>
                            <span className="font-semibold text-slate-800">{crop.ideal_soil_type}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agronomic Best Practices:</span>
                          <ul className="text-xs text-slate-700 space-y-1 mt-1">
                            {crop.key_practices.map((practice, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5">
                                <span className="text-teal-600 font-bold">•</span>
                                <span>{practice}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
