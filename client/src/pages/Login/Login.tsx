import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert } from "antd";
import { UserOutlined, LockOutlined, FireOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../store/authSlice";
import type { AppDispatch, RootState } from "../../store";

export default function Login() {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onFinish = async (values: { email: string; password: string }) => {
    const result = await dispatch(login(values));
    if (!("error" in result)) {
      navigate("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0e27",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "-20%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(23, 134, 231, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          right: "-20%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Login card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "0 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "48px 40px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 20,
                background:
                  "linear-gradient(135deg, rgb(7, 95, 172) 0%, #00f2fe 100%)",
                boxShadow: "0 8px 24px rgba(7,95,172,0.4)",
                marginBottom: 20,
              }}
            >
              <FireOutlined style={{ fontSize: 36, color: "#fff" }} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: -0.5,
              }}
            >
              Gym Manager
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Sign in to your account
            </p>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearError())}
              style={{
                marginBottom: 24,
                background: "rgba(255,77,79,0.1)",
                border: "1px solid rgba(255,77,79,0.2)",
                borderRadius: 10,
              }}
            />
          )}

          <Form form={form} onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={
                  <UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />
                }
                placeholder="Email address"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  height: 48,
                  color: "#fff",
                }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />
                }
                placeholder="Password"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  height: 48,
                  color: "#fff",
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginTop: 32 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 48,
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, rgb(7, 95, 172) 0%, #00f2fe 100%)",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(7,95,172,0.4)",
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "rgba(255,255,255,0.25)",
            fontSize: 12,
          }}
        >
          Gym Management System
        </div>
      </div>

      {/* Global styles for input text color */}
      <style>{`
        .ant-input, .ant-input-password .ant-input {
          color: #fff !important;
        }
        .ant-input::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
        .ant-input-affix-wrapper {
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
        }
        .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused {
          border-color: rgb(7, 95, 172) !important;
          box-shadow: 0 0 0 2px rgba(7,95,172,0.2) !important;
        }
        .ant-input-password .ant-input-suffix .anticon {
          color: rgba(255,255,255,0.35) !important;
        }
      `}</style>
    </div>
  );
}
