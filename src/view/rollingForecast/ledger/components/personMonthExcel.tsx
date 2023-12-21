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
// import Luckysheet from 'luckysheet'
let departmentOptions: any = []
let roleOptions: any = []
let currentMonent: any = ''
let pageTypeOut: any = ''
let currentDay: any = ''
let historyDataEdit: any = []   // 前端缓存数据
let updateDate: any = []
let columnsNew: any = []
let sqrefs: any = ''

// let luckysheet: any = null
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
const personMonthExcel: React.FC<any> = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => {
      return {
        "handleSaveTime": function handleSaveTime() {
        //   var reg = /^\d{4}年\d{1,2}月$/;
        //   updateDate.forEach((item: any) => {
        //     item.departName = item.departNameNo
        //     item.personnelType = item.personnelTypeNo
        //     delete item.departNameNo
        //     delete item.personnelTypeNo
        //     let manMonthFormList: any = []
        //     Object.keys(item).forEach((v) => {
        //       if (reg.test(v)) {
        //         manMonthFormList.push({
        //           forecastDate: v,
        //           manHour: item[v]
        //         })
        //         delete item[v];
        //       }
        //     })
        //     item.manMonthFormList = manMonthFormList
        //   })
        //   editStaff({editManMonthStaffFormList: updateDate, projectLedgerId: id}).then(payload => {
        //     initData()
        //     updateDate = []
        //     message.success('修改成功')
        // })
        debugger
        let b = luckysheet.getluckysheetfile()[0]
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
    roleOptions = roleList
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
      function replaceObject(array: any, Obj: any) {
        return array.map(obj => {
            let keys = Object.keys(obj);
            let ObjKeys = Object.keys(Obj);
            if (keys.length === ObjKeys.length && keys.every(key => ObjKeys.includes(key))) {
                return Obj;
            }
            return obj;
        });
      }
    
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
      const saveChangeParams = async (data: any, record: any, title: any) => {
        if (title == 'roleName') {
          setValue(data == '0' ? '项目' : data == '1' ? '研发' : data == '2' ? '测试' : '其他')
        } else if (title === 'averagePay') {
          if ((record.personnelTypeNo == '公司员工' && Number(data.target.value) < 5) || (record.personnelTypeNo == '外协员工' && Number(data.target.value) > 5)) {
            message.error('平均薪资系数/薪酬需要符合规则（公司员工不小于5，外协员工不大于5）')
            return
          } else {
            setValue(data.target.value)
          }
        } else {
          setValue(data.target ? data.target.value : data.label ? data.label : data)
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
      // 提交
      const submit = async () => {
        try {
          const values = await form.validateFields();
          await handleSubmit({ ...record, ...values }, values);
        } catch (errInfo) {
          console.log('Save failed:', errInfo);
        }
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
            <Form.Item
              style={{ margin: 0 }}
              name={dataIndex}
            >
              <Select
                ref={inputRef}
                options={departmentOptions}
                style={{ width: '100%' }}
                onChange={(($event) => changeDepartPersonnel($event, record, dataIndex)) }
              />
            </Form.Item>
          ) : (
            <div onClick={toggleEdit}>
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
                style={{ width: '100%' }}
                options={[
                  { value: '公司员工', label: '公司员工' },
                  { value: '外协员工', label: '外协员工' },
                ]}
                onChange={(($event) => changeDepartPersonnel($event, record, dataIndex)) }
              />
            </Form.Item>
          ) : (
            <div onClick={toggleEdit}>
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
            <div onClick={toggleEdit}>
              {children}
            </div>
          );
        } else if (!testData(dataIndex)) {
          childNode = editing ? (
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
          ) : (
            <div className='editable-cell-value-wrap' style={{ paddingRight: 24 }} onClick={toggleEdit}>
              {children}
            </div>
          );
        } else {
          // 历史数据
          if (compareChineseDate(dataIndex, currentDay)) {
            // 历史数据 赋值0
            if (!record.editable && !record[dataIndex]) {
              record[dataIndex] = 0
            }
            childNode = editing ? (
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
            ) : (
              <div className='editable-cell-value-wrap' style={{ paddingRight: 24 }} onClick={toggleEdit}>
                {children}
              </div>
            );
          } else {
            // 预测数据 赋值0
            if (record.editable) {
              if(!record[dataIndex] && !record.departName) {
                record[dataIndex] = 0
              }
            }
            childNode = editing && record.editable ? (
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
                  style={{ width: '100%'}}
                />
              </Form.Item>
            ) : (
              <div className='editable-cell-value-wrap' style={{ paddingRight: 24 }} onClick={toggleEdit}>
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
          handleSave: (row: any, values: any) => { handleSave(row, values, 'history') },
          handleSubmit: (row: any, values: any) => { handleSubmit(row, values, 'history') }
        }),
      };
    });
    const uploadProps: UploadProps = {
      beforeUpload: file => {
        setFilePath(file);
        return false
      },
      maxCount: 1,
      accept: ".xlsx,.xls",
    }
    function testData(dateStr1: any) {
      var reg = /^\d{4}年\d{1,2}月$/;
      return reg.test(dateStr1)
    }
    useEffect(() => {
      getCurrentDay()
      initData()
      let urlParams = new URL(window.location.href);
      setPageType(urlParams.searchParams.get('type') || '')
      filterRoleList()
      setTimeout(() => {
        getHistoryColumns()
      }, 1500)
    }, [])
    function initExcel() {
      let column = columnsNew.map((v: any, index:any) => {
        return {
          m: v.dataIndex,
          v: v.title,
          r: 0,
          c: index,
          bg: '#fff000'
        } 
      })
    
      let data = [column]
      historyDataEdit.forEach((v: any, index: any) => {
        let params: any = []
        column.forEach((item: any, i: any) => {
          if (v[item.m]) {
            if (testData(item.m)) {
              let color: any
              // 月份数据
              if (compareChineseDate(item.m, currentDay)) {
                // 历史数据
                if (v.departName) {
                  color = '#bbb'
                } else if (v.personnelType) {
                  color = '#fff'
                } else {
                  color = '#bbb'
                }
              } else {
                if (v.departName) {
                  color = '#bbb'
                } else if (v.personnelType) {
                  color = '#bbb'
                } else {
                  color = '#fff'
                }
              }
              if(color == '#fff') {
                let sqref = `$${convertDSTo26BS(item.c+1)}$${index+2}`
                sqrefs = sqrefs + (sqrefs ? ',' : '') + `${sqref}:${sqref}`
              }
              params.push({
                // ct: {
                //   fa: "0",
                //   t: "n" //格式类型为数字类型
                // },
                v: {
                  ct: {  
                    fa: "0",
                    t: "n" //格式类型为数字类型},
                  },
                  m: v[item.m],
                  v: v[item.m]
                },
                r: 1 + index,
                c: i,
                bg: color,
                // v: v[item.m],
                forecastDate: item.m,
                //m: v[item.m] || 0,
                ...v,
              })
            } else {
              if (item.m != "totalManHour") {
                let sqref = `$${convertDSTo26BS(item.c+1)}$${index+2}`
                sqrefs = sqrefs + (sqrefs ? ',' : '') + `${sqref}:${sqref}`
                params.push({
                  v: v[item.m],
                  m: v[item.m],
                  r: 1 + index,
                  column: item.m,
                  bg: '#ffffff',
                  ignore: false,
                  c: i,
                  ...v
                })
              } else {
                params.push({
                  v: v[item.m],
                  m: v[item.m],
                  r: 1 + index,
                  column: item.m,
                  bg: '#bbb',
                  ignore: false,
                  c: i,
                  ...v
                })
              }
            }
          } else {
            if (item.v == '操作') {
              params.push({
                v: '删除',
                m: '删除',
                r: 1 + index,
                c: i,
                fc: 'blue',
                ...v
              })
            } else {
              if (testData(item.m)) {
                let color: any
                // 月份数据
                if (compareChineseDate(item.m, currentDay)) {
                  // 历史数据
                  if (v.departName) {
                    color = '#bbb'
                  } else if (v.personnelType) {
                    color = '#fff'
                  } else {
                    color = '#bbb'
                  }
                } else {
                  if (v.departName) {
                    color = '#bbb'
                  } else if (v.personnelType) {
                    color = '#bbb'
                  } else {
                    color = '#fff'
                  }
                }
                if(color == '#fff') {
                  let sqref = `$${convertDSTo26BS(item.c+1)}$${index+2}`
                  sqrefs = sqrefs + (sqrefs ? ',' : '') + `${sqref}:${sqref}`
                }
                params.push({
                  v: {
                    ct: {  
                      fa: "0",
                      t: "n" //格式类型为数字类型},
                    },
                    m: v.departName ? '' : '0',
                    v: v.departName ? '' : '0',
                  },
                  //v: v.departName ? '' : '0',
                  r: 1 + index,
                  c: i,
                  bg: color,
                  forecastDate: item.m,
                  //ignore: v.departName ? true : false,
                  //m: v.departName ? '' : '0',
                  ...v
                })
              } else {
                params.push({
                  v: '',
                  m: '',
                  bg: '#bbb',
                  r: 1 + index,
                  column: item.m,
                  c: i,
                  //ignore: true,
                  ...v
                })
              }
            }
          }
        });
        data.push(params)
    
      });
      console.log(sqrefs) 
      let luckysheet = window.luckysheet
      luckysheet.create({
        showtoolbar: false, // 隐藏工具栏
        showinfobar: false, // 隐藏顶部信息栏
        sheetFormulaBar: false, // 是否显示公示栏
        showsheetbar: false, //隐藏sheet
        container: 'luckysheet', // 设定DOM容器的id
        title: 'Sheet', // 工作表的标题
        row: data.length,
        lang: 'zh', // 语言
        //TSR-Start
          cell: [
            { 
                "r": 1, 
                "c": 1, 
                "cp": {
                    "copy": function() {
                        return false;
                    }
                }
            }
        ],
        hook:{
          workbookCreateAfter: function(){
            luckysheet.setBothFrozen(false);
          },
          cellUpdateBefore: function(r: any, c: any, value: any, v: any){
            let a = luckysheet.getluckysheetfile()[0].data[r][c]
            let b = luckysheet.getluckysheetfile()[0]
            if (a.column && a.column !== "roleName") {
              debugger
              changeDepartOrPersonnel(a, value)
            }
          },
          rangePullBefore: function(r: any, c: any, value: any, isRefresh: any){
            if (c == 5) {
              return false
            }
          },
          cellMousedownBefore: function(cell: any, obj: any){
            if (obj.c == 0 && obj.r != 0) {
              var r = confirm("你确定要执行此操作吗？");
              if (r == true) {
                confirmDel(cell)
              } 
            }
          },
       
          // rangeEditAfter: function(obj: any){
          //   debugger

          //   if (obj.c == 5) {
          //     luckysheet.setCellValue(obj.r, obj.c, luckysheet.flowdata(), '11');
          //     luckysheet.jfrefreshgrid();
          //   }
          // },
        },
        data: [ // 数据
            {
            name: 'Sheet', // 表格名称
            data: data,
            "order": 0,
            //celldata: celldata,
            config: {
              authority: {
                  sheet: 1,//如果为1或true，则该工作表受到保护；如果为0或false，则该工作表不受保护。
                  hintText:"不可编辑", //弹窗提示的文字
                  filter: 1,
                  allowRangeList: [{
                      name: "Default0",
                      password: "",
                      hintText: "",
                      algorithmName: "None",
                      saltValue: null,
                      checkRangePasswordUrl: null,
                      // sqref: sqrefs
                      sqref: sqrefs
                  }]
              },
            },
          },
        ],
      });

      let dom = document.getElementById('luckysheet-bottom-controll-row') as HTMLElement
      dom.style.display = 'none'
      setTimeout(() =>{
        let param: any = {}
        column.forEach((v:any, index: number) => {
          param[index] = 150
        })
        luckysheet.setColumnWidth(param)
        let dataVerification = {
          "type": "dropdown",
          "type2": 'include',
          "value1": departmentOptions.map((v: any) => {
            return v.label
          }).toString(),
          // "value1": departmentOptions.map((v: any) => { 
          //   return { label: v.label, value: v.id } 
          // }),
          "value2": "",
          "checked": false,
          "remote": false,
          "prohibitInput": true,
          "hintShow": false,
          "hintText": ""
        };
        let dataVerificationType = {
          "type": "dropdown",
          "type2": 'include',
          "value1": "外协员工,公司员工",
          "value2": "",
          "checked": false,
          "remote": false,
          "prohibitInput": true,
          "hintShow": false,
          "hintText": ""
        };
        let dataVerificationRole = {
          "type": "dropdown",
          "type2": 'include',
          "value1": "项目,研发,测试,其他",
          "value2": "",
          "checked": false,
          "remote": false,
          "prohibitInput": true,
          "hintShow": false,
          "hintText": ""
        };
        let dataVerificationNum = {
          "type": "number",
          "type2": 'bw',
          "value1": "0",
          "value2": "9999999999999999999",
          "checked": false,
          "remote": false,
          "prohibitInput": true,
          "hintShow": false,
          "hintText": ""
        };
        luckysheet.getluckysheetfile().forEach((file: any,index: any)=>{
          if(file.data == undefined){
              return;
          }
          file.data.forEach((item: any, index: any) => {
            if (index == 0) {
              return;
            } else {
              item.forEach((v:any) => {
                luckysheet.setRangeShow({
                  "row": [v.r, v.r],
                  "column": [v.c, v.c]
                }, {
                  show: false
                });
                if (v.c == 0) {
                
                }
                // 实施部门
                if (v.c == 1 && v.m) {
                  luckysheet.setDataVerification(dataVerification);
                }
                // 人员类型
                if (v.c == 2 && v.m) {
                  luckysheet.setDataVerification(dataVerificationType);
                }
                // 角色
                if (v.c == 3 && v.m) {
                  luckysheet.setDataVerification(dataVerificationRole);
                }
                // 角色
                if (v.c > 3) {
                  luckysheet.setDataVerification(dataVerificationNum);
                }
              });
            }
          }) 
        })
        console.log(luckysheet.getluckysheetfile())
      }, 500)
      
    }
    function changeDepartOrPersonnel(data: any, newValue: any) {
      let params: any
      if (data.column == 'departName') {
        params = {
          departName: data.departName,
          newDepartId: data,
          // newDepartName: findItem(departmentOptions, data),
          newDepartName: newValue,
          projectLedgerId: id,
          type: 1
        }
      } else {
        params = {
          departName: data.departNameNo,
          newPersonnelType: newValue,
          oldPersonnelType: data.personnelType,
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
    function convertDSTo26BS(num: any) {
      let code = '';
      // 检验数字
      let reg = /^\d+$/g;
      if (!reg.test(num)) return code;
      // 利用余数倒序求转换结果
      while (num > 0) {
          let temp = num % 26;
          if (temp === 0) temp = 26;
          // 利用ASCII转换成英文
          code = String.fromCharCode(64 + parseInt(temp)) + code;
          num = (num - temp) / 26;
      }
      return code;
    }
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
        setLoading(false)
        getHistoryColumns()
        setTimeout(() => {
          initExcel()
        }, 500)
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
          title: '操作',
          dataIndex: 'operation',
          width: 100,
          fixed: 'left',
          render: (_: any, record: any) => {
            return (
              <Space>
                <Popconfirm
                  title='系统提示'
                  description='确认要删除吗?'
                  onConfirm={() => { confirmDel(record) }}
                  okText='确认'
                  cancelText='取消'
                >
                  <Button type='link'>删除</Button>
                </Popconfirm>
              </Space >
            )
          },
        },
        {
          title: '实施部门',
          dataIndex: 'departName',
          width: 150,
          editable: true
        },
        {
          title: '人员类型',
          dataIndex: 'personnelType',
          width: 100,
          editable: true
        },
        {
          title: '角色',
          dataIndex: 'roleName',
          width: 80,
          editable: true
        },
        {
          title: '平均薪酬系数/平均薪酬',
          dataIndex: 'averagePay',
          width: 150,
          editable: true,
          render: (_: any, record: any) => {
            return (
             <>
              { (record.personnelTypeNo == '外协员工' && _ > 5) || (record.personnelTypeNo == '公司员工' && _ < 5) ? 
              <div style={{color: 'red'}} >
                {_}
              </div> : 
              <div >
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
          width: 150,
        },
        // ...getMonthsBetweenDates(props.form.getFieldValue('projectStartTime'), props.form.getFieldValue('projectEndTime'))
      ]
      let newColumns: any
      if (values.month) {
        newColumns = columns.concat({
            title: values.month,
            dataIndex: values.month,
            width: 300,
            editable: true
        })
      } else {
        newColumns = columns.concat(getMonthsBetweenDates(props.form.getFieldValue('projectStartTime'), props.form.getFieldValue('projectEndTime')))
      }
      columnsNew = newColumns
      setHistoryColumns(newColumns)
     
    }
    // 历史月份选择
    async function manMonthChange(e: string) {
      setLoading(true)
      getHistoryColumns()
      initData()
    }
    // 删除
    function confirmDel(record: any) {
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
    // 
    function handleCancel() {
      setIsModalOpen(false);
    }
    function handleAddCancel() {
      addForm.resetFields()
      setIsAddModalOpen(false);
    }
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
        <Divider />
        {/* 历史数据 */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            {/* <span style={{ paddingRight: '20px' }}>历史数据（财务填写）</span> */}
            <Button onClick={() => { add() }} type='primary' style={{ marginRight: '20px' }}>
              添加
            </Button>
            <Button onClick={() => { doDownLoad(manMonthHistoryDownload, '人月滚动预测历史数据') }} style={{ marginRight: '20px' }}>
              导出excel
            </Button>
            <Button onClick={() => { handleOpen('history') }}>导入Excel</Button>
          </Col>
          {/* <Col span={12} style={{ textAlign: 'right', color: 'red' }}>Tips：点击表格内容即可进行编辑修改</Col> */}
        </Row>
        {/* <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={historyData}
          columns={columnsHistory}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={false}
        /> */}
        <div
          id="luckysheet"
          style={{ width: '100%', height: '500px' }}
          ></div>
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
                      if ((value == '公司员工' && salary < 5) || (value == '外协员工' && salary > 5)  ) {
                        throw new Error('平均薪资系数/薪酬需要符合规则（公司员工不小于5，外协员工不大于5）');
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
                    if ((personnelType == '公司员工' && value < 5) || (personnelType == '外协员工' && value > 5)  ) {
                      throw new Error('平均薪资系数/薪酬需要符合规则（公司员工不小于5，外协员工不大于5）');
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

export default personMonthExcel;