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
    if (req.method === 'GET' && req.url?.includes('/auth/canva')) {
      // Canva OAuth 认证
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
      }

      // 交换 code 获取 access token
      const tokenResponse = await fetch('https://www.canva.cn/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.CANVA_CLIENT_ID!,
          client_secret: process.env.CANVA_CLIENT_SECRET!,
          code: code as string,
          redirect_uri: `${process.env.FRONTEND_URL}/return-nav`,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      // 重定向到前端，携带 token
      res.redirect(`${process.env.FRONTEND_URL}/return-nav?access_token=${tokenData.access_token}`);
      
    } else if (req.method === 'GET' && req.url?.includes('/auth/revoke')) {
      // 撤销认证
      res.json({ success: true });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}