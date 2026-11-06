const cloudinary = require('cloudinary').v2;

// Cloudinary 配置
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const FOLDER_NAME = 'wedding-photos';

module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 解析 multipart/form-data
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 提取文件内容
    const boundary = req.headers['content-type'].split('boundary=')[1];
    const parts = buffer.toString('binary').split('--' + boundary);

    let fileData = null;
    let filename = null;

    for (const part of parts) {
      if (part.includes('filename=')) {
        const filenameMatch = part.match(/filename="(.+?)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }

        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const content = part.substring(headerEnd + 4);
          fileData = Buffer.from(content.trim(), 'binary');
        }
      }
    }

    if (!fileData || !filename) {
      return res.status(400).json({
        success: false,
        error: '未找到上传文件'
      });
    }

    // 上传到 Cloudinary（保留原图）
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: FOLDER_NAME,
          public_id: filename.replace(/\.[^/.]+$/, ''),
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(fileData);
    });

    res.status(200).json({
      success: true,
      message: '上传成功',
      filename: result.public_id.replace(`${FOLDER_NAME}/`, ''),
      url: result.secure_url
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
