import { anyChanged } from 'amis';
import request, { exportFile } from '../request';

// 项目名称列表
export const getProjectName = async () => request.post('/rolling-system-web/projectLedger/getProjectName')
// 项目名称列表
export const getCurrentUserApi = async () => request.get('/rolling-system-web/userManage/currentUser')
// Pm列表
export const getProjectPm = async () => request.post('/rolling-system-web/projectLedger/getProjectPm')
// 立项流程列表
export const getFlowTypeList = async () => request.post('/rolling-system-web/dictItem/getFlowTypeList')
// 项目状态列表
export const getProjectStatusList = async () => request.post('/rolling-system-web/dictItem/getProjectStatusList')
// getProjectLedgerPage
export const getProjectLedgerPage = async (params: any) => request.post('/rolling-system-web/projectLedger/getProjectLedgerPage', params)
// getProjectLedgerPage
export const getBusiness = async (params: any) => request.post('/rolling-system-web/projectLedger/getBusiness', params)
// 导出
export const projectLedgerDownload = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/projectLedger/downloadExcel',
    method: 'post',
    parameter: params
  })
}
// 人月模板
export const manMonthExcelTemplate = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/projectLedger/manMonthExcelTemplate',
    method: 'post',
    parameter: params
  })
}
// 导入人月
export const importManMonthExcel = async (params: any) => request.post('/rolling-system-web/projectLedger/importManMonthExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
// 成本收入模板
export const costIncomeExcelTemplate = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/projectLedger/costIncomeExcelTemplate',
    method: 'post',
    parameter: params
  })
}
// 导入成本
export const importCostIncomeExcel = async (params: any) => request.post('/rolling-system-web/projectLedger/importCostIncomeExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
// 填报预警
export const sendReminder = async (params: any) => request.post('/rolling-system-web/projectLedger/sendReminder', params)
// 维护协同编辑人
export const addSynergyEditor = async (id: any, params: any) => request.post(`/rolling-system-web/projectLedger/addSynergyEditor/${id}`, params)
// 维护协同编辑人
export const addSeal = async (params: any) => request.post(`/rolling-system-web/projectLedger/seal`, params)
// 维护协同编辑人
export const addDistribute = async (params: any) => request.post(`/rolling-system-web/projectLedger/distribute`, params)
// 业务类型列表
export const getBusinessTypeList = async () => request.post('/rolling-system-web/dictItem/getBusinessTypeList')
// 业务类型细分列表
export const getBusinessTypeDetailsList = async (params: any) => request.post('/rolling-system-web/dictItem/getBusinessTypeDetailsList', params)
// -------------------   填报  -------------------
// 项目详细信息
export const projectLedgerDetails = async (params: any) => request.post('/rolling-system-web/projectLedger/ProjectLedgerDetails', params)
// 填报信息保存 
export const updateProjectLedger = async (params: any) => request.post('/rolling-system-web/projectLedger/updateProjectLedger', params)
// -------------  人月历史 ------------------- 
// 获取数据
export const getManMonthHistory = async (params: any) => request.get(`/rolling-system-web/manMonth/getManMonthList?projectLedgerId=${params.projectLedgerId}`, params)
// 添加
export const addManMonthHistory = async (params: any) => request.post('/rolling-system-web/manMonthHistory/addManMonthHistory', params)
// 修改
export const editDepartOrPersonnel = async (params: any) => request.post('/rolling-system-web/manMonth/editDepartOrPersonnel', params)
// 修改
export const editStaff = async (params: any) => request.post('/rolling-system-web/manMonth/editStaff', params)
// 修改
export const addDepartOrPersonnel = async (params: any) => request.post('/rolling-system-web/manMonth/save', params)
// 复制
export const copyManMonthHistory = async (params: any) => request.post('/rolling-system-web/manMonthHistory/copy', params)
// 删除
export const delManMonthHistory = async (params: any) => request.post('/rolling-system-web/manMonth/delete', params)
// 更新
export const updateManMonthHistory = async (params: any) => request.post('/rolling-system-web/manMonthHistory/update', params)
// 导入
export const importManMonthHistory = async (params: any) => request.post('/rolling-system-web/ManMonthExcel/importExcelHis', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
export const importManMonthPm = async (params: any) => request.post('/rolling-system-web/ManMonthExcel/importExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
// 模板下载
export const manMonthHistoryTemplate = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/ManMonthExcel/excelTemplateHis',
    method: 'post',
    parameter: params
  })
}
// 导出
export const manMonthHistoryDownload = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/ManMonthExcel/downloadExcel',
    method: 'post',
    parameter: params
  })
}
// -------------  人月预测公司员工 ------------------- 
// 获取数据
export const getManMonthFormal = async (params: any) => request.post('/rolling-system-web/manMonthFormal/getManMonthFormalList', params)
// 添加
export const addManMonthFormal = async (params: any) => request.post('/rolling-system-web/manMonthFormal/addManMonthFormal', params)
// 复制
export const copyManMonthFormal = async (params: any) => request.post('/rolling-system-web/manMonthFormal/copy', params)
// 删除
export const delManMonthFormal = async (params: any) => request.post('/rolling-system-web/manMonthFormal/del', params)
// 更新
export const updateManMonthFormal = async (params: any) => request.post('/rolling-system-web/manMonthFormal/update', params)
// 导入
export const importManMonthFormal = async (params: any) => request.post('/rolling-system-web/manMonthFormal/importExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
// 模板下载
export const manMonthFormalTemplate = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/ManMonthExcel/excelTemplate',
    method: 'post',
    parameter: params
  })
}
// 导出
export const manMonthFormalDownload = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/manMonthFormal/downloadExcel',
    method: 'post',
    parameter: params
  })
}

// -------------  人月预测外协员工 ------------------- 
// 获取数据
export const getManMonthEpiboly = async (params: any) => request.post('/rolling-system-web/manMonthEpiboly/getManMonthEpibolyList', params)
// 添加
export const addManMonthEpiboly = async (params: any) => request.post('/rolling-system-web/manMonthEpiboly/addManMonthEpiboly', params)
// 复制
export const copyManMonthEpiboly = async (params: any) => request.post('/rolling-system-web/manMonthEpiboly/copy', params)
// 删除
export const delManMonthEpiboly = async (params: any) => request.post('/rolling-system-web/manMonthEpiboly/delete', params)
// 更新
export const updateManMonthEpiboly = async (params: any) => request.post('/rolling-system-web/manMonthEpiboly/update', params)
// 导入
export const importManMonthEpiboly = async (params: any) => request.post('/rolling-system-web/manMonthEpiboly/importExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
// 模板下载
export const manMonthEpibolyTemplate = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/manMonthEpiboly/excelTemplate',
    method: 'post',
    parameter: params
  })
}
// 导出
export const manMonthEpibolyDownload = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/manMonthEpiboly/downloadExcel',
    method: 'post',
    parameter: params
  })
}

// ------------- 成本历史 ------------------- 
// 获取数据
export const getCostIncomeHistory = async (params: any) => request.post('/rolling-system-web/costIncomeHistory/getCostIncomeHistoryList', params)
// 更新
export const updateCostIncomeHistory = async (params: any) => request.post('/rolling-system-web/costIncomeHistory/update', params)
// 导入
export const importCostIncomeHistory = async (params: any) => request.post('/rolling-system-web/costIncomeHistory/importExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
// 模板下载
export const costIncomeHistoryTemplate = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/costIncomeExcel/excelHisTemplate',
    method: 'post',
    parameter: params
  })
}
// 导出
export const costIncomeHistoryDownload = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/costIncomeHistory/downloadExcel',
    method: 'post',
    parameter: params
  })
}
// ------------- 成本预测 ------------------- 
// 获取数据
export const getCostIncomeWrite = async (params: any) => request.post('/rolling-system-web/costIncomeWrite/getCostIncomeWriteList', params)
// 获取数据
export const getHardwareIncomeList = async (params: any) => request.post('/rolling-system-web/hardwareCostIncome/getList', params)
// 获取数据
export const getAllCustom = async () => request.get('/rolling-system-web/customer/getAll')
// 更新
export const updateCostIncomeWrite = async (params: any) => request.post('/rolling-system-web/costIncomeWrite/update', params)
// 更新
export const updateHardwareIncome = async (params: any) => request.post('/rolling-system-web/hardwareCostIncome/update', params)
// 导入
export const importCostIncomeWrite = async (params: any) => request.post('/rolling-system-web/costIncomeExcel/importHisExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
export const importCostIncomePm = async (params: any) => request.post('/rolling-system-web/costIncomeExcel/importExcel', params, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
// 模板下载
export const costIncomeWriteTemplate = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/costIncomeExcel/excelTemplate',
    method: 'post',
    parameter: params
  })
}
// 导出
export const costIncomeWriteDownload = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/costIncomeExcel/downloadExcel',
    method: 'post',
    parameter: params
  })
}
// 导出
export const costIncomeWriteDown = async (params: any) => {
  return exportFile({
    url: '/rolling-system-web/costIncomeWrite/downloadExcel',
    method: 'post',
    parameter: params
  })
}
// ------------- 进度确认 ------------------- 
// 合同里程碑表格成本
export const getContractCost = async (id: any) => request.get(`/rolling-system-web/projectLedger/getContractCost?projectLedgerId=${id}`)
// 合同里程碑表格收入
export const getContract = async (id: any) => request.get(`/rolling-system-web/projectContract/getContract?projectLedgerId=${id}`)
// 合同里程碑列表
export const getContractList = async (id: any) => request.get(`/rolling-system-web/projectContract/getContractList?projectLedgerId=${id}`)
// 更新剩余未确认时间
export const updatePredictionTime = async (params: any) => request.post(`/rolling-system-web/projectContract/updatePredictionTime?contractId=${params.contractId}&date=${params.date}`)
