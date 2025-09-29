// demos/ecommerce_shop/scripts/list-brand-templates.ts

const TOKEN = process.env.CANVA_TOKEN;
const BASE = "https://api.canva.cn";

if (!TOKEN) {
  console.error("Missing CANVA_TOKEN env. Run with: CANVA_TOKEN=xxx npm run list:templates");
  process.exit(1);
}

async function run() {
  let continuation: string | undefined;
  let total = 0;

  while (true) {
    const url = new URL(`${BASE}/v1/brand-templates`);
    if (continuation) url.searchParams.set("continuation", continuation);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!res.ok) {
      console.error("HTTP", res.status, await res.text());
      process.exit(1);
    }

    const body = await res.json();
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) break;

    total += items.length;
    console.log(`Fetched ${items.length}, total=${total}`);

    if (!body.continuation) break;
    continuation = body.continuation;
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});