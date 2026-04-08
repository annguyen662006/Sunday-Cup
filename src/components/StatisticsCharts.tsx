import { useStore } from '../store/useStore';
import { useChartData } from '../hooks/useChartData';
import { GlassCard } from './GlassCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#06B6D4'];

interface StatisticsChartsProps {
  onTeamClick: (teamId: string) => void;
}

export const StatisticsCharts = ({ onTeamClick }: StatisticsChartsProps) => {
  const { matches, teams, rounds, stages, isDarkMode } = useStore();
  const { barChartData, lineChartData, pieChartData } = useChartData(matches, teams, rounds, stages);

  const axisColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipBg = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDarkMode ? '#fff' : '#000';
  const labelLineColor = isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  if (teams.length === 0 || barChartData.length === 0) {
    return null;
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="currentColor" className="text-[10px] md:text-xs font-bold text-on-surface" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-headline font-bold uppercase tracking-wider text-on-surface">
          Tổng kết SG League
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <GlassCard className="p-4 md:p-6">
          <h3 className="text-center text-sm md:text-base font-medium text-on-surface-variant mb-6">Điểm số theo tháng</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
                  itemStyle={{ color: tooltipText }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: axisColor }} />
                {teams.map((team, index) => (
                  <Bar key={team.id} dataKey={team.name} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Line Chart */}
        <GlassCard className="p-4 md:p-6">
          <h3 className="text-center text-sm md:text-base font-medium text-on-surface-variant mb-6">Điểm số luỹ kế theo tháng</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
                  itemStyle={{ color: tooltipText }}
                />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: axisColor }} />
                {teams.map((team, index) => (
                  <Line key={team.id} type="monotone" dataKey={team.name} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Pie Chart */}
      <GlassCard className="p-4 md:p-6 flex flex-col items-center">
        <h3 className="text-center text-sm md:text-base font-medium text-on-surface-variant mb-2">Tỷ lệ điểm số</h3>
        <p className="text-xs text-on-surface/50 mb-6 text-center">Bấm vào biểu đồ để xem chi tiết đội bóng</p>
        <div className="h-[400px] w-full max-w-[600px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomizedLabel}
                labelLine={{ stroke: labelLineColor, strokeWidth: 1 }}
                onClick={(data) => {
                  if (data && data.payload && data.payload.id) {
                    onTeamClick(data.payload.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
                itemStyle={{ color: tooltipText }}
                formatter={(value: number) => [`${value} điểm`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-headline font-black text-xl md:text-2xl text-on-surface">SG</span>
            <span className="font-headline font-black text-xl md:text-2xl text-on-surface">LEAGUE</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {pieChartData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs md:text-sm">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-on-surface-variant">{entry.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
