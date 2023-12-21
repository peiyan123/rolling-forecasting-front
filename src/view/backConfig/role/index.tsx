import React, { useEffect, useState } from 'react';
import { render as renderAmis, ToastComponent, AlertComponent } from 'amis';
import { useNavigate } from 'react-router-dom'
import env from "../../../servers/env"

const Role = () => {
  const navigate = useNavigate();
  const [changeId, setChangeId] = useState<any>(null)

  return (<>{renderAmis(
    {
      type: "page",
      title: "角色管理",
      body: [
        {
          type: "flex",
          className: "p-1",
          items: [
            {
              type: "container",
              body: [
                {
                  type: "button",
                  label: "新 建",
                  level: "primary",
                  onClick: () => {
                    navigate('/backConfig/roleDetail')
                  }
                }
              ],
              size: "xs",
              style: {
                position: "static",
                display: "flex",
                flex: "1 1 auto",
                flexGrow: 1,
                flexBasis: "auto",
                flexWrap: "nowrap",
                flexDirection: "row-reverse"
              },
              wrapperBody: false,
              isFixedHeight: false,
              isFixedWidth: false,
            }
          ],
          style: {
            position: "relative"
          },
        },
        {
          type: "crud",
          api: {
            method: "post",
            url: "/rolling-system-web/role/getRoleList"
          },
          columns: [
            {
              name: "roleName",
              label: "角色名称",
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
                    navigate(`/backConfig/roleDetail?id=${dom.data.id}`)
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
                    url: "/rolling-system-web/role/deleteRoleById",
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

export default Role