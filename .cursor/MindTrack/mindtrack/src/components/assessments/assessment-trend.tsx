"use client";

import * as React from "react";
import { Chart } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import type { AssessmentType } from "@/types/assessments";

interface TrendPoint {
  date: string;
  score: number;
}

interface AssessmentTrendProps {
  type: AssessmentType;
  data: TrendPoint[];
  maxScore?: number;
  title?: string;
  className?: string;
}

export default function AssessmentTrend({
  type,
  data,
  maxScore,
  title,
  className
}: AssessmentTrendProps) {
  const chartTitle = title || `${type.toUpperCase()} Trend`;

  return (
    <div className={className}>
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">{chartTitle}</h3>
        {typeof maxScore === "number" && (
          <p className="text-xs text-gray-500">Max score: {maxScore}</p>
        )}
      </div>
      <Chart>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, maxScore ?? "auto"]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            name="Score"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </Chart>
    </div>
  );
}


