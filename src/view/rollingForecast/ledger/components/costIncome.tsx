import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Form, InputNumber, Select, Table, Input, Row, Col, Divider, message, Modal, Upload } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { UploadProps } from 'antd';
import {
  getCostIncomeHistory, updateCostIncomeHistory, importCostIncomeHistory, costIncomeHistoryTemplate, costIncomeHistoryDownload,
  getCostIncomeWrite, updateCostIncomeWrite, importCostIncomeWrite, costIncomeWriteTemplate, costIncomeWriteDownload, getProjectLedgerPage, importCostIncomePm, costIncomeWriteDown
} from "../../../../servers/api/ledger"
import { downloadFile } from '../../../../common/downLoad'
import './styles.css';
import './copy.css'
let departmentOptions: any = []
let editData: any = []
let updateDate: any = []
let currentDay: any = ''
let clipboardContent: any = ''
let activeCloumn: any = ''
let activeRow: any = ''
let catchData: any = []
let originDir: any = {}
let list: any = []
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

// 表格
const CostIncome: React.FC<any> = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => {
    return {
      "handleSave": function handleSave() {
        updateCostIncomeWrite(updateDate).then(payload => {
          initData()
          updateDate = []
          message.success('修改成功')
        })
      }
    } 
  }, []);
  const { id, dateOptions, departmentList, type } = props
  departmentOptions = departmentList
  const Now = new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`).getTime()
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // 弹窗
  const [filePath, setFilePath] = useState<any>(null);
  const [tableType, setTableType] = useState<string>('');
  const [monthForm] = Form.useForm()
  const [importForm] = Form.useForm()
  const [topDate, setTopDate] = useState<any>(null);
  const [form] = Form.useForm()
  // 历史
  const [historyData, setHistoryData] = useState<any>([]);
  // 预测
  const [writeColumns, setWriteColumns] = useState<any>([]);
  const [writeData, setWriteData] = useState<any>([]);
  catchData = writeData
  const { Item } = Form
  // 表单组件
  
  const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, handleSubmit, index, ...restProps }: any) => {
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
    const togglePase =  (data: any) => {
      activeCloumn = title
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
    // 提交
    const submit = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSubmit({ ...record, ...values }, values);
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };
 
    const handleKeyPress = (event: any) => {
      const pattern = /[0-9]/;
      const inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {
        event.preventDefault();
      }
    };

    const handleChange = (event: any) => {
      const value = event.target.value.replace(/[^\d]/g, ''); // 仅保留数字
    };
    const saveChangeParams = async (data: any, record: any, title: any) => {
      console.log(index, record, dataIndex)
      setEditing(!editing);
      editData = JSON.parse(JSON.stringify(writeData)) 
      editData[index][dataIndex] = data.target.value.replace(/[^0-9.]/g, '')
      setWriteData(editData)
      let p = record
      p[dataIndex] = Number(data.target.value.replace(/[^0-9.]/g, ''))
      if (updateDate && updateDate.findIndex((v: any) => v.forecastDate == title) !== -1) {
        updateDate[updateDate.findIndex((v: any) => v.forecastDate == title)][record.key] = data.target.value.replace(/[^0-9.]/g, '')
      } else {
        let params: any = {
          forecastDate: title,
          projectLedgerId: id,
          type: compareChineseDate(title, currentDay) ? 1 : 2
        }
        params[record.key] = Number(data.target.value.replace(/[^0-9.]/g, ''))
        updateDate.push(params)
      }
    }
    let childNode = children;
    if (record?.type == '人力成本') {
      if (JSON.parse(props.userInfo).roleName !== '财务') {
        return  <td {...restProps}> <span>{childNode}</span> </td>;
      }
      childNode = (editing && !compareChineseDate(currentDay, title)) ? (
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
          <InputNumber ref={inputRef} min={0}
            onPressEnter={submit}
            // onBlur={submit}
            // onInput={save}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onBlur={(($event) => saveChangeParams($event, record, dataIndex)) }
            style={{ width: "100%" }} />
        </Form.Item>
      ) : (
        <div className={!compareChineseDate(currentDay, title) ? 'can-editable' : 'editable-cell-value-wrap'} style={{ paddingRight: 24 }} onDoubleClick={toggleEdit}>
          {children || 0}
        </div>
        
      );
    }
    if (!record?.editable || props.menuType === 'viewProject') {
      return <td {...restProps}>{childNode}</td>;
    }
   
    if (editable && record.type !== '项目成本') {
      // 历史数据
      if (compareChineseDate(dataIndex, currentDay)) {
        if (JSON.parse(props.userInfo).roleName !== '财务') {
          return  <td {...restProps}> <span>{childNode}</span> </td>;
        }
      } else {
        if (JSON.parse(props.userInfo).roleName !== 'PM') {
          return  <td {...restProps}> <span>{childNode}</span> </td>;
        }
      }
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
          <InputNumber ref={inputRef} min={0}
            onPressEnter={submit}
            // onBlur={submit}
            // onInput={save}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onBlur={(($event) => saveChangeParams($event, record, dataIndex)) }
            style={{ width: "100%" }} />
        </Form.Item>
      ) : (
        <div className={record.editable ? 'can-editable' : 'editable-cell-value-wrap'} style={{ paddingRight: 24 }} onDoubleClick={toggleEdit}>
          {children || 0}
        </div>
       
      );
    }
    return <td {...restProps}>{childNode}</td>;

  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
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
  const formCol = [
    {
      span: 8,
      items: [
        { label: "实际收入：", name: "realIncome" },
        { label: "预测收入：", name: "forecastIncome" },
        { label: "人均收入（软件）：", name: "averageIncome" },
      ]
    },
    {
      span: 8,
      items: [
        { label: "实际成本：", name: "realCost" },
        { label: "预测成本：", name: "forecastCost" },
        { label: "人均成本（软件）：", name: "averageCost" },
      ]
    },
    {
      span: 8,
      items: [
        { label: "生命周期收入：", name: "totalIncome" },
        { label: "生命周期成本：", name: "totalCost" },
      ]
    },
  ]
  const columnsWrite = writeColumns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any, index: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        index: index,
        handleSave: (row: any, values: any) => { handleSave(row, values, 'write') },
        handleSubmit: (row: any, values: any) => { handleSubmit(row, values, 'write') },
        onClick:(row: any, values: any)=>pasteInfo(row,record,col)
      }),
    };
  });
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
  let handleCopyTable = (event: any) => {
    eventNode=event
    // console.log(eventNode)
  }
  const pasteInfo=(row:any,record:any,col:any)=>{
    activeCloumn = col.dataIndex
    let elt=row.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
    let elt1=row.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
    let rowFlag=Number([].indexOf.call(elt1.parentNode.querySelectorAll(elt1.tagName),elt1))-1
    let colFlag=Number([].indexOf.call(elt.parentNode.querySelectorAll(elt.tagName),elt))+1
    // let rowFlag=4
    // let colFlag=6
    console.log('行坐标：'+rowFlag,'列坐标：'+colFlag)
    navigator.clipboard.readText()
    .then(data => {
      //首先对源头进行解析
      if (data && !data.includes('\r\n')) { // 单独复制文本，不是复制单个单元格
        data = data + '\r\n';
      }
      let rowStrArray = data.split('\r\n'); //拆成多行
      let rows = [];
      for (let i = 0; i < rowStrArray.length - 1; i++) {
        let row = [];
        let tdStrArray = rowStrArray[i].split('\t'); //按列拆分
        for (let j = 0; j < tdStrArray.length; j++) {
          row.push(Number(tdStrArray[j]) || 333);
        }
        rows.push(row);
      }
      console.log(rows)
      // let lis = ['2024年02月', '2024年03月', '2024年04月', '2024年05月'];
      let lis=Object.keys(editData[1])
      let notPaste = ['jg', 'gz', 'xz']
      // 赋值
      for (let j = 0; j < rows.length; j++) {
        if (rowFlag + j > editData.length - 1) { // 超出行不粘贴
          break;
        }
        let rowInfo = editData[rowFlag + j]
        for (let k=0; k<rows[j].length; k++){
          let key = lis[k+colFlag]
          if (notPaste.indexOf(key)===-1){
            rowInfo[key] = rows[j][k]
          }
        }
      }
      let tData=editData;
      let newData=JSON.parse(JSON.stringify(tData))
    //  console.log('复制1')
      // console.log(newData)
      setWriteData(newData)
    })
    .catch(err => {
      console.error('无法获取剪切板内容:', err);
    });
  };
  function onRow(record: any, i) {
    return {
      onClick: () => {
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
  const handleClick = () => {
    // navigator.clipboard.readText()
    clipboard.readText()
    .then(text => {
      clipboardContent = text
      console.log(activeCloumn, activeRow)
      setTimeout(() => {
        console.log(catchData)
        const rows = clipboardContent.replaceAll('\r', '').split('\n').filter((v: any) => v !== '\t');
          rows.forEach((item: any, index: any) => {
            console.log(item)
            if (item.includes('\t')) {
              console.log('up')
              let row = item.split('\t').filter((v: any) => v !== '');
              row.forEach((v: any, i: any) => {
                let data = dateOptions[dateOptions.findIndex((v: any) => v.label == activeCloumn) + i]?.label
                if (isNumber(v.replaceAll('\"', '')) && v.replaceAll('\"', '') !== '' && catchData[activeRow+index].editable) {
                  if ((!compareChineseDate(data, currentDay) && catchData[activeRow+index].type == '人力成本')) {
                    return
                  } else {
                    catchData[activeRow+index][data] = Number(v.replaceAll('\"', ''))
                    let p = JSON.parse(JSON.stringify(catchData[activeRow+index])) 
                    p[data] = Number(v.replaceAll('\"', ''))
                    if (updateDate && updateDate.findIndex((v: any) => v.forecastDate == data) !== -1) {
                      updateDate[updateDate.findIndex((v: any) => v.forecastDate == data)][catchData[activeRow+index].key] = v
                    } else {
                      let params: any = {
                        forecastDate: data,
                        projectLedgerId: id,
                        type: compareChineseDate(data, currentDay) ? 1 : 2
                      }
                      params[catchData[activeRow+index].key] = Number(v.replaceAll('\"', ''))
                      updateDate.push(params)
                    }
                  }
                }
              });
            } else {
              let data = dateOptions[dateOptions.findIndex((v: any) => v.label == activeCloumn) + index]?.label
              try {
                if (isNumber(item.replaceAll('\"', '')) && item.replaceAll('\"', '') !== '' && catchData[activeRow+index].editable) {
                  if ((!compareChineseDate(data, currentDay) && catchData[activeRow+index].type == '人力成本')) {
                    return
                  } else {
                    catchData[activeRow][data] = Number(item.replaceAll('\"', ''))
                    let p = JSON.parse(JSON.stringify(catchData[activeRow+index])) 
                    p[data] = Number(item.replaceAll('\"', ''))
                    if (updateDate && updateDate.findIndex((v: any) => v.forecastDate == data) !== -1) {
                      updateDate[updateDate.findIndex((v: any) => v.forecastDate == data)][catchData[activeRow+index].key] = item
                    } else {
                      let params: any = {
                        forecastDate: data,
                        projectLedgerId: id,
                        type: compareChineseDate(data, currentDay) ? 1 : 2
                      }
                      params[catchData[activeRow+index].key] = Number(item.replaceAll('\"', ''))
                      updateDate.push(params)
                    }
                  }
                }
              } catch (e) {
              }
            }
          })
          setWriteData(JSON.parse(JSON.stringify(catchData)))
      }, 200)
    })
    .catch(err => {
      alert('无法读取剪贴板数据：', err);
    });
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
  function compareChineseDate(dateStr1: any, dateStr2: any) {
    var date1 = new Date(dateStr1.replace(/年/g, '-').replace(/月/g, '-'));
    var date2 = new Date(dateStr2.replace(/年/g, '-').replace(/月/g, '-'));
    return date1 < date2
  }
  function getClipboardContent() {
    handleClick()
  }
  useEffect(() => {
    // document.addEventListener('paste', function(e) {
    //   // 在这里处理粘贴的内容
    //   getClipboardContent()
    // });
    list = JSON.parse(localStorage.getItem('roleList') || "{}")
    initData()
    getCurrentDay()
    window.addEventListener('keydown', ()=>{
      //ctrl+c
      if(window.event.ctrlKey &&window.event.keyCode === 67){
        handleCopy()
        // getClipboardContent();
      }
      //ctrl+v
      if(window.event.ctrlKey &&window.event.keyCode === 86){
        handleClick()
      }
    }); // 添加全局事件
    return () => {
      window.removeEventListener('keydown', ()=>{
        console.log('监听键盘销毁')
      }); // 销毁
    };
 
  }, [])
   // 线上复制到线下
   let handleCopy = () => {
    const copyableElements = document.querySelectorAll('[data-brush=true]');
    let arrCopy: any = []
    copyableElements.forEach((element, index) => {
      arrCopy.push({ 'val': element.childNodes.length ? (element.childNodes[0].nodeValue || element.childNodes[0].innerHTML) : element.innerHTML, 'height': element.getBoundingClientRect().top })
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
  function getCurrentDay() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 月份是从 0 到 11 表示的，所以我们要加 1
    currentDay = currentYear + '年' + currentMonth + '月'
  }
  async function initData() {
    setLoading(true)
    const values = await monthForm.validateFields();
    getCostIncomeWrite({ projectLedgerId: id, historyMonth: values.month }).then(payload => {
      const { data } = payload
      let tableData: any =  [
        {
          type: '项目收入',
          key: '0',
        },{
          type: '软件收入',
          key: '1',
          indentation: true
        },{
          type: '硬件收入',
          key: '2',
          indentation: true
        }, {
          type: '软件许可收入',
          key: '3',
          indentation: true
        }, {
          type: '项目成本',
          key: '4'
        }, {
          type: '软件成本',
          key: '5',
          indentation: true
        }, {
          type: '人力成本',
          key: '8',
          indentation: true
        }, {
          type: '其他成本',
          key: '9',
          indentation: true
        }, {
          type: '硬件成本',
          key: '6',
          indentation: true
        }, {
          type: '软件许可成本',
          key: '7',
          indentation: true
        }
        , {
          type: '毛利',
          key: '10'
        }
        , {
          type: '人月',
          key: '11'
        }
        , {
          type: '人均收入',
          key: '12'
        }
        , {
          type: '人均成本',
          key: '13'
        }
      ]
      data.softwareCostIncomeVOList.forEach((item: any, index: any) => {
        const monthKey = item.forecastDate
        tableData[0][monthKey] = item.projectIncome || 0
        tableData[0]['editable'] = false
        tableData[0].key = 'projectIncome'
        tableData[1][monthKey] = item.softwareRevenue || 0
        tableData[1]['editable'] = true
        tableData[1]['indentation'] = true
        tableData[1].key = 'softwareRevenue'
        tableData[2][monthKey] = item.hardwareRevenue || 0
        tableData[2]['editable'] = true
        tableData[2]['indentation'] = true
        tableData[2].key = 'hardwareRevenue'
        tableData[3][monthKey] = item.softwareLicenseRevenue || 0
        tableData[3]['editable'] = true
        tableData[3]['indentation'] = true
        tableData[3].key = 'softwareLicenseRevenue'
        tableData[4][monthKey] = item.projectCost || 0
        tableData[4]['editable'] = false
        tableData[4].key = 'projectCost'
        tableData[5][monthKey] = item.softwareCost || 0
        tableData[5]['editable'] = false
        tableData[5]['indentation'] = true
        tableData[5].key = 'softwareCost'
        tableData[6][monthKey] = item.manCost || 0
        tableData[6]['editable'] = false
        tableData[6].key = 'manCost'
        tableData[6]['third'] = true
        tableData[7][monthKey] = item.othersCost || 0
        tableData[7]['editable'] = true
        tableData[7].key = 'othersCost'
        tableData[7]['third'] = true
        tableData[8][monthKey] = item.hardwareCost || 0
        tableData[8]['editable'] = true
        tableData[8]['indentation'] = true
        tableData[8].key = 'hardwareCost'
        tableData[9][monthKey] = item.softwareLicenseCost || 0
        tableData[9]['editable'] = true
        tableData[9]['indentation'] = true
        tableData[9].key = 'softwareLicenseCost'
        tableData[10][monthKey] = item.profit || 0
        tableData[10]['editable'] = false
        tableData[10].key = 'profit'
        tableData[11][monthKey] = item.totalManMonth || 0
        tableData[11]['editable'] = false
        tableData[11].key = 'totalManMonth'
        tableData[12][monthKey] = item.averageIncome || 0
        tableData[12]['editable'] = false
        tableData[12].key = 'averageIncome'
        tableData[13][monthKey] = item.averageCost || 0
        tableData[13]['editable'] = false
        tableData[13].key = 'averageCost'
      })
      setTopDate(data.softwareStatisticsVO)
      form.setFieldsValue({
        averageCost: data.softwareStatisticsVO.averageCost,
        averageIncome: data.softwareStatisticsVO.averageIncome,
        forecastCost: data.softwareStatisticsVO.forecastCost,
        forecastIncome: data.softwareStatisticsVO.forecastIncome,
        realCost: data.softwareStatisticsVO.realCost,
        realIncome: data.softwareStatisticsVO.realIncome,
        totalCost: data.softwareStatisticsVO.totalCost,
        totalIncome: data.softwareStatisticsVO.totalIncome,
      })
      setWriteData(tableData)
      getWriteColumns()
      setLoading(false)
    })
  }
  async function getWriteColumns() {
    const values = await monthForm.validateFields();
    const columns: any = [{
      title: '',
      dataIndex: 'type',
      width: 150,
      fixed: 'left',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          record.third ? <div className='one-cell'  style={{ paddingLeft: '40px'}}>{_}</div> : record.indentation ? <div className='one-cell'  style={{ paddingLeft: '20px'}}>{_}</div> : <div className='one-cell'>{_}</div>
        )
      },
    },]
    let newColumns: any
    if (values.month) {
      newColumns = columns.concat({
          title: values.month,
          dataIndex: values.month,
          width: 300,
          editable: true
      })
    } else {
      newColumns = columns
      dateOptions.forEach((item: any, index: number) => {
        // if (new Date(item.value).getTime() >= Now) {
          newColumns.push({
            title: item.value,
            dataIndex: item.value,
            key: index,
            align: 'right',
            width: 150,
            editable: true,
          })
        // }
      })
    }
    setWriteColumns(newColumns)
  }
  // 历史月份选择
  async function manMonthChange(e: string) {
    setLoading(true)
    getWriteColumns()
    initData()
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
  function handleSave(row: any, values: any, type: string) {
    let newData
    if (type === 'history') {
      newData = [...historyData];
    } else {
      newData = [...writeData];
    }
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    const key = Object.keys(values)[0]
    newData[1][key] = newData[2][key] + newData[3][key] + newData[4][key]
    if (type === 'history') {
      setHistoryData(newData);
    } else {
      setWriteData(newData)
    }
  };
  function handleSubmit(row: any, values: any, type: string) {
    handleSave(row, values, type)
    const key = Object.keys(values)[0]
    let newData
    if (type === 'history') {
      newData = [...historyData];
    } else {
      newData = [...writeData];
    }
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    const params = {
      id: row[key + 'Id'],
      projectIncome: newData[0][key],
      softwareRevenue: newData[1][key],
      hardwareRevenue: newData[2][key],
      hardwareSales: newData[3][key],
      hardwareUnitPrice: newData[4][key],
      manCost: newData[6][key],
      hardwareCost: newData[7][key],
      othersCost: newData[8][key],
    }
    if (type === 'history') {
      updateCostIncomeHistory(params).then(res => {
        message.success('保存成功')
        initData()
      })
    } else {
      updateCostIncomeWrite(params).then(res => {
        message.success('保存成功')
        initData()
      })
    }
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
      await importCostIncomePm(file)
    } else {
      // 财务
      await importCostIncomeWrite(file)
    }
    message.success('导入成功')
    initData()
    setFilePath(null)
  }
  // 
  function handleCancel() {
    setIsModalOpen(false);
  }
  return (
    <div>
      {/* <Row>
        <Col span={16}>
          <h3>成本/收入滚动预测-财务FC填写</h3>
        </Col>
        <Col span={8}>
          <Form form={monthForm} component={false} labelCol={{ span: 10 }}>
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
      <Row style={{ marginBottom: 16 }}>
        <Col span={12}>
          <span style={{ paddingRight: '20px' }}>历史数据</span>
          <Button onClick={() => { doDownLoad(costIncomeHistoryDownload, '成本/收入历史数据') }} style={{ marginRight: '20px' }}>
            导出excel
          </Button>
          <Button onClick={() => { handleOpen('history') }}>导入Excel</Button>
        </Col>
        <Col span={12} style={{ textAlign: 'right', color: 'red' }}>Tips：点击表格内容即可进行编辑修改</Col>
      </Row>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={historyData}
        columns={columns}
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={false}
      />
      <Divider /> */}
      <Row style={{height: 45}}>
        <Col span={16}>
          <h3 style={{margin: '5px 0 0'}}>成本/收入滚动预测-软件-{props.form.getFieldValue('projectName')}</h3>
        </Col>
          {/* <Button type='primary'>同步看板最新数据</Button> */}
        <Col span={8}>
          <Form form={monthForm} component={false} labelCol={{ span: 14 }}  >
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
      <Form labelAlign="right" labelWrap={true} form={form} labelCol={{ span: 10 }} size='small'>
        <Row gutter={10} >
          {
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
                          <Input bordered={false} readOnly />
                        </Item>
                      )
                    })
                  }
                </Col>
              )
            })
          }

        </Row>
      </Form>
      <Divider style={{margin: 0}} />
      {
        props.menuType === 'viewProject' ? '' :  <Row style={{ marginBottom: 10, marginTop: 20 }}>
        <Col span={12}>
          {/* <span style={{ paddingRight: '20px' }}>预测填报</span> */}
          {
            list.includes('exportSoftCost') ? <Button onClick={() => { doDownLoad(costIncomeWriteDown, '成本/收入预测数据') }} style={{ marginRight: '20px' }}>
              导出excel
            </Button> : null
          }
          {
            list.includes('importSoftCost') ?  <Button onClick={() => { handleOpen('write') }}>导入Excel</Button> : null
          }
         
        </Col>
        <Col span={12} style={{ textAlign: 'right', color: 'red' }}>Tips：点击表格内容即可进行编辑修改</Col>
      </Row>
      }
    
      <Table
        components={components}
        style={{ userSelect: 'none'}}
        rowClassName={() => 'editable-row'}
        bordered
        onRow={onRow}
        dataSource={writeData}
        columns={columnsWrite}
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={false}
      />
      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} cancelText="取消" okText='确定'>
        <Form form={importForm} component={false}>
          <Form.Item name='template' label='模板：'>
            {
              <Button type="link" onClick={() => { doDownLoadTemplate(costIncomeHistoryTemplate, '成本/收入历史导入模板') }}>成本/收入历史导入模板</Button>
            }
            {
              tableType === 'write' ?
                <Button type="link" onClick={() => { doDownLoadTemplate(costIncomeWriteTemplate, '成本/收入预测模板') }}>成本/收入预测模板</Button>
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
    </div>
  );
});

export default CostIncome;