import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { plansAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import type { MembershipPlan } from '../../types';

export default function Plans() {
  const queryClient = useQueryClient();
  const canManage = usePermission('members:manage');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [form] = Form.useForm();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await plansAPI.getAll();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: Partial<MembershipPlan>) => plansAPI.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      message.success('Plan created successfully');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<MembershipPlan> }) =>
      plansAPI.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      message.success('Plan updated successfully');
      setIsModalOpen(false);
      setEditingPlan(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update plan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => plansAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      message.success('Plan deleted successfully');
    },
    onError: () => {
      message.error('Failed to delete plan');
    },
  });

  const handleAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: MembershipPlan) => {
    setEditingPlan(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingPlan) {
        updateMutation.mutate({ id: editingPlan._id, values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Duration',
      dataIndex: 'durationInDays',
      key: 'durationInDays',
      render: (val: number) => `${val} days`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val: number) => `Rs. ${val.toLocaleString()}`,
    },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => <Tag color={val ? 'green' : 'red'}>{val ? 'Yes' : 'No'}</Tag>,
    },
    ...(canManage
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: MembershipPlan) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Popconfirm
                  title="Delete this plan?"
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Membership Plans</h2>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Plan
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={plans}
        rowKey="_id"
        loading={isLoading}
      />

      <Modal
        title={editingPlan ? 'Edit Plan' : 'Add Plan'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        centered
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter plan name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="durationInDays"
            label="Duration (Days)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
