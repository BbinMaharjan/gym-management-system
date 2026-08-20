import { useState, useMemo } from 'react';
import { Card, Table, Select, Button, DatePicker, Input, Tag, Avatar, Space, Popconfirm, message, Empty, Spin } from 'antd';
import { UserOutlined, SearchOutlined, DeleteOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { dashboardAPI, membersAPI } from '../../api/api';
import type { AttendanceRecord, Member } from '../../types';
import { usePermission } from '../../hooks/useAuth';

export default function Attendance() {
  const queryClient = useQueryClient();
  const canManage = usePermission('attendance:manage');
  const [searchText, setSearchText] = useState('');
  const [historyDate, setHistoryDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const res = await dashboardAPI.getTodayCheckedIn();
      return res.data;
    },
  });

  const historyParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (historyDate) {
      params.date = historyDate.format('YYYY-MM-DD');
    }
    if (searchText) {
      params.search = searchText;
    }
    return params;
  }, [historyDate, searchText]);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['attendance', 'history', historyDate?.format('YYYY-MM-DD') ?? '', searchText],
    queryFn: async () => {
      const res = await dashboardAPI.getAttendance(Object.keys(historyParams).length > 0 ? historyParams : undefined);
      return res.data;
    },
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members-list'],
    queryFn: async () => {
      const res = await membersAPI.getAll();
      return res.data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await membersAPI.checkIn(memberId);
    },
    onSuccess: () => {
      message.success('Member checked in successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setSelectedMemberId(null);
    },
    onError: () => {
      message.error('Failed to check in member');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await membersAPI.checkOut(memberId);
    },
    onSuccess: () => {
      message.success('Member checked out successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => {
      message.error('Failed to check out member');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await dashboardAPI.deleteAttendance(id);
    },
    onSuccess: () => {
      message.success('Attendance record deleted');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => {
      message.error('Failed to delete attendance record');
    },
  });

  const todayRecords = todayData ?? [];
  const historyRecords = historyData ?? [];
  const allMembers = membersData ?? [];

  const checkedInMemberIds = useMemo(
    () => new Set(todayRecords.map((r) => r.member?._id).filter(Boolean)),
    [todayRecords]
  );

  const availableForCheckIn = useMemo(
    () => allMembers.filter((m) => !checkedInMemberIds.has(m._id)),
    [allMembers, checkedInMemberIds]
  );

  const formatDuration = (checkIn: string, checkOut: string | null) => {
    const start = dayjs(checkIn);
    const end = checkOut ? dayjs(checkOut) : dayjs();
    const diffMinutes = end.diff(start, 'minute');
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const todayColumns = [
    {
      title: 'Member',
      key: 'member',
      render: (_: unknown, record: AttendanceRecord) => (
        <Space>
          <Avatar src={record.member?.photo} icon={!record.member?.photo ? <UserOutlined /> : undefined} />
          <div>
            <div className="font-medium">{record.member?.name ?? 'Unknown'}</div>
            <div className="text-gray-500 text-sm">{record.member?.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Check In',
      key: 'checkInTime',
      render: (_: unknown, record: AttendanceRecord) => dayjs(record.checkInTime).format('hh:mm A'),
    },
    {
      title: 'Shift',
      key: 'shift',
      render: (_: unknown, record: AttendanceRecord) => (
        <Tag color={record.member?.shift === 'morning' ? 'orange' : record.member?.shift === 'evening' ? 'blue' : 'green'}>
          {record.member?.shift ?? 'N/A'}
        </Tag>
      ),
    },
    ...(canManage
      ? [
          {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: AttendanceRecord) => (
              <Space>
                <Popconfirm
                  title="Check out this member?"
                  onConfirm={() => record.member && checkOutMutation.mutate(record.member._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" size="small" icon={<LogoutOutlined />} loading={checkOutMutation.isPending}>
                    Out
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Delete this record?"
                  onConfirm={() => deleteMutation.mutate(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger size="small" icon={<DeleteOutlined />} loading={deleteMutation.isPending}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const historyColumns = [
    {
      title: 'Member',
      key: 'member',
      render: (_: unknown, record: AttendanceRecord) => (
        <Space>
          <Avatar src={record.member?.photo} icon={!record.member?.photo ? <UserOutlined /> : undefined} />
          <span>{record.member?.name ?? 'Unknown'}</span>
        </Space>
      ),
    },
    {
      title: 'Check In',
      key: 'checkInTime',
      render: (_: unknown, record: AttendanceRecord) => dayjs(record.checkInTime).format('DD MMM YYYY hh:mm A'),
    },
    {
      title: 'Check Out',
      key: 'checkOutTime',
      render: (_: unknown, record: AttendanceRecord) =>
        record.checkOutTime ? (
          dayjs(record.checkOutTime).format('DD MMM YYYY hh:mm A')
        ) : (
          <Tag color="green">Still In</Tag>
        ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: unknown, record: AttendanceRecord) => formatDuration(record.checkInTime, record.checkOutTime),
    },
    ...(canManage
      ? [
          {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: AttendanceRecord) => (
              <Space>
                {!record.checkOutTime && record.member && (
                  <Popconfirm
                    title="Check out this member?"
                    onConfirm={() => checkOutMutation.mutate(record.member!._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" size="small" icon={<LogoutOutlined />} loading={checkOutMutation.isPending}>
                      Out
                    </Button>
                  </Popconfirm>
                )}
                <Popconfirm
                  title="Delete this record?"
                  onConfirm={() => deleteMutation.mutate(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger size="small" icon={<DeleteOutlined />} loading={deleteMutation.isPending}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 space-y-6">
      {canManage && (
        <Card title="Check-In" className="shadow-sm">
          <Space className="w-full" direction="vertical" size="middle">
            <div className="flex items-center gap-4">
              <Select
                showSearch
                placeholder="Select a member to check in"
                optionFilterProp="label"
                className="flex-1"
                loading={membersLoading}
                value={selectedMemberId}
                onChange={setSelectedMemberId}
                options={availableForCheckIn.map((m) => ({
                  value: m._id,
                  label: `${m.name} (${m.phone})`,
                }))}
              />
              <Button
                type="primary"
                icon={<LoginOutlined />}
                disabled={!selectedMemberId}
                loading={checkInMutation.isPending}
                onClick={() => selectedMemberId && checkInMutation.mutate(selectedMemberId)}
              >
                Check In
              </Button>
            </div>
          </Space>
        </Card>
      )}

      <Card title={`Currently Checked In (${todayRecords.length})`} className="shadow-sm">
        {todayLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : todayRecords.length === 0 ? (
          <Empty description="No members currently checked in" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayRecords.map((record) => (
              <Card key={record._id} size="small" className="shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <Space>
                    <Avatar src={record.member?.photo} icon={!record.member?.photo ? <UserOutlined /> : undefined} size={48} />
                    <div>
                      <div className="font-medium">{record.member?.name ?? 'Unknown'}</div>
                      <div className="text-gray-500 text-sm">{record.member?.phone}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        In: {dayjs(record.checkInTime).format('hh:mm A')}
                      </div>
                    </div>
                  </Space>
                  <Tag color={record.member?.shift === 'morning' ? 'orange' : record.member?.shift === 'evening' ? 'blue' : 'green'}>
                    {record.member?.shift ?? 'N/A'}
                  </Tag>
                </div>
                {canManage && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Popconfirm
                      title="Check out this member?"
                      onConfirm={() => record.member && checkOutMutation.mutate(record.member._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="primary" size="small" icon={<LogoutOutlined />} block loading={checkOutMutation.isPending}>
                        Out
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Delete this record?"
                      onConfirm={() => deleteMutation.mutate(record._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button danger size="small" icon={<DeleteOutlined />} block loading={deleteMutation.isPending}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card title="Attendance History" className="shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search by member name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 max-w-sm"
            allowClear
          />
          <DatePicker
            value={historyDate}
            onChange={(date) => setHistoryDate(date)}
            placeholder="Filter by date"
            allowClear
          />
        </div>
        <Table
          dataSource={historyRecords}
          columns={historyColumns}
          rowKey="_id"
          loading={historyLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: <Empty description="No attendance records found" /> }}
        />
      </Card>
    </div>
  );
}
