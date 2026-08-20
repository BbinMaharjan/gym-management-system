import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table, Button, Input, Space, Tag, Modal, Form, InputNumber, Select,
  DatePicker, message, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ToolOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { equipmentAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import type { Equipment } from '../../types';

const statusColors: Record<Equipment['status'], string> = {
  available: 'green',
  'in-use': 'blue',
  maintenance: 'orange',
  retired: 'red',
};

export default function EquipmentPage() {
  const queryClient = useQueryClient();
  const canCreate = usePermission('equipment:create');
  const canEdit = usePermission('equipment:edit');
  const canDelete = usePermission('equipment:delete');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [maintenanceEquipmentId, setMaintenanceEquipmentId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [maintenanceForm] = Form.useForm();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment', { search, status: statusFilter }],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await equipmentAPI.getAll(Object.keys(params).length ? params : undefined);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: Partial<Equipment>) => equipmentAPI.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      message.success('Equipment added successfully');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to add equipment');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Equipment> }) =>
      equipmentAPI.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      message.success('Equipment updated successfully');
      setIsModalOpen(false);
      setEditingEquipment(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update equipment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => equipmentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      message.success('Equipment deleted successfully');
    },
    onError: () => {
      message.error('Failed to delete equipment');
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) =>
      equipmentAPI.createMaintenanceLog(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      message.success('Maintenance log added');
      setIsMaintenanceModalOpen(false);
      setMaintenanceEquipmentId(null);
      maintenanceForm.resetFields();
    },
    onError: () => {
      message.error('Failed to add maintenance log');
    },
  });

  const handleAdd = () => {
    setEditingEquipment(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Equipment) => {
    setEditingEquipment(record);
    form.setFieldsValue({
      ...record,
      purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : null,
      nextServiceDue: record.nextServiceDue ? dayjs(record.nextServiceDue) : null,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        purchaseDate: values.purchaseDate?.toISOString(),
        nextServiceDue: values.nextServiceDue?.toISOString(),
      };
      if (editingEquipment) {
        updateMutation.mutate({ id: editingEquipment._id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    });
  };

  const handleMaintenance = (id: string) => {
    setMaintenanceEquipmentId(id);
    maintenanceForm.resetFields();
    setIsMaintenanceModalOpen(true);
  };

  const handleMaintenanceSubmit = () => {
    maintenanceForm.validateFields().then((values) => {
      if (maintenanceEquipmentId) {
        maintenanceMutation.mutate({ id: maintenanceEquipmentId, values });
      }
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Brand', dataIndex: 'brand', key: 'brand' },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (val: number) => `Rs. ${val.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: Equipment['status']) => (
        <Tag color={statusColors[val]}>{val.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Next Service Due',
      dataIndex: 'nextServiceDue',
      key: 'nextServiceDue',
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Equipment) => (
        <Space>
          <Button
            type="link"
            icon={<ToolOutlined />}
            onClick={() => handleMaintenance(record._id)}
          />
          {canEdit && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Delete this equipment?"
              onConfirm={() => deleteMutation.mutate(record._id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Equipment</h2>
        <Space>
          <Input.Search
            placeholder="Search equipment..."
            allowClear
            onSearch={setSearch}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 180 }}
            onChange={(val) => setStatusFilter(val)}
            options={Object.keys(statusColors).map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
          />
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Equipment
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={equipment}
        rowKey="_id"
        loading={isLoading}
      />

      <Modal
        title={editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
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
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="brand"
            label="Brand"
            rules={[{ required: true, message: 'Please enter brand' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cost"
            label="Cost"
            rules={[{ required: true, message: 'Please enter cost' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select
              options={Object.keys(statusColors).map((s) => ({
                value: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              }))}
            />
          </Form.Item>
          <Form.Item name="purchaseDate" label="Purchase Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="nextServiceDue" label="Next Service Due">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Maintenance Log"
        open={isMaintenanceModalOpen}
        onOk={handleMaintenanceSubmit}
        onCancel={() => {
          setIsMaintenanceModalOpen(false);
          setMaintenanceEquipmentId(null);
          maintenanceForm.resetFields();
        }}
        confirmLoading={maintenanceMutation.isPending}
        centered
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Form form={maintenanceForm} layout="vertical">
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="cost"
            label="Cost"
            rules={[{ required: true, message: 'Please enter cost' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="performedBy"
            label="Performed By"
            rules={[{ required: true, message: 'Please enter performer name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
