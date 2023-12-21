import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import {
  Button, Form, Input, InputNumber, Popconfirm, Table, Space, Row, Col, Divider,
  message, Select, Modal, Upload, TreeSelect
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { UploadProps } from 'antd';
import {
  getManMonthHistory, addManMonthHistory, copyManMonthHistory, delManMonthHistory, updateManMonthHistory, importManMonthHistory, manMonthHistoryTemplate, manMonthHistoryDownload,
  getManMonthFormal, addManMonthFormal, copyManMonthFormal, delManMonthFormal, updateManMonthFormal, importManMonthFormal, manMonthFormalTemplate, manMonthFormalDownload,
  getManMonthEpiboly, addManMonthEpiboly, copyManMonthEpiboly, delManMonthEpiboly, updateManMonthEpiboly, importManMonthEpiboly, manMonthEpibolyTemplate, manMonthEpibolyDownload, editDepartOrPersonnel, addDepartOrPersonnel, editStaff, importManMonthPm
} from '../../../../servers/api/ledger'
import { downloadFile } from '../../../../common/downLoad'
import { getRoleList } from '../../../../servers/api/role';
import { getDepartmentList } from '../../../../servers/api/user';
import { table } from 'console';
import './styles.css';
import './copy.css'
// import 'clipboard-polyfill';
let list: any = []
let departmentOptions: any = []
let activeCloumn: any = ''
let activeRow: any = ''
let currentMonent: any = ''
let pageTypeOut: any = ''
let currentDay: any = ''
let historyDataEdit: any = []   // 前端缓存数据
let updateDate: any = []
let clipboardContent: any = ''
let originDir: any={}
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
function getCurrentDay() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 月份是从 0 到 11 表示的，所以我们要加 1
  currentDay = currentYear + '年' + currentMonth + '月'
}
const PersonMonth: React.FC<any> = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => {
    return {
      "handleSaveTime": function handleSaveTime() {
        var reg = /^\d{4}年\d{1,2}月$/;
        updateDate.forEach((item: any) => {
          item.departName = item.departNameNo
          item.personnelType = item.personnelTypeNo
          delete item.departNameNo
          delete item.personnelTypeNo
          let manMonthFormList: any = []
          Object.keys(item).forEach((v) => {
            if (reg.test(v)) {
              manMonthFormList.push({
                forecastDate: v,
                manHour: item[v]
              })
              delete item[v];
            }
          })
          item.manMonthFormList = manMonthFormList
        })
        editStaff({editManMonthStaffFormList: updateDate, projectLedgerId: id}).then(payload => {
          initData()
          updateDate = []
          message.success('修改成功')
      })
      }
    } 
  }, []);
    const { id, dateOptions, departmentList, type } = props
    const [monthForm] = Form.useForm()
    const [importForm] = Form.useForm()
    const [addForm] = Form.useForm()
    departmentOptions = departmentList
    // departmentOptions.forEach((v: any) => {
    //   v.value = v.label
    // })
    const Now = new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`).getTime()
    const [loading, setLoading] = useState<boolean>(true); // loading
    const [isModalOpen, setIsModalOpen] = useState(false); // 弹窗
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 弹窗
    const [filePath, setFilePath] = useState<any>(null);
    const [tableType, setTableType] = useState<string>('');
    const [activeCloumnChange, setActiveCloumnChange] = useState<string>('');
    const [activeRowChange, setActiveRowChange] = useState<string>('');
    // 历史
    const [historyColumns, setHistoryColumns] = useState<any>([]);
    const [historyData, setHistoryData] = useState<any>([]);
    historyDataEdit = historyData
    // 公司员工
    const [formalData, setFormalData] = useState<any>([]);
    // 外协员工
    const [epibolyData, setEpibolyData] = useState<any>([]);
    const [roleList, setRoleList] = useState<any>([])
    const [monent, setMonent] = useState<any>('')
    currentMonent = monent
    const [pageType, setPageType] = useState('');
    pageTypeOut = pageType
    function findItem(tree: any, key: any) {
      for (let i = 0; i < tree.length; i++) {
          if (tree[i].key === key) {
              return tree[i].label;
          }
          if (tree[i].children) {
              let result: any = findItem(tree[i].children, key);
              if (result) {
                  return result;
              }
          }
      }
      return null;
    }
    // 表单组件
    const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, handleSubmit, index,  ...restProps }: any) => {
      const [editing, setEditing] = useState(false);
      const inputRef = useRef<any>(null);
      const form = useContext(EditableContext)!;
      useEffect(() => {
        getCurrentDay()
        if (editing) { inputRef.current?.focus(); }
      }, [editing]);
      // 获取当前月份
      // console.log(record)
      const toggleEdit = (data: any) => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
      };
      const setValue = (data: any) => {
        let params = record
        params[dataIndex] = data
        historyDataEdit[index] = params
        // historyDataEdit = replaceObject(historyDataEdit, params)
        setHistoryData(JSON.parse(JSON.stringify(historyDataEdit)))
        setEditing(!editing);
      };
      const togglePase =  (data: any) => {
        activeCloumn = title
        setActiveCloumnChange(title)
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
      function compareAndReplace(arr: any, obj: any) {
          let found = false;
          for (let i = 0; i < arr.length; i++) {
              let keys = Object.keys(arr[i]);
              let objKeys = Object.keys(obj);
              if (keys.length === objKeys.length) {
                  let sameKeys = keys.every(key => objKeys.includes(key));
                  if (sameKeys) {
                      arr[i] = obj;
                      found = true;
                      break;
                  }
              }
          }
          if (!found) {
              arr.push(obj);
          }
          return arr;
      }
      async function saveChangeParams (data: any, record: any, title: any) {
          if (title == 'roleName') {
            setValue(data == '0' ? '项目' : data == '1' ? '研发' : data == '2' ? '测试' : '其他')
          } else if (title === 'averagePay') {
            if ((record.personnelTypeNo == '公司员工' && Number(data.target.value) > 5) || (record.personnelTypeNo == '外协员工' && Number(data.target.value) < 5)) {
              message.error('平均薪资系数/薪酬需要符合规则（公司员工不大于5，外协员工不小于5）')
              return
            } else {
              setValue(data.target.value.replace(/[^0-9.]/g, ''))
            }
          } else {
            if (testData(title)) {
              setValue(data.target ? data.target.value.replace(/[^0-9.]/g, '') : data.label ? data.label : data.replace(/[^0-9.]/g, ''))
            } else {
              setValue(data.target ? data.target.value : data.label ? data.label : data.replace(/[^0-9.]/g, ''))
            }
          }
          let p = record
          p[title] = data.target ? data.target.value : data
          p.index = index
          if (updateDate && updateDate.findIndex((v: any) => v.index == index) !== -1) {
            updateDate[updateDate.findIndex((v: any) => v.index == index)] = p
          } else {
            updateDate.push(p)
          }
          // let a = JSON.parse(JSON.stringify(compareAndReplace(updateDate, p))) 
          // updateDate = a
          setTimeout(() =>{
            console.log(updateDate)
          }, 500)
      }
      function changeDepartPersonnel (data: any, record: any, title: any) {
        let params: any
        if (title == 'departName') {
          params = {
            departName: record.departName,
            newDepartId: data,
            newDepartName: findItem(departmentOptions, data),
            projectLedgerId: id,
            type: 1
          }
        } else {
          params = {
            departName: record.departNameNo,
            newPersonnelType: data,
            oldPersonnelType: record.personnelType,
            projectLedgerId: id,
            type: 2
          }
        }
        editDepartOrPersonnel(params).then(payload => {
          const { data } = payload
          message.success('修改成功')
          initData()
        })
      }
      function compareChineseDate(dateStr1: any, dateStr2: any) {
        var date1 = new Date(dateStr1.replace(/年/g, '-').replace(/月/g, '-'));
        var date2 = new Date(dateStr2.replace(/年/g, '-').replace(/月/g, '-'));
        return date1 < date2
      }
      function testData(dateStr1: any) {
        var reg = /^\d{4}年\d{1,2}月$/;
        return reg.test(dateStr1)
      }
      let childNode = children;
      if (pageTypeOut == 'view' || currentMonent) {
        return  <td {...restProps}>{childNode}</td>;
      }
      if ((!record?.editable && dataIndex !== 'personnelType') && !testData(dataIndex)) {
        return  <td {...restProps}>{childNode}</td>;
      } 
      if (editable) {
        // 实施部门
        if (dataIndex === 'departName') {
          childNode = editing ? (
            <div className={record.departName ? 'departName-cell' : ''}>
              <Form.Item
                style={{ width: '150px', lineHeight: '50px' }}
                name={dataIndex}
              >
                <Select
                  ref={inputRef}
                  options={departmentOptions}
                  showSearch
                  filterOption={filterOption}
                  style={{ width: '100%' }}
                  onChange={(($event) => changeDepartPersonnel($event, record, dataIndex)) }
                />
              </Form.Item>
            </div>
          ) : (
            <div style={{ paddingLeft: '10px'}}  className={record.departName ? 'departName-cell' : ''} onClick={toggleEdit}>
              {children.label || children}
            </div>
          );
        }
        // 人员类型
        else if (dataIndex === 'personnelType') {
          childNode = editing ? (
            <Form.Item
              style={{ margin: 0 }}
              name={dataIndex}
            >
              <Select
                ref={inputRef}
                style={{ width: '50%' }}
                options={[
                  { value: '公司员工', label: '公司员工' },
                  { value: '外协员工', label: '外协员工' },
                ]}
                onChange={(($event) => changeDepartPersonnel($event, record, dataIndex)) }
              />
            </Form.Item>
          ) : (
            <div style={{ marginLeft: '10px', textAlign: 'left' }} onClick={toggleEdit}>
              {children.label || children}
            </div>
          );
        }
        // 角色
        else if (dataIndex === 'roleName') {
          childNode = editing ? (
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
            <Select
                ref={inputRef}
                style={{ width: '100%' }}
                options={[
                  { value: '0', label: '项目' },
                  { value: '1', label: '研发' },
                  { value: '2', label: '测试' },
                  { value: '3', label: '其他' },
                ]}
                onChange={(($event) => saveChangeParams($event, record, dataIndex)) }
              />
            </Form.Item>
          ) : (
            <div onClick={toggleEdit}>
              {children.label || children}
            </div>
          );
        } else if (dataIndex === 'averagePay') {
          childNode = editing ? (
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
              <InputNumber
                ref={inputRef}
                min={0}
                // onPressEnter={submit}
                // onInput={save}
                onBlur={(($event) => saveChangeParams($event, record, dataIndex)) }
                style={{ width: '100%' }}
              />
            </Form.Item>
          ) : (
            <div style={{ width: '30%'}} className={'editable-cell-value-wrap'}>
              {children}
            </div>
          );
        } else if (!testData(dataIndex)) {
          childNode = editing ? (
            <div className={record.departName ? 'departName-cell' : ''}>
              <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
              >
                <InputNumber
                  ref={inputRef}
                  min={0}
                  // onPressEnter={submit}
                  // onInput={save}
                  onBlur={(($event) => saveChangeParams($event, record, title)) }
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
            
          ) : (
            <div className={record.departName ? 'departName-cell-left' : 'editable-cell-value-wrap'} style={{ width: '30%' }}>
              {children}
            </div>
          );
        } else {
          // 历史数据
          if (compareChineseDate(dataIndex, currentDay)) {
            if (JSON.parse(props.userInfo).roleName !== '财务') {
              return  <td {...restProps}> {
                record.departName ? <div className={'departName-cell'}>{childNode}</div> : <span>{childNode}</span>
              } </td>;
            }
            // 历史数据 赋值0
            if ((!record.editable && !record[dataIndex] )) {
              record[dataIndex] = 0
            }
            childNode = editing ? (
              <div className={record.departName ? 'departName-cell' : ''}>
                <Form.Item
                  style={{ margin: 0 }}
                  name={dataIndex}
                >
                  <InputNumber
                    ref={inputRef}
                    min={0}
                    // onPressEnter={submit}
                    // onInput={save}
                    // onPaste={handlePaste} 
                    // onChange={handleChange}
                    // onKeyPress={handleKeyPress}
                    onBlur={(($event) => saveChangeParams($event, record, title)) }
                    style={{ width: '100%'  }}
                  />
                </Form.Item>
              </div>
            ) : (
              <div className={record.type == 2 ? 'can-editable' : record.departName ? 'departName-cell' :'editable-cell-value-wrap'} onDoubleClick={toggleEdit}>
                {children}
              </div>
            );
          } else {
            if (JSON.parse(props.userInfo).roleName !== 'PM') {
              return  <td {...restProps}> {
                record.departName ? <div className={'departName-cell'}>{childNode}</div> : <span>{childNode}</span>
              }  </td>;
            }
            // 预测数据 赋值0
            if (record.editable) {
              if(!record[dataIndex] && !record.departName) {
                record[dataIndex] = 0
              }
            }
            childNode = editing && record.editable ? (
              <div className={record.departName ? 'departName-cell' : ''}>
                <Form.Item
                  style={{ margin: 0 }}
                  name={dataIndex}
                >
                  <InputNumber
                    ref={inputRef}
                    min={0}
                    // onPressEnter={submit}
                    //onInput={save}
                    // onChange={handleChange}
                    // onKeyPress={handleKeyPress}

                    // formatter={formatter}
                    // parser={parser}

                    onBlur={(($event) => saveChangeParams($event, record, title)) }
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
            ) : (
              <div className={record.type == 3 ? 'can-editable' : record.departName ? 'departName-cell' : 'editable-cell-value-wrap'} onDoubleClick={toggleEdit}>
                {children || 0}
              </div>
            );
          }
        }
      }
      return <td {...restProps}>{childNode}</td>;
    };
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    function isNumber(value: any) {
      if (typeof value === 'number') {
          return true;
      } else if (typeof value === 'string') {
          return !isNaN(parseFloat(value)) && isFinite(value);
      } else {
          return false;
      }
    }
    const pasteInfo=(row:any,record:any,col:any)=>{
      if (col.dataIndex == 'departName' || col.dataIndex == 'personnelType' || col.dataIndex == 'roleName') {
        return
      }
      activeCloumn = col.dataIndex 
      // console.log(row)
      // // console.log(record)
      // // console.log(col)
      // // console.log(row.target)
      // let elt=row.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
      // let elt1=row.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
      // let rowFlag=Number(activeRow)
      // let colFlag=Number(activeCloumn)
      // // let rowFlag=4
      // // let colFlag=6
      // console.log('行坐标：'+rowFlag,'列坐标：'+colFlag)
      // navigator.clipboard.readText()
      // .then(data => {
      //   //首先对源头进行解析
      //   if (data && !data.includes('\r\n')) { // 单独复制文本，不是复制单个单元格
      //     data = data + '\r\n';
      //   }
      //   let rowStrArray = data.split('\r\n'); //拆成多行
      //   let rows = [];
      //   for (let i = 0; i < rowStrArray.length - 1; i++) {
      //     let row = [];
      //     let tdStrArray = rowStrArray[i].split('\t'); //按列拆分
      //     for (let j = 0; j < tdStrArray.length; j++) {
      //       row.push(Number(tdStrArray[j]) || 333);
      //     }
      //     rows.push(row);
      //   }
      //   console.log(rows)
      //   // let lis = ['2024年02月', '2024年03月', '2024年04月', '2024年05月'];
      //   let lis=Object.keys(historyDataEdit[1])
      //   let notPaste = ['jg', 'gz', 'xz']
      //   // 赋值
      //   for (let j = 0; j < rows.length; j++) {
      //     if (rowFlag + j > historyDataEdit.length - 1) { // 超出行不粘贴
      //       break;
      //     }
      //     let rowInfo = historyDataEdit[rowFlag + j]
      //     for (let k=0; k<rows[j].length; k++){
      //       let key = lis[k+colFlag]
      //       if (notPaste.indexOf(key)===-1){
      //         rowInfo[key] = rows[j][k]
      //       }
      //     }
      //   }
      //   let tData=historyDataEdit;
      //   let newData=JSON.parse(JSON.stringify(tData))
      // //  console.log('复制1')
      //   // console.log(newData)
      //   setHistoryData(newData)
      // })
      // .catch(err => {
      //   console.error('无法获取剪切板内容:', err);
      // });
    };
    // 历史
    const columnsHistory = historyColumns.map((col: any) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any, index: any) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          index: index,
          title: col.title,
          colSpan: (col.dataIndex == 'averagePay' && (record.departName || record.personnelType)) ? 0 : 1,
          handleSave: (row: any, values: any) => { handleSave(row, values, 'history') },
          handleSubmit: (row: any, values: any) => { handleSubmit(row, values, 'history') },
          onClick:(row: any, values: any)=>pasteInfo(row,record,col)
        }),
      };
    });
    // 线上复制到线下
    let handleCopy = () => {
      const copyableElements = document.querySelectorAll('[data-brush=true]');
      let arrCopy: any = []
      copyableElements.forEach((element, index) => {
        arrCopy.push({ 'val': element.childNodes ? element.childNodes[0].innerHTML : element.innerHTML, 'height': element.getBoundingClientRect().top })
      });
      let groupedArr = arrCopy.reduce((accumulator: any, currentValue: any) => {
        let group = accumulator.find((item: any) => item[0].height === currentValue.height);
        if (group) {
          group.push(currentValue);
        } else {
          accumulator.push([currentValue]);
        }
        return accumulator;
      }, []);

      let result = groupedArr.map((group: any) => group.map((item: any) => item.val));
      console.log(result)
      let formattedData = "";
      for (var i = 0; i < result.length; i++) {
        var row = result[i];
        for (var j = 0; j < row.length; j++) {
          var cell = row[j];
          var value = cell;
          if (typeof cell === "string") {
            value = '"' + cell.replace(/"/g, '') + '"';
          }
          formattedData += value + "\t";
        }
        formattedData += "\n";
      }
      formattedData = formattedData


      // console.log(formattedData)
      navigator.clipboard.writeText(formattedData).then(() => {
        //  console.log(arr);
      }).catch((error) => {
        // console.error('复制失败:', error);
      });
    }
    const uploadProps: UploadProps = {
      beforeUpload: file => {
        setFilePath(file);
        return false
      },
      maxCount: 1,
      accept: ".xlsx,.xls",
    }
    function getClipboardContent() {
      handleClick()
    }
    const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    useEffect(() => {
      // document.addEventListener('paste', function(e) {
      //   // 在这里处理粘贴的内容
      //   getClipboardContent();
      // });
      list = JSON.parse(localStorage.getItem('roleList') || "{}")
      initData()
      let urlParams = new URL(window.location.href);
      setPageType(urlParams.searchParams.get('type') || '')
      filterRoleList()
      window.addEventListener('keydown', ()=>{
        //ctrl+c
        if(window.event.ctrlKey &&window.event.keyCode === 67){
          handleCopy()
          // getClipboardContent();
        }
        //ctrl+v
        if(window.event.ctrlKey &&window.event.keyCode === 86){
          handleClick()
          //cpoyV()
        }
      }); // 添加全局事件
      return () => {
        window.removeEventListener('keydown', ()=>{
          console.log('监听键盘销毁')
        }); // 销毁
      };
    }, [])

    async function handleClick() {
      try {
        clipboard.readText()
        .then(text => {
          clipboardContent = text
          console.log(activeCloumn, activeRow)
          setTimeout(() => {
            const rows = clipboardContent.replaceAll('\r', '').split('\n');
              rows.forEach((item: any, index: any) => {
                console.log(item)
                if (item.includes('\t')) {
                  console.log('up')
                  let row = item.split('\t');
                  row.forEach((v: any, i: any) => {
                    let data = dateOptions[dateOptions.findIndex((v: any) => v.label == activeCloumn) + i]?.label
                    if (v == 9) {
                    }
                    if (isNumber(v.replaceAll('\"', '')) && v.replaceAll('\"', '') !== '' && historyDataEdit[activeRow+index][data] !== undefined ) {
                      if ((!compareChineseDate(data, currentDay) && historyDataEdit[activeRow+index].type == 2) || (historyDataEdit[activeRow].type == 3 && compareChineseDate(data, currentDay))) {
                        return
                      } else {
                        historyDataEdit[activeRow+index][data] = Number(v.replaceAll('\"', ''))
                        let p = JSON.parse(JSON.stringify(historyDataEdit[activeRow+index])) 
                        p[data] = Number(v.replaceAll('\"', ''))
                        p.index = activeRow
                        if (updateDate && updateDate.findIndex((v: any) => v.index == activeRow+index) !== -1) {
                          updateDate[updateDate.findIndex((v: any) => v.index == activeRow+index)] = p
                        } else {
                          updateDate.push(p)
                        }
                      }
                    }
                  });
                } else {
                  let data = dateOptions[dateOptions.findIndex((v: any) => v.label == activeCloumn) + index]?.label
                  try {
                    if (isNumber(item.replaceAll('\"', '')) && item.replaceAll('\"', '') !== '' && historyDataEdit[activeRow][data] !== undefined) {
                      if ((!compareChineseDate(data, currentDay) && historyDataEdit[activeRow].type == 2) || (historyDataEdit[activeRow].type == 3 && compareChineseDate(data, currentDay))) {
                        return
                      } else {
                        historyDataEdit[activeRow][data] = Number(item.replaceAll('\"', ''))
                        let p = JSON.parse(JSON.stringify(historyDataEdit[activeRow])) 
                        p[data] = Number(item.replaceAll('\"', ''))
                        p.index = activeRow
                        if (updateDate && updateDate.findIndex((v: any) => v.index == activeRow) !== -1) {
                          updateDate[updateDate.findIndex((v: any) => v.index == activeRow)] = p
                        } else {
                          updateDate.push(p)
                        }
                      }
                    }
                  } catch (e) {
                  }
                }
              })
            setHistoryData(JSON.parse(JSON.stringify(historyDataEdit)))
          }, 200)
        })
        .catch(err => {
          alert('无法读取剪贴板数据：', err);
        });
      } catch (err) {
        console.error('无法读取剪贴板内容：', err);
      }
      // clipboard.readText()
      // .then((text: any) => {
      
      // })
      // .catch(err => {
      //   alert('无法读取剪贴板数据：', err);
      // });
    };
    // 加载
    async function initData() {
      setLoading(true)
      const values = await monthForm.validateFields();
      setMonent(values.month)
      getManMonthHistory({ projectLedgerId: id, historyMonth: values.month }).then(payload => {
        const { data } = payload
        let tableData: any = []
        data.forEach((item: any, index: number) => {
          tableData.push({
            departName: item.departName || '-',
            departId: item.departId,
            departNameNo: item.departName || '-',
            totalManHour: item.totalManHour || 0,
            editable: true,
          })
           // 公司员工
           if (item.formalListVOList) {
            let result: any = {
              departNameNo: item.departName || '-',
              departId: item.departId,
              editable: false,
              personnelTypeNo: '公司员工',
              type: 2,
            };
            dateOptions.forEach((item: any) => {
              if(!result[item.label]) {
                result[item.label] = 0
              } 
            });
            item.formalListVOList?.forEach((v: any) => {
              v.manMonthFormalDateHistoryVOS?.forEach((subItem: any) => {
                  if (result[subItem.forecastDate]) {
                      result[subItem.forecastDate] += subItem.manHour;
                  } else {
                      result[subItem.forecastDate] = subItem.manHour;
                  }
              });
            });
              // 公司员工历史数据
            item.manMonthHistoryVOList?.forEach((v: any) => {
              if (v.personnelType == '公司员工') {
                result.id = v.id
                result.personnelTypeNo = '公司员工'
                result = {...result,...getTimeClounms(v.manMonthHistoryDateVOS, 'history')}
              }
            })
            item.formalListVOList && tableData.push({
              personnelType: '公司员工',
              totalManHour: item.epibolyManHour || 0,
              editable: true,
              departId: item.departId,
              ...result
            })
            item.formalListVOList?.forEach((v: any, indx: any) => {
              let params = {
                departNameNo: item.departName || '-',
                totalManHour: v.manHour || 0,
                roleName:v.roleName,
                personnelTypeNo: '公司员工',
                averagePay:v.averagePay,
                departId: item.departId,
                type: 3,
                id: v.id,
                editable: true,
                ...getTimeClounms(v.manMonthFormalDateHistoryVOS, 'after')
              }
              dateOptions.forEach((item: any) => {
                if(!compareChineseDate(item.label, currentDay) && !params.hasOwnProperty(item.label)) {
                  params[item.label] = 0
                } 
              });
              tableData.push(params)
            })
          }
          // 外协
          if (item.epibolyListVOList) {
            let result: any = {
              editable: false,
              id: item.id,
              type: 2,
            };
            dateOptions.forEach((item: any) => {
              if(!result[item.label]) {
                result[item.label] = 0
              } 
            });
            item.epibolyListVOList?.forEach((v: any) => {
              v.manMonthEpibolyDateVOS?.forEach((subItem: any) => {
                  if (result[subItem.forecastDate]) {
                      result[subItem.forecastDate] += subItem.manHour;
                  } else {
                      result[subItem.forecastDate] = subItem.manHour;
                  }
              });
            });
            // 外协员工历史数据
            item.manMonthHistoryVOList?.forEach((v: any) => {
              if (v.personnelType == '外协员工') {
                result.id = v.id
                result.personnelTypeNo = '外协员工'
                result = {...result,...getTimeClounms(v.manMonthHistoryDateVOS, 'history')}
              }
            })
            item.epibolyListVOList && tableData.push({
              departNameNo: item.departName || '-',
              departId: item.departId,
              personnelType: '外协员工',
              personnelTypeNo: '外协员工',
              totalManHour: item.epibolyManHour || 0,
              editable: true,
              ...result
            })
            dateOptions.forEach((item: any) => {
              if(!compareChineseDate(item.label, currentDay)) {
                result[item.label] = 0
              } 
            });
            item.epibolyListVOList?.forEach((v: any, indx: any) => {
              let params = {
                departNameNo: item.departName || '-',
                departId: item.departId,
                totalManHour: v.manHour || 0,
                roleName:v.roleName,
                personnelTypeNo: '外协员工',
                type: 3,
                averagePay:v.averagePay,
                id: v.id,
                editable: true,
                ...getTimeClounms(v.manMonthEpibolyDateVOS, 'after')
              }
              dateOptions.forEach((item: any) => {
                if(!compareChineseDate(item.label, currentDay) && !params.hasOwnProperty(item.label)) {
                  params[item.label] = 0
                } 
              });
              tableData.push(params)
            })
          }
         
         
        })
        historyDataEdit = tableData
        setHistoryData(historyDataEdit)
        console.log(historyDataEdit)
        setLoading(false)
        getHistoryColumns()
      })
    }
    function compareChineseDate(dateStr1: any, dateStr2: any) {
      var date1 = new Date(dateStr1.replace(/年/g, '-').replace(/月/g, '-'));
      var date2 = new Date(dateStr2.replace(/年/g, '-').replace(/月/g, '-'));
      return date1 < date2
    }
    function getTimeClounms(v, type) {
      let newArr = v?.map((m: any) => {
        let obj: any = {};
        if (type == 'after') {
          obj[m.forecastDate] = m.manHour;
        } else {
          obj[m.historyMonth] = m.manMonth || 0;
        }
        return obj;
      }).reduce((acc: any, val: any) => {
        return {...acc, ...val};
      }, {});;
      return newArr
    }
    function getMonthsBetweenDates(startDate: any, endDate: any) {
      var start = new Date(startDate);
      var end = new Date(endDate);
      var months = [];
      while (start <= end) {
          var month = start.getFullYear() + '年' + ('0' + (start.getMonth() + 1)).slice(-2) + '月' ;
          months.push({
            title: month,
            dataIndex: month,
            type: 'date',
            width: 150,
            editable: true,
          });
          start.setMonth(start.getMonth() + 1);
      }
      return months;
  }
    // 过滤角色list
    function filterRoleList() {
      getRoleList().then((res: any) => {
        if (res.code === 200) {
          let list: any = []
          res.data.map((item: any) => {
            list.push({
              label: item.roleName,
              value: item.id,
            })
          })
          setRoleList(list)
        }
      })
    }
    // 历史Columns
    async function getHistoryColumns() {
      const values = await monthForm.validateFields();
      const columns: any = [
        {
          title: '实施部门',
          dataIndex: 'departName',
          width: 100,
          editable: true,
          // render: (text: any) => {
          //   return (
          //     <span>{text}</span>
          //   )
          // },
          render: (text: any, record: any, index: any) => {
            if (record.departName) {
              // 第二行合并单元格
              return {
                children: text,
                props: { colSpan: 4 },
              };
            }
            return text;
          },
        },
        {
          title: '人员类型',
          dataIndex: 'personnelType',
          width: 70,
          editable: true,
          render: (text: any, record: any, index: any) => {
            if (record.departName) {
              // 第二行合并单元格
              return {
                children: text,
                props: { colSpan: 0 },
              };
            } else if (record.personnelType) {
              return {
                children: text,
                props: { colSpan: 3 },
              };
            }
            return text;
          },
        },
        {
          title: '角色',
          dataIndex: 'roleName',
          width: 75,
          editable: true,
          render: (text: any, record: any, index: any) => {
            if (record.departName || record.personnelType) {
              // 第二行合并单元格
              return {
                children: text,
                props: { colSpan: 0 },
              };
            } 
            return <div style={{ textAlign: 'center'}}>{text}</div> ;
          },
        },
        {
          title: '平均薪酬系数/平均薪酬',
          dataIndex: 'averagePay',
          width: 100,
          editable: true,
          render: (_: any, record: any) => {
            return (
             <>
              { (record.personnelTypeNo == '外协员工' && _ < 5) || (record.personnelTypeNo == '公司员工' && _ > 5) ? 
              <div style={{color: 'red', textAlign: 'center'}} >
                {_}
              </div> : 
              <div style={{color: 'red', textAlign: 'center'}}>
                {_}
              </div> 
            }
             </>
            )
          },
        },
        {
          title: '总工数（人月）',
          dataIndex: 'totalManHour',
          width: 100,
          render: (_: any, record: any) => {
            return (
              <div className={record.departName ? 'departName-cell-left' : 'totalManHour-cell'} >
                {_}
              </div>
            )
          },
        },
        // ...getMonthsBetweenDates(props.form.getFieldValue('projectStartTime'), props.form.getFieldValue('projectEndTime'))
      ]
      let newColumns: any
      dateOptions.forEach((item: any, index: number) => {
        // if (new Date(item.value).getTime() >= Now) {
          columns.push({
            title: item.value,
            dataIndex: item.value,
            key: index,
            width: 100,
            editable: true,
          })
          if (index == dateOptions.length - 1) {
            columns.push({
              title: '操作',
              dataIndex: 'operation',
              width: 100,
              fixed: 'right',
              render: (_: any, record: any) => {
                if (props.menuType === 'viewProject' || !list.includes('deleteHour')) {
                  return ''
                } else {
                  return (
                    <Space className='del-cell'>
                      <Popconfirm
                        title='系统提示'
                        description='确认要删除吗?'
                        onConfirm={() => { confirmDel(record, 'history') }}
                        okText='确认'
                        cancelText='取消'
                      >
                        <Button type='link'>删除</Button>
                      </Popconfirm>
                    </Space >
                  )
                }
              },
            })
          }
        // }
      })
      newColumns = columns
      setHistoryColumns(newColumns)
    }
    // 历史月份选择
    async function manMonthChange(e: string) {
      setLoading(true)
      getHistoryColumns()
      initData()
    }
    // 删除
    function confirmDel(record: any, type: string) {
      setLoading(true)
      let params = {
        "departName": record.departNameNo,
        "personnelType": record.personnelTypeNo,
        "projectLedgerId": Number(id),
        "staffId": Number(record.id),
        "type": record.id ? 3 : record.departName ? 1 : 2
      }
      delManMonthHistory(params).then(res => {
        message.success('删除成功')
        setLoading(false)
        initData()
      }).catch(error => {
        setLoading(false)
    });
    }
    // 新增
    function add() {
      importForm.resetFields()
      setIsAddModalOpen(true)
    }
    // 前端输入暂存
    function handleSave(row: any, values: any, type: string) {
      let newData
      if (type === 'history') {
        newData = [...historyData];
        for (let i in row.manMonthList) {
          if (Object.keys(values)[0] === row.manMonthList[i].historyMonth) {
            row.manHour = row.manHour - row.manMonthList[i].manMonth + values[Object.keys(values)[0]]
            row.manMonthList[i].manMonth = values[Object.keys(values)[0]]
            break
          }
        }
      } else if (type === 'formal') {
        newData = [...formalData];
        for (let i in row.manMonthList) {
          if (Object.keys(values)[0] === row.manMonthList[i].forecastDate) {
            row.manHour = row.manHour - row.manMonthList[i].manHour + values[Object.keys(values)[0]]
            row.manMonthList[i].manHour = values[Object.keys(values)[0]]
            break
          }
        }
      } else {
        newData = [...epibolyData];
        for (let i in row.manMonthList) {
          if (Object.keys(values)[0] === row.manMonthList[i].forecastDate) {
            row.manHour = row.manHour - row.manMonthList[i].manHour + values[Object.keys(values)[0]]
            row.manMonthList[i].manHour = values[Object.keys(values)[0]]
            break
          }
        }
      }
      const index = newData.findIndex((item) => row.key === item.key);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      if (type === 'history') {
        setHistoryData(newData);
      } else if (type === 'formal') {
        setFormalData(newData);
      } else {
        setEpibolyData(newData);
      }
    };
    // 更新
    function handleSubmit(row: any, values: any, type: string) {
      const depart = row.departName
      if (depart.value) {
        row.departName = depart.label || depart
        row.departId = depart.value || ''
      }
      handleSave(row, values, type)
      if (type === 'history') {
        for (let i in row.manMonthList) {
          if (Object.keys(values)[0] === row.manMonthList[i].historyMonth) {
            row.manHour = row.manHour - row.manMonthList[i].manMonth + values[Object.keys(values)[0]]
            row.manMonthList[i].manMonth = values[Object.keys(values)[0]]
            break
          }
        }
      } else if (type === 'formal') {
        for (let i in row.manMonthList) {
          if (Object.keys(values)[0] === row.manMonthList[i].forecastDate) {
            row.manHour = row.manHour - row.manMonthList[i].manHour + values[Object.keys(values)[0]]
            row.manMonthList[i].manHour = values[Object.keys(values)[0]]
            break
          }
        }
      } else {
        for (let i in row.manMonthList) {
          if (Object.keys(values)[0] === row.manMonthList[i].forecastDate) {
            row.manHour = row.manHour - row.manMonthList[i].manHour + values[Object.keys(values)[0]]
            row.manMonthList[i].manHour = values[Object.keys(values)[0]]
            break
          }
        }
      }
      // setLoading(true)
      // return 
      if (type === 'history') {
        updateManMonthHistory({
          id: row.id,
          personnelType: row.personnelType,
          departName: row.departName,
          departId: row.departId,
          updateManMonthHistoryDateFormList: row.manMonthList,
        }).then(res => {
          message.success('保存成功')
          initData()
        })
      } else if (type === 'formal') {
        updateManMonthFormal({
          id: row.id,
          personnelType: row.personnelType,
          departName: row.departName,
          departId: row.departId,
          manMonthForms: row.manMonthList,
          averagePay: row.averagePay,
          roleName: row.roleName === '-' ? null : row.roleName
        }).then(res => {
          message.success('保存成功')
          initData()
        })
      } else {
        updateManMonthEpiboly({
          id: row.id,
          personnelType: row.personnelType,
          departName: row.departName,
          departId: row.departId,
          manMonthForms: row.manMonthList,
          averagePay: row.averagePay,
          roleName: row.roleName === '-' ? null : row.roleName
        }).then(res => {
          message.success('保存成功')
          initData()
        })
      }
    }
    // 导出excel
    function doDownLoad(download: any, name: any) {
      downloadFile(
        download,
        { projectLedgerId: id },
        name + '.xlsx'
      );
    }
    // 模板下载
    function doDownLoadTemplate(download: any, name: any) {
      downloadFile(
        download,
        { id },
        name + '.xlsx'
      );
    }
    // open
    function handleOpen(type: string) {
      setFilePath(null)
      importForm.resetFields()
      setTableType(type)
      setIsModalOpen(true);
    }
    // handleOk
    async function handleOk() {
      const file = new FormData();
      file.append('file', filePath)
      file.append('projectLedgerId', id)
      setIsModalOpen(false)
      if (tableType === 'history') {
        await importManMonthHistory(file)
      } else if (tableType === 'formal') {
        await importManMonthPm(file)
      } else {
        await importManMonthEpiboly(file)
      }
      message.success('导入成功')
      initData()
      setFilePath(null)
    }
    async function handleAddOk() {
      const values = await addForm.validateFields();
      // if ((values.personnelType == '公司员工' && values.salary < 5) || (values.personnelType == '外协员工' && values.salary > 5)  ) {
      //   message.error('平均薪资系数/薪酬需要符合规则（公司员工不小于5，外协员工不大于5）')
      //   return
      // }
      let params = {
        ...values,
        departName: findItem(departmentOptions, values.departId),
        projectLedgerId: id,
      }
      addDepartOrPersonnel(params).then(payload => {
        const { data } = payload
        message.success('添加成功')
        handleAddCancel()
        initData()
      })
    }
    function handleCancel() {
      setIsModalOpen(false);
    }
    function handleAddCancel() {
      addForm.resetFields()
      setIsAddModalOpen(false);
    }
    const clearStyle = (item:any) => {
      item.hasAttribute('data-brush') && item.removeAttribute('data-brush');
      item.hasAttribute('brush-border-top') && item.removeAttribute('brush-border-top');
      item.hasAttribute('brush-border-right') && item.removeAttribute('brush-border-right');
      item.hasAttribute('brush-border-left') && item.removeAttribute('brush-border-left');
      item.hasAttribute('brush-border-bottom') && item.removeAttribute('brush-border-bottom');
    };
    const renderNodes = (coordinates: any) => {
      const nodes = document.querySelectorAll('.ant-table-cell');
      nodes.forEach((item) => {
        const target = item?.getBoundingClientRect();
        clearStyle(item);
        if (
          target?.top >= coordinates.top &&
          target?.right <= coordinates.right &&
          target?.left >= coordinates.left &&
          target?.bottom <= coordinates.bottom
        ) {
          item.setAttribute('data-brush', 'true');
  
          if (target.top === coordinates.top) {
            item.setAttribute('brush-border-top', 'true');
          }
          if (target.right === coordinates.right) {
            item.setAttribute('brush-border-right', 'true');
          }
          if (target.left === coordinates.left) {
            item.setAttribute('brush-border-left', 'true');
          }
          if (target.bottom === coordinates.bottom) {
            item.setAttribute('brush-border-bottom', 'true');
          }
        }
      });
    };
    function onRow(record: any, i) {
      return {
        onClick: (event: any) => {
          activeRow = i
          // handleCopyTable(event)
        },
        onMouseDown: (event:any) => {
          const rect = event.target.getBoundingClientRect();
          // funsion 判断点击是否为表头元素，为否时才继续后面的逻辑。antd 不需要判断，因为点击表头不会触发该事件
          const isHeaderNode = event.target?.parentNode?.getAttribute('class')?.indexOf('next-table-header-node') > -1;
          if (isHeaderNode) return;
      
          originDir = {
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
          };
          // 渲染
          renderNodes(originDir);
        },
        onMouseMove: (event:any) => {
          if (!originDir.top) return;
          const rect = event.target.getBoundingClientRect();
        
          let coordinates = {};
        
          // 鼠标按下后往右下方拖动
          if (
            rect.top <= originDir.top &&
            rect.left <= originDir.left &&
            rect.right <= originDir.left &&
            rect.bottom <= originDir.top
          ) {
            coordinates = {
              top: rect.top,
              left: rect.left,
              right: originDir.right,
              bottom: originDir.bottom,
            };
          }
        
          // 鼠标按下后往左下方拖动
          if (
            rect.top >= originDir.top &&
            rect.left <= originDir.left &&
            rect.right <= originDir.right &&
            rect.bottom >= originDir.bottom
          ) {
            coordinates = {
              top: originDir.top,
              left: rect.left,
              right: originDir.right,
              bottom: rect.bottom,
            };
          }
          
          
        // 鼠标按下后往右上方拖动
           if (
            rect.top <= originDir.top &&
            rect.left >= originDir.left &&
            rect.right >= originDir.right &&
            rect.bottom <= originDir.bottom
            ) {
             coordinates = {
                top: rect.top,
                left: originDir.left,
                right: rect.right,
                bottom: originDir.bottom,
            };
        }
        
          // 鼠标按下后往左上方拖动
          if (
            rect.top >= originDir.top &&
            rect.left >= originDir.left &&
            rect.right >= originDir.right &&
            rect.bottom >= originDir.bottom
          ) {
            coordinates = {
              top: originDir.top,
              left: originDir.left,
              right: rect.right,
              bottom: rect.bottom,
            };
          }
        // console.log(123)
          renderNodes(coordinates);
        },
        onMouseUp: (event:any) => {
          originDir = {};
        },
      };
    };
   
    return (
      <div>
        <Row style={{height: 45}}>
          <Col span={16}>
            <h3 style={{margin : '5px 0 0'}}>人月滚动预测-{props.form.getFieldValue('projectName')}</h3>
          </Col>
          <Col span={8}>
            <Form form={monthForm} component={false} labelCol={{ span: 14 }}>
              <Form.Item name='month' label='请需要查看的历史月份选择：'>
                <Select
                  style={{ width: '100%' }}
                  onChange={manMonthChange}
                  allowClear
                  placeholder="请选择历史月份"
                  options={dateOptions}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
        <Divider style={{margin: '0 0 10px'}}/>
        {/* 历史数据 */}
        {
         props.menuType === 'viewProject' ? '' : <Row style={{ marginBottom: 16 }}>
         <Col span={12}>
          {
            list.includes('addHour') ? 
            <Button onClick={() => { add() }} type='primary' style={{ marginRight: '20px' }}>
              添加
            </Button> : null
          }
          {
            list.includes('exportHour') ? 
            <Button onClick={() => { doDownLoad(manMonthHistoryDownload, '人月滚动预测历史数据') }} style={{ marginRight: '20px' }}>
              导出excel
            </Button> : null
          }
          {
            list.includes('importHour') ? 
            <Button onClick={() => { handleOpen('history') }}>导入Excel</Button> : null
          }
         </Col>
         {/* <Col span={12} style={{ textAlign: 'right', color: 'red' }}>Tips：点击表格内容即可进行编辑修改</Col> */}
       </Row>
        }
        
        <Table
          style={{ userSelect: 'none'}}
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          size="small"
          onRow={onRow}
          dataSource={historyData}
          columns={columnsHistory}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={false}
        />
        <Button id="myButton" style={{ display: 'none'}}   onClick={getClipboardContent}>Click Me</Button>

        <Divider />
        <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} cancelText="取消" okText='确定'>
          <Form form={importForm} component={false}>
            <Form.Item name='template' label='模板：'>
              {
                tableType === 'history' ?
                  <Button type="link" onClick={() => { doDownLoadTemplate(manMonthHistoryTemplate, '人月滚动预测历史数据模板') }}>人月滚动预测历史数据模板</Button>
                  : null
              }
              {
                <Button type="link" onClick={() => { doDownLoadTemplate(manMonthFormalTemplate, '人月滚动预测公司员工模板') }}>人月滚动预测公司员工模板</Button>
              }
              {
                tableType === 'epiboly' ?
                  <Button type="link" onClick={() => { doDownLoadTemplate(manMonthEpibolyTemplate, '人月滚动预测外协员工模板') }}>人月滚动预测外协员工模板</Button>
                  : null
              }
            </Form.Item>
            <Form.Item name='file' label='上传文件：'>
              <Upload {...uploadProps}>
                <Button>{filePath ? '重新上传' : '上传'}</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
        <Modal open={isAddModalOpen} onOk={handleAddOk} onCancel={handleAddCancel} title="添加明细" cancelText="取消" okText='确定'>
          <div style={{ margin: '20px' }}>
          <Form labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} form={addForm} component={false}>
            <Form.Item
              name='departId'
              label='实施部门:'
              rules={[
                {
                  required: true,
                  message: `不得为空`,
                },
              ]}
            >
              <Select
                style={{ width: '100%' }}
                showSearch
                filterOption={filterOption}
                options={departmentOptions}
              />
            </Form.Item>
            <Form.Item
              name='personnelType'
              label='人员类型:'
              required={true}
              rules={[
                {
                  validator: async (rule, value) => {
                    const salary = await addForm?.getFieldValue('salary');
                    if (value == undefined || value == '') {
                      throw new Error('不得为空');
                    }
                    if (salary != undefined && salary != '') {
                      if ((value == '公司员工' && salary > 5) || (value == '外协员工' && salary < 5)  ) {
                        throw new Error('平均薪资系数/薪酬需要符合规则（公司员工不大于5，外协员工不小于5）');
                      }
                    }
                  },
                },
              ]}
            >
              <Select
                style={{ width: '100%' }}
                options={[
                  { value: '公司员工', label: '公司员工' },
                  { value: '外协员工', label: '外协员工' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name='roleValue'
              label='角色:'
              rules={[
                {
                  required: true,
                  message: `不得为空`,
                },
              ]}
            >
              <Select
                style={{ width: '100%' }}
                options={[
                  { value: '0', label: '项目' },
                  { value: '1', label: '研发' },
                  { value: '2', label: '测试' },
                  { value: '3', label: '其他' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name='salary'
              label='平均薪资系数/平均薪酬:'
              required={true}
              rules={[
                {
                  validator: async (rule, value) => {
                    const personnelType = await addForm?.getFieldValue('personnelType');
                    if (value == undefined || value == '') {
                      throw new Error('不得为空');
                    }
                    if ((personnelType == '公司员工' && value > 5) || (personnelType == '外协员工' && value < 5)  ) {
                      throw new Error('平均薪资系数/薪酬需要符合规则（公司员工不大于5，外协员工不小于5）');
                    }
                  },
                },
              ]}
            >
              <Input
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
          </div>
        </Modal>
      </div>
    );
});

export default PersonMonth;