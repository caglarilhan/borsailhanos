import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Legacy mega-components with hundreds of lint issues - refactor later
      "src/components/DashboardV33Inner.tsx",
      "src/components/CalibrationPanel.tsx",
      "src/components/CrossMarketArbitrage.tsx",
      "src/components/CryptoTrading.tsx",
      "src/components/DeepLearningModels.tsx",
      "src/components/EducationSystem.tsx",
      "src/components/EventDrivenAI.tsx",
      "src/components/GodModePanel.tsx",
      "src/components/IngestionMonitor.tsx",
      "src/components/LiquidityHeatmap.tsx",
      "src/components/LiveMetrics.tsx",
      "src/components/LivePrices.tsx",
      "src/components/MacroBridgeAI.tsx",
      "src/components/MarketOverview.tsx",
      "src/components/MarketRegimeDetector.tsx",
      "src/components/MomentumMap.tsx",
      "src/components/OptionsAnalysis.tsx",
      "src/components/PatternAnalysis.tsx",
      "src/components/PredictiveTwin.tsx",
      "src/components/RealTimeAlerts.tsx",
      "src/components/RiskEngine.tsx",
      "src/components/ScenarioSimulator.tsx",
      "src/components/SeckmeFormations.tsx",
      "src/components/SectorHeatmap.tsx",
      "src/components/SectorStrength.tsx",
      "src/components/SignalTrackingPanel.tsx",
      "src/components/SmartNotifications.tsx",
      "src/components/SmartTerminalDashboard.tsx",
      "src/components/StrategyLab.tsx",
      "src/components/TickInspector.tsx",
      "src/components/Top30Analysis.tsx",
      "src/components/TradingSignals.tsx",
      "src/components/UltraAccuracyOptimizer.tsx",
    ],
  },
];

export default eslintConfig;
