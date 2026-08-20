import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, DatePicker, Select, Spin, Avatar, message, Popconfirm } from 'antd';
import { SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, LogoutOutlined, LoginOutlined, DeleteOutlined } from '@ant-design/icons';
import { dashboardAPI, membersAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import dayjs from 'dayjs';

export default function Attendance() {
  const [todayRecords, setTodayRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayLoading, setTodayLoading] = useState(false);
  const [checkInMember, setCheckInMember] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [search, setSearch] = useState('');

  const canManage = usePermission('attendance:manage');

  const fetchTodayCheckedIn = async () => {
    setTodayLoading(true);
    try {
      const { data } = await dashboardAPI.getTodayCheckedIn();
      setTodayRecords(data);
    } finally {
      setTodayLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.getAttendance({ date: date.format('YYYY-MM-DD') });
      setHistoryRecords(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    const { data } = await membersAPI.getAll();
    setAllMembers(data);
  };

  useEffect(() => {
    fetchTodayCheckedIn();
    fetchHistory();
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [date]);

  const handleCheckIn = async () => {
    if (!checkInMember) return message.warning('Select a member');
    setCheckInLoading(true);
    try {
      await membersAPI.checkIn(checkInMember);
      message.success('Checked in');
      setCheckInMember(null);
      fetchTodayCheckedIn();
      fetchHistory();
    } catch (err) {
      message.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      await membersAPI.checkOut(memberId);
      message.success('Checked out');
      fetchTodayCheckedIn();
      fetchHistory();
    } catch (err) {
      message.error(err.response?.data?.error || 'Check-out failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dashboardAPI.deleteAttendance(id);
      message.success('Record deleted');
      fetchTodayCheckedIn();
      fetchHistory();
    } catch (err) {
      message.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const checkedInMemberIds = todayRecords.map((r) => r.member?._id);

  const availableForCheckIn = allMembers.filter(
    (m) => !checkedInMemberIds.includes(m._id)
  );

  const filteredHistory = historyRecords.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.member?.name?.toLowerCase().includes(q) ||
      r.member?.phone?.includes(q)
    );
  });

  const historyColumns = [
    {
      title: 'Member',
      key: 'member',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.member?.name || '-'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.member?.phone || ''}</div>
        </div>
      ),
    },
    {
      title: 'Check In',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (v) => v ? dayjs(v).format('DD MMM YYYY, hh:mm A') : '-',
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (v) => {
        if (!v) return <Tag color="orange">Still In</Tag>;
        return dayjs(v).format('DD MMM YYYY, hh:mm A');
      },
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, r) => {
        if (!r.checkOutTime) {
          const mins = dayjs().diff(dayjs(r.checkInTime), 'minute');
          return `${Math.floor(mins / 60)}h ${mins % 60}m (ongoing)`;
        }
        const mins = dayjs(r.checkOutTime).diff(dayjs(r.checkInTime), 'minute');
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
      },
    },
    ...(canManage
      ? [
          {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => (
              <Space>
                {!record.checkOutTime && (
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<LogoutOutlined />}
                    onClick={() => handleCheckOut(record.member?._id)}
                  >
                    Out
                  </Button>
                )}
                <Popconfirm title="Delete this record?" onConfirm={() => handleDelete(record._id)}>
                  <Button danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Attendance</h2>

      {/* Check-In Section */}
      {canManage && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <LoginOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            <h3 className="text-base font-semibold m-0">Check In Member</h3>
          </div>
          <div className="flex gap-3 items-end">
            <Select
              showSearch
              placeholder="Search member to check in"
              optionFilterProp="label"
              style={{ minWidth: 300 }}
              value={checkInMember}
              onChange={setCheckInMember}
              options={availableForCheckIn.map((m) => ({
                value: m._id,
                label: `${m.name} (${m.phone})`,
              }))}
              allowClear
            />
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={checkInLoading}
              onClick={handleCheckIn}
            >
              Check In
            </Button>
          </div>
        </div>
      )}

      {/* Section 1: Currently Checked In */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          <h3 className="text-base font-semibold m-0">Currently Checked In Today ({todayRecords.length})</h3>
        </div>
        {todayLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : todayRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999', background: '#fafafa', borderRadius: 8 }}>
            No members currently checked in today
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {todayRecords.map((record) => {
              const member = record.member;
              return (
                <div
                  key={record._id}
                  style={{
                    background: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderLeft: '3px solid #52c41a',
                  }}
                >
                  <Avatar
                    size={44}
                    src={member?.photo}
                    icon={<UserOutlined />}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>{member?.phone || ''}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#52c41a' }}>
                      <ClockCircleOutlined />
                      In: {dayjs(record.checkInTime).format('hh:mm A')}
                      {member?.shift && <Tag style={{ marginLeft: 4, fontSize: 11 }} color="blue">{member.shift}</Tag>}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex flex-col gap-1">
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<LogoutOutlined />}
                        onClick={() => handleCheckOut(member?._id)}
                      >
                        Out
                      </Button>
                      <Popconfirm title="Delete record?" onConfirm={() => handleDelete(record._id)}>
                        <Button danger size="small" icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Attendance History */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
          <h3 className="text-base font-semibold m-0">Attendance History</h3>
          <div className="flex gap-3">
            <Input
              placeholder="Search by name or phone"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
              allowClear
            />
            <DatePicker
              value={date}
              onChange={(d) => d && setDate(d)}
            />
          </div>
        </div>
        <Table
          columns={historyColumns}
          dataSource={filteredHistory}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 600 }}
        />
      </div>
    </div>
  );
}
