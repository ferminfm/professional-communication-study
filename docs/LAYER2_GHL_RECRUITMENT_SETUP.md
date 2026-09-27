# Layer 2 GoHighLevel recruitment setup — brand study

## Goal

Prepare GoHighLevel for low-cost recruitment and follow-up for the deployed multilingual naming study, without linking survey answers to CRM identities and without leaking KUMIAY branding into the study.

Live neutral survey base:

https://professional-communication-study.professional-research.workers.dev

Routes:

- ES: https://professional-communication-study.professional-research.workers.dev/es
- EN: https://professional-communication-study.professional-research.workers.dev/en
- JA: https://professional-communication-study.professional-research.workers.dev/ja

Known HighLevel location ID from the existing account context:

`M0NQRuYV8QKmbFi4GUbb`

## Non-negotiable boundaries

1. Do not modify existing KUMIAY production forms, translation workflows, pipelines, client records, phone settings, domains, or sender identities.
2. Do not invite existing leads/clients merely because they are present in the CRM. Recruitment targets require explicit user selection.
3. Do not append a contact ID, email, phone number, or other direct identifier to the survey URL.
4. Do not import Cloudflare/D1 survey answers into GHL.
5. Do not add tags revealing a respondent's preferred candidate.
6. Do not send any real invitation until the user approves the exact recipient set and message.
7. Respect existing unsubscribe/DND status.
8. The survey URL and participant-facing sender identity must not mention KUMIAY.

## Authentication

The local Codex MCP is configured as:

```
ghl  https://services.leadconnectorhq.com/mcp/
```

Authenticate it first:

```bash
codex mcp login ghl
```

If OAuth is unavailable or fails, use a HighLevel Private Integration Token for the exact location above. Create it in:

Settings → Private Integrations → Create New Integration

Grant only the minimum scopes needed for setup, preferably:

- Contacts: view/edit
- Conversations: view/edit
- Conversation Messages: view/edit
- Locations: view
- Custom Fields / Custom Values: view/edit if supported
- Workflows: view/edit only if exposed by the current MCP/API surface

Do not grant payments, calendars, opportunities, users, or unrelated scopes for this study unless a concrete operation requires them.

Never commit or print the token.

## Phase 1 — audit current sender identity

Before creating any outbound workflow, inspect the selected HighLevel location for:

- business/location name;
- logo;
- email From name;
- email From address/domain;
- SMS/WhatsApp sender number and visible business identity;
- any footer text automatically added to outbound email;
- connected Facebook/Instagram pages if relevant.

Classify each outbound channel as:

- NEUTRAL_OK — nothing reveals KUMIAY or a candidate name;
- KUMIAY_BRANDED — KUMIAY is visible;
- OTHER_IDENTIFYING — founder/company identity may bias the study;
- UNKNOWN.

Do not alter existing sender identities to make them neutral. Report the audit. If GHL outbound identity is not neutral, use GHL only to organize recruitment and send invitations through the user's personal Gmail/WhatsApp or another explicitly approved neutral sender.

## Phase 2 — create research-only tags

Create only if missing:

- `research.brand-study.pilot`
- `research.brand-study.es`
- `research.brand-study.en`
- `research.brand-study.ja`
- `research.brand-study.technical`
- `research.brand-study.general`
- `research.brand-study.industry`
- `research.brand-study.academic`
- `research.brand-study.invited`
- `research.brand-study.reminder-sent`

Do not apply them to any real contact yet unless the user has explicitly approved that contact.

## Phase 3 — create neutral survey links / custom values

If HighLevel Custom Values are available, create:

- `brand_study_base_url` =
  `https://professional-communication-study.professional-research.workers.dev`

- `brand_study_es_email` =
  `https://professional-communication-study.professional-research.workers.dev/es?src=ghl-email&medium=email&campaign=name-study-v1&cohort=general`

- `brand_study_es_technical_whatsapp` =
  `https://professional-communication-study.professional-research.workers.dev/es?src=ghl-whatsapp&medium=whatsapp&campaign=name-study-v1&cohort=technical`

- `brand_study_en_email` =
  `https://professional-communication-study.professional-research.workers.dev/en?src=ghl-email&medium=email&campaign=name-study-v1&cohort=industry`

- `brand_study_ja_email` =
  `https://professional-communication-study.professional-research.workers.dev/ja?src=ghl-email&medium=email&campaign=name-study-v1&cohort=academic`

No per-contact tracking token is allowed.

## Phase 4 — create invitation templates, but DO NOT send

Create three draft templates.

### Spanish

Subject:
`Encuesta breve sobre comunicación profesional`

Body:

`Estoy haciendo una prueba breve sobre cómo se perciben algunos nombres y materiales de una empresa de ingeniería. Toma aproximadamente 8–12 minutos. No pide nombre, correo ni datos de contacto, y las respuestas se guardan separadas de mi lista de contactos.

[ENLACE]

Gracias por ayudarme con una primera impresión independiente.`

### English

Subject:
`Short professional communication study`

Body:

`I am running a short study on how several names and professional materials are perceived for an engineering business. It takes about 8–12 minutes. The survey does not ask for your name, email, or contact details, and responses are stored separately from my contact list.

[LINK]

Thank you for providing an independent first impression.`

### Japanese

Subject:
`短いコミュニケーション調査へのご協力のお願い`

Body:

`工学系ビジネスで使用する名称や説明文の第一印象について、8〜12分程度の短い調査を行っています。氏名、メールアドレス、電話番号などの連絡先情報は入力しません。回答は連絡先リストとは別に保存されます。

[リンク]

率直な第一印象をご回答いただけると助かります。`

Replace the placeholder with the appropriate coarse-tracking URL only.

## Phase 5 — workflow/smart-list setup

For the pilot, prefer a DRAFT/OFF workflow. Do not activate it.

Suggested name:

`Brand Study Pilot v1 — DRAFT`

Suggested logic if supported:

1. Manual enrollment or trigger by tag `research.brand-study.pilot`.
2. Branch on language tag (es/en/ja).
3. Send the corresponding invitation ONLY if outbound sender identity is NEUTRAL_OK.
4. Add `research.brand-study.invited`.
5. STOP.

Do not automate a reminder during the first 8–12-person pilot because survey completion is anonymous and GHL cannot know who completed it without identity linkage.

After the pilot, a separate manual reminder step can be used:
- user reviews whether more responses are needed;
- explicitly approved contacts receive at most one reminder;
- add `research.brand-study.reminder-sent`.

If workflow creation is not exposed through MCP, use the HighLevel UI through browser/computer-use only for this isolated draft workflow. Do not alter unrelated workflows.

## Phase 6 — pilot recipient staging

Do not recruit from the existing CRM automatically.

Ask the user for an explicit pilot list of approximately 8–12 people, ideally:
- 3–5 Spanish speakers;
- 2–4 English speakers;
- 2–4 Japanese speakers;
- some technically informed, some nontechnical.

For each approved participant, create/update the contact only if needed and apply:
- `research.brand-study.pilot`
- one language tag;
- one cohort tag.

Do not add survey-answer data to the contact.

## Phase 7 — test before real sending

Before inviting real participants:

1. Send one test email/message to the user's own approved test contact.
2. Confirm sender name/domain/number is neutral enough.
3. Confirm the exact survey URL opens the correct language and stores source/campaign/cohort correctly.
4. Confirm no KUMIAY name/logo/footer appears unexpectedly.
5. If any branding leak exists, disable GHL sending and keep GHL as organizational CRM only.

## Completion report

Return:

- authentication method used;
- sender-identity audit;
- tags created;
- custom values/links created;
- templates created;
- workflow/smart list status;
- whether outbound GHL is neutral enough to use;
- no-send confirmation;
- smallest remaining user decision (normally the pilot recipient list).

Do not send invitations without explicit approval.
