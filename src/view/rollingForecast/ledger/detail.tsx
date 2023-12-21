import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Divider, Form, Button, } from 'antd';
import ProjectForm from './components/projectForm';
import PersonMonth from './components/personMonth';
import PersonMonthExcel from './components/personMonthExcel';
import CostIncome from './components/costIncome';
import { projectLedgerDetails } from '../../../servers/api/ledger';
import { getDepartmentList } from "../../../servers/api/user"
import HardwareIncome from './components/hardwareIncome';
import ProgressIncome from './components/progressIncome';
import dayjs from 'dayjs';
const LedgerDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // 拿到路径地址
  const [dateOptions, setDateOptions] = useState<any>([]);
  const [departmentList, setDepartmentList] = useState<any>([]) // 事业部
  const [departmentListNo2, setDepartmentListNo2] = useState<any>([]) // 事业部
  const id = searchParams.get('id');
  const myRef = useRef<any>();
  const projectFormRef = useRef<any>();
  const myCostIncomeRef = useRef<any>();
  const myHardwareRef = useRef<any>();
  const [form] = Form.useForm()
  const [activeKey, setActiveKey] = useState<any>('1');
  const [menuType, setMenuType] = useState<any>('') // 事业部
  const [userInfo, setUserInfo] = useState<any>('') // 事业部
  const [costType, setCostType] = useState<any>('') 
   useEffect(() => {
    setMenuType(getLastPathSegment(window.location.href))
    initData()
    filterDepartmentList()
    setUserInfo(localStorage.getItem('userInfo'))
  }, [])
  function getLastPathSegment(url: any) {
    const path = new URL(url).pathname;
    const segments = path.split('/').filter(segment => segment.trim() !== '');
    return segments[segments.length - 1];
  }
  function initData() {
    if (id) {
      projectLedgerDetails({ id }).then(res => {
        // form项目基本信息表单
        form.setFieldsValue({
          ...res.data,
          dateRange: res.data?.projectStartTime ? [dayjs(res.data?.projectStartTime, 'YYYY-MM-DD'), dayjs(res.data?.projectEndTime, 'YYYY-MM-DD')] : [],
          time: res.data?.projectStartTime + '至' + res.data?.projectEndTime,
          onLanding: res.data?.onLanding === 0 ? '否' : '是',
        })
        getDateOptions(res.data?.projectStartTime, res.data?.projectEndTime)
        setCostType(res.data?.verifyWayName) 
      });
    }
  }
  // 计算日期列表
  function getDateOptions(startDate: string, endDate: string) {
    if (startDate && endDate) {
      var d1 = startDate;
      var d2 = endDate;
      var arr = new Array();
      var s1 = d1?.split("-");
      var s2 = d2?.split("-");
      var mCount = 0;
      if (parseInt(s1[0]) < parseInt(s2[0])) {
        mCount = (parseInt(s2[0]) - parseInt(s1[0])) * 12 + parseInt(s2[1]) - parseInt(s1[1]) + 1;
      } else {
        mCount = parseInt(s2[1]) - parseInt(s1[1]) + 1;
      }
      if (mCount > 0) {
        var startM = parseInt(s1[1]);
        var startY = parseInt(s1[0]);
        for (var i = 0; i < mCount; i++) {
          if (startM < 12) {
            arr[i] = startY + "年" + (startM > 9 ? startM : "0" + startM) + '月'
            // (startM > 9 ? startM : "0" + startM);
            startM += 1;
          } else {
            arr[i] = startY + "年" + (startM > 9 ? startM : "0" + startM) + '月'
            // (startM > 9 ? startM : "0" + startM);
            startM = 1;
            startY += 1;
          }
        }
      }
      const newData: any = []
      arr.forEach((item: any) => {
        newData.push({ label: item, value: item })
      })
      setDateOptions(newData)
    }
  }
  function flattenTree(tree: any, depth = 0) {
    if (depth === 1) {
      return tree.map((item: any) => ({
        ...item,
        label: item.name,
        value: item.id,
        key: item.id,
        children: undefined
      }));
    }
    return tree.reduce((acc: any, item: any) => {
      if (item.children) {
        acc.push(...flattenTree(item.children, depth + 1));
      }
      return acc;
    }, []);
  }
  // 部门list
  function filterDepartmentList() {
    getDepartmentList().then(res => {
      let list: any = eachReplaceKey(res.data)
      setDepartmentList(list)
      let a = flattenTree(res.data)
      setDepartmentListNo2(flattenTree(res.data)) 

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
  function handleSave() {
    if (activeKey == '2') {
      myRef.current!.handleSaveTime();
    } else if (activeKey == '3') {
      myCostIncomeRef.current!.handleSave();
    }
    else if (activeKey == '4') {
      myHardwareRef.current!.handleSave();
    }else if (activeKey == '1') {
      projectFormRef.current!.handleSave();
    }
  }
  
  function handleSubmit() {
    projectFormRef.current!.handleSubmit();
  }
  
  function onChange(str: string) {
    setActiveKey(str)
  }
  
  const tabsTiems = [
    {
      label: menuType === 'reportProject' || menuType === 'viewProject' ? '项目基本信息' : '待落地项目基本信息',
      key: '1',
      hidden: false,
      ref: projectFormRef,
      children: <ProjectForm ref={projectFormRef} id={id} form={form} menuType={menuType}/>,
    },
    {
      label: '人月滚动预测',
      key: '2',
      ref: myRef,
      hidden: costType == '商品销售-量产',
      children: <PersonMonth userInfo={userInfo} ref={myRef} id={id} form={form} dateOptions={dateOptions} menuType={menuType} departmentList={departmentListNo2} />,
    },
    // {
    //   label: '人月滚动预测',
    //   key: '6',
    //   //ref: myRef,
    //   children: <PersonMonthExcel userInfo={userInfo} id={id} form={form} dateOptions={dateOptions} menuType={menuType} departmentList={departmentListNo2} />,
    // },
    {
      label: '成本/收入滚动预测-软件',
      key: '3',
      ref: myCostIncomeRef,
      hidden: costType == '商品销售-量产',
      children: <CostIncome userInfo={userInfo} ref={myCostIncomeRef} id={id} form={form} menuType={menuType} dateOptions={dateOptions} departmentList={departmentListNo2} />,
    },
    {
      label: '成本/收入滚动预测-硬件',
      key: '4',
      ref: myHardwareRef,
      hidden: costType == '履约进度法' || costType == '结算单' || costType == '维护期分期' || costType == '商品销售法',
      children: <HardwareIncome userInfo={userInfo} ref={myHardwareRef} id={id} form={form} menuType={menuType} dateOptions={dateOptions} departmentList={departmentListNo2} />,
    },
    {
      label: '成本/收入滚动预测-进度确认',
      key: '5',
      hidden: costType == '商品销售-量产' || costType == '结算单' || costType == '维护期分期' || costType == '商品销售法',
      children: <ProgressIncome id={id} form={form} dateOptions={dateOptions} departmentList={departmentList} />,
    },
  ]
  type PositionType = 'right';
  const OperationsSlot: Record<PositionType, React.ReactNode> = {
    right: (
      <>
        { (menuType === 'addProject' || menuType === 'editProject') && <Button type='primary' onClick={() => { handleSubmit() }}>提交至台账</Button> }
        <Button style={{ margin: '0 10px' }} onClick={() => { (getLastPathSegment(window.location.href) == 'addProject' || getLastPathSegment(window.location.href) == 'editProject') ? navigate(`/rollingForecast/loadProject`) : navigate(`/rollingForecast/ledger`) }}>返回台账</Button>
        { menuType === 'viewProject' ? '' : <Button type='primary' onClick={() => { handleSave() }}>保存</Button> }
      </>
      ),
  }
  return (
    <>
      <h3 style={{margin:0}}>项目详情</h3>
      <Divider  style={{margin: '10px 0'}}/>
      <Tabs
        tabBarExtraContent={OperationsSlot}
        defaultActiveKey={"1"}
        onChange={onChange}
        type="card"
        items={(getLastPathSegment(window.location.href) == 'addProject' || getLastPathSegment(window.location.href) == 'editProject') ? [tabsTiems[0]] : tabsTiems.filter((v) => !v.hidden)}
      />
    </>
  )
}

export default LedgerDetail;