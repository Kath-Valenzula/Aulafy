/**
 * Proxy de API hacia Elastic Beanstalk.
 * Evita reenviar Origin/Referer para que el CORS del backend no bloquee Vercel.
 */
const API_BASE = 'http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api';

export const config = {
  matcher: '/api/:path*'
};

export default async function middleware(request: Request): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetPath = incomingUrl.pathname.replace(/^\/api/, '');
  const targetUrl = `${API_BASE}${targetPath}${incomingUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const authorization = request.headers.get('authorization');

  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  if (authorization) {
    headers.set('Authorization', authorization);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('transfer-encoding');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}
