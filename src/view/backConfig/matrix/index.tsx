import React, { useEffect, useState } from 'react';
import { render as renderAmis, ToastComponent, AlertComponent } from 'amis';
import env from "../../../servers/env"
import { getDepartmentList, getDeptFcList } from "../../../servers/api/user"

const Matrix = () => {
  const [departmentList, setDepartmentList] = useState<any>([])
  const [deptFcList, setDeptFcList] = useState<any>([])
  const [searchForm, setSearchForm] = useState<any>({ current: 1, size: 10 })

  useEffect(() => {
    filterDepartmentList()
    filterDeptFcList()
  }, [])

  // 过滤部门list
  function filterDeptFcList() {
    getDeptFcList().then(res => {
      let list: any = []
      res.data.map((item: any) => {
        list.push({
          label: item.userName,
          value: item.userId,
        })
      })
      setDeptFcList(list)
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
  // 过滤tableData 添加序号
  function filterTableData(payload: any) {
    let responseData = { ...payload }
    responseData.data.records = responseData.data.records.map((item: any, index: number) => {
      return {
        ...item,
        number: index + 1
      }
    })
    setSearchForm({ ...searchForm, total: responseData.data.total })
    return responseData
  }

  return (<>{renderAmis(
    {
      type: "page",
      title: "财务对应事业部矩阵",
      body: [
        {
          type: "crud",
          id: "crud",
          api: {
            method: "post",
            url: "/rolling-system-web/deptFc/getDeptFcPage",
            // data: searchForm,
            adaptor: function (payload: any, response: any) {
              return filterTableData(payload)
            }
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
                      type: "form",
                      mode: "horizontal",
                      columnCount: 2,
                      wrapWithPanel: false,
                      body: [
                        {
                          type: "nested-select",
                          name: "deptId",
                          label: "立项事业部",
                          searchable: true,
                          clearable: true,
                          options: departmentList,
                          onEvent: {
                            change: {
                              actions: [
                                {
                                  componentId: "crud",
                                  actionType: "reload"
                                }
                              ]
                            }
                          },
                        }, {
                          type: "select",
                          name: "userId",
                          label: "财务FC",
                          clearable: true,
                          options: deptFcList,
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
                      ]
                    },
                    style: {
                      "flex": "0 0 150px",
                      "flexBasis": "85%",
                    },
                  },
                  // {
                  //   type: "container",
                  //   body: {
                  //     type: "nested-select",
                  //     name: "deptId",
                  //     label: "立项事业部",
                  //     searchable: true,
                  //     clearable: true,
                  //     size: "lg",
                  //     options: departmentList,
                  //     onEvent: {
                  //       change: {
                  //         actions: [
                  //           {
                  //             componentId: "crud",
                  //             actionType: "reload"
                  //           }
                  //         ]
                  //       }
                  //     },
                  //   },
                  //   style: {
                  //     "flex": "0 0 150px",
                  //     "flexBasis": "42.5%",
                  //   },
                  // },
                  // {
                  //   type: "container",
                  //   body: [
                  //     {
                  //       type: "select",
                  //       name: "userId",
                  //       label: "财务FC",
                  //       clearable: true,
                  //       size: "lg",
                  //       options: deptFcList,
                  //       onEvent: {
                  //         change: {
                  //           actions: [
                  //             {
                  //               componentId: "crud",
                  //               actionType: "reload"
                  //             }
                  //           ]
                  //         }
                  //       }
                  //     },
                  //   ],
                  //   style: {
                  //     "flex": "0 0 150px",
                  //     "flexBasis": "42.5%",
                  //   },
                  // },
                  {
                    type: "container",
                    body: [
                      // {
                      //   type: "submit",
                      //   label: "查询",
                      //   level: "primary",
                      //   style: {
                      //     "marginRight": "20px"
                      //   }
                      // },
                      {
                        type: "reset",
                        label: "重置",
                      },
                    ],
                    style: {
                      "flex": "0 0 150px",
                      "flexBasis": "15%",
                      "textAlign": "right"
                    },
                  },
                ],
                style: {
                  "alignItems": "start",
                },
              },
            ]
          },
          footerToolbar: [
            "pagination",
            "switch-per-page",
          ],
          pageField: "current",
          perPageField: "size",
          alwaysShowPagination: true,
          autoJumpToTopOnPagerChange: true,
          autoFillHeight: true,
          showIndex: true,
          columns: [
            {
              name: `number`,
              label: "序号",
              type: "text",
              width: 100,
            },
            {
              name: "deptName",
              label: "立项事业部",
              type: "text"
            },
            {
              name: "fcName",
              label: "财务FC",
              type: "text"
            },
          ],
        },
      ],
    },
    {},
    env
  )}</>)
}

export default Matrix