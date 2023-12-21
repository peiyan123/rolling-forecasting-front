import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Table, Row, Col, Divider, message, DatePicker } from 'antd';
import type { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';
import { getContractCost, getContract, getContractList, updatePredictionTime } from '../../../../servers/api/ledger'

const EditableContext = React.createContext<FormInstance<any> | null>(null);

const EditableRow = ({ index, ...props }: any) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

// 表单组件
const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }: any) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) { inputRef.current?.focus(); }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  // 保存
  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values }, values);
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  const disabledDate = (_current: any) => {
    let current = _current.format('YYYY-MM-DD')
    return current && current < dayjs().endOf('day').format('YYYY-MM-DD')
  };

  let childNode = children;
  if (editable && record?.remainingAmount !== 0) {
    childNode =
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title}不得为空`,
          },
        ]}
      >
        <DatePicker defaultValue={record[dataIndex]} format="YYYY-MM-DD" disabledDate={disabledDate} onChange={save} allowClear={false} />
      </Form.Item >
  }
  return <td {...restProps}>{childNode}</td>;
};
// 表格
const CostIncome: React.FC<any> = (props) => {
  const { id, dateOptions, departmentList, type } = props
  const [loading, setLoading] = useState<boolean>(true);
  const [columnsTop, setColumnsTop] = useState<any>([]);
  const [topData, setTopData] = useState<any>([]);
  const [bottomData, setBottomData] = useState<any>([]);
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columnsBottom: any = [
    {
      title: "序号",
      dataIndex: "index",
      width: 40,
      fixed: 'left',
      align: 'center'
    },
    {
      title: "合同名称",
      dataIndex: "contractName",
      width: 200,
      align: 'center'
    },
    {
      title: "里程碑描述",
      dataIndex: "stage",
      width: 150,
      align: 'center'
    },
    {
      title: "里程碑金额(本币不含税)",
      dataIndex: "amount",
      width: 150,
      align: 'center'
    },
    {
      title: "已确认金额(本币不含税)",
      dataIndex: "confirmAmount",
      width: 150,
      align: 'center'
    },
    {
      title: "里程碑结束日期",
      dataIndex: "endTime",
      width: 100,
      align: 'center'
    },
    {
      title: "实际确认日期",
      dataIndex: "endTime",
      width: 100,
      align: 'center'
    },
    {
      title: "剩余未确认金额(本币不含税)",
      dataIndex: "remainingAmount",
      width: 150,
      align: 'center'
    },
    {
      title: "剩余金额确认日期",
      dataIndex: "predictionTime",
      width: 150,
      align: 'center',
      editable: true,
    },
  ]
  const columns = columnsBottom.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: (row: any, values: any) => { handleSave(row, values) },
      }),
    };
  });
  useEffect(() => {
    getColumnsTop();
  }, [])
  useEffect(() => {
    initData();
  }, [columnsTop])

  function getColumnsTop() {
    const months: any = [
      {
        title: "",
        dataIndex: "label",
        width: 100,
        fixed: 'left',
        align: 'center'
      },
      {
        title: "历史月份合计",
        dataIndex: "history",
        width: 110,
        fixed: 'left',
        align: 'center'
      },
      {
        title: "失效预计金额合计",
        dataIndex: "expect",
        width: 130,
        fixed: 'left',
        align: 'center'
      }
    ]; // 创建空数组存放月份
    let currentYear = new Date().getFullYear(); // 获取当前月份（注意月份从0开始计算）
    for (let i = 1; i <= 12; i++) {
      months.push({
        title: currentYear + '年' + (Number(i) < 10 ? '0' + i : i) + '月',
        dataIndex: currentYear + '年' + (Number(i) < 10 ? '0' + i : i) + '月',
        width: 100,
        align: 'center'
      })
    }
    for (let i = 1; i <= 12; i++) {
      months.push({
        title: (currentYear + 1) + '年' + (Number(i) < 10 ? '0' + i : i) + '月',
        dataIndex: (currentYear + 1) + '年' + (Number(i) < 10 ? '0' + i : i) + '月',
        width: 100,
        align: 'center'
      })
    }
    setColumnsTop(months)
  }

  async function initData() {
    if (!columnsTop.length) return
    setLoading(true)
    // 合计表格
    let data: any = [{ label: "项目收入" }, { label: "项目成本" }]
    columnsTop.map((item: any, index: number) => {
      if (index > 0) {
        data[0][item.dataIndex] = ""
        data[1][item.dataIndex] = ""
      }
    })
    // 收入
    await getContract(id).then(res => {
      Object.keys(res.data).map(item => {
        data[0][item] = res.data[item]
      })
    })
    // 成本
    await getContractCost(id).then(res => {
      Object.keys(res.data).map(item => {
        data[1][item] = res.data[item]
      })
    })
    setTopData(data) // 生成数据
    await getContractList(id).then(res => {
      setBottomData(res.data.map((item: any, index: number) => {
        return {
          ...item,
          index: index + 1,
          predictionTime: item.predictionTime ? dayjs(item.predictionTime) : '-',
        }
      }))
    })
    setLoading(false)
  }

  async function handleSave(row: any, values: any) {
    let newData = [...bottomData];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setLoading(true)
    await updatePredictionTime({
      contractId: item.id,
      date: row.predictionTime.format('YYYY-MM-DD')
    }).then(() => {
      message.success("修改成功!")
      setBottomData(newData);
    }).catch(() => {
      setBottomData([...bottomData]);
    })
    initData()
  };

  return (
    <div>
      <Row style={{height: 45}}>
        <Col span={12}>
          <h3 style={{margin : '5px 0 0'}}>成本/收入滚动预测-进度确认-{props.form.getFieldValue('projectName')}</h3>
        </Col>
      </Row>
      <Divider style={{margin: '10px 0'}}/>
      <Table
        columns={columnsTop}
        dataSource={topData}
        loading={loading}
        pagination={false}
        scroll={{ x: 1300 }}
        rowClassName={() => 'editable-row'}
        bordered
      />
      <Divider style={{margin: '10px 0'}}/>
      <Table
        components={components}
        columns={columns}
        dataSource={bottomData}
        loading={loading}
        pagination={false}
        scroll={{ x: 1300, y: '30vh' }}
        rowClassName={() => 'editable-row'}
      // bordered
      />
    </div>
  );
};

export default CostIncome;