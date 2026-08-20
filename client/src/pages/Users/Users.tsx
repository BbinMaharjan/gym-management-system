import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table, Button, Input, Space, Tag, Modal, Form, Select, Checkbox,
  message, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usersAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import type { User } from '../../types';

const ALL_PERMISSIONS = [
  'members:view', 'members:create', 'members:edit', 'members:delete', 'members:manage',
  'equipment:view', 'equipment:create', 'equipment:edit', 'equipment:delete',
  'payments:view', 'payments:manage',
  'attendance:view', 'attendance:manage',
  'users:manage', 'reports:view',
];

const roleColors: Record<User['role'], string> = {
  superadmin: 'gold',
  admin: 'blue',
  staff: 'default',
};

export default function Users() {
  const queryClient = useQueryClient();
  const canManage = usePermission('users:manage');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const watchedRole = Form.useWatch('role', form);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      const res = await usersAPI.getAll(search || undefined);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: Partial<User> & { password?: string }) => usersAPI.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User created successfully');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<User> }) =>
      usersAPI.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User updated successfully');
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User deleted successfully');
    },
    onError: () => {
      message.error('Failed to delete user');
    },
  });

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
      permissions: record.permissions,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        updateMutation.mutate({ id: editingUser._id, values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (val: User['role']) => (
        <Tag color={roleColors[val]}>{val.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (val: string[]) => (
        <Space wrap size={[0, 4]}>
          {val?.map((p) => <Tag key={p}>{p}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => <Tag color={val ? 'green' : 'red'}>{val ? 'Active' : 'Inactive'}</Tag>,
    },
    ...(canManage
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: User) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Popconfirm
                  title="Delete this user?"
                  onConfirm={() => deleteMutation.mutate(record._id)}
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Users</h2>
        <Space>
          <Input.Search
            placeholder="Search users..."
            allowClear
            onSearch={setSearch}
            style={{ width: 250 }}
          />
          {canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add User
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={isLoading}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
        centered
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select
              options={[
                { value: 'superadmin', label: 'Super Admin' },
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
          </Form.Item>
          {watchedRole && watchedRole !== 'superadmin' && (
            <Form.Item name="permissions" label="Permissions">
              <Checkbox.Group style={{ width: '100%' }}>
                <Space wrap>
                  {ALL_PERMISSIONS.map((p) => (
                    <Checkbox key={p} value={p}>{p}</Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
