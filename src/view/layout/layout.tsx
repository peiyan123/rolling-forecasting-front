import React, { useState, useEffect } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, BarChartOutlined, ToolOutlined } from '@ant-design/icons';
import { Layout, Menu, Button, theme, message, Col, Row } from 'antd';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import type { MenuProps } from 'antd';
import { getPower } from '../../servers/api/login';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const App: React.FC = () => {
  const isLogin = localStorage.getItem('token');
  const user: any = localStorage.getItem("user");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [powerList, setPowerList] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    getPower().then(res => {
      console.log(res);
      setPowerList(res.data.map((v: any) => {
        return v.frontUrl
      }))
      localStorage.setItem('roleList', JSON.stringify(res.data.map((v: any) => {
        return v.frontUrl
      })))
    })
  }, [])

  const items: MenuProps['items'] = [
    getItem('滚动预测', 'rollingForecast', <BarChartOutlined />, [
      powerList.includes('ledgeList') ?  getItem('项目台账', 'ledger', null) : null,
      powerList.includes('waitList') ?  getItem('待落地项目', 'loadProject', null) : null,
    ]),
    getItem('后台配置', 'backConfig', <ToolOutlined />, [
      getItem('财务对应事业部矩阵', 'matrix', null),
      getItem('事业群对应运营人员', 'business_group', null),
      getItem('人员管理', 'user', null),
      powerList.includes('role') ?  getItem('角色管理', 'role', null) : null,
    ]),
    powerList.includes('report') ?  getItem('报表系统', 'report', null) : null,
  ]
  const menuClick: MenuProps['onClick'] = (item) => {
    if (item.key == "report") {
      window.open('http://bi.thundersoft.com:8080/WebReport/ReportServer?op=fs', '_blank')
    } else {
      navigate(item.keyPath[1] + '/' + item.key)
    }
  }
  const onOpenChange: MenuProps['onOpenChange'] = keys => {
    setOpenKeys(keys);
  };

  useEffect(() => {
    // 此方法只对只有二级的菜单有效
    const pathList = pathname.split('/').map(v => v);
    setSelectedKeys(pathList)
    setOpenKeys([pathList[1]])
  }, [pathname])

  function logout() {
    localStorage.clear()
    navigate('/login')
  }
  // if (!isLogin) {
  //   message.error('登陆失效或者失效，请重新登陆')
  //   setTimeout(() => {
  //     navigate("/login")
  //   }, 1000)
  // }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical"
          style={{
            height: "32px",
            margin: "16px",
          }}
        >
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAAAvCAYAAACWlZSFAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wOC0wOFQxMzo1MjozOCswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDgtMDhUMTQ6MDM6NDUrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDgtMDhUMTQ6MDM6NDUrMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDU4M2U1YzItNmIzOC0wZDQ2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"
            style={{ width: "100%" }} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={items}
          onClick={menuClick}
          onOpenChange={onOpenChange}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Row justify={'space-between'}>
            <Col span={12}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <span>Hello，{user ? JSON.parse(user).username : ''}</span>
              <Button type="link" onClick={logout}>退出登录</Button>
            </Col>
          </Row>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;