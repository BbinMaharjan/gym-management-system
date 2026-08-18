import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, Checkbox, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { usersAPI } from '../../api/api';

const ALL_PERMISSIONS = [
  'members:view', 'members:create', 'members:edit', 'members:delete', 'members:manage',
  'equipment:view', 'equipment:create', 'equipment:edit', 'equipment:delete',
  'payments:view', 'payments:manage',
  'attendance:view', 'attendance:manage',
  'users:manage',
  'reports:view',
];

const roleColors = { superadmin: 'gold', admin: 'blue', staff: 'default' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getAll(search);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleSave = async (values) => {
    try {
      if (editing) {
        await usersAPI.update(editing._id, values);
        message.success('User updated');
      } else {
        await usersAPI.create(values);
        message.success('User created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    await usersAPI.delete(id);
    message.success('User deleted');
    fetchUsers();
  };

  const handleToggleActive = async (user) => {
    await usersAPI.update(user._id, { isActive: !user.isActive });
    message.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    fetchUsers();
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (r) => <Tag color={roleColors[r]}>{r}</Tag>,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p?.length > 0 ? p.map((perm) => <Tag key={perm}>{perm}</Tag>) : <span className="text-gray-400">All (SuperAdmin)</span>}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.role !== 'superadmin' && (
            <>
              <Button
                size="small"
                onClick={() => {
                  setEditing(record);
                  form.setFieldsValue({
                    name: record.name,
                    email: record.email,
                    role: record.role,
                    permissions: record.permissions,
                  });
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button size="small" onClick={() => handleToggleActive(record)}>
                {record.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Popconfirm title="Delete user?" onConfirm={() => handleDelete(record._id)}>
                <Button size="small" danger>Delete</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const role = Form.useWatch('role', form);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Add User
        </Button>
      </div>
      <Input
        placeholder="Search by name or email"
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-md"
        allowClear
      />
      <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editing ? 'Edit User' : 'Add User'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input disabled={editing?.role === 'superadmin'} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input disabled={editing?.role === 'superadmin'} />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Password" rules={[{ required: true }, { min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              disabled={editing?.role === 'superadmin'}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
          </Form.Item>
          {role !== 'superadmin' && (
            <Form.Item name="permissions" label="Permissions">
              <Checkbox.Group options={ALL_PERMISSIONS} className="flex flex-wrap gap-2" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
