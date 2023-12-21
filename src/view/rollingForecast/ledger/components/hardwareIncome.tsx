import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Form, InputNumber, Select, Table, Input, Row, Col, Divider, message, Modal, Upload } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { UploadProps } from 'antd';
import {
  getCostIncomeHistory, updateCostIncomeHistory, importCostIncomeHistory, costIncomeHistoryTemplate, costIncomeHistoryDownload,
  getCostIncomeWrite, updateCostIncomeWrite, importCostIncomeWrite, costIncomeWriteTemplate, costIncomeWriteDownload, getAllCustom, getHardwareIncomeList, updateHardwareIncome,
  projectLedgerDetails
} from "../../../../servers/api/ledger"
import { downloadFile } from '../../../../common/downLoad'
import './styles.css';
import './copy.css'
let departmentOptions: any = []
let originDir: any = {}
let list: any = []
let tableDataEdit: any = []
let undataParams: any = []
let currentDay: any = ''
let activeCloumn: any = ''
let activeRow: any = ''
let clipboardContent: any = ''
const EditableContext = React.createContext<FormInstance<any> | null>(null);
const EditableRow = ({ index, ...props }: any) => {
  const [rowForm] = Form.useForm();
  return (
    <Form form={rowForm} component={false}>
      <EditableContext.Provider value={rowForm}>
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
        setLoading(true)
        updateHardwareIncome(undataParams).then(payload => {
          initData()
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 弹窗
  const [filePath, setFilePath] = useState<any>(null);
  const [tableType, setTableType] = useState<string>('');
  const [monthForm] = Form.useForm()
  const [importForm] = Form.useForm()
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const [projectInfo, setProjectInfo] = useState<any>({});
  // 历史
  const [historyColumns, setHistoryColumns] = useState<any>([]);
  const [customList, setCustomList] = useState<any>([]);
  const [historyData, setHistoryData] = useState<any>([]);
  // 预测
  const [writeColumns, setWriteColumns] = useState<any>([]);
  const [writeData, setWriteData] = useState<any>([]);
  const { Item } = Form
  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  // 表单组件
  const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, handleSubmit, index, ...restProps }: any) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<any>(null);
    const cellForm = useContext(EditableContext)!;

    useEffect(() => {
      if (editing) { inputRef.current!.focus(); }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      cellForm.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };
    const saveChangeParams = async (data: any, record: any, title: any) => {
      let params = record
      params[dataIndex] = Number(data.target.value.replace(/[^0-9.]/g, ''))
      tableDataEdit[index] = params
      // 实时计算 
      const editIdxs: any = []
      let sales_volume_list: any = [] // 销量
      let unit_price_list: any = [] // 单价
      tableDataEdit.map((item: any, index: number) => {
        if (params.customerId === item.customerId) {
          editIdxs.push(index)
        }
        if (item.type === '硬件销量') {
          sales_volume_list.push(item)
        }
        if (item.type === '硬件单价') {
          unit_price_list.push(item)
        }
      })
      let income: number = 0
      sales_volume_list.map((item: any) => {
        unit_price_list.map((value: any) => {
          if (item.customerId == value.customerId) {
            income += item[title] * value[title]
          }
        })
      })
      tableDataEdit[0][title] = income // 项目收入
      tableDataEdit[editIdxs[3]][title] = Number((income - (income * (projectInfo.grossProfitRate) / 100)).toFixed(0)) // 硬件成本
      // tableDataEdit[editIdxs[3]][title] = tableDataEdit[editIdxs[2]][title] // 硬件成本
      let cost: number = 0
      tableDataEdit.map((item: any) => {
        if (item.type === '硬件成本') {
          cost += item[title]
        }
      })
      tableDataEdit[1][title] = cost // 项目成本
      setWriteData(JSON.parse(JSON.stringify(tableDataEdit)))
      // 实时计算form
      let realIncome: number = 0
      let forecastIncome: number = 0
      let realCost: number = 0
      let forecastCost: number = 0
      let totalIncome: number = 0
      let totalCost: number = 0
      Object.keys(tableDataEdit[0]).forEach((key) => {
        if (key.indexOf('年') > 0) {
          if (
            Number(key.split('年')[0]) <= new Date().getFullYear() &&
            Number(key.split('年')[1].split('月')[0]) < new Date().getMonth() + 1
          ) {
            realIncome += tableDataEdit[0][key]
            realCost += tableDataEdit[1][key]
          } else {
            forecastIncome += tableDataEdit[0][key]
            forecastCost += tableDataEdit[1][key]
          }
          totalIncome += tableDataEdit[0][key]
          totalCost += tableDataEdit[1][key]
        }
      })
      form.setFieldValue("realIncome", realIncome)
      form.setFieldValue("forecastIncome", forecastIncome)
      form.setFieldValue("realCost", realCost)
      form.setFieldValue("forecastCost", forecastCost)
      form.setFieldValue("totalIncome", totalIncome)
      form.setFieldValue("totalCost", totalCost)
      setEditing(!editing);

      let query = undataParams.findIndex(((v: any) => v.customerId == record.customerId && v.forecastDate == title))
      if (query !== -1) {
        undataParams[query][record.type == '硬件收入' ? 'hardwareRevenue' : record.type == '硬件销量' ? 'hardwareSales' : record.type == '硬件单价' ? 'hardwareUnitPrice' : 'hardwareCost'] = data.target.value
      } else {
        let params1: any = {}
        if (record.type == '硬件收入') {
          params1.hardwareRevenue = Number(data.target.value.replace(/[^0-9.]/g, ''))
        } else if (record.type == '硬件销量') {
          params1.hardwareSales = Number(data.target.value.replace(/[^0-9.]/g, ''))
        } else if (record.type == '硬件单价') {
          params1.hardwareUnitPrice = Number(data.target.value.replace(/[^0-9.]/g, ''))
        } else if (record.type == '硬件成本') {
          params1.hardwareCost = Number(data.target.value.replace(/[^0-9.]/g, ''))
        }
        undataParams.push({
          projectLedgerId: id,
          customerId: record.customerId,
          customerName: record.name || record.nameNo,
          forecastDate: title,
          incomeCertainty: record.cost || record.costNo,
          type: title == 'cost' ? 3 : compareChineseDate(title, currentDay) ? 1 : 2,
          ...params1
        })
      }
    }
    const togglePase =  (data: any) => {
      activeCloumn = title
      console.log(activeCloumn)
    };
    let childNode = children;
    if (props.menuType === 'viewProject') {
      return <td {...restProps}>{childNode}</td>;
    }
    if (editable && record?.editable) {
      if (testData(title)) {
        if (record.type == '硬件收入' || record.type == '硬件成本') {
          if (JSON.parse(props.userInfo).roleName !== '财务') {
            return <td {...restProps}> <span>{childNode}</span> </td>;
          }
          // 硬件收入 硬件成本 历史财务手填,预测自动计算
          if (compareChineseDate(title, currentDay)) {
            childNode = editing ? (<Form.Item
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
                onKeyPress={handleKeyPress}
                onBlur={(($event) => saveChangeParams($event, record, dataIndex))}
                style={{ width: "100%" }} />
            </Form.Item>) : (
            <div className={'can-editable'} style={{ paddingRight: 24 }} onDoubleClick={toggleEdit} onClick={togglePase}>
              {children}
            </div>
          );
          } else {
            childNode = (<div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={togglePase}>
              {children}
            </div>)
          }
        } else {
          if (JSON.parse(props.userInfo).roleName !== 'PM') {
            return <td {...restProps}> <span>{childNode}</span> </td>;
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
                onKeyPress={handleKeyPress}
                onBlur={(($event) => saveChangeParams($event, record, dataIndex))}
                style={{ width: "100%" }} />
            </Form.Item>
          ) : (
            <div className={'can-editable'} style={{ paddingRight: 24 }} onDoubleClick={toggleEdit} onClick={togglePase}>
              {children}
            </div>
          );
        }
      }
      else if (dataIndex == 'cost') {
        if (JSON.parse(props.userInfo).roleName == 'PM') {
          return <td {...restProps}> <div>{childNode}</div> </td>;
        }
        childNode = editing ? (<Form.Item
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
            onBlur={(($event) => saveChangeParams($event, record, dataIndex))}
            style={{ width: "100%" }} />
        </Form.Item>) : (
        <div className={record.cost ? 'can-editable' : 'editable-cell-value-wrap'} style={{ paddingRight: 24 }} onDoubleClick={toggleEdit} >
          {children}
        </div>
      );
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
      ]
    },
    {
      span: 8,
      items: [
        { label: "实际成本：", name: "realCost" },
        { label: "预测成本：", name: "forecastCost" },
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
  const handleKeyPress = (event: any) => {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  };

  function testData(dateStr1: any) {
    var reg = /^\d{4}年\d{1,2}月$/;
    return reg.test(dateStr1)
  }
  function compareChineseDate(dateStr1: any, dateStr2: any) {
    var date1 = new Date(dateStr1.replace(/年/g, '-').replace(/月/g, '-'));
    var date2 = new Date(dateStr2.replace(/年/g, '-').replace(/月/g, '-'));
    return date1 < date2
  }
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
      let lis=Object.keys(tableDataEdit[1])
      let notPaste = ['jg', 'gz', 'xz']
      // 赋值
      for (let j = 0; j < rows.length; j++) {
        if (rowFlag + j > tableDataEdit.length - 1) { // 超出行不粘贴
          break;
        }
        let rowInfo = tableDataEdit[rowFlag + j]
        for (let k=0; k<rows[j].length; k++){
          let key = lis[k+colFlag]
          if (notPaste.indexOf(key)===-1){
            rowInfo[key] = rows[j][k]
          }
        }
      }
      let tData=tableDataEdit;
      let newData=JSON.parse(JSON.stringify(tData))
    //  console.log('复制1')
      // console.log(newData)
      setWriteData(newData)
    })
    .catch(err => {
      console.error('无法获取剪切板内容:', err);
    });
  };
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
      onClick: () => {
        activeRow = i
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
  function isNumber(value: any) {
    if (typeof value === 'number') {
        return true;
    } else if (typeof value === 'string') {
        return !isNaN(parseFloat(value)) && isFinite(value);
    } else {
        return false;
    }
  }
  const handleClick = () => {
    // navigator.clipboard.readText()
    let catchData = JSON.parse(JSON.stringify(tableDataEdit)) 
    console.log(catchData)
    clipboard.readText()
      .then(text => {
        clipboardContent = text
        console.log(activeCloumn, activeRow)
        setTimeout(() => {
          const rows = clipboardContent.replaceAll('\r', '').split('\n').filter((v: any) => v !== '\t');
          rows.forEach((item: any, index: any) => {
            if (item.includes('\t')) {
              console.log('up')
              let row = item.split('\t').filter((v: any) => v !== '');
              row.forEach((v: any, i: any) => {
                let data = dateOptions[dateOptions.findIndex((v: any) => v.label == activeCloumn) + i]?.label
                if (isNumber(v.replaceAll('\"', '')) && v.replaceAll('\"', '') !== '' && catchData[activeRow + index].editable) {
                  catchData[activeRow + index][data] = Number(v.replaceAll('\"', ''))
                  let p = JSON.parse(JSON.stringify(catchData[activeRow + index]))
                  p[data] = Number(v.replaceAll('\"', ''))
                  let params = p
                  params[data] = Number(v.replaceAll('\"', ''))
                  tableDataEdit[index] = params
                  let query = undataParams.findIndex(((v: any) => v.customerId == params.customerId && v.forecastDate == data))
                  if (query !== -1) {
                    undataParams[query][params.type == '硬件收入' ? 'hardwareRevenue' : params.type == '硬件销量' ? 'hardwareSales' : params.type == '硬件单价' ? 'hardwareUnitPrice' : 'hardwareCost'] = v
                  } else {
                    let params1: any = {}
                    if (params.type == '硬件收入') {
                      params1.hardwareRevenue = Number(v.replaceAll('\"', ''))
                    } else if (params.type == '硬件销量') {
                      params1.hardwareSales = Number(v.replaceAll('\"', ''))
                    } else if (params.type == '硬件单价') {
                      params1.hardwareUnitPrice = Number(v.replaceAll('\"', ''))
                    } else if (params.type == '硬件成本') {
                      params1.hardwareCost = Number(v.replaceAll('\"', ''))
                    }
                    undataParams.push({
                      projectLedgerId: id,
                      customerId: params.customerId,
                      customerName: params.name || params.nameNo,
                      forecastDate: data,
                      incomeCertainty: params.cost || params.costNo,
                      type: params.cost ? 3 : compareChineseDate(data, currentDay) ? 1 : 2,
                      ...params1
                    })
                  }

                }
              });
            } else {
              let data = dateOptions[dateOptions.findIndex((v: any) => v.label == activeCloumn) + index]?.label
              try {
                if (isNumber(item.replaceAll('\"', '')) && item.replaceAll('\"', '') !== '' && catchData[activeRow + index].editable) {
                  if ((!compareChineseDate(data, currentDay) && catchData[activeRow + index].type == '人力成本')) {
                    return
                  } else {
                    catchData[activeRow][data] = Number(item.replaceAll('\"', ''))
                    let p = JSON.parse(JSON.stringify(catchData[activeRow + index]))
                    p[data] = Number(item.replaceAll('\"', ''))
                    // if (updateDate && updateDate.findIndex((v: any) => v.forecastDate == data) !== -1) {
                    //   updateDate[updateDate.findIndex((v: any) => v.forecastDate == data)][tableDataEdit[activeRow+index].key] = item
                    // } else {
                    //   let params: any = {
                    //     forecastDate: data,
                    //     projectLedgerId: id,
                    //     type: compareChineseDate(data, currentDay) ? 1 : 2
                    //   }
                    //   params[tableDataEdit[activeRow+index].key] = Number(item)
                    //   updateDate.push(params)
                    // }
                  }
                }
              } catch (e) {
              }
            }
          })
          setWriteData(catchData)
          tableDataEdit = catchData
      }, 200)
    })
    .catch(err => {
      alert('无法读取剪贴板数据：', err);
    });
  };
  function getClipboardContent() {
    handleClick()
  }
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
  useEffect(() => {
    list = JSON.parse(localStorage.getItem('roleList') || "{}")
    initData()
    getCustom()
    getCurrentDay()
    // document.addEventListener('paste', function(e) {
    //   // 在这里处理粘贴的内容
    //   getClipboardContent()
    // });
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
    });
  }, [])
  function getCurrentDay() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 月份是从 0 到 11 表示的，所以我们要加 1
    currentDay = currentYear + '年' + currentMonth + '月'
  }
  function getCustom() {
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
  async function initData() {
    setLoading(true)
    const values = await monthForm.validateFields();
    getHardwareIncomeList({ projectLedgerId: id, historyMonth: values.month }).then(payload => {
      const { data } = payload
      /*
        项目收入  项目成本 开始
      */
      let tableData: any =  [{
        name: '项目收入',
        editable: false
      }, {
        name: '项目成本',
        editable: false
      }]
      tableData.forEach((item: any, index: any) => {
        dateOptions.forEach((v: any) => {
          item[v.label] = 0
        });
      });
      tableData.forEach((item: any, index: any) => {
        if (index == 0) {
          data.yearMonthTotal.forEach((v: any) => {
            item[v.forecastDate] = v.projectIncome || 0
          })  
        } else {
          data.yearMonthTotal.forEach((v: any) => {
            item[v.forecastDate] = v.projectCost || 0
          })  
        }
      });
      /*
        项目收入  项目成本 结束
      */
      form.setFieldsValue({
        forecastCost: data.projectStatisticsData.forecastCost,
        forecastIncome: data.projectStatisticsData.forecastIncome,
        realCost: data.projectStatisticsData.realCost,
        realIncome: data.projectStatisticsData.realIncome,
        totalCost: data.projectStatisticsData.totalCost,
        totalIncome: data.projectStatisticsData.totalIncome,
      })
      /*
        硬件客户 开始
      */
      data.hardwareTableDetail?.forEach((item: any) => {
        let params1: any = {}
        let params2: any = {}
        let params3: any = {}
        let params4: any = {}
        dateOptions.forEach((v: any) => {
          params1[v.label] = 0
          params2[v.label] = 0
          params3[v.label] = 0
          params4[v.label] = 0
        });
        item.hardwareCostIncomeVOList?.forEach((v: any) => {
          params1[v.forecastDate] = v.hardwareRevenue || 0  // 硬件收入
          params2[v.forecastDate] = v.hardwareSales || 0  // 硬件销量
          params3[v.forecastDate] = v.hardwareUnitPrice || 0  // 硬件单价
          params4[v.forecastDate] = v.hardwareCost || 0  // 硬件成本
        });
        tableData.push({
          name: item.customerName,
          customerId: item.customerId,
          type: '硬件收入',
          editable: true,
          cost: item.incomeCertainty,
          ...params1
        }, 
        {
          nameNo: item.customerName,
          customerId: item.customerId,
          type: '硬件销量',
          indentation: true,
          editable: true,
          costNo: item.incomeCertainty,
          ...params2
        },{
          nameNo: item.customerName,
          customerId: item.customerId,
          type: '硬件单价',
          editable: true,
          indentation: true,
          costNo: item.incomeCertainty,
          ...params3
        },{
          nameNo: item.customerName,
          customerId: item.customerId,
          type: '硬件成本',
          editable: true,
          costNo: item.incomeCertainty,
          ...params3
        })
        item.hardwareCostIncomeVOList?.forEach((v: any) => {
          params1[v.forecastDate] = v.hardwareRevenue
        });
      })

      /*
        硬件客户 结束
      */
      setWriteData(tableData)
      tableDataEdit = tableData
      getWriteColumns()
      setLoading(false)
    })

    projectLedgerDetails({ id }).then(res => {
      setProjectInfo(res.data)
    })
  }
  function getWriteColumns() {
    const columns: any = [{
      title: '客户名称',
      dataIndex: 'name',
      width: 150,
      fixed: 'left',
    },{
      title: '收入确认性（%）',
      dataIndex: 'cost',
      width: 150,
      align: 'right',
      editable: true,
      fixed: 'left',
    },{
      title: '收支类型',
      dataIndex: 'type',
      width: 150,
      fixed: 'left',
      render: (_: any, record: any) => {
        return (
          record?.indentation ? <span  style={{ marginLeft: '20px'}}>{_}</span> : <span >{_}</span>
        )
      },
    },]
    dateOptions.forEach((item: any, index: number) => {
      // if (new Date(item.value).getTime() >= Now) {
        columns.push({
          title: item.value,
          dataIndex: item.value,
          key: index,
          width: 150,
          align: 'right',
          editable: true,
        })
      // }
    })
    setWriteColumns(columns)
  }
  // 历史月份选择
  async function manMonthChange(e: string) {
    setLoading(true)
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
  function handleAddOpen() {
    addForm.resetFields()
    setIsAddModalOpen(true)
  }
  // handleOk
  async function handleOk() {
    const file = new FormData();
    file.append('file', filePath)
    file.append('projectLedgerId', id)
    setIsModalOpen(false)
    if (tableType === 'history') {
      await importCostIncomeHistory(file)
    } else {
      await importCostIncomeWrite(file)
    }
    message.success('导入成功')
    initData()
    setFilePath(null)
  }
  // 
  function handleAddCancel() {
    setIsAddModalOpen(false);
  }
  async function handleAddOk() {
    setLoading(true)
    const customerId = addForm.getFieldValue('template')
    const cost = addForm.getFieldValue('incomeCertainty')
    const customerName = customList.filter((v: any) => v.id == customerId)[0].label
    tableDataEdit = JSON.parse(JSON.stringify(writeData)) 
    let params: any = {}
    dateOptions.forEach((item: any) => {
      params[item.label] = 0
    });
    tableDataEdit.push({
      name: customerName,
      customerId: customerId,
      type: '硬件收入',
      editable: true,
      cost: cost,
      ...params
    }, 
    {
      nameNo: customerName,
      customerId: customerId,
      type: '硬件销量',
      indentation: true,
      costNo: cost,
      editable: true,
      ...params
    },{
      nameNo: customerName,
      customerId: customerId,
      type: '硬件单价',
      indentation: true,
      costNo: cost,
      editable: true,
      ...params
    },{
      nameNo: customerName,
      customerId: customerId,
      type: '硬件成本',
      editable: true,
      costNo: cost,
      ...params
    })
    setIsAddModalOpen(false)
    setWriteData(tableDataEdit)
    setLoading(false)
    undataParams.push({
      projectLedgerId: id,
      customerId: customerId,
      customerName: customerName,
      forecastDate: '',
      incomeCertainty: cost,
      type: 1,
    })
  }
  // 
  function handleCancel() {
    setIsModalOpen(false);
  }
  return (
    <div>
      <Row style={{height: 45}}>
        <Col span={16}>
          <h3 style={{margin: '5px 0 0'}}>成本/收入滚动预测-硬件-{props.form.getFieldValue('projectName')}</h3>
        </Col>
          {/* <Button type='primary'>同步看板最新数据</Button> */}
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
        props.menuType === 'viewProject' ? '' : 
        <Row style={{ marginBottom: 10, marginTop: 20 }}>
        <Col span={12}>
          {/* <span style={{ paddingRight: '20px' }}>预测填报</span> */}
          {
            list.includes('exportHardCost') ? <Button onClick={() => { doDownLoad(costIncomeWriteDownload, '成本/收入预测数据') }} style={{ marginRight: '20px' }}>
            导出excel
          </Button> : null
          }
          {
            list.includes('importHardCost') ? <Button style={{ marginRight: '20px' }} onClick={() => { handleOpen('write') }}>导入Excel</Button> : null
          }
          {
            list.includes('addHardCustomer') ? <Button onClick={() => { handleAddOpen() }}>添加硬件客户</Button> : null
          }
          
        </Col>
        <Col span={12} style={{ textAlign: 'right', color: 'red' }}>Tips：点击表格内容即可进行编辑修改</Col>
      </Row>
      }
    
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        style={{ userSelect: 'none'}}
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
      <Modal open={isAddModalOpen} onOk={handleAddOk} onCancel={handleAddCancel} title='添加硬件客户' cancelText="取消" okText='确定'>
        <div style={{ margin: '20px' }}>
          <Form form={addForm} component={false}>
            <Form.Item  
              rules={[
                {
                  required: true,
                  message: `不得为空`,
                },
              ]} 
              name='template' 
              label='客户名称：'>
              <Select
                  style={{ width: '100%' }}
                  filterOption={filterOption}
                  showSearch
                  options={customList}
                />
            </Form.Item>
            <div className='hardwareincom-title'>如未在选项中找到需要的客户请前往OA新增客户</div>
            <Form.Item 
              rules={[
                {
                  required: true,
                  message: `不得为空`,
                },
              ]} 
              name='incomeCertainty' 
              label='收入确定性：'>
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </div>
        
      </Modal>
    </div>
  );
});

export default CostIncome;