import { useStore } from '../store/useStore';
import { useChartData } from '../hooks/useChartData';
import { GlassCard } from './GlassCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#06B6D4'];

const getTeamColor = (teamName: string, index: number) => {
  const name = teamName.toLowerCase();
  if (name.includes('sunday united')) return '#EF4444'; // Red
  if (name.includes('diamond blue')) return '#3B82F6'; // Blue
  if (name.includes('fffc')) return '#10B981'; // Green
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

interface StatisticsChartsProps {
  onTeamClick: (teamId: string) => void;
  onViewAllTeams: () => void;
}

export const StatisticsCharts = ({ onTeamClick, onViewAllTeams }: StatisticsChartsProps) => {
  const { matches, teams, rounds, stages, isDarkMode } = useStore();
  const { barChartData, lineChartData, pieChartData } = useChartData(matches, teams, rounds, stages);

  const axisColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const tooltipBg = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDarkMode ? '#fff' : '#000';

  if (teams.length === 0 || barChartData.length === 0) {
    return null;
  }

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const sortedPieData = [...pieChartData].sort((a, b) => a.name.localeCompare(b.name));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="#ffffff" 
        style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
        className="text-[10px] md:text-xs font-bold pointer-events-none" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-headline font-bold uppercase tracking-wider text-on-surface">
          Joykick Premier League 2026
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <GlassCard className="p-4 md:p-6">
          <h3 className="text-center text-sm md:text-base font-medium text-on-surface-variant mb-6">Điểm số theo tháng</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
                  itemStyle={{ color: tooltipText }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: axisColor }} />
                {sortedTeams.map((team, index) => (
                  <Bar key={team.id} dataKey={team.name} fill={getTeamColor(team.name, index)} radius={[4, 4, 0, 0]} />
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
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
                  itemStyle={{ color: tooltipText }}
                />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: axisColor }} />
                {sortedTeams.map((team, index) => (
                  <Line key={team.id} type="monotone" dataKey={team.name} stroke={getTeamColor(team.name, index)} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
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
                data={sortedPieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomizedLabel}
                labelLine={false}
                onClick={(data) => {
                  if (data && data.payload && data.payload.id) {
                    onTeamClick(data.payload.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                {sortedPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTeamColor(entry.name, index)} className="hover:opacity-80 transition-opacity outline-none" />
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
            <span className="font-headline font-black text-xl md:text-2xl text-on-surface">JOYKICK</span>
            <span className="font-headline font-black text-xl md:text-2xl text-on-surface">LEAGUE</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4 mb-8">
          {sortedPieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs md:text-sm">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getTeamColor(entry.name, index) }}></div>
              <span className="text-on-surface-variant">{entry.name}</span>
            </div>
          ))}
        </div>
        
        <button
          onClick={onViewAllTeams}
          className="mt-4 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          Xem chi tiết các đội bóng
        </button>
      </GlassCard>
    </div>
  );
};
