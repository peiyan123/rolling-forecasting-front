import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Divider, Form, Col, Row, Input, Select, InputNumber, TreeSelect, DatePicker, message } from 'antd';
import { getBusinessTypeList, getBusinessTypeDetailsList, updateProjectLedger, getFlowTypeList, getProjectStatusList, getAllCustom } from '../../../../servers/api/ledger';
import { addOrEditBusinessApi, getDepartmentList, getDictItemApi, getUserList } from '../../../../servers/api/user';
let businessTypeOptionsNew: any = []
let personnelManagementOptionsNew: any = []
let departmentOptionsNew: any = []

const ProjectForm: React.FC<any> = forwardRef((props, ref) => {
  const navigate = useNavigate();

  useImperativeHandle(ref, () => {
    return {
      "handleSave": function handleSaveTime() {
        const dateRange = props.form.getFieldValue('dateRange')
        let projectEndTime: any = ''
        let projectStartTime: any = ''
        if (dateRange) {
          // projectStartTime = dateRange[0].$y + '-' + (dateRange[0].$M + 1) + '-' + dateRange[0].$D
          // projectEndTime = dateRange[1].$y + '-' + (dateRange[1].$M + 1) + '-' + dateRange[1].$D
          projectStartTime = new Date(dateRange[0]).getTime()
          projectEndTime = new Date(dateRange[1]).getTime()
        }
        let a = personnelManagementOptionsNew?.filter((v: any) => v.id == props.form.getFieldValue('pm'))
        let params: any = {
          id: props.form.getFieldValue('id') || undefined,
          projectName: props.form.getFieldValue('projectName'),
          businessName: props.form.getFieldValue('businessName'),
          businessType: props.form.getFieldValue('businessType'),
          businessTypeName: props.form.getFieldValue('businessType') && businessTypeOptionsNew?.filter((v: any) => v.id == props.form.getFieldValue('businessType'))[0]?.label,
          customerAbbreviation: props.form.getFieldValue('customerAbbreviation'),
          deptId: props.form.getFieldValue('deptId'),
          divisionName: departmentOptionsNew?.filter((v: any) => v.id == Number(props.form.getFieldValue('deptId')))[0]?.name,
          grossProfitRate: props.form.getFieldValue('grossProfitRate'),
          incomeCertainty: props.form.getFieldValue('incomeCertainty'),
          marketArea: props.form.getFieldValue('marketArea'),
          pm: props.form.getFieldValue('pm'),
          pmName: personnelManagementOptionsNew?.filter((v: any) => v.value == props.form.getFieldValue('pm'))[0]?.label,
          projectDirectorId: props.form.getFieldValue('projectDirectorId'),
          projectDirectorName: personnelManagementOptionsNew?.filter((v: any) => v.value == props.form.getFieldValue('projectDirectorId'))[0]?.label,
          projectEndTime: projectEndTime,
          projectGrossCost: props.form.getFieldValue('projectGrossCost'),
          projectGrossIncome: props.form.getFieldValue('projectGrossIncome'),
          projectStartTime: projectStartTime,
          saleId: props.form.getFieldValue('saleId'),
          saleName: personnelManagementOptionsNew?.filter((v: any) => v.value == props.form.getFieldValue('saleId'))[0]?.label,
          waitProjectCode: props.form.getFieldValue('waitProjectCode'),
          state: '2'
        }
        // if (params.projectName && params.businessName && params.customerAbbreviation && params.customerAbbreviation && params.waitProjectCode && params.businessType && params.marketArea && params.incomeCertainty && dateRange && params.deptId && params.projectGrossIncome && params.projectGrossCost && params.grossProfitRate) {
        //   params.state = '1'
        // }
        // /rollingForecast/loadProject
        // if (props.menuType == 'editProject') {
        //   params.id = props.id
        // }
        addOrEditBusinessApi(params).then(res => {
          message.success('保存成功')
          navigate('/rollingForecast/loadProject')
        })
      },
      "handleSubmit": async function handleSubmit() {
        const dateRange = props.form.getFieldValue('dateRange')
        let projectEndTime: any = ''
        let projectStartTime: any = ''
        if (dateRange) {
          // projectStartTime = dateRange[0].$y + '-' + (dateRange[0].$M + 1) + '-' + dateRange[0].$D
          // projectEndTime = dateRange[1].$y + '-' + (dateRange[1].$M + 1) + '-' + dateRange[1].$D
          projectStartTime = new Date(dateRange[0]).getTime()
          projectEndTime = new Date(dateRange[1]).getTime()
        }
        let a = personnelManagementOptionsNew?.filter((v: any) => v.id == props.form.getFieldValue('pm'))
        const values = await props.form.validateFields();
        let params: any = {
          ...values,
          businessTypeName: props.form.getFieldValue('businessType') && businessTypeOptionsNew?.filter((v: any) => v.id == props.form.getFieldValue('businessType'))[0]?.label,
          customerAbbreviation: props.form.getFieldValue('customerAbbreviation'),
          deptId: props.form.getFieldValue('deptId'),
          divisionName: departmentOptionsNew?.filter((v: any) => v.id == Number(props.form.getFieldValue('deptId')))[0]?.name,
          pmName: personnelManagementOptionsNew?.filter((v: any) => v.value == props.form.getFieldValue('pm'))[0]?.label,
          projectDirectorName: personnelManagementOptionsNew?.filter((v: any) => v.value == props.form.getFieldValue('projectDirectorId'))[0]?.label,
          projectEndTime: projectEndTime,
          projectStartTime: projectStartTime,
          saleName: personnelManagementOptionsNew?.filter((v: any) => v.value == props.form.getFieldValue('saleId'))[0]?.label,
          state: '1'
        }
        addOrEditBusinessApi(params).then(res => {
          message.success('保存成功')
          navigate('/rollingForecast/ledger')
        })
      }
    }
  }, []);
  const { Item } = Form
  const { RangePicker } = DatePicker;
  const [businessTypeOptions, setBusinessTypeOptions] = useState<any>([]);
  businessTypeOptionsNew = businessTypeOptions
  const [customList, setCustomList] = useState<any>([]);
  const [regionList, setRegionList] = useState<any>([]);
  const [form] = Form.useForm()
  useEffect(() => {
    filterBusinessType();
    filterDepartmentOptions()
    filterProjectStatusOptions()
    getPersonnelPage()
    getDictItem()
  }, [])
  const formCol = [
    {
      span: 8,
      items: [
        { label: "项目名称：", name: "projectName" },
        { label: "项目经理：", name: "pmName" },
        { label: "事业部名称：", name: "divisionName" },
        { label: "收入确定性：", name: "incomeCertainty" },
        { label: "业务类型(看板)：", name: "businessTypeName" },
      ]
    },
    {
      span: 8,
      items: [
        { label: "项目编码：", name: "projectCode" },
        { label: "商机名称：", name: "onLanding" },
        { label: "项目状态：", name: "projectStatusName" },
        { label: "计划开始结束日期：", name: "time" },
        { label: "预计项目总收入(RMB)：", name: "projectGrossIncome" },
      ]
    },
    {
      span: 8,
      items: [
        { label: "客户简称：", name: "customerAbbreviation" },
        { label: "市场区域：", name: "marketArea" },
        { label: "立项流程类型：", name: "flowTypeName" },
        { label: "收入确认方式：", name: "verifyWayName" },
        { label: "项目立项/变更预计毛利率(%)：", name: "grossProfitRate" },
      ]
    },
  ]
  const [departmentOptions, setDepartmentOptions] = useState<any>([])
  const [personnelManagementOptions, setPersonnelManagementOptions] = useState<any>([])
  personnelManagementOptionsNew = personnelManagementOptions
  const [flowTypeOpitons, setFlowTypeOpitons] = useState<any>([])
  const [projectStatusOptions, setProjectStatusOptions] = useState<any>([])
  const { Option } = Select;
  const formColUnload = [
    {
      span: 8,
      items: [
        { label: "项目名称", name: "projectName", editable: true, required: true },
        { label: "待落地项目编码", name: "waitProjectCode", editable: false, required: true },
        { label: "收入确定性(%)", name: "incomeCertainty", editable: true, required: true },
        { label: "预计项目总收入(不含税人民币)", name: "projectGrossIncome", editable: true, required: true },
        { label: "项目经理", name: "pm", editable: true, required: false },
        // { label: "商机所属事业群", name: "businessDeptName", editable: false, required: false },
      ]
    },
    {
      span: 8,
      items: [
        { label: "商机名称", name: "businessName", editable: true, required: true },
        { label: "业务类型", name: "businessType", editable: true, required: true },
        { label: "计划开始结束日期", name: "dateRange", editable: true, required: true },
        { label: "预计项目总成本(不含税人民币)", name: "projectGrossCost", editable: true, required: true },
        { label: "销售", name: "saleId", editable: true, required: false },
      ]
    },
    {
      span: 8,
      items: [
        { label: "客户简称", name: "customerAbbreviation", editable: true, required: true },
        { label: "市场区域", name: "marketArea", editable: true, required: true },
        { label: "立项事业部", name: "deptId", editable: true, required: true },
        { label: "预计毛利率(%)", name: "grossProfitRate", editable: true, required: true },
        { label: "项目总监", name: "projectDirectorId", editable: true, required: false },

      ]
    },
  ]
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
  function flattenTreeData(treeData: any, array: any = []) {
    for (let i = 0; i < treeData.length; i++) {
      const node = treeData[i];
      array.push(node);
      if (node.children) {
        flattenTreeData(node.children, array);
      }
    }
    return array;
  }
  function filterDepartmentOptions() {
    getDepartmentList().then(res => {
      let list: any = eachReplaceKey(res.data)
      setDepartmentOptions(list)
      departmentOptionsNew = flattenTreeData(res.data);
    })
  }
  function getPersonnelPage() {
    getUserList("").then(res => {
      let data: any = []
      res.data.map((item: any) => {
        data.push({
          ...item,
          label: item.userName + '-' + item.email,
          value: item.userId,
          key: item.userId
        })
      })
      setPersonnelManagementOptions(data)
    })
  }
  function getDictItem() {
    let params = {
      dictCode: 'customerRegion'
    }
    getDictItemApi(params).then((res: any) => {
      let list: any = res.map((item: any) => {
        return {
          label: item.itemText,
          value: item.id
        }
      })
      setRegionList(list)
    })
    getAllCustom().then(payload => {
      const { data } = payload
      setCustomList(data.map((item: any) => {
        return {
          ...item,
          label: item.fullName,
          value: item.id
        }
      }))
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
  function onRangeChange(dates: any, dateStrings: string[]) {

  }

  // 过滤业务类型
  async function filterBusinessType() {
    let params = {
      dictCode: 'businessType'
    }
    getDictItemApi(params).then((res: any) => {
      let list: any = res.map((item: any) => {
        return {
          label: item.itemText,
          value: item.itemValue
        }
      })
      setBusinessTypeOptions(list)
    })
  }
  function businessTypeChange(newValue: number) {
    for (let item of businessTypeOptions) {
      for (let element of item.children) {
        if (newValue === element.value) {
          formUpdate({
            businessType: item.itemValue,
            businessTypeName: item.title,
            businessTypeDetail: element.value,
            businessTypeDetailName: element.title,
          })
          break
        }
      }
    }
  }
  function formUpdate(params: any) {
    updateProjectLedger({ id: props.id, ...params })
  }
  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (<div>
    <h3 style={{ margin: '5px 0 0' }}>{props.menuType === 'reportProject' || props.menuType === 'viewProject' ? '项目基本信息' : '待落地项目基本信息'}
      {
        props.menuType != 'addProject' ? <span> -{props.form.getFieldValue('projectName')}</span> : ''
      }
    </h3>
    <Divider />
    <Form labelAlign="right" labelWrap={true} form={props.form} labelCol={{ span: 10 }} >
      <Row gutter={10} >
        {
          props.menuType == 'viewProject' || props.menuType == 'reportProject' ?
            formCol.map(item => {
              return (
                <Col className="gutter-row" span={item.span}>
                  {
                    item.items.map(value => {
                      return (
                        <Item
                          label={value.label}
                          name={value.name}
                        >
                          <Input bordered={false} />
                        </Item>
                      )
                    })
                  }
                </Col>
              )
            }) : formColUnload.map(item => {
              return (
                <Col className="gutter-row" span={item.span}>
                  <Item
                    name="id"
                    hidden={false}
                  >
                  </Item>
                  {
                    item.items.map(value => {
                      switch (value.name) {
                        case 'dateRange':
                          return (
                            <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required }]}
                            >
                              <RangePicker onChange={onRangeChange} style={{ width: '100%' }} />
                            </Item>
                          )
                        case 'businessType':
                          return (
                            <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required, message: '请选择' }]}
                            >
                              <Select placeholder="请选择" options={businessTypeOptions} showSearch filterOption={filterOption} optionFilterProp="children" />
                            </Item>
                          )
                        case 'deptId':
                          return (
                            <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required, message: '请选择' }]}
                            >
                              {/* <TreeSelect placeholder='请选择' treeData={departmentOptions} allowClear treeNodeFilterProp='label' showSearch /> */}
                              <Select placeholder='请选择' options={departmentOptions} allowClear showSearch filterOption={filterOption} optionFilterProp="children"  />
                            </Item>
                          )
                        case 'pm':
                        case 'saleId':
                        case 'projectDirectorId':
                          return (
                            <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required, message: '请选择' }]}
                            >
                              <Select placeholder='请选择' options={personnelManagementOptions} allowClear showSearch filterOption={filterOption} optionFilterProp="children" />
                            </Item>
                          )
                        case 'customerAbbreviation':
                          return (
                            <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required, message: '请选择' }]}
                            >
                              <Select placeholder='请选择' options={customList} allowClear showSearch filterOption={filterOption} optionFilterProp="children" />
                            </Item>
                          )
                        case 'marketArea':
                          return (
                            <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required, message: '请选择' }]}
                            >
                              <Select placeholder='请选择' options={regionList} allowClear showSearch filterOption={filterOption} optionFilterProp="children" />
                            </Item>
                          )
                        case 'incomeCertainty':
                        case 'projectGrossIncome':
                        case 'projectGrossCost':
                        case 'grossProfitRate':
                            return (
                              <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required }]}
                            >
                              <InputNumber placeholder='请输入' min={0} style={{width:'100%'}} />
                            </Item>
                            )
                        default:
                          return (
                            <Item
                              label={value.label}
                              name={value.name}
                              required={value.required}
                              rules={[{ required: value.required }]}
                            >
                              <Input bordered={value.editable || props.menuType == 'addProject'} readOnly={!value.editable && props.menuType != 'addProject'} placeholder={value.editable ? '请输入' : ''} />
                            </Item>
                          )
                      }
                    })
                  }
                </Col>
              )
            })
        }

      </Row>
    </Form>
    <Divider />
  </div >)
})

export default ProjectForm