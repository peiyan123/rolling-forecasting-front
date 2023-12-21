import request from '../request';
import axios from 'axios';

// 获取权限菜单列表
export const getPowerList = async () => request.post('/rolling-system-web/purview/getPurviewTree')
// 创建角色
export const roleAdd = async (params: any) => request.post('/rolling-system-web/role/saveRole', params)
// 获取角色详情信息
export const roleDetail = async (params: any) => request.post('/rolling-system-web/role/getRolById', params)
// 获取角色详情信息
export const roleUpdate = async (params: any) => request.post('/rolling-system-web/role/updateRole', params)
// 角色列表
export const getRoleList = async () => request.post('/rolling-system-web/role/getRoleList')