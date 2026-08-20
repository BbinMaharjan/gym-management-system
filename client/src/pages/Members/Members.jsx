import { useEffect, useState, useMemo } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, DatePicker, Upload, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, CameraOutlined, AppstoreOutlined, UnorderedListOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { membersAPI, plansAPI } from '../../api/api';
import { usePermission } from '../../hooks/useAuth';
import dayjs from 'dayjs';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [nextNumberLoading, setNextNumberLoading] = useState(false);
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

  const fetchNextNumber = async () => {
    setNextNumberLoading(true);
    try {
      const { data } = await membersAPI.getNextNumber();
      form.setFieldValue('membershipNumber', data.membershipNumber);
    } finally {
      setNextNumberLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, [search]);

  const handleSave = async (values) => {
    try {
      const formData = new FormData();
      const allowed = ['membershipNumber', 'name', 'phone', 'email', 'address', 'dob', 'gender', 'bloodGroup', 'shift', 'membershipPlan', 'planStartDate', 'planExpiryDate', 'status'];
      Object.entries(values).forEach(([key, val]) => {
        if (!allowed.includes(key)) return;
        if (val === undefined || val === null) return;
        if (key === 'dob' || key === 'planStartDate' || key === 'planExpiryDate') {
          formData.append(key, val ? val.toISOString() : '');
        } else if (typeof val === 'object' && !(val instanceof File)) {
          Object.entries(val).forEach(([k, v]) => {
            if (v !== undefined && v !== null) formData.append(`${key}[${k}]`, v);
          });
        } else {
          formData.append(key, val);
        }
      });
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      if (editingMember) {
        await membersAPI.update(editingMember._id, formData);
        message.success('Member updated');
      } else {
        await membersAPI.create(formData);
        message.success('Member created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingMember(null);
      setPhotoFile(null);
      setPhotoPreview(null);
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

  const selectedPlanId = Form.useWatch('membershipPlan', form);
  const selectedJoinDate = Form.useWatch('planStartDate', form);

  const selectedPlanDuration = useMemo(() => {
    if (!selectedPlanId) return null;
    const plan = plans.find((p) => p._id === selectedPlanId);
    return plan?.durationInDays || null;
  }, [selectedPlanId, plans]);

  const autoExpiryDate = useMemo(() => {
    if (!selectedJoinDate || !selectedPlanDuration) return null;
    return dayjs(selectedJoinDate).add(selectedPlanDuration, 'day');
  }, [selectedJoinDate, selectedPlanDuration]);

  const [expiryManuallyEdited, setExpiryManuallyEdited] = useState(false);

  useEffect(() => {
    if (autoExpiryDate && !expiryManuallyEdited) {
      form.setFieldValue('planExpiryDate', autoExpiryDate);
    }
  }, [autoExpiryDate, expiryManuallyEdited, form]);

  const openEditModal = (record) => {
    setEditingMember(record);
    setExpiryManuallyEdited(!!record.planExpiryDate);
    form.setFieldsValue({
      ...record,
      membershipPlan: record.membershipPlan?._id || record.membershipPlan || null,
      dob: record.dob ? dayjs(record.dob) : null,
      planStartDate: record.planStartDate ? dayjs(record.planStartDate) : null,
      planExpiryDate: record.planExpiryDate ? dayjs(record.planExpiryDate) : null,
    });
    setPhotoFile(null);
    setPhotoPreview(record.photo || null);
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'No.',
      dataIndex: 'membershipNumber',
      key: 'membershipNumber',
      render: (v) => v || '-',
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Blood',
      dataIndex: 'bloodGroup',
      key: 'bloodGroup',
      render: (v) => v || '-',
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      key: 'shift',
      render: (v) => v ? <Tag>{v.charAt(0).toUpperCase() + v.slice(1)}</Tag> : '-',
    },
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
            <Button size="small" onClick={() => openEditModal(record)}>Edit</Button>
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

  const renderCard = (member) => {
    const statusColor = member.status === 'active' ? '#52c41a' : member.status === 'expired' ? '#ff4d4f' : '#1677ff';
    return (
      <div
        key={member._id}
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'default',
        }}
        className="hover:shadow-lg hover:-translate-y-0.5"
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: 80,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '3px solid #fff',
              overflow: 'hidden',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {member.photo ? (
              <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserOutlined style={{ fontSize: 28, color: '#999' }} />
            )}
          </div>
          <Tag
            color={statusColor}
            style={{ position: 'absolute', top: 8, right: 8, textTransform: 'capitalize', fontWeight: 600 }}
          >
            {member.status}
          </Tag>
        </div>

        <div style={{ padding: '36px 16px 12px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>{member.name}</h3>

          {member.membershipNumber && (
            <div style={{ marginTop: 4, fontSize: 11, color: '#1677ff', fontWeight: 600, letterSpacing: 1 }}>{member.membershipNumber}</div>
          )}

          <div style={{ margin: '8px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#666', fontSize: 13 }}>
            <PhoneOutlined />
            <span>{member.phone || '-'}</span>
          </div>
          {member.email && (
            <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#666', fontSize: 13 }}>
              <MailOutlined />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{member.email}</span>
            </div>
          )}

          <div style={{ margin: '12px 0', padding: '8px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 12, color: '#888', marginBottom: 6 }}>
              {member.bloodGroup && <span><span style={{ color: '#999' }}>Blood:</span> <strong style={{ color: '#333' }}>{member.bloodGroup}</strong></span>}
              {member.shift && <span><span style={{ color: '#999' }}>Shift:</span> <strong style={{ color: '#333' }}>{member.shift.charAt(0).toUpperCase() + member.shift.slice(1)}</strong></span>}
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>Plan</div>
            <div style={{ fontWeight: 600, color: '#1677ff' }}>{member.membershipPlan?.name || 'No Plan'}</div>
            {member.membershipPlan?.price != null && (
              <div style={{ fontSize: 12, color: '#666' }}>Rs{member.membershipPlan.price}</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 12 }}>
            <div>
              <div>Joining</div>
              <div style={{ color: '#333', fontWeight: 500 }}>{member.planStartDate ? dayjs(member.planStartDate).format('DD MMM YYYY') : '-'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Expiry</div>
              <div style={{ color: member.planExpiryDate && dayjs(member.planExpiryDate).isBefore(dayjs()) ? '#ff4d4f' : '#333', fontWeight: 500 }}>
                {member.planExpiryDate ? dayjs(member.planExpiryDate).format('DD MMM YYYY') : '-'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, justifyContent: 'center' }}>
          {canEdit && (
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openEditModal(member)} style={{ flex: 1 }}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Popconfirm title="Delete member?" onConfirm={() => handleDelete(member._id)}>
              <Button danger size="small" icon={<DeleteOutlined />} style={{ flex: 1 }}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">Members</h2>
        <div className="flex items-center gap-2">
          <Space>
            <Button
              type={viewMode === 'table' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('table')}
              size="small"
            />
            <Button
              type={viewMode === 'card' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('card')}
              size="small"
            />
          </Space>
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingMember(null); form.resetFields(); setPhotoFile(null); setPhotoPreview(null); setExpiryManuallyEdited(false); setModalOpen(true); fetchNextNumber(); }}>
              Add Member
            </Button>
          )}
        </div>
      </div>
      <Input
        placeholder="Search by name, phone, or email"
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 sm:max-w-md"
        allowClear
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : viewMode === 'table' ? (
        <Table columns={columns} dataSource={members} rowKey="_id" pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 700 }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {members.map(renderCard)}
        </div>
      )}

      <Modal
        title={editingMember ? 'Edit Member' : 'Add Member'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingMember(null); form.resetFields(); setPhotoFile(null); setPhotoPreview(null); setExpiryManuallyEdited(false); }}
        onOk={() => form.submit()}
        width={Math.min(600, window.innerWidth - 32)}
        centered
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Upload
              listType="picture-circle"
              beforeUpload={(file) => {
                setPhotoFile(file);
                const reader = new FileReader();
                reader.onload = (e) => setPhotoPreview(e.target.result);
                reader.readAsDataURL(file);
                return false;
              }}
              showUploadList={false}
              accept="image/*"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Member"
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div>
                  <CameraOutlined style={{ fontSize: 24, color: '#999' }} />
                  <div style={{ marginTop: 4, fontSize: 12 }}>Upload Photo</div>
                </div>
              )}
            </Upload>
          </div>
          <Form.Item name="membershipNumber" label="Membership Number">
            <Input placeholder="Auto-generated" disabled={nextNumberLoading} />
          </Form.Item>
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
          <Form.Item name="bloodGroup" label="Blood Group">
            <Select
              placeholder="Select blood group"
              allowClear
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({ value: g, label: g }))}
            />
          </Form.Item>
          <Form.Item name="shift" label="Shift">
            <Select
              placeholder="Select shift"
              allowClear
              options={[{ value: 'morning', label: 'Morning' }, { value: 'evening', label: 'Evening' }]}
            />
          </Form.Item>
          <Form.Item name="membershipPlan" label="Membership Plan">
            <Select
              placeholder="Select a plan"
              allowClear
              options={plans.map((p) => ({ value: p._id, label: `${p.name} - Rs${p.price}` }))}
            />
          </Form.Item>
          <Form.Item name="planStartDate" label="Joining Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="planExpiryDate" label="Expiry Date">
            <DatePicker
              className="w-full"
              onChange={() => setExpiryManuallyEdited(true)}
            />
          </Form.Item>
          <Form.Item name={['emergencyContact', 'name']} label="Emergency Contact Name">
            <Input />
          </Form.Item>
          <Form.Item name={['emergencyContact', 'phone']} label="Emergency Contact Phone">
            <Input />
          </Form.Item>
          {editingMember && (
            <Form.Item name="status" label="Status">
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'frozen', label: 'Frozen' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
