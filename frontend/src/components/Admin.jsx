import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Modal, Form, Select, message, Statistic, Spin } from 'antd';
import { UserOutlined, BarChartOutlined } from '@ant-design/icons';
import api from '../services/api';

function Admin() {
  const [users, setUsers] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, dashboardRes] = await Promise.all([
        api.get('/users/all'),
        api.get('/admin/dashboard'),
      ]);
      setUsers(usersRes.users || []);
      setDashboard(dashboardRes.dashboard || {});
    } catch (error) {
      message.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({ role: user.role });
    setModalVisible(true);
  };

  const handleUpdateRole = async (values) => {
    try {
      await api.put(`/users/role/${selectedUser.id}`, values);
      message.success('Role updated successfully');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to update role');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Member ID', dataIndex: 'membership_id', key: 'membership_id' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', render: (text) => `$${text}` },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => handleEditRole(record)}
        >
          Edit Role
        </Button>
      ),
    },
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
              title="Total Users"
              value={dashboard.totalUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={dashboard.totalOrders || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={dashboard.totalRevenue || 0}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={dashboard.totalMembers || 0}
            />
          </Card>
        </Col>
      </Row>

      <Card title="User Management" style={{ marginTop: '20px' }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="Edit User Role"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateRole}
        >
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Select.Option value="member">Member</Select.Option>
              <Select.Option value="agent">Agent</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Admin;