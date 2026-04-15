import Axios from "axios";
import { ElMessage } from 'element-plus'

const axios = Axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9800',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    transformRequest: [(data, headers) => {
            // 返回json
            return JSON.stringify(data);
        },
    ],
    transformResponse: [
    function (response: Response) {
      // 修复类型错误，确保response符合Response类型
      response = response || {code: 0, message: '', data: null};

      if (typeof response === 'string') response = JSON.parse(response);

      if (response.message) {
        let type: string;
        switch (response.code) {
          case 0:
            type = 'success';
            break;
          case 1:
            type = 'error';
            break;
          case 2:
            type = 'warning';
            break;
          case 200:
            type = 'success';
            break;
          case 400:
            type = 'error';
            break;
          case 401:
            type = 'error';
            break;
          case 403:
            type = 'error';
            break;
          case 404:
            type = 'error';
            break;
          case 500:
            type = 'error';
            break;
          default:
            type = 'info';
            break;
        }

        ElMessage({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          message: response.message,
          type: type,
        });
      }

      return response;
    },
  ],
});

export default axios;