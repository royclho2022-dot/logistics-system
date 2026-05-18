import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Space, Statistic, Spin, message } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../services/api';

function Dashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, paymentsRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/payments/history'),
      ]);
      setOrders(ordersRes.orders || []);
      setPayments(paymentsRes.payments || []);
    } catch (error) {
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const createNewOrder = async () => {
    try {
      const response = await api.post('/orders/create', { amount: 0 });
      message.success('Order created: ' + response.order.order_id);
      fetchDashboardData();
    } catch (error) {
      message.error('Failed to create order');
    }
  };

  const orderColumns = [
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (text) => `$${text}` },
    { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleDateString() },
  ];

  const paymentColumns = [
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (text) => `$${text}` },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleDateString() },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Member ID"
              value={user.membership_id}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Account Balance"
              value={user.balance || 0}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Payments"
              value={payments.filter(p => p.status === 'completed').length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <Card title="Recent Orders">
            <Space style={{ marginBottom: '10px' }}>
              <Button type="primary" onClick={createNewOrder}>
                Create New Order
              </Button>
            </Space>
            <Table
              columns={orderColumns}
              dataSource={orders.slice(0, 5)}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Payment History">
            <Table
              columns={paymentColumns}
              dataSource={payments.slice(0, 5)}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;