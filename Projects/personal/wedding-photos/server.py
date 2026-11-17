#!/usr/bin/env python3
"""
婚礼图片服务器
支持原图上传和下载的本地服务器
"""

import os
import json
import shutil
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import mimetypes

# 配置
PORT = 8080
UPLOAD_DIR = 'uploads'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

class WeddingPhotoHandler(SimpleHTTPRequestHandler):
    """自定义请求处理器"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='.', **kwargs)

    def do_GET(self):
        """处理GET请求"""
        parsed_path = urlparse(self.path)

        # API: 获取图片列表
        if parsed_path.path == '/api/photos':
            self.handle_get_photos()
        # API: 下载图片
        elif parsed_path.path.startswith('/api/download/'):
            filename = parsed_path.path.replace('/api/download/', '')
            self.handle_download_photo(filename)
        # 其他请求交给父类处理
        else:
            super().do_GET()

    def do_POST(self):
        """处理POST请求"""
        parsed_path = urlparse(self.path)

        # API: 上传图片
        if parsed_path.path == '/api/upload':
            self.handle_upload_photo()
        # API: 删除图片
        elif parsed_path.path.startswith('/api/delete/'):
            filename = parsed_path.path.replace('/api/delete/', '')
            self.handle_delete_photo(filename)
        else:
            self.send_error(404, "Not Found")

    def handle_get_photos(self):
        """获取所有图片列表"""
        try:
            if not os.path.exists(UPLOAD_DIR):
                os.makedirs(UPLOAD_DIR)

            photos = []
            for filename in os.listdir(UPLOAD_DIR):
                if self.allowed_file(filename):
                    filepath = os.path.join(UPLOAD_DIR, filename)
                    stat = os.stat(filepath)
                    photos.append({
                        'filename': filename,
                        'size': stat.st_size,
                        'upload_time': stat.st_mtime,
                        'url': f'/uploads/{filename}'
                    })

            # 按上传时间倒序排列
            photos.sort(key=lambda x: x['upload_time'], reverse=True)

            self.send_json_response({'success': True, 'photos': photos})
        except Exception as e:
            self.send_json_response({'success': False, 'error': str(e)}, 500)

    def handle_upload_photo(self):
        """处理图片上传"""
        try:
            content_type = self.headers.get('Content-Type', '')

            if 'multipart/form-data' not in content_type:
                self.send_json_response({'success': False, 'error': '需要 multipart/form-data'}, 400)
                return

            # 解析 boundary
            boundary = content_type.split('boundary=')[1].encode()

            # 读取数据
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > MAX_FILE_SIZE:
                self.send_json_response({'success': False, 'error': f'文件大小超过限制({MAX_FILE_SIZE//1024//1024}MB)'}, 400)
                return

            body = self.rfile.read(content_length)

            # 解析 multipart 数据
            parts = body.split(b'--' + boundary)

            for part in parts:
                if b'filename=' in part:
                    # 提取文件名
                    filename_start = part.find(b'filename="') + 10
                    filename_end = part.find(b'"', filename_start)
                    filename = part[filename_start:filename_end].decode('utf-8')

                    # 提取文件内容
                    content_start = part.find(b'\r\n\r\n') + 4
                    content_end = part.rfind(b'\r\n')
                    file_content = part[content_start:content_end]

                    # 检查文件类型
                    if not self.allowed_file(filename):
                        self.send_json_response({'success': False, 'error': f'不支持的文件类型'}, 400)
                        return

                    # 确保上传目录存在
                    if not os.path.exists(UPLOAD_DIR):
                        os.makedirs(UPLOAD_DIR)

                    # 保存文件（保留原文件名，如果冲突则添加时间戳）
                    original_filename = filename
                    counter = 1
                    while os.path.exists(os.path.join(UPLOAD_DIR, filename)):
                        name, ext = os.path.splitext(original_filename)
                        filename = f"{name}_{counter}{ext}"
                        counter += 1

                    filepath = os.path.join(UPLOAD_DIR, filename)
                    with open(filepath, 'wb') as f:
                        f.write(file_content)

                    self.send_json_response({
                        'success': True,
                        'message': '上传成功',
                        'filename': filename
                    })
                    return

            self.send_json_response({'success': False, 'error': '未找到上传文件'}, 400)

        except Exception as e:
            self.send_json_response({'success': False, 'error': str(e)}, 500)

    def handle_download_photo(self, filename):
        """下载原图"""
        try:
            filepath = os.path.join(UPLOAD_DIR, filename)

            if not os.path.exists(filepath):
                self.send_error(404, "File not found")
                return

            # 获取 MIME 类型
            mime_type, _ = mimetypes.guess_type(filepath)

            # 读取文件
            with open(filepath, 'rb') as f:
                file_content = f.read()

            # 发送响应
            self.send_response(200)
            self.send_header('Content-Type', mime_type or 'application/octet-stream')
            self.send_header('Content-Length', len(file_content))
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.end_headers()
            self.wfile.write(file_content)

        except Exception as e:
            self.send_error(500, str(e))

    def handle_delete_photo(self, filename):
        """删除图片"""
        try:
            filepath = os.path.join(UPLOAD_DIR, filename)

            if not os.path.exists(filepath):
                self.send_json_response({'success': False, 'error': '文件不存在'}, 404)
                return

            os.remove(filepath)
            self.send_json_response({'success': True, 'message': '删除成功'})

        except Exception as e:
            self.send_json_response({'success': False, 'error': str(e)}, 500)

    def allowed_file(self, filename):
        """检查文件扩展名是否允许"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def send_json_response(self, data, status=200):
        """发送 JSON 响应"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

def run_server():
    """启动服务器"""
    # 确保上传目录存在
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    server_address = ('', PORT)
    httpd = HTTPServer(server_address, WeddingPhotoHandler)

    print(f"""
╔════════════════════════════════════════════════════════════╗
║            婚礼图片下载服务器已启动                          ║
╠════════════════════════════════════════════════════════════╣
║  上传页面: http://localhost:{PORT}/upload.html              ║
║  下载页面: http://localhost:{PORT}/download.html            ║
║  图片目录: {os.path.abspath(UPLOAD_DIR):20s}               ║
╚════════════════════════════════════════════════════════════╝

支持功能:
  ✓ 上传原图高清图片 (最大 {MAX_FILE_SIZE//1024//1024}MB)
  ✓ 原图预览和下载
  ✓ 支持 JPG, PNG, GIF, WebP, HEIC 等格式

按 Ctrl+C 停止服务器
    """)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n服务器已停止")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
