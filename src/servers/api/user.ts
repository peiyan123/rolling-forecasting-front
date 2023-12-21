import request from '../request';


type DetailType = {
  id: string
}

// 获取用户列表
export const getUserList = async (name: string) => request.get(`/system-user-web/user/getUserMessageByNameLike?name=${name}`)
// 获取部门列表
export const getDepartmentList = async () => request.post('/system-user-web/sysDepartment/getDeptTreeList')
// 获取默认部门信息
export const getDefaultDepart = async (userId: string) => request.get(`/rolling-system-web/userManage/getDefaultDepart?userId=${userId}`)
// 新增用户
export const userAdd = async (params: any) => request.post("/rolling-system-web/userManage/addUserRole", params)
// 用户详情
export const userDetail = async (params: DetailType) => request.post("/rolling-system-web/userManage/getPerManageById", params)
// 修改用户
export const userUpdate = async (params: any) => request.post("/rolling-system-web/userManage/updateUserRole", params)
// 获取财务FC列表
export const getDeptFcList = async () => request.post("/rolling-system-web/deptFc/getDeptFcList")
// 获取财务FC列表
export const getPersonnelManagementPage = async (params: any) => request.post("/rolling-system-web/userManage/getPersonnelManagementPage", params)
export const getDictItemApi = async (params: any) => request.get(`/rolling-system-web/dictItem/getDictItem?dictCode=${params.dictCode}`)
// 待落地项目保存
export const addOrEditBusinessApi = async (params: any) => request.post(`/rolling-system-web/projectLedger/addOrEditBusiness`, params)
// 事业群对应运营人员列表 
export const getDeptFcPage = async(params: any) => request.post('/rolling-system-web/deptFilling/getDeptFcPage',params)