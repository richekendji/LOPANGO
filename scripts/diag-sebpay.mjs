// Diagnostic SebPay — cherche la section "authentication" de la doc
(async () => {
  const r = await fetch("https://new.sebpay.bj/fr/docs", {
    signal: AbortSignal.timeout(15000),
  });
  const t = await r.text();
  // Le site Next.js embarque le contenu dans un payload JSON; chercher autour de "Authorization"/"X-API-Key"/"base"
  for (const kw of ["X-API-Key", "X-Api-Key", "Authorization", "Bearer", "api.sebpay", "api_url", "baseUrl", "Base URL", "base_url"]) {
    let idx = 0;
    let count = 0;
    while (count < 3) {
      const i = t.indexOf(kw, idx);
      if (i === -1) break;
      const ctx = t.slice(Math.max(0, i - 150), i + 250).replace(/\s+/g, " ");
      console.log(`\n[${kw}] ...${ctx}...`);
      idx = i + 1;
      count++;
    }
    if (count === 0) console.log(`\n[${kw}] — absent`);
  }
})();
