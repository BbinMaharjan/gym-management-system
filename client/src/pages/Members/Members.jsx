import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { membersAPI, plansAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import dayjs from 'dayjs';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();

  const canCreate = usePermission('members:create');
  const canEdit = usePermission('members:edit');
  const canDelete = usePermission('members:delete');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await membersAPI.getAll({ search });
      setMembers(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    const { data } = await plansAPI.getAll();
    setPlans(data);
  };

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, [search]);

  const handleSave = async (values) => {
    try {
      if (editingMember) {
        await membersAPI.update(editingMember._id, values);
        message.success('Member updated');
      } else {
        await membersAPI.create(values);
        message.success('Member created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      message.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    await membersAPI.delete(id);
    message.success('Member deleted');
    fetchMembers();
  };

  const handleAssignPlan = async (memberId, planId) => {
    try {
      await membersAPI.assignPlan(memberId, { planId });
      message.success('Plan assigned');
      fetchMembers();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to assign plan');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, r) => r.membershipPlan?.name || '-',
    },
    {
      title: 'Expiry',
      key: 'expiry',
      render: (_, r) => r.planExpiryDate ? dayjs(r.planExpiryDate).format('DD MMM YYYY') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'active' ? 'green' : s === 'expired' ? 'red' : 'blue'}>{s}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {canEdit && (
            <Button
              size="small"
              onClick={() => {
                setEditingMember(record);
                form.setFieldsValue({
                  ...record,
                  dob: record.dob ? dayjs(record.dob) : null,
                });
                setModalOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Popconfirm title="Delete member?" onConfirm={() => handleDelete(record._id)}>
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Members</h2>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingMember(null); form.resetFields(); setModalOpen(true); }}>
            Add Member
          </Button>
        )}
      </div>
      <Input
        placeholder="Search by name, phone, or email"
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-md"
        allowClear
      />
      <Table columns={columns} dataSource={members} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editingMember ? 'Edit Member' : 'Add Member'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingMember(null); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="dob" label="Date of Birth">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="gender" label="Gender">
            <Select options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
          </Form.Item>
          <Form.Item name={['emergencyContact', 'name']} label="Emergency Contact Name">
            <Input />
          </Form.Item>
          <Form.Item name={['emergencyContact', 'phone']} label="Emergency Contact Phone">
            <Input />
          </Form.Item>
          {editingMember && (
            <>
              <Form.Item name="status" label="Status">
                <Select options={[{ value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'frozen', label: 'Frozen' }]} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
