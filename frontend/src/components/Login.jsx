import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, message, Spin } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import api from '../services/api';
import '../styles/Auth.css';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!email) {
      message.error('Please enter your email');
      return;
    }

    setCodeLoading(true);
    try {
      await api.post('/auth/send-verification', { email });
      message.success('Verification code sent to your email');
      setStep(2);
      
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (error) {
      message.error(error.message || 'Failed to send verification code');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) {
      message.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-code', { email, code });
      localStorage.setItem('token', response.token);
      message.success('Login successful');
      onLoginSuccess(response.user);
    } catch (error) {
      message.error(error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card title="Login to Logistics System" className="login-card">
        {step === 1 ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form layout="vertical">
              <Form.Item label="Email">
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>
            </Form>
            <Button
              type="primary"
              block
              onClick={handleSendCode}
              loading={codeLoading}
            >
              Send Verification Code
            </Button>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form layout="vertical">
              <Form.Item label="Verification Code">
                <Input
                  prefix={<LockOutlined />}
                  placeholder="Enter the code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </Form.Item>
            </Form>
            <Button
              type="primary"
              block
              onClick={handleVerify}
              loading={loading}
            >
              Verify & Login
            </Button>
            <Button
              block
              onClick={() => {
                setStep(1);
                setCode('');
                setCountdown(0);
              }}
            >
              Back to Email
            </Button>
            {countdown > 0 && (
              <p style={{ textAlign: 'center', color: '#666' }}>
                Resend code in {countdown}s
              </p>
            )}
          </Space>
        )}
      </Card>
    </div>
  );
}

export default Login;