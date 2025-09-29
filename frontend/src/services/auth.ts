// OAuth 2.0 + PKCE 授权流程
export const getCanvaAuthorization = async (): Promise<string | undefined> => {
  try {
    const clientId = process.env.CANVA_CLIENT_ID || 'OC-AZbW7d5jk2-P';
    const redirectUrl = window.location.origin + '/api/oauth/redirect';
    
    // 生成 PKCE code challenge
    const codeChallenge = await generateCodeChallenge();
    
    // 生成随机 state
    const state = btoa(crypto.getRandomValues(new Uint8Array(32)).toString())
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    localStorage.setItem('canva_oauth_state', state);
    
    // 正确的 scope 列表
    const scopes = [
      'asset:read',
      'asset:write',
      'brandtemplate:content:read',
      'brandtemplate:meta:read',
      'design:content:read',
      'design:content:write',
      'design:meta:read',
      'profile:read'
    ];
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUrl,
      response_type: 'code',
      scope: scopes.join(' '),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state
    });
    
    const authUrl = `https://www.canva.cn/api/oauth/authorize?${params.toString()}`;
    
    // 跳转到认证页面
    window.location.href = authUrl;
    
    return undefined; // 不会立即返回 token，需要等待回调
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
};

// 生成 PKCE code challenge
const generateCodeChallenge = async (): Promise<string> => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  localStorage.setItem('canva_code_verifier', codeVerifier);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hash);
  return btoa(String.fromCharCode.apply(null, Array.from(hashArray)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const revoke = async () => {
  // 简化的撤销函数，清除本地存储
  localStorage.removeItem('canva_access_token');
  localStorage.removeItem('canva_oauth_state');
  localStorage.removeItem('canva_code_verifier');
  return true;
};

export const checkForAccessToken = async (): Promise<{
  token?: string;
}> => {
  // 检查 URL 参数中是否有 access token
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  
  if (accessToken) {
    // 存储 token 到 localStorage
    localStorage.setItem('canva_access_token', accessToken);
    
    // 清除 URL 中的 token
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('access_token');
    window.history.replaceState({}, '', newUrl.toString());
    
    return { token: accessToken };
  }
  
  // 检查 localStorage 中的 token
  const storedToken = localStorage.getItem('canva_access_token');
  return { token: storedToken || undefined };
};