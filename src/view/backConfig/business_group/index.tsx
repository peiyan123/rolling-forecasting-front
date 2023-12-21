import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Table, Space, Row, Col, Divider, message, Modal, Upload, TreeSelect, DatePicker, InputNumber, Pagination, Drawer } from 'antd';
import { getDeptFcPage } from '../../../servers/api/user'

const businessGroup = () => {
  const { Item } = Form
  const [form] = Form.useForm();
  const [current, setCurrent] = useState<number>(1)
  const [size, setSize] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [tableData, setTableData] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const columns = [
    {
      title: "序号",
      dataIndex: 'key',
      width: 100,
    },
    {
      title: "事业群",
      dataIndex: "deptName",
    },
    {
      title: "部门负责人",
      dataIndex: "userName",
    },
  ]

  useEffect(() => {
    initData()
  }, [])

  useEffect(() => {
    initData()
  }, [size, current])

  async function initData() {
    const values = await form.validateFields();
    setLoading(true)
    getDeptFcPage({
      ...values,
      current: current,
      size: size,
    }).then(res => {
      const records =
        res.data.records.map((item: any, index: number) => {
          return {
            ...item,
            key: index + 1
          }
        })
      setTableData(records)
      setTotal(res.data.total)
      setLoading(false)
    })
  }
  async function paginationChange(page: number, pageSize: number) {
    setCurrent(page)
    setSize(pageSize)
  }
  async function reset() {
    await form.resetFields()
    initData()
  }

  return <>
    <h3 style={{ padding: '0 10px' }}>事业群对应运营人员</h3>
    <Divider />
    <Form form={form} labelAlign="right" labelWrap={true} labelCol={{ span: 5 }} >
      <Row gutter={10}>
        <Col span={6}>
          <Item label="事业群名称" name="deptName">
            <Input onBlur={initData} placeholder='请输入'></Input>
          </Item>
        </Col>
        <Col span={6} offset={4}>
          <Item label="部门负责人" name="userName">
            <Input onBlur={initData} placeholder='请输入'></Input>
          </Item>
        </Col>
        <Col span={4} offset={4}>
          <Button style={{ marginRight: '10px' }} type='primary' onClick={initData}>查询</Button>
          <Button onClick={reset}>重置</Button>
        </Col>
      </Row>
    </Form>
    <Table dataSource={tableData}
      columns={columns}
      loading={loading}
      pagination={false}
      scroll={{ y: '55vh' }}
    />
    <Pagination
      style={{ textAlign: 'right', marginTop: 20 }}
      showSizeChanger
      pageSize={size}
      current={current}
      total={total}
      onChange={paginationChange}
    />
  </>
}

export default businessGroup