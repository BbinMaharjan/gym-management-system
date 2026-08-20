import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import {
  TeamOutlined,
  WarningOutlined,
  ToolOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  UserOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI } from '../../api/api';

const StatCard = ({ title, value, icon, color, gradient, delay, suffix }) => (
  <div
    className="stat-card"
    style={{
      background: gradient,
      borderRadius: 16,
      padding: '24px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      animationDelay: `${delay}ms`,
    }}
  >
    <div className="stat-card-bg" style={{ background: `${color}20` }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
            {suffix}{value?.toLocaleString() ?? 0}
          </div>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const CHART_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shiftData, setShiftData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getSummary(),
      dashboardAPI.getRevenueTrend(),
      dashboardAPI.getAttendanceTrend(),
      dashboardAPI.getMemberGrowth(),
      dashboardAPI.getPaymentMethods(),
      dashboardAPI.getShiftDistribution(),
    ])
      .then(([s, r, a, mg, pm, sd]) => {
        setSummary(s.data);
        setRevenueTrend(r.data);
        setAttendanceTrend(a.data);
        setMemberGrowth(mg.data);
        setPaymentMethods(pm.data);
        setShiftData(sd.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const statCards = [
    { title: 'Active Members', value: summary?.totalActiveMembers, icon: <TeamOutlined />, color: '#1677ff', gradient: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)' },
    { title: 'Expiring This Week', value: summary?.expiringThisWeek, icon: <WarningOutlined />, color: '#faad14', gradient: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' },
    { title: 'Monthly Revenue', value: summary?.monthlyRevenue, icon: <DollarOutlined />, color: '#52c41a', gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', suffix: 'Rs' },
    { title: "Today's Attendance", value: summary?.todayAttendance, icon: <CheckCircleOutlined />, color: '#13c2c2', gradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)' },
    { title: 'Total Members', value: summary?.totalMembers, icon: <UserOutlined />, color: '#722ed1', gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)' },
    { title: 'Under Maintenance', value: summary?.equipmentUnderMaintenance, icon: <ToolOutlined />, color: '#ff4d4f', gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          fontSize: 13,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color }}>
              {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? `Rs${p.value.toLocaleString()}` : p.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <style>{`
        .stat-card {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease forwards;
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card-bg {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.5;
        }
        .chart-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: box-shadow 0.3s ease;
        }
        .chart-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .chart-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Dashboard</h2>
        <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Welcome back! Here's your gym overview.</div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={card.title} style={{ animationDelay: `${i * 80}ms` }}>
            <StatCard {...card} delay={i * 80} />
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue Trend */}
        <div className="chart-card">
          <div className="chart-title">
            <RiseOutlined style={{ color: '#52c41a' }} /> Revenue Trend (6 Months)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 12 }} stroke="#ccc" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#52c41a" fill="url(#revGrad)" strokeWidth={2.5} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="chart-card">
          <div className="chart-title">
            <CheckCircleOutlined style={{ color: '#13c2c2' }} /> Attendance (Last 7 Days)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 12 }} stroke="#ccc" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="attendance" name="Check-ins" radius={[6, 6, 0, 0]} animationDuration={1200}>
                {attendanceTrend.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Member Growth */}
        <div className="chart-card lg:col-span-1">
          <div className="chart-title">
            <TeamOutlined style={{ color: '#1677ff' }} /> Member Growth
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 12 }} stroke="#ccc" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="members" name="New Members" fill="#1677ff" radius={[6, 6, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="chart-card lg:col-span-1">
          <div className="chart-title">
            <DollarOutlined style={{ color: '#722ed1' }} /> Payment Methods
          </div>
          {paymentMethods.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="method"
                  animationDuration={1200}
                  label={({ method, count }) => `${method} (${count})`}
                >
                  {paymentMethods.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No payments this month</div>
          )}
        </div>

        {/* Shift Distribution */}
        <div className="chart-card lg:col-span-1">
          <div className="chart-title">
            <CheckCircleOutlined style={{ color: '#faad14' }} /> Today's Shift
          </div>
          {shiftData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={shiftData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="shift"
                  animationDuration={1200}
                  label={({ shift, count }) => `${shift} (${count})`}
                >
                  {shiftData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No attendance today</div>
          )}
        </div>
      </div>
    </div>
  );
}
