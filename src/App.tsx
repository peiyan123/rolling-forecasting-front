import React from 'react';

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import 'amis/lib/themes/cxd.css';
import 'amis/lib/helper.css';
import 'amis/lib/themes/antd.css';

import axios from 'axios';
import copy from 'copy-to-clipboard';

import { render as renderAmis, ToastComponent, AlertComponent } from 'amis';
import { alert, confirm, toast } from 'amis-ui';

import { BrowserRouter } from "react-router-dom";
import { Routers } from './router/index'
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
class APP extends React.Component<any, any> {
  render() {
    return (
      <ConfigProvider locale={zhCN}>
        {/* <ToastComponent key="toast" position={'top-right'} />
        <AlertComponent key="alert" /> */}
        <BrowserRouter>
          <Routers />
        </BrowserRouter>
        {/* <AMISComponent /> */}
      </ConfigProvider>
    );
  }
}

export default APP;
