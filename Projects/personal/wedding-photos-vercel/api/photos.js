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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 从 Cloudinary 获取所有照片
    const result = await cloudinary.search
      .expression(`folder:${FOLDER_NAME}`)
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    const photos = result.resources.map(photo => ({
      filename: photo.public_id.replace(`${FOLDER_NAME}/`, ''),
      size: photo.bytes,
      upload_time: photo.created_at,
      url: photo.secure_url,
      original_url: cloudinary.url(photo.public_id, {
        resource_type: 'image',
        type: 'upload',
        flags: 'attachment'
      })
    }));

    res.status(200).json({
      success: true,
      photos
    });
  } catch (error) {
    console.error('获取照片列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
