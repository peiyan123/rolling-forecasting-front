import axios from 'axios'
import { message } from 'antd';
import { FRI_SHU_ACCEEDIT_HOME } from '../config'

axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ?
    '/api' : // 本地环境 
    '/api'
const request = axios.create({
  timeout: 600000
})

request.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (config.url.indexOf('/feishu') >= 0) {
    config.baseURL = ''
  } else if (config.url.indexOf('/system-login-auth/oauth/token') < 0) {
    if (!token) {
      message.error('登陆失效或者失效，请重新登陆')
      setTimeout(() => {
        localStorage.clear();
        window.location.href = FRI_SHU_ACCEEDIT_HOME;
      }, 2000)
      return false
    } else {
      config.headers['Authorization'] = token;
    }
  }
  return config
}, err => {
  return Promise.reject(err)
});
request.interceptors.response.use((response: any) => {
  if (response) {
    if (response.request.responseType === 'blob' || response.data.code === 200 || response.config.url.indexOf('/feishu/') >= 0 || !response.data.code) {// 下载接口，直接返回
      return response.data
    }
    message.error(response.data?.msg);
    return response.data
  }
}, err => {

  let { code, msg } = err.response.data
  if (code === 230) {
    message.error('登陆失效或者失效，请重新登陆')
    localStorage.clear();
    window.location.href = FRI_SHU_ACCEEDIT_HOME;
    return false
  }

  message.error(msg)

  if (err.response.status) {
    //在这对错误返回状态值进行处理
    return Promise.reject(err.response.status)
  }
})
/**
 * 专用下载文件 用于excel导出
 * @param url
 * @param parameter
 * @returns {*}
 */
export function exportFile({ url, method, parameter }: any) {
  const param: any = {
    url: url,
    method: method || 'post',
    responseType: 'blob'
  };
  if (method === 'post') {
    param.data = parameter;
  } else {
    param.params = parameter;
  }
  return request(param);
}

export default request
