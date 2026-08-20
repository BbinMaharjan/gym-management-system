import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Popconfirm,
  message,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { dashboardAPI, membersAPI, plansAPI } from "../../api/api";
import type { Payment } from "../../types";
import { usePermission } from "../../hooks/useAuth";

const { RangePicker } = DatePicker;

const methodColors: Record<string, string> = {
  cash: "green",
  card: "blue",
  bank_transfer: "orange",
  other: "default",
};

export default function Payments() {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const canManage = usePermission("payments:manage");

  const from = dateRange?.[0]?.format("YYYY-MM-DD") ?? undefined;
  const to = dateRange?.[1]?.format("YYYY-MM-DD") ?? undefined;

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", { from, to }],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await dashboardAPI.getPayments(params);
      return res.data;
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members-list"],
    queryFn: async () => {
      const res = await membersAPI.getAll();
      return res.data;
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await plansAPI.getAll();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const memberId = data.memberId as string;
      const { memberId: _, ...rest } = data;
      const res = await membersAPI.createPayment(memberId, rest);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      message.success("Payment created successfully");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error("Failed to create payment");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Payment>;
    }) => {
      const res = await dashboardAPI.updatePayment(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      message.success("Payment updated successfully");
      setIsModalOpen(false);
      setEditingPayment(null);
      form.resetFields();
    },
    onError: () => {
      message.error("Failed to update payment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await dashboardAPI.deletePayment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      message.success("Payment deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete payment");
    },
  });

  const filteredPayments = useMemo(() => {
    if (!searchText) return payments;
    const term = searchText.toLowerCase();
    return payments.filter(
      (p) =>
        p.member?.name?.toLowerCase().includes(term) ||
        p.member?.phone?.includes(term) ||
        p.plan?.name?.toLowerCase().includes(term) ||
        p.notes?.toLowerCase().includes(term),
    );
  }, [payments, searchText]);

  const openAddModal = () => {
    setEditingPayment(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    form.setFieldsValue({
      memberId: payment.member?._id,
      amount: payment.amount,
      method: payment.method,
      planId: payment.plan?._id,
      paidOn: dayjs(payment.paidOn),
      notes: payment.notes,
    });
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const payload: Record<string, unknown> = {
        ...values,
        paidOn: values.paidOn?.toISOString(),
      };

      if (editingPayment) {
        updateMutation.mutate({
          id: editingPayment._id,
          data: payload as Partial<Payment>,
        });
      } else {
        createMutation.mutate(payload);
      }
    });
  };

  const columns = [
    {
      title: "Member",
      key: "member",
      render: (_: unknown, record: Payment) => record.member?.name ?? "N/A",
    },
    {
      title: "Amount",
      key: "amount",
      render: (_: unknown, record: Payment) => `Rs ${record.amount}`,
    },
    {
      title: "Method",
      key: "method",
      render: (_: unknown, record: Payment) => (
        <Tag color={methodColors[record.method] ?? "default"}>
          {record.method.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      render: (_: unknown, record: Payment) => record.plan?.name ?? "N/A",
    },
    {
      title: "Paid On",
      key: "paidOn",
      render: (_: unknown, record: Payment) =>
        dayjs(record.paidOn).format("DD MMM YYYY"),
    },
    ...(canManage
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: Payment) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(record)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this payment?"
                  onConfirm={() => deleteMutation.mutate(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Payments</h1>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            Add Payment
          </Button>
        )}
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search by member name, phone, plan..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-sm"
            allowClear
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              setDateRange(dates as [Dayjs | null, Dayjs | null] | null)
            }
          />
        </div>

        <Table
          dataSource={filteredPayments}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPayment ? "Edit Payment" : "Add Payment"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPayment(null);
          form.resetFields();
        }}
        centered
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical">
          {!editingPayment && (
            <Form.Item
              name="memberId"
              label="Member"
              rules={[{ required: true, message: "Please select a member" }]}
            >
              <Select
                placeholder="Select member"
                showSearch
                optionFilterProp="label"
                options={members.map((m) => ({ value: m._id, label: m.name }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber min={0} className="w-full" prefix="Rs" />
          </Form.Item>

          <Form.Item
            name="method"
            label="Payment Method"
            rules={[
              { required: true, message: "Please select payment method" },
            ]}
          >
            <Select
              placeholder="Select method"
              options={[
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "other", label: "Other" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="planId"
            label="Plan"
            rules={[{ required: true, message: "Please select a plan" }]}
          >
            <Select
              placeholder="Select plan"
              showSearch
              optionFilterProp="label"
              options={plans.map((p) => ({ value: p._id, label: p.name }))}
            />
          </Form.Item>

          <Form.Item
            name="paidOn"
            label="Paid On"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
