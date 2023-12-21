import request from '../request';
import { REDIRECT_URL, appId, appSecret } from '../../config';

// 获取token接口
export const getToken = async (code: any, type: any) => {
  console.log(REDIRECT_URL);
  
  const url = type === 'web' ?
    `/system-login-auth/oauth/token?code=${code}&grant_type=rolling-feishu&redirectUri=${REDIRECT_URL}` :
    `/system-login-auth/oauth/token?code=${code}&grant_type=rolling-feishu`;
  return request.post(url, {
    code,
    grant_type: 'rolling-feishu',
    redirectUri: REDIRECT_URL
  }, {
    headers: {
      'Authorization': 'Basic cm9sbGluZzoxMjM0NTY=',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 获取角色权限
export const getPower = async () => request.post('/rolling-system-web/purview/getUserPurview')