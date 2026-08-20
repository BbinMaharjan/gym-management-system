import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import {
  TeamOutlined,
  WarningOutlined,
  ToolOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { dashboardAPI } from '../../api/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getSummary()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" className="flex justify-center mt-12" />;

  const cards = [
    { title: 'Active Members', value: data?.totalActiveMembers, icon: <TeamOutlined />, color: '#1677ff' },
    { title: 'Expiring This Week', value: data?.expiringThisWeek, icon: <WarningOutlined />, color: '#faad14' },
    { title: 'Total Equipment', value: data?.totalEquipment, icon: <ToolOutlined />, color: '#52c41a' },
    { title: 'Under Maintenance', value: data?.equipmentUnderMaintenance, icon: <ToolOutlined />, color: '#ff4d4f' },
    { title: 'Monthly Revenue', value: data?.monthlyRevenue, icon: <DollarOutlined />, color: '#722ed1', prefix: 'Rs' },
    { title: "Today's Attendance", value: data?.todayAttendance, icon: <CheckCircleOutlined />, color: '#13c2c2' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} lg={8} key={card.title}>
            <Card hoverable>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.prefix || card.icon}
                valueStyle={{ color: card.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
