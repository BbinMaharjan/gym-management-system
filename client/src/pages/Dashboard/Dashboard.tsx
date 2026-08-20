import { Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { dashboardAPI } from '../../api/api';
import type {
  DashboardSummary,
  RevenueTrend,
  AttendanceTrend,
  MemberGrowth,
  PaymentMethod,
  ShiftData,
} from '../../types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

const styles = {
  container: {
    padding: '24px',
    background: '#f0f2f5',
    minHeight: '100vh',
  } as React.CSSProperties,
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  } as React.CSSProperties,
  statCard: {
    borderRadius: '12px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'fadeInUp 0.6s ease forwards',
    opacity: 0,
    transform: 'translateY(20px)',
  } as React.CSSProperties,
  statTitle: {
    fontSize: '14px',
    opacity: 0.85,
    marginBottom: '8px',
  } as React.CSSProperties,
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.2,
  } as React.CSSProperties,
  chartRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  } as React.CSSProperties,
  chartCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
    animation: 'fadeInUp 0.6s ease forwards',
    opacity: 0,
  } as React.CSSProperties,
  chartTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#262626',
  } as React.CSSProperties,
  pieRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  } as React.CSSProperties,
  keyframes: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
};

const gradients: Record<string, string> = {
  members: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  revenue: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  attendance: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  expiring: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  equipment: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  maintenance: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  totalMembers: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.85)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontSize: '13px',
      }}
    >
      <p style={{ marginBottom: '4px', fontWeight: 600 }}>{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ margin: '2px 0', color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardAPI.getSummary(),
  });

  const { data: revenueRes } = useQuery({
    queryKey: ['dashboard', 'revenueTrend'],
    queryFn: () => dashboardAPI.getRevenueTrend(),
  });

  const { data: attendanceRes } = useQuery({
    queryKey: ['dashboard', 'attendanceTrend'],
    queryFn: () => dashboardAPI.getAttendanceTrend(),
  });

  const { data: memberGrowthRes } = useQuery({
    queryKey: ['dashboard', 'memberGrowth'],
    queryFn: () => dashboardAPI.getMemberGrowth(),
  });

  const { data: paymentMethodsRes } = useQuery({
    queryKey: ['dashboard', 'paymentMethods'],
    queryFn: () => dashboardAPI.getPaymentMethods(),
  });

  const { data: shiftRes } = useQuery({
    queryKey: ['dashboard', 'shiftDistribution'],
    queryFn: () => dashboardAPI.getShiftDistribution(),
  });

  const summary: DashboardSummary | undefined = summaryRes?.data;
  const revenueTrend: RevenueTrend[] = revenueRes?.data ?? [];
  const attendanceTrend: AttendanceTrend[] = attendanceRes?.data ?? [];
  const memberGrowth: MemberGrowth[] = memberGrowthRes?.data ?? [];
  const paymentMethods: PaymentMethod[] = paymentMethodsRes?.data ?? [];
  const shiftDistribution: ShiftData[] = shiftRes?.data ?? [];

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const statCards = [
    { title: 'Active Members', value: summary?.totalActiveMembers ?? 0, bg: gradients.members },
    { title: 'Monthly Revenue', value: `Rs.${(summary?.monthlyRevenue ?? 0).toLocaleString()}`, bg: gradients.revenue },
    { title: "Today's Attendance", value: summary?.todayAttendance ?? 0, bg: gradients.attendance },
    { title: 'Expiring This Week', value: summary?.expiringThisWeek ?? 0, bg: gradients.expiring },
    { title: 'Total Equipment', value: summary?.totalEquipment ?? 0, bg: gradients.equipment },
    { title: 'Under Maintenance', value: summary?.equipmentUnderMaintenance ?? 0, bg: gradients.maintenance },
    { title: 'Total Members', value: summary?.totalMembers ?? 0, bg: gradients.totalMembers },
  ];

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.container}>
        <div style={styles.statsRow}>
          {statCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                ...styles.statCard,
                background: card.bg,
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <div style={styles.statTitle}>{card.title}</div>
              <div style={styles.statValue}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={styles.chartRow}>
          <div style={{ ...styles.chartCard, animationDelay: '0.3s' }}>
            <div style={styles.chartTitle}>Revenue Trend</div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fill="url(#revenueGrad)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...styles.chartCard, animationDelay: '0.4s' }}>
            <div style={styles.chartTitle}>Attendance Trend</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="attendance" fill="#4facfe" name="Attendance" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartRow}>
          <div style={{ ...styles.chartCard, animationDelay: '0.5s' }}>
            <div style={styles.chartTitle}>Member Growth</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="members" fill="#52c41a" name="Members" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.pieRow}>
          <div style={{ ...styles.chartCard, animationDelay: '0.6s' }}>
            <div style={styles.chartTitle}>Payment Methods</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="total"
                  nameKey="method"
                  label={({ method, total }: any) =>
                    `${method}: Rs.${Number(total).toLocaleString()}`
                  }
                >
                  {paymentMethods.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: any, name: any) => [
                    `Rs.${Number(value).toLocaleString()}`,
                    name === 'total' ? 'Total' : name,
                  ]) as any}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...styles.chartCard, animationDelay: '0.7s' }}>
            <div style={styles.chartTitle}>Shift Distribution</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={shiftDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="shift"
                  label={({ shift, count }: any) =>
                    `${shift}: ${count}`
                  }
                >
                  {shiftDistribution.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: any, name: any) => [
                    value,
                    name === 'count' ? 'Count' : name,
                  ]) as any}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
