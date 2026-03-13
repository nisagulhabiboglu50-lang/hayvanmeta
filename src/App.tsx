import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Info, RefreshCw, Layers, Search, Loader2, Sparkles, Play, Video } from 'lucide-react';
import { ANIMALS as INITIAL_ANIMALS } from './constants';
import { Animal, LifecycleStage } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal>(INITIAL_ANIMALS[0]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStage = selectedAnimal.stages[currentStageIndex];

  // Reset video when stage changes
  useEffect(() => {
    setGeneratedVideoUrl(null);
  }, [selectedAnimal.id, currentStageIndex]);

  const nextStage = () => {
    if (currentStageIndex < selectedAnimal.stages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
    } else {
      setCurrentStageIndex(0);
    }
  };

  const prevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(currentStageIndex - 1);
    } else {
      setCurrentStageIndex(selectedAnimal.stages.length - 1);
    }
  };

  const handleAnimalSelect = (animal: Animal) => {
    setSelectedAnimal(animal);
    setCurrentStageIndex(0);
    setError(null);
  };

  const generateStageVideo = async () => {
    setIsVideoLoading(true);
    setError(null);
    try {
      const prompt = `A high-quality nature documentary style video showing the metamorphosis process of a ${selectedAnimal.name}: ${currentStage.name}. ${currentStage.description}. Cinematic lighting, macro lens.`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
        });
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error(err);
      setError("Video üretilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const searchAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Analyze the metamorphosis/lifecycle of "${searchQuery}". Provide 4 distinct stages. 
        Return the data in Turkish. For each stage, provide a name, a detailed description, and a keyword for a high-quality nature photograph.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              scientificName: { type: Type.STRING },
              icon: { type: Type.STRING, description: "A single emoji representing the animal" },
              stages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imageKeyword: { type: Type.STRING, description: "English keyword for Unsplash image" }
                  },
                  required: ["id", "name", "description", "imageKeyword"]
                }
              }
            },
            required: ["name", "scientificName", "icon", "stages"]
          }
        }
      });

      const data = JSON.parse(response.text);
      
      const newAnimal: Animal = {
        id: Date.now().toString(),
        name: data.name,
        scientificName: data.scientificName,
        icon: data.icon,
        stages: data.stages.map((s: any, idx: number) => ({
          ...s,
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(data.name)}-${idx}/800/600`
        }))
      };

      setAnimals(prev => [newAnimal, ...prev.slice(0, 5)]);
      setSelectedAnimal(newAnimal);
      setCurrentStageIndex(0);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      setError("Hayvan bilgileri alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2D2D] font-sans">
      {/* Header */}
      <header className="border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Metamorfoz Gözlemcisi</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Yapay Zeka & Veo Destekli</p>
            </div>
          </div>

          <form onSubmit={searchAnimal} className="relative w-full md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bir hayvan ara (örn: İpek Böceği)..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <button 
              type="submit" 
              disabled={isLoading}
              className="absolute right-2 top-1.5 p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {animals.map((animal) => (
            <button
              key={animal.id}
              onClick={() => handleAnimalSelect(animal)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                selectedAnimal.id === animal.id 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{animal.icon}</span>
              <span className="text-sm font-bold">{animal.name}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
            <Info size={18} />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Visual Observer */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl bg-black group">
              <AnimatePresence mode="wait">
                {generatedVideoUrl ? (
                  <motion.video
                    key={generatedVideoUrl}
                    src={generatedVideoUrl}
                    autoPlay
                    loop
                    controls
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <motion.img
                    key={`${selectedAnimal.id}-${currentStage.id}`}
                    src={currentStage.imageUrl}
                    alt={currentStage.name}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </AnimatePresence>

              {isVideoLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4 z-20">
                  <Loader2 size={48} className="animate-spin text-emerald-400" />
                  <div className="text-center">
                    <p className="font-bold text-lg">Video Üretiliyor...</p>
                    <p className="text-sm text-gray-300">Bu işlem yaklaşık 30-60 saniye sürebilir.</p>
                  </div>
                </div>
              )}
              
              {/* Overlay Controls */}
              {!generatedVideoUrl && !isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={prevStage}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextStage}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}

              {/* Stage Progress Bar */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-2 z-10">
                {selectedAnimal.stages.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 flex-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <motion.div
                      initial={false}
                      animate={{ width: idx <= currentStageIndex ? '100%' : '0%' }}
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Selector */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
              <div className="flex gap-4">
                {selectedAnimal.stages.map((stage, idx) => (
                  <button
                    key={stage.id}
                    onClick={() => setCurrentStageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      currentStageIndex === idx ? 'border-emerald-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={stage.imageUrl} alt={stage.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {currentStageIndex === idx && (
                      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentStageIndex(0)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <RefreshCw size={16} />
                Sıfırla
              </button>
            </div>
          </div>

          {/* Right Side: Information */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              key={selectedAnimal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-widest">
                {selectedAnimal.scientificName}
              </span>
              <h2 className="text-4xl font-bold tracking-tight">{selectedAnimal.name}</h2>
              <p className="text-gray-500 leading-relaxed">
                Bu canlının yaşam döngüsü {selectedAnimal.stages.length} ana aşamadan oluşur. 
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedAnimal.id}-${currentStage.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 rounded-3xl border border-[#E5E5E5] shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-xl">
                      {currentStageIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{currentStage.name}</h3>
                      <p className="text-sm text-gray-400">Aşama {currentStageIndex + 1} / {selectedAnimal.stages.length}</p>
                    </div>
                  </div>
                  {!generatedVideoUrl && (
                    <button
                      onClick={generateStageVideo}
                      disabled={isVideoLoading}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      title="Video Gözlemi Başlat"
                    >
                      <Video size={20} />
                    </button>
                  )}
                </div>

                <div className="h-px bg-[#F0F0F0]" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-emerald-500 mt-1 shrink-0" size={20} />
                    <p className="text-gray-700 leading-relaxed">
                      {currentStage.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={prevStage}
                    className="py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft size={20} />
                    Geri
                  </button>
                  <button
                    onClick={nextStage}
                    className="py-4 bg-[#2D2D2D] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                  >
                    İleri
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-[#E5E5E5] mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Layers size={18} />
            <span className="text-sm font-medium">Metamorfoz Gözlemcisi &copy; 2026</span>
          </div>
          <p className="text-xs text-gray-400">Yapay zeka (Veo) ile üretilen videolar canlandırma amaçlıdır.</p>
        </div>
      </footer>
    </div>
  );
}
