import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, Select, Table, Space, Row, Col, Divider, message, Modal, Upload, TreeSelect, DatePicker, InputNumber, Pagination, Drawer } from 'antd';
import type { UploadProps } from 'antd';
import {
  getProjectName, getProjectPm, getFlowTypeList, getProjectStatusList,
  getProjectLedgerPage, projectLedgerDownload, manMonthExcelTemplate, importManMonthExcel, costIncomeExcelTemplate, importCostIncomeExcel, sendReminder, addSynergyEditor, getBusiness, addDistribute, getCurrentUserApi, addSeal
} from "../../../servers/api/ledger"
import { getDepartmentList, getUserList } from "../../../servers/api/user"
import { downloadFile } from '../../../common/downLoad'
import './styles.css';
const { RangePicker } = DatePicker;
let currentDayOption: any = []
let list: any = []
const Ledger = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [importForm] = Form.useForm();
  const [tbForm] = Form.useForm();
  const [fcForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [fpForm] = Form.useForm();
  const { Item } = Form
  const [projectNameOpitons, setProjectNameOpitons] = useState<any>([])
  const [pmOpitons, setProjectPmOptions] = useState<any>([])
  const [departmentOptions, setDepartmentOptions] = useState<any>([])
  const [projectStatusOptions, setProjectStatusOptions] = useState<any>([])
  const [flowTypeOpitons, setFlowTypeOpitons] = useState<any>([])
  const [userOptions, setUserOptions] = useState<any>([])
  const [tableData, setTableData] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // 弹窗
  const [filePath, setFilePath] = useState<any>(null);
  const [fileType, setFileType] = useState<any>(null);
  const [isTbModalOpen, setIsTbModalOpen] = useState(false); // 弹窗
  const [isFcModalOpen, setIsFcModalOpen] = useState(false); // 弹窗
  const [isFpModalOpen, setIsFpModalOpen] = useState(false); // 弹窗
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // 弹窗
  const [changeData, setChangeData] = useState<any>(null);
  const [current, setCurrent] = useState<number>(1)
  const [size, setSize] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [showSenior, setShowSenior] = useState<boolean>(false)
  const [menuType, setMenuType] = useState('')
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    list = JSON.parse(localStorage.getItem('roleList') || "{}")
    getMenuType()
    getCurrentUser()
    filterProjectNameOpitons()
    filterProjectPmOptions()
    filterDepartmentOptions()
    filterProjectStatusOptions()
    filterFlowTypeOpitons()
    getUserList("").then(res => {
      filterUserOptions(res)
    })
    getCurrentDay()
    initData()
  }, [])

  useEffect(() => {
    initData()
  }, [size, current])

  const columns: any = [
    {
      title: "项目名称",
      dataIndex: "projectName",
      width: 170
    },
    {
      title: "项目编号",
      dataIndex: "projectCode",
      width: 120
    },
    {
      title: "立项流程类型",
      dataIndex: "flowTypeName",
      width: 90
    },
    {
      title: "事业部名称",
      dataIndex: "divisionName",
      width: 150
    },
    {
      title: "客户简称",
      dataIndex: "customerAbbreviation",
      width: 130
    },
    {
      title: "市场区域",
      dataIndex: "marketArea",
      width: 100
    },
    // {
    //   title: "是否落地",
    //   dataIndex: "onLanding",
    //   width: 100,
    //   render: (_: any, record: any) => {
    //     return (
    //       <span>{record.onLanding === '0' ? '否' : '是'}</span>
    //     )
    //   }
    // },
    {
      title: "收入确定性",
      dataIndex: "incomeCertainty",
      width: 80
    },
    {
      title: "业务类型",
      dataIndex: "businessTypeName",
      width: 110
    },
    // {
    //   title: "业务类型(看板)",
    //   dataIndex: "businessTypeKanban",
    //   width: 150
    // },
    {
      title: "收入确认方式",
      dataIndex: "verifyWayName",
      width: 100
    },
    {
      title: "项目状态",
      dataIndex: "projectStatusName",
      width: 70
    },
    {
      title: "项目开始日期-结束日期",
      dataIndex: "projectTime",
      width: 200
    },
    {
      title: "预计项目总收入(RMB)",
      dataIndex: "projectGrossIncome",
      align: 'right',
      width: 170
    },
    {
      title: "项目立项/变更预计毛利率(%)",
      dataIndex: "grossProfitRate",
      align: 'right',
      width: 100
    },
    // {
    //   title: "履约进度项目状态",
    //   dataIndex: "progressPerformance",
    //   width: 150
    // },
    // {
    //   title: "项目剩余预计总收入(RMB)",
    //   dataIndex: "totalResidualIncome",
    //   width: 200
    // },
    {
      title: "项目经理",
      dataIndex: "pmName",
      width: 80
    },
    {
      title: "协同编辑人",
      dataIndex: "synergyEditor",
      width: 100,
      render: (_: any, record: any) => {
        return (
          <Space>
            {getSynergyEditor(record.synergyEditor) || '-'}
          </Space>
        )
      }
    },
    {
      title: "当年数据",
      dataIndex: "yearLabel",
      width: 100,
      align: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            <span>收入（人民币）</span>
            <Divider style={{ margin: 0 }} />
            <span>成本（人民币）</span>
            <Divider style={{ margin: 0 }} />
            <span>人月</span>
          </div>
        )
      }
    },
    {
      title: "以前年度",
      dataIndex: "1",
      width: 80,
      align: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            <span>{record['previousYear']?.income}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['previousYear']?.cost}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['previousYear']?.manMonth}</span>
          </div>
        )
      }
    },
    {
      title: "本年实际数",
      dataIndex: "2",
      width: 80,
      align: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            <span>{record['currentYearHistory']?.income}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['currentYearHistory']?.cost}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['currentYearHistory']?.manMonth}</span>
          </div>
        )
      }
    },
    {
      title: "本年预测数",
      dataIndex: "3",
      width: 80,
      align: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            <span>{record['currentYearForecast']?.income}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['currentYearForecast']?.cost}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['currentYearForecast']?.manMonth}</span>
          </div>
        )
      }
    },
    {
      title: "本年总计",
      dataIndex: "4",
      width: 80,
      align: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            <span>{record['currentYearTotal']?.income}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['currentYearTotal']?.cost}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['currentYearTotal']?.manMonth}</span>
          </div>
        )
      }
    },
    {
      title: "生命周期",
      dataIndex: "5",
      width: 80,
      align: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            <span>{record['total']?.income}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['total']?.cost}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['total']?.manMonth}</span>
          </div>
        )
      }
    },
    {
      title: "生命周期人均",
      dataIndex: "6",
      width: 90,
      align: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            <span>{record['totalAverage']?.income}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['totalAverage']?.cost}</span>
            <Divider style={{ margin: 0 }} />
            <span>{record['totalAverage']?.manMonth || 0}</span>
          </div>
        )
      }
    },
    {
      title: "操作",
      dataIndex: "operation",
      align: 'center',
      width: 240,
      fixed: 'right',
      render: (_: any, record: any) => {
        return (
          <Space className='operation-cell' style={{padding: 0}}>
            {
              !list.includes('collaborativeEditing') ? '' : <Button type='link' onClick={() => { userHandleOpen(record) }}>维护协同编辑人</Button>
            }
            {
              list.includes('write') ?
                <Button style={{ marginLeft: '-20px' }} type='link' onClick={() => { navigate(`/rollingForecast/reportProject?id=${record.id}&type=add&menu=${menuType}`) }}>
                  填报
                </Button> : ''
            }
            {
              list.includes('read') ? <Button style={{ marginLeft: '-20px' }} type='link' onClick={() => { navigate(`/rollingForecast/viewProject?id=${record.id}&type=view&menu=${menuType}`) }}>查看</Button> : ''
            }
          </Space>
        )
      },
    },
  ]
  const columnsLoad: any = [
    {
      title: "商机名称",
      dataIndex: "businessName",
      width: 200
    },
    {
      title: "待落地项目编码",
      dataIndex: "waitProjectCode",
      width: 150
    },
    {
      title: "收入确定性（%）",
      dataIndex: "incomeCertainty",
      width: 130
    },
    {
      title: "开始日期-结束日期",
      dataIndex: "projectTime",
      width: 200
    },
    {
      title: "项目状态",
      dataIndex: "state",
      width: 100,
      render: (_: any, record: any) => {
        if (_) {
          return '保存'
        } else {
          return '待维护'
        }
      },
    },
    {
      title: "协同编辑人",
      dataIndex: "synergyEditor",
      width: 150,
      render: (_: any, record: any) => {
        return (
          <Space>
            {getSynergyEditor(record.synergyEditor) || '-'}
          </Space>
        )
      }
    },
    {
      title: "填单人",
      dataIndex: "editorName",
      width: 150,
      render: (_: any, record: any) => {
        if (_) {
          return (
            <Space>
              {_ || '-'}
            </Space>
          )
        } else {
          return (
            <Space>
              {userOptions.filter((v: any) => v.value == record.editorId)[0]?.label}
            </Space>
          )

        }
      }
    },
    {
      title: "操作",
      dataIndex: "operation",
      align: 'center',
      width: 260,
      fixed: 'right',
      render: (_: any, record: any) => {
        return (
          <div>
            {
              list.includes('waitCollaborativeEditing') ?
                <Button type='link' onClick={() => { userHandleOpen(record) }}>维护协同编辑人</Button> : null
            }
            {
              list.includes('editAllocation') ?
                <Button type='link' onClick={() => { navigate(`/rollingForecast/editProject?id=${record.id}&type=add&menu=${menuType}`) }}>
                  编辑
                </Button> : null
            }
            {
              list.includes('waitAllocation') ?
                <Button type='link' onClick={() => { fpHandleOpen(record) }}>
                  分配
                </Button> : ''
            }
          </div>
        )
      },
    },
  ]
  const uploadProps: UploadProps = {
    beforeUpload: file => {
      setFilePath(file);
      return false
    },
    onChange: info => {
      console.log(info);
    },
    maxCount: 1,
    accept: ".xlsx,.xls",
  }
  const normFile = (e: any) => {  //如果是typescript, 那么参数写成 e: any
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  function getCurrentUser() {
    getCurrentUserApi().then((res: any) => {
      setCurrentUser(res.data)
      localStorage.setItem('userInfo', JSON.stringify(res.data))
    })
  }
  function getMenuType() {
    setMenuType(getLastPathSegment(window.location.href))
  }
  function getCurrentDay() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 月份是从 0 到 11 表示的，所以我们要加 1
    let data = {
      label: currentYear + '年' + currentMonth + '月',
      value: currentYear + '年' + currentMonth + '月',
    }
    // let a = [getLastMonthYearAndMonth(), data]
    // setCurrentDayOption([getLastMonthYearAndMonth(), data])
    currentDayOption = [getLastMonthYearAndMonth(), data]
  }
  function getLastMonthYearAndMonth() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1; //月份从0开始，需要加1
    if (month === 1) {  // 如果当前月份是1月，年份减1，月份设为12
      year -= 1;
      month = 12;
    } else {
      month -= 1; // 否则月份减1
    }
    return {
      label: year + '年' + (month < 10 ? '0' + month : month) + '月',
      value: year + '年' + (month < 10 ? '0' + month : month) + '月',
    };
  }

  function getLastPathSegment(url: any) {
    const path = new URL(url).pathname;
    const segments = path.split('/').filter(segment => segment.trim() !== '');
    return segments[segments.length - 1];
  }
  function filterProjectNameOpitons() {
    getProjectName().then((res: any) => {
      const list = res.map((item: any) => {
        return {
          label: item.projectName,
          value: item.projectName
        }
      })
      setProjectNameOpitons(list)
    })
  }
  function filterDepartmentOptions() {
    getDepartmentList().then(res => {
      let list: any = eachReplaceKey(res.data)
      setDepartmentOptions(list)
    })
  }
  // 过滤
  function eachReplaceKey(city: any) {
    let data: any = [];
    city.map((item: any) => {
      let newData = {
        ...item,
        label: item.name,
        value: item.id,
        key: item.id,
        children: item.children || null
      };
      if (item.children) {
        newData.children = eachReplaceKey(item.children);
      }
      data.push(newData);
    });
    return data;
  }
  function filterProjectPmOptions() {
    getProjectPm().then((res: any) => {
      const list = res.map((item: any) => {
        return {
          label: item.pmName,
          value: item.pm
        }
      })
      setProjectPmOptions(list)
    })
  }
  function filterProjectStatusOptions() {
    getProjectStatusList().then((res: any) => {
      const list = res.map((item: any) => {
        return {
          label: item.itemText,
          value: item.itemValue
        }
      })
      setProjectStatusOptions(list)
    })
  }
  function filterFlowTypeOpitons() {
    getFlowTypeList().then((res: any) => {
      const list = res.map((item: any) => {
        return {
          label: item.itemText,
          value: item.itemValue
        }
      })
      setFlowTypeOpitons(list)
    })
  }
  function filterUserOptions(payload: any) {
    let responseData = { ...payload, data: [] }
    payload.data.map((item: any) => {
      responseData.data.push({
        ...item,
        label: item.userName + '-' + item.email,
        value: item.userId,
        key: item.userId
      })
    })
    setUserOptions(responseData.data)
    return responseData
  }
  async function initData() {
    if (getLastPathSegment(window.location.href).includes('loadProject')) {
      // 待落地项目
      getTodoData()
    } else {
      getReadyData()
    }

  }
  async function getReadyData() {
    const values = await form.validateFields();
    let startDate = ''
    let endDate = ''
    if (values.time) {
      startDate = values.time[0].$y + '-' + (values.time[0].$M + 1) + '-' + values.time[0].$D
      endDate = values.time[1].$y + '-' + (values.time[1].$M + 1) + '-' + values.time[1].$D
    }
    setLoading(true)
    getProjectLedgerPage({
      current: current,
      size: size,
      deptId: values.deptId || 0,
      endDate: endDate,
      flowType: values.flowType || 0,
      onLanding: values.onLanding || '',
      pm: values.pm || 0,
      projectCode: values.projectCode || '',
      projectName: values.projectName || '',
      projectStatus: values.projectStatus || '',
      startDate: startDate,
    }).then(res => {
      const records = res.data.records
      records.map((item: any, index: number) => {
        records[index].yearLabel = [{ label: "收入（人民币）" }, { label: "成本（人民币）" }, { label: "人月" },]
        records[index].projectTime = item.projectStartTime + '~' + item.projectEndTime
        // for (let jdx: number = 1; jdx < 6; jdx++) {
        //   let data = [{ value: "-", label: "projectIncome" }, { value: "-", label: "projectCost" }, { value: "-", label: "projectIncome" }]
        //   data[0].value item.previousYear
        //   // for (let value of item.costIncomeHistory) {
        //   //   if (value.historyMonth === `2023年${jdx}月`) {
        //   //     data[0].value = value.projectIncome
        //   //     data[1].value = value.projectCost
        //   //   }
        //   // }
        //   // for (let value of item.manMonthHistory) {
        //   //   if (value.historyMonth === `2023年${jdx}月`) {
        //   //     data[2].value = value.manMonth
        //   //   }
        //   // }
        //   records[index][jdx.toString()] = data
        // }
      })
      setTableData(records)
      setTotal(res.data.total)
      setLoading(false)
    })
  }
  async function getTodoData() {
    const values = await form.validateFields();
    let endProjectEndTime = ''
    let endProjectStartTime = ''
    let startProjectEndTime = ''
    let startProjectStartTime = ''
    if (values.startTime) {
      startProjectStartTime = values.startTime[0].$y + '-' + (values.startTime[0].$M + 1) + '-' + values.startTime[0].$D
      startProjectEndTime = values.startTime[1].$y + '-' + (values.startTime[1].$M + 1) + '-' + values.startTime[1].$D
    }
    if (values.endTime) {
      endProjectStartTime = values.endTime[0].$y + '-' + (values.endTime[0].$M + 1) + '-' + values.endTime[0].$D
      endProjectEndTime = values.endTime[1].$y + '-' + (values.endTime[1].$M + 1) + '-' + values.endTime[1].$D
    }
    setLoading(true)
    getBusiness({
      current: current,
      size: size,
      endProjectEndTime: endProjectEndTime,
      endProjectStartTime: endProjectStartTime,
      state: values.onLanding || '',
      waitProjectCode: values.projectCode || '',
      businessName: values.projectName || '',
      startProjectEndTime: startProjectEndTime || '',
      startProjectStartTime: startProjectStartTime || '',
    }).then(res => {
      const records = res.data.records
      records.map((item: any, index: number) => {
        records[index].yearLabel = [{ label: "收入（人民币）" }, { label: "成本（人民币）" }, { label: "人月" },]
        if (item.projectStartTime && item.projectEndTime) {
          records[index].projectTime = item.projectStartTime + '~' + item.projectEndTime
        }
      })
      setTableData(records)
      setTotal(res.data.total)
      setLoading(false)
    })
  }
  function paginationChange(page: number, pageSize: number) {
    setCurrent(page)
    setSize(pageSize)
    initData()
  }
  async function reset() {
    await form.resetFields()
    setShowSenior(false)
    initData()
  }
  function search() {
    setShowSenior(false)
    initData()
  }
  function getSynergyEditor(data: any) {
    let str = ''
    data?.forEach((item: any) => {
      str = str + item.userName + ','
    });
    return str
  }
  async function doDownLoad() {
    const values = await form.validateFields();
    let startDate = ''
    let endDate = ''
    if (values.time) {
      startDate = values.time[0].$y + '-' + (values.time[0].$M + 1) + '-' + values.time[0].$D
      endDate = values.time[1].$y + '-' + (values.time[1].$M + 1) + '-' + values.time[1].$D
    }
    downloadFile(projectLedgerDownload, {
      current: current,
      size: size,
      deptId: values.deptId || 0,
      endDate: endDate,
      flowType: values.flowType || 0,
      onLanding: values.onLanding || '',
      pm: values.pm || 0,
      projectCode: values.projectCode || '',
      projectName: values.projectName || '',
      projectStatus: values.projectStatus || '',
      startDate: startDate,
    }, '项目台账.xlsx')
  }
  async function doDownLoadTemplate(download: any, name: any) {
    downloadFile(download, {}, name + '.xlsx')
  }
  function importHandleOpen(type: string) {
    importForm.resetFields()
    setFilePath(null)
    setFileType(type)
    setIsImportModalOpen(true);
  }
  async function importHandleOk() {
    const file = new FormData();
    file.append('file', filePath)
    if (fileType === '1') {
      await importManMonthExcel(file)
    } else {
      await importCostIncomeExcel(file)
    }
    setIsImportModalOpen(false)
    message.success('导入成功')
    initData()
    setFilePath(null)
  }
  function handleCancel() {
    setIsImportModalOpen(false);
    setIsTbModalOpen(false);
    setIsUserModalOpen(false);
    setIsFpModalOpen(false)
    setIsFcModalOpen(false);
  }
  function tbHandleOpen() {
    tbForm.resetFields()
    setIsTbModalOpen(true);
  }
  function fcHandleOpen() {
    fcForm.resetFields()
    setIsFcModalOpen(true);
  }
  async function tbHandleOk() {
    const values = await tbForm.validateFields();
    sendReminder(values).then(res => {
      message.success('提醒成功')
      setIsTbModalOpen(false);
      tbForm.resetFields();
    })
  }
  async function fcHandleOk() {
    const values = await fcForm.validateFields();
    console.log(values)
    addSeal({
      sealTime: values.month
    }).then(res => {
      message.success('封存成功！')
      setIsFcModalOpen(false);
      initData()
    })
  }
  async function userHandleOpen(data: any) {
    userForm.resetFields()
    await setChangeData(data)
    let list: any = []
    data.synergyEditor?.forEach((item: any) => {
      list.push(item.userId)
    })
    userForm.setFieldsValue({ synergyEditor: list })
    setIsUserModalOpen(true);
  }
  async function fpHandleOpen(data: any) {
    fpForm.resetFields()
    await setChangeData(data)
    // let list: any = []
    // data.synergyEditor?.forEach((item: any) => {
    //   list.push(item.userId)
    // })
    fpForm.setFieldsValue({ editorId: data.editorId })
    setIsFpModalOpen(true);
  }
  async function userHandleOk() {
    const values = await userForm.validateFields();
    let parmas: any = []
    userOptions.forEach((item: any) => {
      if (values.synergyEditor.includes(item.userId)) {
        parmas.push({
          userId: item.userId,
          userName: item.userName,
        })
      }
    });
    addSynergyEditor(changeData.id, parmas).then(res => {
      message.success('协同编辑人维护成功！')
      setIsUserModalOpen(false);
      initData()
    })
  }
  async function fpHandleOk() {
    const values = await fpForm.validateFields();
    let parmas: any = {
      editorId: values.editorId,
      editorName: userOptions.filter((v: any) => v.value == values.editorId)[0].label,
      projectLedgerId: changeData.id
    }
    addDistribute(parmas).then(res => {
      message.success('填单人分配成功！')
      setIsFpModalOpen(false);
      initData()
    })
  }
  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const Header = () => {
    return (
      <Form form={form} labelAlign="right" labelWrap={true} labelCol={{ span: 8 }} >
        <Row gutter={10} style={{height:40}}>
          <Col span={9}>
            <Item
              label={menuType.includes('loadProject') ? '商机名称' : '项目名称'}
              name='projectName'
            >
              <Select placeholder='请选择' options={projectNameOpitons} allowClear showSearch onChange={initData} />
            </Item>
          </Col>
          <Col span={9}>
            <Item
              label={menuType.includes('loadProject') ? '待落地项目编码' : '项目编码'}
              name='projectCode'
            >
              <Input placeholder='请输入' onBlur={initData} />
            </Item>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button type='primary' style={{ marginRight: 5 }} onClick={search}>查询</Button>
            <Button style={{ marginRight: 5 }} onClick={reset} >重置</Button>
            <Button onClick={() => { setShowSenior(!showSenior) }}>高级筛选</Button>
          </Col>
        </Row>
      </Form>)
  }
  const containerStyle: React.CSSProperties = {
    position: 'relative',
  };
  return (
    <div>
      <h3 style={{ margin: 0 }}>
        {
          menuType.includes('loadProject') ? '待落地项目' : menuType.includes('addProject') ? '新增列表' : '项目台账'
        } </h3>
      <Divider style={{ margin: '10px 0' }} />
      <Header />
      <div style={containerStyle}>
        <Row style={{ marginBottom: 10 }}>
          <Col span={12}>
            {
              menuType.includes('loadProject') || !list.includes('exportLedge') ? '' :
                <Button type='primary' style={{ marginRight: 10 }} onClick={doDownLoad}>导出</Button>
            }
            {
              menuType.includes('loadProject') ? <Button style={{ marginRight: 10 }} type='primary' onClick={() => { navigate(`/rollingForecast/addProject?menu=addProject`) }}>新增待落地项目</Button> : ''
            }
            {
              menuType.includes('loadProject') ? '' :
                <span>
                  {
                    !list.includes('importHourFC') ? '' : <Button style={{ marginRight: 10 }} onClick={() => { importHandleOpen('1') }}>导入上月人月</Button>
                  }
                  {
                    !list.includes('importCost') ? '' : <Button onClick={() => { importHandleOpen('2') }}>导入上月成本收入</Button>
                  }

                </span>
            }
          </Col>
          {
            menuType.includes('loadProject') ? '' :
              <Col span={12} style={{ textAlign: 'right' }}>
                {
                  !list.includes('sealingData') ? '' : <Button style={{ marginRight: 10 }} onClick={fcHandleOpen}>封存数据</Button>
                }
                {
                  !list.includes('fillingReminder') ? '' : <Button type='primary' danger onClick={tbHandleOpen}>填报提醒</Button>
                }

              </Col>
          }
        </Row>
        <Table
          dataSource={tableData}
          columns={menuType.includes('loadProject') ? columnsLoad : columns}
          loading={loading}
          pagination={false}
          scroll={{ x: 1300, y: '57vh' }}
        />
        <Pagination
          style={{ textAlign: 'right', marginTop: 20 }}
          showSizeChanger
          pageSize={size}
          current={current}
          total={total}
          onChange={paginationChange}
        />
        <Drawer
          placement="top"
          open={showSenior}
          closable={false}
          getContainer={false}
          onClose={() => { setShowSenior(false) }}
          height={160}
        >
          <Form form={form} labelAlign="right" labelWrap={true} labelCol={{ span: 6 }} >
            {
              menuType.includes('loadProject') ? <Row gutter={10} >
                <Col span={9}>
                  <Item
                    label='项目开始日期'
                    name='startTime'
                  >
                    <RangePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
                  </Item>
                  <Item
                    label='项目状态'
                    name='projectStatus'
                  >
                    <Select placeholder='请选择' options={projectStatusOptions} allowClear />
                  </Item>

                </Col>
                <Col span={9}>
                  <Item
                    label='项目结束日期'
                    name='endTime'
                  >
                    <RangePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
                  </Item>
                </Col>
              </Row> :
                <Row gutter={10} >
                  <Col span={10}>
                    <Item
                      label='立项事业部'
                      name='deptId'
                    >
                      <TreeSelect placeholder='请选择' treeData={departmentOptions} allowClear treeNodeFilterProp='label' showSearch />
                    </Item>
                    <Item
                      label='立项流程类型'
                      name='flowType'
                    >
                      <Select placeholder='请选择' options={flowTypeOpitons} allowClear />
                    </Item>
                  </Col>
                  <Col span={7}>
                    <Item
                      label='项目经理'
                      name='pm'
                    >
                      <Select placeholder='请选择' options={userOptions} allowClear showSearch filterOption={filterOption} />
                    </Item>
                    <Item
                      label='项目状态'
                      name='projectStatus'
                    >
                      <Select placeholder='请选择' options={projectStatusOptions} allowClear />
                    </Item>
                  </Col>
                  <Col span={7}>
                    <Item
                      label='立项日期'
                      name='time'
                    >
                      <RangePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
                    </Item>
                    <Item
                      label='是否落地'
                      name='onLanding'
                    >
                      <Select placeholder='请选择' options={[{ value: 1, label: "是" }, { value: 0, label: "否" }]} allowClear />
                    </Item>
                  </Col>
                </Row>
            }

          </Form>
        </Drawer>
      </div>
      <Modal open={isImportModalOpen} onOk={importHandleOk} onCancel={handleCancel} cancelText="取消" okText='确定'>
        <Form form={importForm} component={false}>
          <Form.Item name='template' label='模板：'>
            {
              fileType === '1' ?
                <Button type="link" onClick={() => { doDownLoadTemplate(manMonthExcelTemplate, '导入人月模板') }}>
                  导入人月模板
                  {/* <a href="/src/static/excel/导入人月模板.xlsx" target="_blank" download='导入人月模板'>导入人月模板</a> */}
                </Button>
                : null
            }
            {
              fileType === '2' ?
                <Button type="link" onClick={() => { doDownLoadTemplate(costIncomeExcelTemplate, '导入成本收入模板') }}>
                  导入成本收入模板
                  {/* <a href="/src/static/excel/导入成本收入模板.xlsx" target="_blank" download='导入成本收入模板'>导入成本收入模板</a></Button> */}
                </Button>
                : null
            }
          </Form.Item>
          <Form.Item name='file' label='上传文件：' getValueFromEvent={normFile}>
            <Upload {...uploadProps}>
              <Button>{filePath ? '重新上传' : '上传'}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal title='填报提醒' open={isTbModalOpen} onOk={tbHandleOk} onCancel={handleCancel} cancelText="取消" okText='确定'>
        <Form form={tbForm}>
          <Item name='deptId' label='请选择需要提醒的事业群' rules={[{ message: "事业群不得为空", required: true }]}>
            <Select mode="multiple" placeholder='请选择' options={departmentOptions} />
          </Item>
          <Item name='date' label='提醒内容：' rules={[{ message: "不得为空", required: true }]}>
            <Space>
              <span>请于</span>
              <InputNumber placeholder='请输入' style={{ width: 100 }} />
              <span>日之前，完成滚动预测数据填报。</span>
            </Space>
          </Item>
        </Form>
      </Modal>
      <Modal title='封存数据' open={isFcModalOpen} onOk={fcHandleOk} onCancel={handleCancel} cancelText="取消" okText='确定'>
        <Form form={fcForm}>
          <Item name='month' label='选择当前数据作为哪月定版数据封存' rules={[{ message: "选择得为空", required: true }]}>
            <Select placeholder='请选择' options={currentDayOption} />
          </Item>
          <Item name='date' label='说明' initialValue={' '} rules={[{ required: true }]}>
            <Space>
              <span>请于每月10号前定板上月数据，否则系统将自动将10号数据做为上月定版数据</span>
              {/* <InputNumber placeholder='请输入' style={{ width: 100 }} />
              <span>日之前，完成滚动预测数据填报。</span> */}
            </Space>
          </Item>
        </Form>
      </Modal>
      <Modal title='维护协同编辑人' open={isUserModalOpen} onOk={userHandleOk} onCancel={handleCancel} cancelText="取消" okText='确定'>
        <Form form={userForm}>
          <Item name='synergyEditor' label='选择成员' >
            <Select mode="multiple" placeholder='请选择' options={userOptions} filterOption={filterOption} />
          </Item>
        </Form>
      </Modal>
      <Modal title='分配待落地项目' open={isFpModalOpen} onOk={fpHandleOk} onCancel={handleCancel} cancelText="取消" okText='确定'>
        <Form form={fpForm}>
          <Item name='editorId' label='选择当前待落地项目填单人' rules={[{ required: true }]}>
            <Select showSearch placeholder='请选择' options={userOptions} filterOption={filterOption} />
          </Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Ledger