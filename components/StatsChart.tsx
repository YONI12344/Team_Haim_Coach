"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StatsPoint {
  date: string;
  distance: number;
}

interface StatsChartProps {
  data: StatsPoint[];
}

export default function StatsChart({ data }: StatsChartProps) {
  return (
    <div className="h-72 w-full rounded-xl border border-navy-800 bg-navy-900 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Line type="monotone" dataKey="distance" stroke="#22c55e" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
