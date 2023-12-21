import React, { useEffect, useState } from 'react'
import { render as renderAmis, ToastComponent, AlertComponent } from 'amis'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'amis-ui'
import env from "../../../servers/env"
import { getUserList, getDepartmentList, getDefaultDepart, userAdd, userDetail, userUpdate } from "../../../servers/api/user"
import { getRoleList } from "../../../servers/api/role"

const UserDetail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams() // 拿到路径地址
  const [dataForm, setDataform] = useState<any>({})
  const [userOptions, setUserOptions] = useState<any>([])
  const [roleList, setRoleList] = useState<any>([])
  const [departmentList, setDepartmentList] = useState<any>([])

  const id = searchParams.get('id')

  useEffect(() => {
    filterRoleList()
    filterDepartmentList()
    if (id) {
      userDetail({ id }).then((res: any) => {
        if (res.code === 200) {
          setDataform({ ...res.data, departId: res.data.departId[0] === null ? null : res.data.departId })
          getUserList(res.data.userName).then((res2: any) => {
            filterUserList(res2)
          })
        }
      })
    }
  }, [])

  // 过滤用户list
  function filterUserList(payload: any) {
    let responseData = { ...payload, data: [] }
    payload.data.map((item: any) => {
      responseData.data.push({
        label: item.userName + '-' + item.email,
        value: item.userId,
        ...item
      })
    })
    setUserOptions(responseData.data)
    return responseData
  }
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
  // 过滤部门list
  function filterDepartmentList() {
    getDepartmentList().then(res => {
      let list: any = eachReplaceKey(res.data)
      setDepartmentList(list)
    })
  }
  // 过滤
  function eachReplaceKey(city: any) {
    let data: any = [];
    city.map((item: any) => {
      let newData = {
        ...item,
        label: item.name,
        value: item.id,
        children: item.children || null
      };
      if (item.children) {
        newData.children = eachReplaceKey(item.children);
      }
      data.push(newData);
    });
    return data;
  }
  // 保存
  function submit(e: any) {
    let params = {};
    try {
      params = {
        ...e,
        departId: !e.departId ? [] : typeof e.departId === 'object' ? e.departId : e.departId?.split(','),
        roleId: typeof e.roleId === 'object' ? e.roleId : [e.roleId],
        userName: dataForm.userName,
      }
    } catch (error) {
      console.log(error);
    }
    console.log();

    if (id) {
      userUpdate({ id, ...params }).then((res: any) => {
        if (res.code === 200) {
          toast.success("修改成功")
          navigate(-1)
        }
      }).catch(err => {
        toast.success("修改成功")
      })
    } else {
      userAdd(params).then((res: any) => {
        if (res.code === 200) {
          toast.error("创建成功")
          navigate(-1)
        }
      }).catch(err => {
        toast.error("修改成功")
      })
    }
  }

  // body
  const FormBody = [
    {
      label: "人员",
      type: "select",
      name: "userId",
      value: dataForm.userId,
      required: true,
      multiple: false,
      clearable: true,
      searchable: true,
      selectMode: "group",
      sortable: true,
      disabled: id,
      placeholder: "通过姓名关键字搜索",
      searchApi: {
        method: "get",
        url: "/system-user-web/user/getUserMessageByNameLike?name=${term}",
        adaptor: function (payload: any, response: any) {
          return filterUserList(payload)
        },
      },
      options: userOptions,
      onChange: (e: string) => {
        if (e) {
          userOptions.map((item: any) => {
            if (e === item.userId) {
              getDefaultDepart(e).then(res => {
                setDataform({
                  ...item,
                  departName: item.userDepart,
                  workCode: item.workCode,
                  defaultDeparts: res.data.defaultDeparts || null
                })
              })
            }
          })
        } else {
          setDataform({})
        }
      },
    },
    {
      label: "工号",
      type: "input-text",
      name: "workCode",
      value: dataForm.workCode,
      required: true,
      disabled: true
    },
    {
      label: "部门",
      type: "input-text",
      name: "departName",
      value: dataForm.departName,
      required: true,
      disabled: true
    },
    {
      label: "角色",
      type: "select",
      name: "roleId",
      value: dataForm.roleId,
      clearable: true,
      required: true,
      options: roleList,
      onChange: (e: any) => {
        roleList.map((item: any) => {
          if (item.value === e) {
            setDataform({
              ...dataForm,
              roleId: e,
              roleName: item.label
            })
          }
        })
      }
    },
    {
      label: "默认数据部门",
      type: "input-text",
      name: "defaultDeparts",
      value: dataForm.defaultDeparts,
      static: true,
    },
    {
      label: "拓展数据权限",
      type: "nested-select",
      name: "departId",
      value: dataForm.departId,
      multiple: true,
      clearable: true,
      maxTagCount: 3,
      hidden: dataForm.roleName === '财务',
      overflowTagPopover: {
        title: "已选项"
      },
      options: departmentList,
    }
  ]

  return (<>{renderAmis(
    {
      type: "page",
      title: id ? "修改人员" : "新建人员",
      body: [
        {
          type: "form",
          title: "",
          mode: "horizontal",
          id: "form",
          body: FormBody,
          columnCount: 2,
          labelAlign: "right",
          horizontal: { "left": 2, "right": 10 },
          submitText: "保存",
          onSubmit: (e: any) => submit(e),
          disabledSubmit: true
        }
      ],
      asideResizor: false,
      pullRefresh: {
        disabled: true
      }
    },
    {},
    env
  )}</>)
}

export default UserDetail