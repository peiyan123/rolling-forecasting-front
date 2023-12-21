
import React from 'react';

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import 'amis/lib/themes/cxd.css';
import 'amis/lib/helper.css';
import 'amis/lib/themes/antd.css';

import axios from 'axios';
import copy from 'copy-to-clipboard';

import { message } from 'antd';
import { FRI_SHU_ACCEEDIT_HOME } from '../config'

axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ?
    '/api' : // 本地环境 
    '/api'

// amis 环境配置
const env = {
  // 下面三个接口必须实现
  fetcher: ({
    url, // 接口地址
    method, // 请求方法 get、post、put、delete
    data, // 请求数据
    responseType,
    config, // 其他配置
    headers // 请求头
  }: any) => {
    const token = localStorage.getItem('token');

    if (!token) {
      message.error('登陆失效或者失效，请重新登陆');
      setTimeout(() => {
        window.location.href = FRI_SHU_ACCEEDIT_HOME;
      }, 2000)
      return false
    }

    config = config || {};
    config.withCredentials = true;
    responseType && (config.responseType = responseType);

    if (config.cancelExecutor) {
      config.cancelToken = new (axios as any).CancelToken(
        config.cancelExecutor
      );
    }

    config.headers = headers || { Authorization: token };

    if (method !== 'post' && method !== 'put' && method !== 'patch') {
      if (data) {
        config.params = data;
      }
      return (axios as any)[method](url, config);
    } else if (data && data instanceof FormData) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (
      data &&
      typeof data !== 'string' &&
      !(data instanceof Blob) &&
      !(data instanceof ArrayBuffer)
    ) {
      data = JSON.stringify(data);
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'application/json';
    }

    return (axios as any)[method](url, data, config);
  },
  isCancel: (value: any) => (axios as any).isCancel(value),
  copy: (content: string) => {
    copy(content);
    message.success('内容已复制到粘贴板');
  },
  theme: "antd",

  // 后面这些接口可以不用实现

  // 默认是地址跳转
  // jumpTo: (
  //   location: string /*目标地址*/,
  //   action: any /* action对象*/
  // ) => {
  //   // 用来实现页面跳转, actionType:link、url 都会进来。
  // },

  // updateLocation: (
  //   location: string /*目标地址*/,
  //   replace: boolean /*是replace，还是push？*/
  // ) => {
  //   // 地址替换，跟 jumpTo 类似
  // },

  // isCurrentUrl: (
  //   url: string /*url地址*/,
  // ) => {
  //   // 用来判断是否目标地址当前地址
  // },

  notify: (
    type: 'error' | 'success' /**/,
    msg: string /*提示内容*/
  ) => {
    type === 'success' ? message[type]('操作成功') : console.warn('[Notify]', type, msg);
    // message[type]
    //   ? message[type](type === 'success' ? '操作成功' : '系统繁忙')
    //   : console.warn('[Notify]', type, msg);
  },
  // alert,
  // confirm,
};

export default env