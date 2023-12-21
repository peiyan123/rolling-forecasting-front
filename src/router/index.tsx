import React, { lazy, Suspense } from 'react'
import { useRoutes, Navigate } from 'react-router-dom'
// 路由信息
// @ts-ignore
// @ts-ignore
const routerMap = [
  {
    component: lazy(() => import('../view/layout/layout')),
    auth: true,
    children: [
      {
        path: 'rollingForecast',
        component: lazy(() => import('../view/rollingForecast/index')),
        children: [
          {
            label: "项目台账",
            path: 'ledger',
            component: lazy(() => import('../view/rollingForecast/ledger/index')),
          },
          {
            label: "项目详情",
            path: 'reportProject',
            component: lazy(() => import('../view/rollingForecast/ledger/detail')),
          },
          {
            label: "项目详情",
            path: 'viewProject',
            component: lazy(() => import('../view/rollingForecast/ledger/detail')),
          },
          {
            label: "待落地项目",
            path: 'loadProject',
            component: lazy(() => import('../view/rollingForecast/ledger/index')),
          },
          {
            label: "新增列表",
            path: 'addProject',
            component: lazy(() => import('../view/rollingForecast/ledger/detail')),
          },
          {
            label: "待落地项目基本信息",
            path: 'editProject',
            component: lazy(() => import('../view/rollingForecast/ledger/detail')),
          },
        ]
      },
      {
        path: 'backConfig',
        component: lazy(() => import('../view/backConfig/index')),
        children: [
          {
            label: "财务对应事业部矩阵",
            path: 'matrix',
            component: lazy(() => import('../view/backConfig/matrix/index')),
          },
          {
            label: "事业群对应运营人员",
            path: 'business_group',
            component: lazy(() => import('../view/backConfig/business_group/index')),
          },
          {
            label: "人员管理",
            path: 'user',
            component: lazy(() => import('../view/backConfig/user/index')),
          },
          {
            label: "人员详情",
            path: 'userDetail',
            component: lazy(() => import('../view/backConfig/user/detail')),
          },
          {
            label: "角色管理",
            path: 'role',
            component: lazy(() => import('../view/backConfig/role/index')),
          },
          {
            label: "角色详情",
            path: 'roleDetail',
            component: lazy(() => import('../view/backConfig/role/detail')),
          },
        ]
      },
      {
        path: 'report',
        label: "报表系统",
        redirect: 'http://bi.thundersoft.com:8080/WebReport/ReportServer?op=fs',
      },
    ],
  },
  {
    path: '/',
    redirect: '/rollingForecast/ledger',
  },
  {
    path: '/login',
    component: lazy(() => import('../view/login/index'))
  }
]
// 处理路由数据
const generatorRouter = (routers: any) => {
  return routers.map((v: any) => {
    if (v.children) {
      v.children = generatorRouter(v.children)
    }
    if (v.redirect) {
      v.element = <Navigate to={v.redirect} />
    } else {
      v.element = (<Suspense fallback={null}>
        <v.component />
      </Suspense>)
    }
    return v
  })
}

const Routers = () => useRoutes(generatorRouter(routerMap))
export { routerMap, Routers }
