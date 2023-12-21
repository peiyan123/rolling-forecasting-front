import React, { useEffect, useState } from 'react';
import { render as renderAmis, ToastComponent, AlertComponent } from 'amis';
import { useNavigate } from 'react-router-dom'
import env from "../../../servers/env"
import { getRoleList } from "../../../servers/api/role"

const User = () => {
  const navigate = useNavigate();
  const [changeId, setChangeId] = useState<any>(null)
  const [roleList, setRoleList] = useState<any>([])

  useEffect(() => {
    filterRoleList()
  }, [])

  // 过滤角色list
  function filterRoleList() {
    getRoleList().then((res: any) => {
      if (res.code === 200) {
        let list: any = []
        res.data.map((item: any) => {
          list.push({
            label: item.roleName,
            value: item.id,
          })
        })
        setRoleList(list)
      }
    })
  }

  return (<>{renderAmis(
    {
      type: "page",
      title: "人员管理",
      body: [
        {
          type: "crud",
          id: "crud",
          api: {
            method: "post",
            url: "/rolling-system-web/userManage/getPersonnelManagementPage"
          },
          filter: {
            wrapWithPanel: false,
            body: [
              {
                type: "flex",
                items: [
                  {
                    type: "container",
                    body: {
                      type: "input-text",
                      name: "nameLike",
                      label: "姓名",
                      clearable: true,
                      placeholder: "通过姓名关键字搜索",
                      size: "lg",
                      onEvent: {
                        blur: {
                          actions: [
                            {
                              componentId: "crud",
                              actionType: "reload"
                            }
                          ]
                        }
                      }
                    },
                    style: {
                      "position": "static",
                      "display": "block",
                      "flex": "0 0 150px",
                      "flexBasis": "47.5%",
                    },
                  },
                  {
                    type: "container",
                    body: [
                      {
                        type: "select",
                        name: "roleId",
                        label: "角色",
                        clearable: true,
                        placeholder: "选择角色",
                        size: "lg",
                        options: roleList,
                        onEvent: {
                          change: {
                            actions: [
                              {
                                componentId: "crud",
                                actionType: "reload"
                              }
                            ]
                          }
                        }
                      },
                      // {
                      //   type: "submit",
                      //   level: "primary",
                      //   label: "查询"
                      // },
                    ],
                    style: {
                      "position": "static",
                      "display": "block",
                      "flex": "0 0 150px",
                      "flexBasis": "47.5%",
                    },
                  },
                  {
                    type: "container",
                    body: {
                      type: "button",
                      label: "新 建",
                      level: "primary",
                      onClick: () => {
                        navigate('/backConfig/userDetail')
                      },
                    },
                    style: {
                      "position": "static",
                      "display": "block",
                      "flex": "0 0 150px",
                      "flexBasis": "5%",
                    },
                  },
                ],
                style: {
                  "alignItems": "start",
                  "marginBottom": "20px"
                },
              },
            ]
          },
          footerToolbar: [
            "switch-per-page",
            "pagination",
          ],
          pageField: "current",
          perPageField: "size",
          alwaysShowPagination: true,
          autoFillHeight: true,
          columns: [
            {
              name: "workCode",
              label: "工号",
              type: "text"
            },
            {
              name: "userName",
              label: "姓名",
              type: "text"
            },
            {
              name: "departName",
              label: "部门",
              type: "text"
            },
            {
              name: "roleName",
              label: "权限",
              type: "text"
            },
            {
              label: "操作",
              type: "operation",
              width: 200,
              buttons: [
                {
                  type: "button",
                  label: "修改",
                  level: "link",
                  onClick: (event: any, dom: any) => {
                    navigate(`/backConfig/userDetail?id=${dom.data.id}`)
                  }
                },
                {
                  type: "button",
                  label: "删除",
                  level: "link",
                  style: {
                    color: "red"
                  },
                  actionType: "ajax",
                  onClick: (event: any, dom: any) => {
                    setChangeId(dom.data.id)
                  },
                  confirmText: "确认删除该角色吗？",
                  confirmTitle: "提示",
                  api: {
                    method: "post",
                    url: "/rolling-system-web/userManage/delUserRole",
                    data: { id: changeId },
                  },
                }
              ],
            }
          ],
        },
      ],
    },
    {},
    env
  )}</>)
}

export default User