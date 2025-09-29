import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET' && req.url?.includes('/user/profile')) {
      // 获取用户配置 - 简化版本，返回模拟数据
      res.json({
        profile: {
          display_name: "Demo User (Vercel)",
          email: "demo@example.com",
        },
      });
      
    } else if (req.method === 'GET' && req.url?.includes('/user/capabilities')) {
      // 获取用户能力 - 简化版本
      res.json({
        capabilities: {
          asset: { read: true, write: true },
          brandtemplate: { content: { read: true }, meta: { read: true } },
          design: { content: { read: true, write: true }, meta: { read: true } },
          profile: { read: true }
        }
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}