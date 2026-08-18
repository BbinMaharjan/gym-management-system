import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { plansAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const canManage = usePermission('members:manage');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await plansAPI.getAll();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async (values) => {
    try {
      if (editing) {
        await plansAPI.update(editing._id, values);
        message.success('Plan updated');
      } else {
        await plansAPI.create(values);
        message.success('Plan created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchPlans();
    } catch (err) {
      message.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    await plansAPI.delete(id);
    message.success('Plan deleted');
    fetchPlans();
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Duration (Days)', dataIndex: 'durationInDays', key: 'durationInDays' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (v) => `$${v}` },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => <Switch checked={v} disabled size="small" />,
    },
    ...(canManage
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <div className="space-x-2">
                <Button
                  size="small"
                  onClick={() => {
                    setEditing(record);
                    form.setFieldsValue(record);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Popconfirm title="Delete plan?" onConfirm={() => handleDelete(record._id)}>
                  <Button size="small" danger>Delete</Button>
                </Popconfirm>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Membership Plans</h2>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
            Add Plan
          </Button>
        )}
      </div>
      <Table columns={columns} dataSource={plans} rowKey="_id" loading={loading} pagination={false} />
      <Modal
        title={editing ? 'Edit Plan' : 'Add Plan'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Plan Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="durationInDays" label="Duration (Days)" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
