const locationPath = 'http://127.0.0.1:3000/login'; // 本地
// const locationPath = 'http://192.168.55.34:83/login'; // 测试环境
const isDev = process.env.NODE_ENV === 'development';
const feishuPath = 'https://open.feishu.cn/open-apis/authen/v1/authorize';
export const appId = 'cli_a587db1669b9500c';
export const appSecret = 'RoFBwlN5YXKBP3TtkTwJAh5NkRByYger';
export const REDIRECT_URL = isDev ? locationPath : window.location.origin + '/login';
export const FRI_SHU_ACCEEDIT_HOME = `${feishuPath}?client_id=${appId}&redirect_uri=${REDIRECT_URL}&response_type=code`;