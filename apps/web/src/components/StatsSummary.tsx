import React from "react";

interface StatsSummaryProps {
  totalPolls: number;
  totalResponses: number;
  averageResponseRate: number;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({
  totalPolls,
  totalResponses,
  averageResponseRate,
}) => {
  const stats = [
    { label: "Total Polls", value: totalPolls },
    { label: "Total Responses", value: totalResponses },
    { label: "Avg Response Rate", value: `${averageResponseRate}%` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-primary">{stat.value}</div>
          <div className="text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsSummary;
