import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, InputNumber, DatePicker, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { dashboardAPI, membersAPI, plansAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import dayjs from 'dayjs';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form] = Form.useForm();

  const canManage = usePermission('payments:manage');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange && dateRange[0]) params.from = dateRange[0].toISOString();
      if (dateRange && dateRange[1]) params.to = dateRange[1].toISOString();
      const { data } = await dashboardAPI.getPayments(params);
      setPayments(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    const { data } = await membersAPI.getAll();
    setMembers(data);
  };

  const fetchPlans = async () => {
    const { data } = await plansAPI.getAll();
    setPlans(data);
  };

  useEffect(() => {
    fetchPayments();
  }, [dateRange]);

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.member?.name?.toLowerCase().includes(q) ||
      p.member?.phone?.includes(q)
    );
  });

  const handleSave = async (values) => {
    try {
      const payload = {
        ...values,
        paidOn: values.paidOn ? values.paidOn.toISOString() : new Date().toISOString(),
      };

      if (editingPayment) {
        await dashboardAPI.updatePayment(editingPayment._id, payload);
        message.success('Payment updated');
      } else {
        await membersAPI.createPayment(values.member, payload);
        message.success('Payment recorded');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      message.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    await dashboardAPI.deletePayment(id);
    message.success('Payment deleted');
    fetchPayments();
  };

  const openEditModal = (record) => {
    setEditingPayment(record);
    form.setFieldsValue({
      member: record.member?._id,
      amount: record.amount,
      method: record.method,
      plan: record.plan?._id || null,
      paidOn: record.paidOn ? dayjs(record.paidOn) : dayjs(),
    });
    setModalOpen(true);
  };

  const methodColors = { cash: 'green', card: 'blue', upi: 'purple', bank_transfer: 'orange', other: 'default' };

  const columns = [
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
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v) => <span style={{ fontWeight: 600 }}>Rs{v?.toLocaleString()}</span>,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (v) => <Tag color={methodColors[v] || 'default'}>{v?.replace('_', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, r) => r.plan?.name || '-',
    },
    {
      title: 'Paid On',
      dataIndex: 'paidOn',
      key: 'paidOn',
      render: (v) => v ? dayjs(v).format('DD MMM YYYY') : '-',
    },
    ...(canManage
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openEditModal(record)}>Edit</Button>
                <Popconfirm title="Delete payment?" onConfirm={() => handleDelete(record._id)}>
                  <Button size="small" danger>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">Payments</h2>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPayment(null); form.resetFields(); form.setFieldValue('paidOn', dayjs()); setModalOpen(true); }}>
            Record Payment
          </Button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search by member name or phone"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-md"
          allowClear
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={setDateRange}
          className="sm:max-w-md"
        />
      </div>

      <Table columns={columns} dataSource={filteredPayments} rowKey="_id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 700 }} />

      <Modal
        title={editingPayment ? 'Edit Payment' : 'Record Payment'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingPayment(null); form.resetFields(); }}
        onOk={() => form.submit()}
        width={Math.min(500, window.innerWidth - 32)}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {!editingPayment && (
            <Form.Item name="member" label="Member" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Search member by name or phone"
                optionFilterProp="label"
                options={members.map((m) => ({ value: m._id, label: `${m.name} (${m.phone})` }))}
              />
            </Form.Item>
          )}
          <Form.Item name="amount" label="Amount (Rs)" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" prefix="Rs" />
          </Form.Item>
          <Form.Item name="method" label="Payment Method" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'upi', label: 'UPI' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Form.Item>
          <Form.Item name="plan" label="Plan (Optional)">
            <Select
              placeholder="Select plan"
              allowClear
              options={plans.map((p) => ({ value: p._id, label: `${p.name} - Rs${p.price}` }))}
            />
          </Form.Item>
          <Form.Item name="paidOn" label="Paid On">
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
