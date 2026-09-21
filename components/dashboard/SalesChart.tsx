"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/currency";

const ACCENT = "#FF375F";

interface Point {
  date: string;
  total: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const date = label ? new Date(label + "T00:00:00") : null;
  return (
    <div className="rounded-[12px] border border-border bg-surface px-3.5 py-2.5 shadow-[var(--shadow-elevated)]">
      <p className="text-[12px] text-text-secondary">
        {date?.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })}
      </p>
      <p className="mt-0.5 text-[14px] font-semibold text-text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function SalesChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E5E5E7" strokeDasharray="0" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#6E6E73" }}
          tickFormatter={(value: string) => new Date(value + "T00:00:00").toLocaleDateString("es-PE", { weekday: "short" })}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6E6E73" }} width={0} hide />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E5E5E7", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="total"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#salesFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
