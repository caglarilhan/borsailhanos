"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from "recharts";

const testData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
];

const pieData = [
  { name: 'Group A', value: 400, color: '#0088FE' },
  { name: 'Group B', value: 300, color: '#00C49F' },
  { name: 'Group C', value: 300, color: '#FFBB28' },
  { name: 'Group D', value: 200, color: '#FF8042' },
];

export default function ChartTest() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chart Test Component</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Bar Chart Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart>
            <BarChart data={testData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </Chart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Chart Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart>
            <LineChart data={testData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </Chart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pie Chart Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Chart>
        </CardContent>
      </Card>
    </div>
  );
}
