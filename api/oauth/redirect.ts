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
    if (req.method === 'GET') {
      const { code, state, error, error_description } = req.query;
      
      // 如果有错误，重定向到前端错误页面
      if (error) {
        const errorUrl = new URL('/', req.headers.host || 'localhost:3000');
        errorUrl.searchParams.set('error', error as string);
        errorUrl.searchParams.set('error_description', error_description as string);
        
        return res.redirect(errorUrl.toString());
      }
      
      // 验证 state
      // 这里可以添加 state 验证逻辑
      
      if (!code) {
        return res.status(400).send('Authorization code not provided');
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
          redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/oauth/redirect`,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Token exchange failed:', errorData);
        
        const errorUrl = new URL('/', req.headers.host || 'localhost:3000');
        errorUrl.searchParams.set('error', 'token_exchange_failed');
        errorUrl.searchParams.set('error_description', 'Failed to exchange authorization code for access token');
        
        return res.redirect(errorUrl.toString());
      }

      const tokenData = await tokenResponse.json();
      
      // 重定向到前端，携带 access token
      const successUrl = new URL('/', req.headers.host || 'localhost:3000');
      successUrl.searchParams.set('access_token', tokenData.access_token);
      
      return res.redirect(successUrl.toString());
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('OAuth redirect error:', error);
    
    const errorUrl = new URL('/', req.headers.host || 'localhost:3000');
    errorUrl.searchParams.set('error', 'internal_error');
    errorUrl.searchParams.set('error_description', 'Internal server error');
    
    return res.redirect(errorUrl.toString());
  }
}
