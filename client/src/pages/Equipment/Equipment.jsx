import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, InputNumber, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { equipmentAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const statusColors = {
  available: 'green',
  'in-use': 'blue',
  maintenance: 'orange',
  retired: 'red',
};

export default function EquipmentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form] = Form.useForm();
  const [maintForm] = Form.useForm();

  const canCreate = usePermission('equipment:create');
  const canEdit = usePermission('equipment:edit');
  const canDelete = usePermission('equipment:delete');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await equipmentAPI.getAll({ search, status: statusFilter });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, statusFilter]);

  const handleSave = async (values) => {
    try {
      const payload = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : undefined,
      };
      if (editing) {
        await equipmentAPI.update(editing._id, payload);
        message.success('Equipment updated');
      } else {
        await equipmentAPI.create(payload);
        message.success('Equipment created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchItems();
    } catch (err) {
      message.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    await equipmentAPI.delete(id);
    message.success('Equipment deleted');
    fetchItems();
  };

  const handleMaintenance = async (values) => {
    try {
      await equipmentAPI.createMaintenanceLog(selectedId, values);
      message.success('Maintenance log added');
      setMaintenanceModal(false);
      maintForm.resetFields();
      fetchItems();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Brand', dataIndex: 'brand', key: 'brand' },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (v) => (v ? `Rs${v.toLocaleString()}` : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={statusColors[s]}>{s}</Tag>,
    },
    {
      title: 'Next Service',
      dataIndex: 'nextServiceDue',
      key: 'nextServiceDue',
      render: (d) => (d ? dayjs(d).format('DD MMM YYYY') : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {canEdit && (
            <>
              <Button
                size="small"
                onClick={() => {
                  setEditing(record);
                  form.setFieldsValue({
                    ...record,
                    purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : null,
                    nextServiceDue: record.nextServiceDue ? dayjs(record.nextServiceDue) : null,
                  });
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                type="dashed"
                onClick={() => {
                  setSelectedId(record._id);
                  maintForm.resetFields();
                  setMaintenanceModal(true);
                }}
              >
                Add Log
              </Button>
            </>
          )}
          {canDelete && (
            <Popconfirm title="Delete equipment?" onConfirm={() => handleDelete(record._id)}>
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">Equipment</h2>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
            Add Equipment
          </Button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
          allowClear
        />
        <Select
          placeholder="Filter by status"
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter(v || '')}
          allowClear
          className="w-full sm:w-48"
          options={[
            { value: 'available', label: 'Available' },
            { value: 'in-use', label: 'In-Use' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'retired', label: 'Retired' },
          ]}
        />
      </div>
      <Table columns={columns} dataSource={items} rowKey="_id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 800 }} />

      <Modal
        title={editing ? 'Edit Equipment' : 'Add Equipment'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        width={Math.min(600, window.innerWidth - 32)}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="Brand">
            <Input />
          </Form.Item>
          <Form.Item name="cost" label="Cost">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="purchaseDate" label="Purchase Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              options={[
                { value: 'available', label: 'Available' },
                { value: 'in-use', label: 'In-Use' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'retired', label: 'Retired' },
              ]}
            />
          </Form.Item>
          <Form.Item name="nextServiceDue" label="Next Service Due">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Maintenance Log"
        open={maintenanceModal}
        onCancel={() => { setMaintenanceModal(false); maintForm.resetFields(); }}
        onOk={() => maintForm.submit()}
      >
        <Form form={maintForm} layout="vertical" onFinish={handleMaintenance}>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="cost" label="Cost">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="performedBy" label="Performed By">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
