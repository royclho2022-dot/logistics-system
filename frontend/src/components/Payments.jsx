import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Spin } from 'antd';
import api from '../services/api';

function Payments({ onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleRecharge = async (values) => {
    try {
      setLoading(true);
      const response = await api.post('/payments/recharge', {
        amount: parseFloat(values.amount),
      });
      
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      message.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Recharge Account Balance" style={{ maxWidth: '500px' }}>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRecharge}
          >
            <Form.Item
              label="Amount (USD)"
              name="amount"
              rules={[
                { required: true, message: 'Please enter amount' },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: 'Please enter a valid amount',
                },
              ]}
            >
              <Input
                type="number"
                placeholder="e.g., 50.00"
                step="0.01"
                min="0.01"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                Proceed to Payment
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default Payments;