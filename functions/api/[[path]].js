/* ============================================================================
 * functions/api/[[path]].js —— Cloudflare Pages Functions 入口
 * ----------------------------------------------------------------------------
 * 部署到 Cloudflare Pages 后，所有 /api/xxx 的请求都会进到这里，
 * 然后交给 api/router.js 处理。
 *
 * 第一次请求时它会自动完成两件事（这样你就不用手动敲 SQL 命令了）：
 *   1. 建表（如果还不存在）
 *   2. 导入初始出书数据（只在表是空的时候做一次）
 *
 * 本地开发不用这个文件，用 tools/dev-server.mjs 即可（逻辑完全相同）。
 * ==========================================================================*/
import { handleApi } from '../../api/router.js';
import { createStore, migrate } from '../../api/store.js';
import { SCHEMA_SQL } from '../../api/schema.js';
import { SEED_BOOKS } from '../../api/seed.js';

/* 同一个 isolate 里只需要做一次 */
let bootstrapped = false;

async function bootstrap(env) {
  if (bootstrapped) return;
  if (!env || !env.DB) return;
  await migrate(env.DB, SCHEMA_SQL);
  await createStore(env.DB).seedIfEmpty(SEED_BOOKS);
  bootstrapped = true;
}

export async function onRequest(context) {
  const { request, env } = context;
  try {
    await bootstrap(env);
  } catch (e) {
    // 初始化失败不要挡住请求：下一次请求会再试一次
    console.error('数据库初始化失败：' + (e && e.message));
  }
  return handleApi(request, env);
}
