import { message } from "antd";
export function downloadFile(download: any, data: any, name: any) {
  message.loading('下载中')
  download(data).then((res: any) => {
    const downloadElement = document.createElement('a');
    const href = window.URL.createObjectURL(res); // 创建下载的链接
    downloadElement.href = href;
    downloadElement.download = name; // 下载后文件名
    document.body.appendChild(downloadElement);
    downloadElement.click(); // 点击下载
    document.body.removeChild(downloadElement); // 下载完成移除元素
    window.URL.revokeObjectURL(href); // 释放掉blob对象
    message.destroy();
    message.success('下载成功');
  })
}