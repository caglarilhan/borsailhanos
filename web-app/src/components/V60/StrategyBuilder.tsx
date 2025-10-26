'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  TrendingUp,
  Shield,
  Calendar,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface StrategyStep {
  step: number;
  title: string;
  component: React.ReactNode;
}

export default function StrategyBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [strategy, setStrategy] = useState({
    name: '',
    targetReturn: 15,
    riskTolerance: 'medium',
    timeHorizon: 'medium',
    preferredSectors: [] as string[],
    maxPositions: 5
  });

  const sectors = ['Bankacılık', 'Teknoloji', 'İnşaat', 'Sanayi', 'Otomotiv', 'Gıda'];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Strateji Adı</label>
              <input
                type="text"
                value={strategy.name}
                onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
                placeholder="Örn: Hedef Getiri 15% Stratejisi"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Hedef Getiri: <span className="text-purple-400">{strategy.targetReturn}%</span>
              </label>
              <input
                type="range"
                min={5}
                max={50}
                value={strategy.targetReturn}
                onChange={(e) => setStrategy({ ...strategy, targetReturn: parseInt(e.target.value) })}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5% (Güvenli)</span>
                <span>50% (Agresif)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-3">Risk Toleransı</label>
              <div className="grid grid-cols-3 gap-4">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setStrategy({ ...strategy, riskTolerance: level.toLowerCase() })}
                    className={`py-4 px-6 rounded-lg font-bold transition-all ${
                      strategy.riskTolerance === level.toLowerCase()
                        ? 'bg-purple-500 text-white scale-105'
                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-3">Zaman Ufku</label>
              <div className="grid grid-cols-3 gap-4">
                {['Short', 'Medium', 'Long'].map((horizon) => (
                  <button
                    key={horizon}
                    onClick={() => setStrategy({ ...strategy, timeHorizon: horizon.toLowerCase() })}
                    className={`py-4 px-6 rounded-lg font-bold transition-all ${
                      strategy.timeHorizon === horizon.toLowerCase()
                        ? 'bg-purple-500 text-white scale-105'
                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }`}
                  >
                    {horizon === 'Short' && 'Kısa'} 
                    {horizon === 'Medium' && 'Orta'}
                    {horizon === 'Long' && 'Uzun'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Maksimum Pozisyon: <span className="text-cyan-400">{strategy.maxPositions}</span>
              </label>
              <input
                type="range"
                min={3}
                max={20}
                value={strategy.maxPositions}
                onChange={(e) => setStrategy({ ...strategy, maxPositions: parseInt(e.target.value) })}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-bold text-gray-400 mb-3">Tercih Edilen Sektörler</label>
            <div className="grid grid-cols-2 gap-3">
              {sectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => {
                    const newSectors = strategy.preferredSectors.includes(sector)
                      ? strategy.preferredSectors.filter(s => s !== sector)
                      : [...strategy.preferredSectors, sector];
                    setStrategy({ ...strategy, preferredSectors: newSectors });
                  }}
                  className={`py-3 px-4 rounded-lg font-bold transition-all ${
                    strategy.preferredSectors.includes(sector)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  {strategy.preferredSectors.includes(sector) && '✓ '}{sector}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl p-6 border-2 border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Strateji Özeti</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ad:</span>
                  <span className="text-white font-bold">{strategy.name || 'İsimsiz Strateji'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hedef Getiri:</span>
                  <span className="text-purple-400 font-bold">{strategy.targetReturn}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk:</span>
                  <span className="text-cyan-400 font-bold capitalize">{strategy.riskTolerance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zaman:</span>
                  <span className="text-emerald-400 font-bold capitalize">{strategy.timeHorizon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Pozisyon:</span>
                  <span className="text-orange-400 font-bold">{strategy.maxPositions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sektörler:</span>
                  <span className="text-yellow-400 font-bold">
                    {strategy.preferredSectors.length > 0 ? strategy.preferredSectors.join(', ') : 'Hepsi'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-bold text-white text-lg flex items-center justify-center gap-3 hover:from-purple-600 hover:to-cyan-600 transition-all"
            >
              <CheckCircle className="w-6 h-6" />
              Stratejiyi Oluştur
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step < currentStep ? 'bg-green-500 text-white' :
              step === currentStep ? 'bg-purple-500 text-white ring-4 ring-purple-500/50' :
              'bg-slate-700 text-gray-400'
            }`}>
              {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
            </div>
            {step < 5 && (
              <div className={`flex-1 h-1 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-slate-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Titles */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          {currentStep === 1 && '📝 Strateji Adı'}
          {currentStep === 2 && '🎯 Hedef & Risk'}
          {currentStep === 3 && '⏰ Zaman & Pozisyon'}
          {currentStep === 4 && '🏭 Sektör Seçimi'}
          {currentStep === 5 && '✅ Onay'}
        </h3>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StepContent />
      </motion.div>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex justify-between pt-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-all"
          >
            ← Geri
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg font-bold flex items-center gap-2 hover:from-purple-600 hover:to-cyan-600 transition-all"
          >
            İleri <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

