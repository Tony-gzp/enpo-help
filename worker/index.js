/* ============================================================================
 * worker/index.js —— Cloudflare Worker 入口（网站的主程序）
 * ----------------------------------------------------------------------------
 * 这个项目部署成 Cloudflare 的「Worker + 静态资源」：
 *   - 静态文件（HTML / CSS / JS / 图片）由 Cloudflare 直接发给浏览器，速度最快
 *   - 只有 /api/xxx 的请求会进到这个文件里，交给 api/router.js 处理
 *
 * 第一次收到请求时它会自动完成两件事（这样你就不用手动建表了）：
 *   1. 建表（如果还不存在）
 *   2. 导入初始出书数据（只在表是空的时候做一次）
 *
 * 本地开发不用这个文件，用 tools/dev-server.mjs 即可（逻辑完全相同）。
 * ==========================================================================*/
import { handleApi } from '../api/router.js';
import { createStore, migrate } from '../api/store.js';
import { SCHEMA_SQL } from '../api/schema.js';
import { SEED_BOOKS } from '../api/seed.js';

/* 同一个 Worker 实例里只需要初始化一次 */
let bootstrapped = false;

async function bootstrap(env) {
  if (bootstrapped) return;
  if (!env || !env.DB) return;
  await migrate(env.DB, SCHEMA_SQL);
  await createStore(env.DB).seedIfEmpty(SEED_BOOKS);
  bootstrapped = true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /* ---------------- 接口 ---------------- */
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      try {
        await bootstrap(env);
      } catch (e) {
        // 初始化失败不要挡住请求：下一次请求会再试一次
        console.error('数据库初始化失败：' + (e && e.message));
      }
      return handleApi(request, env);
    }

    /* ---------------- 静态资源 ---------------- */
    // 能走到这里，说明没有匹配到任何静态文件（Cloudflare 会先把静态文件发出去）
    // 所以直接返回自定义的 404 页面
    if (env && env.ASSETS) {
      const notFound = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin)));
      if (notFound.ok) {
        return new Response(notFound.body, {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }
    return new Response('页面不存在', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
};
