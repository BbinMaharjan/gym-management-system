import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  Upload,
  message,
  Row,
  Col,
  Avatar,
  Descriptions,
  Popconfirm,
  Tabs,
  Tooltip,
  Badge,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  EyeOutlined,
  UserOutlined,
  ReloadOutlined,
  TeamOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { membersAPI, plansAPI } from "../../api/api";
import { usePermission } from "../../hooks/useAuth";
import { Member, MembershipPlan } from "../../types";

const { Option } = Select;
const { TabPane } = Tabs;

const Members: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [form] = Form.useForm();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const queryClient = useQueryClient();
  const canEdit = usePermission("members:edit");
  const canDelete = usePermission("members:delete");
  const canCreate = usePermission("members:create");

  const watchPlan = Form.useWatch("membershipPlan", form);
  const watchStartDate = Form.useWatch("planStartDate", form);

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["members", { search }],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (search) {
        params.search = search;
      }
      const response = await membersAPI.getAll(params);
      return response.data;
    },
  });

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await plansAPI.getAll();
      return response.data;
    },
  });

  const { data: nextNumberData, refetch: refetchNextNumber } = useQuery({
    queryKey: ["nextMemberNumber"],
    queryFn: async () => {
      const response = await membersAPI.getNextNumber();
      return response.data;
    },
  });

  useEffect(() => {
    if (isModalVisible && !editingMember) {
      refetchNextNumber();
    }
  }, [isModalVisible, editingMember, refetchNextNumber]);

  useEffect(() => {
    if (isModalVisible && nextNumberData && !editingMember) {
      form.setFieldsValue({
        membershipNumber: nextNumberData.membershipNumber,
      });
    }
  }, [nextNumberData, isModalVisible, editingMember, form]);

  useEffect(() => {
    if (watchPlan && watchStartDate && plansData) {
      const plan = plansData.find((p: MembershipPlan) => p._id === watchPlan);
      if (plan) {
        const expiry = dayjs(watchStartDate).add(plan.durationInDays, "day");
        form.setFieldsValue({ planExpiryDate: expiry });
      }
    }
  }, [watchPlan, watchStartDate, plansData, form]);

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await membersAPI.create(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      message.success("Member created successfully");
      setIsModalVisible(false);
      form.resetFields();
      setPhotoFile(null);
      setPhotoPreview("");
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to create member");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await membersAPI.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      message.success("Member updated successfully");
      setIsModalVisible(false);
      setEditingMember(null);
      form.resetFields();
      setPhotoFile(null);
      setPhotoPreview("");
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to update member");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await membersAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      message.success("Member deleted successfully");
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to delete member");
    },
  });

  const assignPlanMutation = useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      await membersAPI.assignPlan(id, { planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      message.success("Plan assigned successfully");
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to assign plan");
    },
  });

  const handleCreate = () => {
    setEditingMember(null);
    form.resetFields();
    setPhotoFile(null);
    setPhotoPreview("");
    setIsModalVisible(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    form.setFieldsValue({
      membershipNumber: member.membershipNumber,
      name: member.name,
      phone: member.phone,
      email: member.email,
      address: member.address,
      dob: member.dob ? dayjs(member.dob) : null,
      gender: member.gender,
      bloodGroup: member.bloodGroup,
      shift: member.shift,
      membershipPlan:
        member.membershipPlan && typeof member.membershipPlan === "object"
          ? member.membershipPlan._id
          : member.membershipPlan,
      planStartDate: member.planStartDate ? dayjs(member.planStartDate) : null,
      planExpiryDate: member.planExpiryDate
        ? dayjs(member.planExpiryDate)
        : null,
      status: member.status,
      emergencyContactName: member.emergencyContact?.name,
      emergencyContactPhone: member.emergencyContact?.phone,
    });
    if (member.photo) {
      setPhotoPreview(member.photo);
    }
    setIsModalVisible(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setIsViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      formData.append("membershipNumber", values.membershipNumber);
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("email", values.email || "");
      formData.append("address", values.address || "");
      formData.append("dob", values.dob ? values.dob.format("YYYY-MM-DD") : "");
      formData.append("gender", values.gender || "");
      formData.append("bloodGroup", values.bloodGroup || "");
      formData.append("shift", values.shift || "");
      formData.append("membershipPlan", values.membershipPlan || "");
      formData.append(
        "planStartDate",
        values.planStartDate ? values.planStartDate.format("YYYY-MM-DD") : "",
      );
      formData.append(
        "planExpiryDate",
        values.planExpiryDate ? values.planExpiryDate.format("YYYY-MM-DD") : "",
      );
      formData.append("status", values.status || "active");
      formData.append(
        "emergencyContactName",
        values.emergencyContactName || "",
      );
      formData.append(
        "emergencyContactPhone",
        values.emergencyContactPhone || "",
      );

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (editingMember) {
        await updateMutation.mutateAsync({
          id: editingMember._id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handlePhotoChange = (info: any) => {
    const file = info.file?.originFileObj || info.file;
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload Photo</div>
    </div>
  );

  const columns = [
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (photo: string, record: Member) => (
        <Avatar
          src={photo}
          icon={<UserOutlined />}
          size={50}
          style={{ backgroundColor: "#1890ff" }}
        />
      ),
    },
    {
      title: "Membership #",
      dataIndex: "membershipNumber",
      key: "membershipNumber",
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Plan",
      dataIndex: "membershipPlan",
      key: "membershipPlan",
      render: (plan: MembershipPlan | string | null) => {
        if (!plan) return <Tag>No Plan</Tag>;
        if (typeof plan === "object") {
          return <Tag color="blue">{plan.name}</Tag>;
        }
        return <Tag color="blue">{plan}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: "green",
          expired: "red",
          frozen: "orange",
        };
        return (
          <Tag color={colorMap[status] || "default"}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Expiry Date",
      dataIndex: "planExpiryDate",
      key: "planExpiryDate",
      render: (date: string) => {
        if (!date) return "-";
        const expiry = dayjs(date);
        const isExpired = expiry.isBefore(dayjs(), "day");
        return (
          <span style={{ color: isExpired ? "#ff4d4f" : "#52c41a" }}>
            {expiry.format("DD MMM YYYY")}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Member) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {canEdit && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Popconfirm
              title="Are you sure you want to delete this member?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const renderMemberCard = (member: Member) => {
    const planName =
      member.membershipPlan && typeof member.membershipPlan === "object"
        ? member.membershipPlan.name
        : member.membershipPlan || "No Plan";

    const isExpired =
      member.planExpiryDate &&
      dayjs(member.planExpiryDate).isBefore(dayjs(), "day");

    return (
      <Card
        key={member._id}
        hoverable
        style={{
          borderRadius: 12,
          overflow: "hidden",
          height: "100%",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            background:
              member.status === "active"
                ? "linear-gradient(135deg, rgb(7, 95, 172) 0%, #00f2fe 100%)"
                : member.status === "expired"
                  ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <Avatar
            src={member.photo}
            icon={<UserOutlined />}
            size={80}
            style={{
              border: "4px solid rgba(255,255,255,0.3)",
              marginBottom: 10,
            }}
          />
          <h3 style={{ color: "#fff", margin: 0, fontSize: 18 }}>
            {member.name}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "5px 0 0" }}>
            {member.membershipNumber}
          </p>
        </div>
        <div style={{ padding: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PhoneOutlined style={{ color: "#1890ff" }} />
              <span>{member.phone}</span>
            </div>
            {member.email && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MailOutlined style={{ color: "#1890ff" }} />
                <span>{member.email}</span>
              </div>
            )}
            {member.address && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HomeOutlined style={{ color: "#1890ff" }} />
                <span>{member.address}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarOutlined style={{ color: "#1890ff" }} />
              <span>
                Expiry:{" "}
                {member.planExpiryDate
                  ? dayjs(member.planExpiryDate).format("DD MMM YYYY")
                  : "-"}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <Tag
                color={
                  member.status === "active"
                    ? "green"
                    : member.status === "expired"
                      ? "red"
                      : "orange"
                }
              >
                {planName}
              </Tag>
              <Tag
                color={
                  member.status === "active"
                    ? "green"
                    : member.status === "expired"
                      ? "red"
                      : "orange"
                }
              >
                {member.status.toUpperCase()}
              </Tag>
            </div>
          </Space>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(member)}
              shape="circle"
            />

            {canEdit && (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(member)}
                shape="circle"
              />
            )}
            {canDelete && (
              <Popconfirm
                title="Are you sure you want to delete this member?"
                onConfirm={() => handleDelete(member._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  shape="circle"
                />
              </Popconfirm>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Members Management</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Search members..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["members"] });
                setSearch("");
              }}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Add Member
              </Button>
            )}
            <Button
              onClick={() =>
                setViewMode(viewMode === "card" ? "table" : "card")
              }
            >
              {viewMode === "card" ? "Table View" : "Card View"}
            </Button>
          </Space>
        }
      >
        {viewMode === "table" ? (
          <Table
            columns={columns}
            dataSource={membersData || []}
            rowKey="_id"
            loading={membersLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} members`,
            }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {membersLoading ? (
              <Col span={24}>
                <div style={{ textAlign: "center", padding: 50 }}>
                  Loading members...
                </div>
              </Col>
            ) : membersData && membersData.length > 0 ? (
              membersData.map((member: Member) => (
                <Col xs={24} sm={12} md={8} lg={6} key={member._id}>
                  {renderMemberCard(member)}
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="No members found" />
              </Col>
            )}
          </Row>
        )}
      </Card>

      <Modal
        title={editingMember ? "Edit Member" : "Add New Member"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingMember(null);
          form.resetFields();
          setPhotoFile(null);
          setPhotoPreview("");
        }}
        width={800}
        centered
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="membershipNumber"
                label="Membership Number"
                rules={[
                  { required: true, message: "Please enter membership number" },
                ]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Enter address" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dob" label="Date of Birth">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="Gender">
                <Select placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bloodGroup" label="Blood Group">
                <Select placeholder="Select blood group">
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="shift" label="Shift">
                <Select placeholder="Select shift">
                  <Option value="morning">Morning</Option>
                  <Option value="afternoon">Afternoon</Option>
                  <Option value="evening">Evening</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status" initialValue="active">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="expired">Expired</Option>
                  <Option value="frozen">Frozen</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="membershipPlan" label="Membership Plan">
                <Select placeholder="Select plan" loading={plansLoading}>
                  {plansData?.map((plan: MembershipPlan) => (
                    <Option key={plan._id} value={plan._id}>
                      {plan.name} - {plan.durationInDays} days - ${plan.price}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="planStartDate" label="Plan Start Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="planExpiryDate" label="Plan Expiry Date">
                <DatePicker style={{ width: "100%" }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="emergencyContactName"
                label="Emergency Contact Name"
              >
                <Input placeholder="Enter emergency contact name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emergencyContactPhone"
                label="Emergency Contact Phone"
              >
                <Input placeholder="Enter emergency contact phone" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Photo">
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  onChange={handlePhotoChange}
                  maxCount={1}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="preview"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Member Details"
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setSelectedMember(null);
        }}
        footer={null}
        width={1000}
        centered
        styles={{
          body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto" },
        }}
      >
        {selectedMember && (
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: 24,
                padding: 20,
                background: "linear-gradient(135deg, rgb(7, 95, 172) 0%, #00f2fe 100%)",
                borderRadius: 12,
              }}
            >
              <Avatar
                src={selectedMember.photo}
                icon={<UserOutlined />}
                size={100}
                style={{
                  border: "4px solid rgba(255,255,255,0.3)",
                  marginBottom: 16,
                }}
              />
              <h2 style={{ color: "#fff", margin: 0 }}>
                {selectedMember.name}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", margin: "5px 0 0" }}>
                {selectedMember.membershipNumber}
              </p>
              <Tag
                color={
                  selectedMember.status === "active"
                    ? "green"
                    : selectedMember.status === "expired"
                      ? "red"
                      : "orange"
                }
                style={{ marginTop: 10 }}
              >
                {selectedMember.status.toUpperCase()}
              </Tag>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {selectedMember.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {selectedMember.email || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                <HomeOutlined /> {selectedMember.address || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                <CalendarOutlined />{" "}
                {selectedMember.dob
                  ? dayjs(selectedMember.dob).format("DD MMM YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {selectedMember.gender === "male" ? (
                  <>
                    <ManOutlined /> Male
                  </>
                ) : selectedMember.gender === "female" ? (
                  <>
                    <WomanOutlined /> Female
                  </>
                ) : (
                  selectedMember.gender || "-"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Blood Group">
                {selectedMember.bloodGroup || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Shift">
                {selectedMember.shift
                  ? selectedMember.shift.charAt(0).toUpperCase() +
                    selectedMember.shift.slice(1)
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Membership Plan">
                {selectedMember.membershipPlan &&
                typeof selectedMember.membershipPlan === "object"
                  ? selectedMember.membershipPlan.name
                  : selectedMember.membershipPlan || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Plan Price">
                {selectedMember.membershipPlan &&
                typeof selectedMember.membershipPlan === "object"
                  ? `$${selectedMember.membershipPlan.price}`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Plan Start Date">
                {selectedMember.planStartDate
                  ? dayjs(selectedMember.planStartDate).format("DD MMM YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Plan Expiry Date">
                <span
                  style={{
                    color:
                      selectedMember.planExpiryDate &&
                      dayjs(selectedMember.planExpiryDate).isBefore(
                        dayjs(),
                        "day",
                      )
                        ? "#ff4d4f"
                        : "#52c41a",
                  }}
                >
                  {selectedMember.planExpiryDate
                    ? dayjs(selectedMember.planExpiryDate).format("DD MMM YYYY")
                    : "-"}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Emergency Contact Name">
                {selectedMember.emergencyContact?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Emergency Contact Phone">
                {selectedMember.emergencyContact?.phone || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>
                {dayjs(selectedMember.createdAt).format("DD MMM YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Members;
