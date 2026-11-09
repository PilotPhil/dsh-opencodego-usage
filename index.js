/**
 * Host half of the OpenCode Go quota bundle.
 *
 * Reads the OpenCode Go allowance (`GET https://opencode.ai/zen/go/v1/usage`) with the
 * user's OpenCode API key and publishes the result twice, from one implementation:
 *   - the `opencode_go_quota` agent tool, so the model can answer "how much is left?";
 *   - a same-origin JSON route the Client widget reads, because the browser half never
 *     talks to a third-party origin and never sees the key.
 *
 * The key is resolved through the credential seam under the env-style name
 * `OPENCODE_GO_API_KEY` (the same name the OpenCode Go LLM provider uses), so a key that
 * already works for inference needs no separate setup.
 */

const API_KEY_REF = 'OPENCODE_GO_API_KEY'
const USAGE_URL = 'https://opencode.ai/zen/go/v1/usage'
const ROUTE = '/api/opencode-go-quota'
const CACHE_MS = 30_000
const WINDOWS = ['rolling', 'weekly', 'monthly']

/** Last successful read, so a widget poll and a tool call in the same minute share one request. */
let cache = null

function clampPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10))
}

/** Node response helper: the route is a raw handler because resources only answer GET and HEAD. */
function sendJson(response, headOnly, status, body) {
  const text = JSON.stringify(body)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text),
  })
  if (headOnly || status === 204) {
    response.end()
    return
  }
  response.end(text)
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 16 * 1024) throw new Error('body too large')
    chunks.push(chunk)
  }
  if (size === 0) return null
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function failure(code, message) {
  return { ok: false, code, message }
}

/** Read the key without ever logging or returning it. */
async function resolveApiKey(ctx) {
  const credentials = ctx.get('credentials')
  if (credentials !== undefined && typeof credentials.resolve === 'function') {
    try {
      const resolved = await credentials.resolve(API_KEY_REF)
      const value = resolved && typeof resolved.value === 'string' ? resolved.value.trim() : ''
      if (value !== '') return { key: value, source: resolved.source || 'credential' }
    } catch {
      // A broken credential store must not hide a working environment value.
    }
  }
  const ambient = process.env[API_KEY_REF]
  if (typeof ambient === 'string' && ambient.trim() !== '') {
    return { key: ambient.trim(), source: 'env' }
  }
  return { key: null, source: null }
}

/** Map the documented response onto plain window numbers; unknown shapes degrade per window. */
function normalizeUsage(body) {
  const usage = body && typeof body === 'object' ? (body.usage ?? body) : null
  if (usage === null || typeof usage !== 'object') return null
  const windows = {}
  let seen = false
  for (const name of WINDOWS) {
    const raw = usage[name]
    if (raw === null || typeof raw !== 'object') continue
    const usedPercent = clampPercent(raw.percent ?? raw.usedPercent ?? raw.used)
    const resetsAt = typeof raw.resetsAt === 'string'
      ? raw.resetsAt
      : typeof raw.resets_at === 'string' ? raw.resets_at : null
    windows[name] = {
      usedPercent,
      limited: raw.status === 'rate-limited' || raw.limited === true || (usedPercent !== null && usedPercent >= 100),
      resetsAt,
    }
    seen = true
  }
  return seen ? windows : null
}

async function readUsage(key) {
  let response
  try {
    response = await fetch(USAGE_URL, {
      method: 'GET',
      headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return failure('offline', 'Cannot reach opencode.ai. Check the network and try again.')
  }
  if (response.status === 401) {
    return failure('unauthorized', 'OpenCode rejected this API key (HTTP 401). Paste a current key.')
  }
  if (response.status === 403) {
    return failure('no-subscription', 'This workspace has no OpenCode Go subscription (HTTP 403).')
  }
  if (!response.ok) {
    return failure('http', `opencode.ai answered HTTP ${response.status}.`)
  }
  let body
  try {
    body = await response.json()
  } catch {
    return failure('malformed', 'opencode.ai returned a body that is not JSON.')
  }
  const windows = normalizeUsage(body)
  if (windows === null) {
    return failure('malformed', 'The usage response carried no 5-hour, weekly or monthly window.')
  }
  return { ok: true, windows }
}

async function cachedUsage(key, refresh) {
  if (!refresh && cache !== null && cache.key === key && Date.now() - cache.at < CACHE_MS) {
    return { ...cache.result, fetchedAt: new Date(cache.at).toISOString(), cached: true }
  }
  const result = await readUsage(key)
  if (result.ok) {
    cache = { key, at: Date.now(), result }
    return { ...result, fetchedAt: new Date(cache.at).toISOString(), cached: false }
  }
  return result
}

/** Shape shared by the tool and the route, so both callers read the same fields. */
async function snapshot(ctx, refresh) {
  const { key, source } = await resolveApiKey(ctx)
  if (key === null) {
    return {
      ok: false,
      configured: false,
      code: 'unconfigured',
      message: `No OpenCode API key. Paste one in the OpenCode Go widget, or set ${API_KEY_REF}.`,
    }
  }
  const result = await cachedUsage(key, refresh)
  if (!result.ok) return { ...result, configured: true, source }
  return { ok: true, configured: true, source, windows: result.windows, fetchedAt: result.fetchedAt, cached: result.cached }
}

function describeWindow(name, entry) {
  const label = name === 'rolling' ? '5h' : name === 'weekly' ? 'week' : 'month'
  if (entry === undefined || entry.usedPercent === null) return `${label} unknown`
  const remaining = Math.round(Math.max(0, 100 - entry.usedPercent))
  const reset = entry.resetsAt === null ? '' : `, resets ${entry.resetsAt}`
  const limited = entry.limited ? ' (limit reached)' : ''
  return `${label} ${remaining}% left${reset}${limited}`
}

function summarize(result) {
  if (result.ok !== true) {
    return `OpenCode Go: ${result.message ?? result.code ?? 'query failed'}`
  }
  const parts = WINDOWS.map((name) => describeWindow(name, result.windows[name]))
  return `OpenCode Go allowance: ${parts.join(' · ')}. Percentages are each window's own allowance.`
}

export function apply(ctx) {
  const tools = ctx.get('tools')
  if (tools !== undefined && typeof tools.register === 'function') {
    ctx.effect(() => tools.register({
      name: 'opencode_go_quota',
      description:
        'Report how much of the OpenCode Go subscription allowance is left in its three windows: '
        + 'the rolling 5-hour window, the weekly window and the monthly window. Each value is a '
        + 'percentage of that window\'s own allowance, with the time the window resets.',
      parameters: {
        type: 'object',
        properties: {
          refresh: {
            type: 'boolean',
            description: 'Bypass the 30 second cache and read opencode.ai again.',
          },
        },
        additionalProperties: false,
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            configured: { type: 'boolean' },
            code: { type: 'string' },
            message: { type: 'string' },
            source: { type: 'string' },
            fetchedAt: { type: 'string' },
            cached: { type: 'boolean' },
            windows: {
              type: 'object',
              properties: {
                rolling: { type: 'object', properties: { usedPercent: { type: 'number' }, limited: { type: 'boolean' }, resetsAt: { type: 'string' } } },
                weekly: { type: 'object', properties: { usedPercent: { type: 'number' }, limited: { type: 'boolean' }, resetsAt: { type: 'string' } } },
                monthly: { type: 'object', properties: { usedPercent: { type: 'number' }, limited: { type: 'boolean' }, resetsAt: { type: 'string' } } },
              },
            },
          },
        },
        render: (_args, value) => [{ type: 'text', text: summarize(value) }],
      },
      async execute(args) {
        const refresh = args !== null && typeof args === 'object' && args.refresh === true
        return snapshot(ctx, refresh)
      },
    }))
  }

  const webServer = ctx.get('webServer')
  if (webServer !== undefined && typeof webServer.register === 'function') {
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: ROUTE,
      handler: async (request, response) => {
        const reply = (status, body) => sendJson(response, request.method === 'HEAD', status, body)
        try {
          if (request.method === 'GET' || request.method === 'HEAD') {
            reply(200, await snapshot(ctx, false))
            return
          }
          if (request.method !== 'POST') {
            response.writeHead(405, { allow: 'GET, HEAD, POST' })
            response.end()
            return
          }
          let body
          try {
            body = await readJsonBody(request)
          } catch {
            reply(400, { ok: false, code: 'bad-request', message: 'Expected a JSON body.' })
            return
          }
          if (body === null || typeof body !== 'object') {
            reply(400, { ok: false, code: 'bad-request', message: 'Expected a JSON object.' })
            return
          }
          const submitted = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
          if (submitted === '') {
            reply(400, { ok: false, code: 'missing-key', message: 'The API key is empty.' })
            return
          }
          const probe = await readUsage(submitted)
          if (probe.ok !== true) {
            const current = await resolveApiKey(ctx)
            reply(200, { ...probe, configured: current.key !== null })
            return
          }
          const credentials = ctx.get('credentials')
          if (credentials === undefined || typeof credentials.set !== 'function') {
            reply(200, {
              ok: false,
              code: 'no-credential-store',
              message: `This profile cannot store credentials. Set ${API_KEY_REF} in the environment instead.`,
              configured: true,
            })
            return
          }
          try {
            await credentials.set(API_KEY_REF, submitted)
          } catch (error) {
            reply(200, {
              ok: false,
              code: 'store-failed',
              message: `The key works but could not be saved: ${error instanceof Error ? error.message : String(error)}`,
              configured: true,
            })
            return
          }
          cache = { key: submitted, at: Date.now(), result: probe }
          reply(200, {
            ok: true,
            configured: true,
            source: 'credential',
            windows: probe.windows,
            fetchedAt: new Date(cache.at).toISOString(),
          })
        } catch (error) {
          try {
            reply(500, { ok: false, code: 'internal', message: error instanceof Error ? error.message : String(error) })
          } catch {
            // The socket is already gone.
          }
        }
      },
    }))
  }
}
