import React, { useEffect, useState } from 'react';
import { render as renderAmis, ToastComponent, AlertComponent } from 'amis';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'amis-ui';
import env from "../../../servers/env"
import { getPowerList, roleAdd, roleDetail, roleUpdate } from "../../../servers/api/role"

const RoleDetail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams() // 拿到路径地址
  const [filterList, setfilterList] = useState<any>([])
  const [dataForm, setDataform] = useState<any>({})
  const id = searchParams.get('id')

  useEffect(() => {
    filterPower()
    if (id) {
      initDetail()
    }
  }, [])
  function addLabel(obj: any) {
    if (obj.children) {
        obj.label = obj.name;
        obj.value = obj.id;
        obj.children.forEach((child: any) => {
            child.label = child.name;
            child.value = child.id;
            addLabel(child);
        });
    } else {
      obj.label = obj.name;
      obj.value = obj.id;
    }
  }
  // 过滤
  function filterPower() {
    getPowerList().then(res => {
      let list: any = JSON.parse(JSON.stringify(res.data))
      // res.data.map((item: any) => {
      //   let children: any = []
      //   item.children.map((value: any) => {
      //     children.push({
      //       ...value,
      //       label: value.name,
      //       value: value.id,
      //     })
      //   })
      //   debugger
      //   list.push({
      //     ...item,
      //     label: item.name,
      //     value: item.id,
      //     children: children
      //   })
      // })
      list.forEach((item: any) => {
        addLabel(item);
      });
      setfilterList(list)
    })
  }
  // 保存
  function submit(e: any) {
    const params: any = {
      ...e,
      id,
      purviewIdList: e.purviewIdList.split(','),
    }
    if (id) {
      roleUpdate(params).then((res: any) => {
        if (res.code === 200) {
          toast.success("修改成功")
          navigate(-1)
        }
      })
    } else {
      roleAdd(params).then((res: any) => {
        if (res.code === 200) {
          toast.success("创建成功")
          navigate(-1)
        }
      })
    }
  }
  // 获取详情
  function initDetail() {
    roleDetail({ id }).then(res => {
      console.log(res);
      console.log(res.data.purviewIdList.toString());
      setDataform({
        ...res.data,
        purviewIdList: res.data.purviewIdList.toString()
      })
    })
  }

  return (<>{renderAmis(
    {
      type: "page",
      title: id ? "修改角色" : "新建角色",
      body: [
        {
          type: "flex",
          className: "p-1",
          items: [
          ],
          style: {
            position: "relative"
          },
        },
        {
          type: "form",
          body: [
            {
              label: "角色名称",
              type: "input-text",
              name: "roleName",
              value: dataForm.roleName,
              mode: "inline",
              required: true
            },
            {
              type: "input-tree",
              label: "权限配置",
              name: "purviewIdList",
              value: dataForm.purviewIdList,
              options: filterList,
              multiple: true,
              enableNodePath: false,
              hideRoot: true,
              showIcon: false,
              initiallyOpen: true,
              onlyLeaf: true,
              showRadio: true,
              showOutline: false,
              autoCheckChildren: true,
              cascade: true,
              onlyChildren: true,
              withChildren: true,
              required: true
            }
          ],
          mode: "normal",
          submitText: "保存",
          onSubmit: (e: any) => {
            submit(e)
          }
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

export default RoleDetail