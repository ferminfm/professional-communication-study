const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) }
});

const csvEscape = (value) => {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

function authorized(request, env) {
  const h = request.headers.get('authorization') || '';
  return env.ADMIN_TOKEN && h === `Bearer ${env.ADMIN_TOKEN}`;
}

function safeSource(v) {
  const allowed = new Set(['direct', 'pilot', 'technical-network', 'ghl-email', 'ghl-whatsapp', 'facebook-organic', 'facebook-paid', 'linkedin', 'other']);
  return allowed.has(v) ? v : 'other';
}

function safeMedium(v) {
  const allowed = new Set(['link', 'email', 'whatsapp', 'facebook', 'linkedin', 'direct']);
  return allowed.has(v) ? v : 'link';
}

function safeCampaign(v) {
  return String(v || 'none').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 80) || 'none';
}

function safeCohort(v) {
  const allowed = new Set(['general', 'technical', 'founder-network', 'industry', 'academic']);
  return allowed.has(v) ? v : 'general';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({ ok: true, studyVersion: env.STUDY_VERSION });
    }

    if (url.pathname === '/api/submit' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, { status: 400 }); }

      const required = ['id', 'language', 'candidateOrder', 'answers', 'startedAt', 'submittedAt'];
      if (required.some(k => body[k] == null)) return json({ error: 'missing_fields' }, { status: 400 });
      if (!['es', 'en', 'ja'].includes(body.language)) return json({ error: 'invalid_language' }, { status: 400 });
      if (!Array.isArray(body.candidateOrder) || body.candidateOrder.length !== 4) return json({ error: 'invalid_candidate_order' }, { status: 400 });

      const started = Date.parse(body.startedAt);
      const submitted = Date.parse(body.submittedAt);
      if (!Number.isFinite(started) || !Number.isFinite(submitted) || submitted < started) return json({ error: 'invalid_timestamps' }, { status: 400 });
      const duration = Math.max(0, Math.min(7200, Math.round((submitted - started) / 1000)));

      try {
        await env.DB.prepare(`
          INSERT INTO responses
          (id, study_version, language, recruitment_source, recruitment_medium, campaign, cohort, candidate_order, answers_json, started_at, submitted_at, duration_seconds, completed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).bind(
          String(body.id).slice(0, 100),
          env.STUDY_VERSION,
          body.language,
          safeSource(body.source),
          safeMedium(body.medium),
          safeCampaign(body.campaign),
          safeCohort(body.cohort),
          JSON.stringify(body.candidateOrder),
          JSON.stringify(body.answers),
          body.startedAt,
          body.submittedAt,
          duration
        ).run();
      } catch (e) {
        if (String(e).includes('UNIQUE')) return json({ ok: true, duplicate: true });
        console.error(e);
        return json({ error: 'storage_failed' }, { status: 500 });
      }
      return json({ ok: true });
    }

    if (url.pathname === '/api/summary' && request.method === 'GET') {
      if (!authorized(request, env)) return json({ error: 'unauthorized' }, { status: 401 });
      const totals = await env.DB.prepare(`
        SELECT language, recruitment_source, recruitment_medium, campaign, cohort, COUNT(*) AS n
        FROM responses GROUP BY language, recruitment_source, recruitment_medium, campaign, cohort
        ORDER BY language, recruitment_source, recruitment_medium, campaign, cohort
      `).all();
      return json({ studyVersion: env.STUDY_VERSION, groups: totals.results || [] });
    }

    if (url.pathname === '/api/export.csv' && request.method === 'GET') {
      if (!authorized(request, env)) return json({ error: 'unauthorized' }, { status: 401 });
      const rows = await env.DB.prepare(`SELECT * FROM responses ORDER BY submitted_at ASC`).all();
      const cols = ['id','study_version','language','recruitment_source','recruitment_medium','campaign','cohort','candidate_order','answers_json','started_at','submitted_at','duration_seconds','completed'];
      const lines = [cols.join(',')];
      for (const row of rows.results || []) lines.push(cols.map(c => csvEscape(row[c])).join(','));
      return new Response(lines.join('\n'), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="brand-study-${new Date().toISOString().slice(0,10)}.csv"`
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
