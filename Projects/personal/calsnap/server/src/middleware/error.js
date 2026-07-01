import { send, sendError } from '../utils/response.js';

export default function errorHandler(err, _req, reply) {
  const isMissingMultipart = err.statusCode === 406 && err.message === 'the request is not multipart';
  const status = isMissingMultipart ? 400 : (err.statusCode || 500);
  const message = isMissingMultipart
    ? '请上传食物图片'
    : err.validation
    ? err.validation.map(v => v.message).join('; ')
    : err.message || '服务器出了点问题';

  sendError(reply, status, message);
}
