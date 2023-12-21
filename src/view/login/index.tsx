import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FRI_SHU_ACCEEDIT_HOME, appId } from '../../config'
import { getToken, getPower } from '../../servers/api/login'
import { message } from 'antd';

const Login = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams() // 拿到路径地址
  let code = searchParams.get('code') //从路径中取出第三方网站生成的授权码

  useEffect(() => {
    enterSys();
    // window.location = FRI_SHU_ACCEEDIT_HOME;
  }, [])

  function enterSys() {
    // 处理参数
    if (window.h5sdk) {
      // 飞书内打开
      window.h5sdk.ready(function () {
        window.tt.requestAuthCode({
          appId: appId,
          success: async (info) => {
            // 拿到授权码 info.code
            callLoginRequest(info.code, 'feishu');
          },
          fail: (error) => {
            console.error(error);
          },
        });
      });
    } else {
      if (!code) {
        window.location = FRI_SHU_ACCEEDIT_HOME;
      } else {
        // 浏览器打开
        callLoginRequest(code, 'web')
      }
    }
  }

  async function callLoginRequest(loginCode: any, type: any) {
    const res: any = await getToken(loginCode, type);
    if (res.code === 200) {
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('data', JSON.stringify(res));
      localStorage.setItem('token', 'Bearer ' + res.data.access_token);
      const powerRes = await getPower()
      localStorage.setItem('roleList', JSON.stringify(powerRes.data.map((v: any) => {
        return v.frontUrl
      })))
      // const isAuth = await getAuth();
      // localStorage.setItem('auth', isAuth.data)
      navigate('/')
    } else {
      message.error(res.msg);
      window.location = FRI_SHU_ACCEEDIT_HOME;
    }
  }

  return <div></div>
}

export default Login;