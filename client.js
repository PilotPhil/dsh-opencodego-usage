window.__ModuleLoader__.load({
  id: '@pilot12138/dsh-opencodego-usage',
  factory(require) {
    const React = require('react')

    const ENDPOINT = '/api/opencode-go-quota'
    const NS = 'opencode-go-quota'
    const ANCHOR_SLOT = 'sidebar.footer.action'
    const SETTINGS_SLOT = 'plugins.bundle.config'
    const INTERVAL_KEY = 'dsh.opencode-go-quota.interval'
    const SETTINGS_EVENT = '@pilot12138/dsh-opencodego-usage:settings'
    const INTERVAL_CHOICES = [0, 1, 5, 10, 15, 30, 60]
    const DEFAULT_INTERVAL = 5

    const EN = {
      title: 'OpenCode Go',
      loading: 'reading…',
      unconfigured: 'No API key',
      hint: 'Paste your OpenCode API key to read the Go allowance.',
      save: 'Save',
      saving: 'Saving…',
      refresh: 'Refresh',
      reset: 'resets',
      used: 'used',
      limited: 'limit reached',
      unknown: 'unknown',
      failed: 'query failed',
      fiveHour: '5h',
      week: 'week',
      month: 'month',
      unauthorized: 'key rejected (401)',
      noSubscription: 'no Go subscription',
      offline: 'cannot reach opencode.ai',
      malformed: 'unexpected response',
      http: 'opencode.ai error',
      storeFailed: 'key works but could not be saved',
      noStore: 'cannot store credentials here',
      interval: 'Auto refresh',
      off: 'Off',
      minutes: 'min',
      key: 'API key',
      saved: 'Saved',
      keyConfigured: 'Configured',
      keyMissing: 'Not configured',
      fromSource: 'from',
    }

    const ZH = {
      title: 'OpenCode Go',
      loading: '读取中…',
      unconfigured: '未配置 API key',
      hint: '粘贴 OpenCode API key 以查询 Go 套餐余量。',
      save: '保存',
      saving: '保存中…',
      refresh: '刷新',
      reset: '重置',
      used: '已用',
      limited: '已用尽',
      unknown: '未知',
      failed: '查询失败',
      fiveHour: '5h',
      week: '本周',
      month: '本月',
      unauthorized: 'API key 无效 (401)',
      noSubscription: '未订阅 Go',
      offline: '无法连接 opencode.ai',
      malformed: '返回格式异常',
      http: 'opencode.ai 返回错误',
      storeFailed: 'key 有效但无法保存',
      noStore: '当前环境无法保存凭据',
      interval: '自动更新',
      off: '关闭',
      minutes: '分钟',
      key: 'API key',
      saved: '已保存',
      keyConfigured: '已配置',
      keyMissing: '未配置',
      fromSource: '来源',
    }

    const CSS = [
      '.ogq-anchor{display:none;}',
      // Same trick as dsh-tps: let the shared seat row wrap, so a 100%-wide entry takes a
      // line of its own instead of fighting the other entries for horizontal space.
      ':has(> [data-slot="sidebar.footer.action"] > #ogq-quota){flex-wrap:wrap}',
      ':has(> #ogq-quota):not(body){flex-wrap:wrap}',
      '#ogq-quota{box-sizing:border-box;flex:0 0 100%;width:100%;min-width:0;order:-100;',
      'margin:2px 0 6px;padding:0;}',
      '.ogq-host{box-sizing:border-box;width:100%;min-width:0;padding:0;}',
      '.ogq-card{box-sizing:border-box;width:100%;min-width:0;display:flex;flex-direction:column;gap:4px;',
      'padding:6px 9px 6px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);',
      // Fixed blue accent: the token set is theme-dependent (some themes render brand-primary as
      // near-black), so the meters keep a readable blue in every theme.
      '--ogq-accent:#3b82f6;--ogq-track:rgba(59,130,246,.20);',
      'font-size:11.5px;line-height:1.3;user-select:none;}',
      '.ogq-head{display:flex;align-items:center;gap:5px;min-width:0;}',
      '.ogq-dot{flex:0 0 auto;width:6px;height:6px;border-radius:50%;',
      'background:var(--dsw-alias-label-secondary);opacity:.7;}',
      '.ogq-title{flex:1 1 auto;min-width:0;color:var(--dsw-alias-label-secondary);white-space:nowrap;',
      'overflow:hidden;text-overflow:ellipsis;}',
      '.ogq-icon{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);',
      'font:inherit;font-size:11px;line-height:1;cursor:pointer;padding:1px 3px;border-radius:4px;}',
      '.ogq-icon:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      '.ogq-icon:disabled{opacity:.45;cursor:default;}',
      '.ogq-body{display:flex;flex-direction:column;gap:3px;min-width:0;}',
      '.ogq-row{display:flex;align-items:center;gap:6px;min-width:0;}',
      '.ogq-pair{display:flex;align-items:center;gap:8px;min-width:0;}',
      '.ogq-cell{display:flex;align-items:center;gap:6px;flex:1 1 0;min-width:0;}',
      '.ogq-cell .ogq-name{max-width:52%;}',
      '.ogq-cell .ogq-track{flex:1 1 20px;min-width:12px;}',
      // Same value column and gap as the full row, so every bar ends on the same vertical line.
      '.ogq-cell .ogq-value{min-width:34px;}',
      '.ogq-track{position:relative;flex:1 1 50px;min-width:24px;height:4px;border-radius:2px;',
      'background:var(--ogq-track);overflow:hidden;}',
      '.ogq-fill{position:absolute;top:0;bottom:0;left:0;border-radius:2px;',
      'background:var(--ogq-accent);transition:width .3s ease;}',
      '.ogq-name{flex:0 0 auto;max-width:38px;color:var(--dsw-alias-label-secondary);white-space:nowrap;',
      'overflow:hidden;text-overflow:ellipsis;}',
      '.ogq-track.ogq-warn .ogq-fill{background:var(--dsw-alias-state-warn-primary,#d97706);}',
      '.ogq-track.ogq-bad .ogq-fill{background:var(--dsw-alias-state-error-primary,#dc2626);}',
      '.ogq-track.ogq-muted .ogq-fill{background:var(--dsw-alias-state-idle-primary,#9ca3af);}',
      '.ogq-value{flex:0 0 auto;min-width:34px;text-align:right;font-variant-numeric:tabular-nums;',
      'font-weight:600;color:var(--ogq-accent);}',
      '.ogq-value.ogq-warn{color:var(--dsw-alias-state-warn-primary,#d97706);}',
      '.ogq-value.ogq-bad{color:var(--dsw-alias-state-error-primary,#dc2626);}',
      '.ogq-value.ogq-muted{color:var(--dsw-alias-label-secondary);}',
      '.ogq-note{color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.ogq-note.ogq-bad{color:var(--dsw-alias-state-error-primary);}',
      '.ogq-form{display:flex;flex-direction:column;gap:4px;}',
      '.ogq-input{font:inherit;line-height:1.2;width:100%;box-sizing:border-box;padding:3px 5px;border-radius:4px;',
      'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);',
      'color:var(--dsw-alias-label-primary);}',
      '.ogq-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary);}',
      '.ogq-save{appearance:none;font:inherit;line-height:1.2;cursor:pointer;padding:3px 7px;border-radius:4px;',
      'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);',
      'color:var(--dsw-alias-label-primary);}',
      '.ogq-save:disabled{opacity:.5;cursor:default;}',
      '.ogq-set{display:flex;flex-direction:column;gap:9px;font-size:12px;line-height:1.4;',
      'color:var(--dsw-alias-label-primary);}',
      '.ogq-set-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}',
      '.ogq-set-label{flex:0 0 84px;color:var(--dsw-alias-label-secondary);}',
      '.ogq-set-select{font:inherit;padding:3px 6px;border-radius:5px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);}',
      '.ogq-set-input{font:inherit;flex:1 1 220px;min-width:180px;padding:4px 7px;border-radius:5px;',
      'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);',
      'color:var(--dsw-alias-label-primary);}',
      '.ogq-set-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary);}',
      '.ogq-set-btn{appearance:none;font:inherit;cursor:pointer;padding:4px 10px;border-radius:5px;',
      'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);',
      'color:var(--dsw-alias-label-primary);}',
      '.ogq-set-btn:hover{border-color:var(--dsw-alias-border-l2);}',
      '.ogq-set-btn:disabled{opacity:.5;cursor:default;}',
      '.ogq-set-note{color:var(--dsw-alias-label-secondary);font-size:11.5px;}',
      '.ogq-set-note.ogq-bad{color:var(--dsw-alias-state-error-primary);}',
      '.ogq-set-note.ogq-ok{color:var(--dsw-alias-state-success-primary);}',
    ].join('')

    /** Text comes from the Client locale service when it is there; the built-in dictionaries stay as a fallback. */
    function createTranslator(ctx) {
      const looksChinese = typeof document !== 'undefined'
        && typeof document.documentElement.lang === 'string'
        && document.documentElement.lang.toLowerCase().indexOf('zh') === 0
      const fallback = looksChinese ? ZH : EN
      const fallbackFor = (key) => (typeof fallback[key] === 'string' ? fallback[key] : key)
      try {
        const locale = typeof ctx.get === 'function' ? ctx.get('locale') : undefined
        if (locale !== undefined && typeof locale.bind === 'function' && typeof locale.register === 'function') {
          try {
            locale.register(NS, { en: EN, zh: ZH })
          } catch {
            // A registration conflict is not fatal: bind still answers, and the fallback covers misses.
          }
          const translate = locale.bind(NS)
          if (typeof translate === 'function') {
            return (key) => {
              const text = translate(key)
              return typeof text === 'string' && text !== '' && text !== key ? text : fallbackFor(key)
            }
          }
        }
      } catch {
        // Fall through to the built-in dictionary.
      }
      return fallbackFor
    }

    function loadInterval() {
      try {
        const raw = window.localStorage.getItem(INTERVAL_KEY)
        if (raw === null) return DEFAULT_INTERVAL
        const value = Number(raw)
        if (!Number.isFinite(value) || value < 0) return DEFAULT_INTERVAL
        return value
      } catch {
        return DEFAULT_INTERVAL
      }
    }

    function saveInterval(minutes) {
      try {
        window.localStorage.setItem(INTERVAL_KEY, String(minutes))
      } catch {
        // Storage is optional: the session keeps the chosen value either way.
      }
      try {
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT))
      } catch {
        // A missing CustomEvent only costs the live update.
      }
    }

    function formatReset(iso) {
      if (typeof iso !== 'string' || iso === '') return ''
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return ''
      const now = new Date()
      const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      return date.toDateString() === now.toDateString()
        ? time
        : (date.getMonth() + 1) + '/' + date.getDate() + ' ' + time
    }

    function formatPercent(value) {
      return Math.round(value) + '%'
    }

    /** One failure vocabulary for the card and the settings panel. */
    function describeFailureFor(body, t) {
      const code = body !== null && typeof body === 'object' && typeof body.code === 'string' ? body.code : ''
      const known = {
        unauthorized: 'unauthorized',
        'no-subscription': 'noSubscription',
        offline: 'offline',
        malformed: 'malformed',
        http: 'http',
        'store-failed': 'storeFailed',
        'no-credential-store': 'noStore',
      }[code]
      if (known !== undefined) return t(known)
      if (body !== null && typeof body === 'object' && typeof body.message === 'string' && body.message !== '') {
        return body.message
      }
      return t('failed')
    }

    function meterStatus(entry) {
      if (entry === null || typeof entry !== 'object' || typeof entry.usedPercent !== 'number') return 'muted'
      if (entry.limited === true) return 'bad'
      const remaining = 100 - entry.usedPercent
      if (remaining <= 10) return 'bad'
      if (remaining <= 30) return 'warn'
      return 'ok'
    }

    /**
     * The card itself, built as plain DOM so it can be its own row in the sidebar column.
     * The sidebar offers no slot for a block above its footer row, so this widget is inserted
     * as a sibling of that row — still in the column's layout flow, so nothing is covered.
     */
    function createCard(t) {
      const host = document.createElement('div')
      host.className = 'ogq-host'
      host.id = 'ogq-quota'

      const style = document.createElement('style')
      style.textContent = CSS
      host.appendChild(style)

      const card = document.createElement('div')
      card.className = 'ogq-card'
      host.appendChild(card)

      const head = document.createElement('div')
      head.className = 'ogq-head'
      const dot = document.createElement('span')
      dot.className = 'ogq-dot'
      const title = document.createElement('span')
      title.className = 'ogq-title'
      title.textContent = t('title')
      const refreshButton = document.createElement('button')
      refreshButton.type = 'button'
      refreshButton.className = 'ogq-icon'
      refreshButton.textContent = '↻'
      refreshButton.title = t('refresh')
      head.append(dot, title, refreshButton)
      card.appendChild(head)

      const body = document.createElement('div')
      body.className = 'ogq-body'
      card.appendChild(body)

      let busy = false
      let alive = true
      let timer = null

      const request = async (init) => {
        const response = await fetch(ENDPOINT, init)
        return await response.json()
      }

      const readCard = () => request({ headers: { accept: 'application/json' }, cache: 'no-store' })

      const readValue = async (apiKey) => request({
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      })

      const note = (text, bad) => {
        const element = document.createElement('div')
        element.className = 'ogq-note' + (bad === true ? ' ogq-bad' : '')
        element.textContent = text
        return element
      }

      const rowFor = (labelKey, entry) => {
        const used = entry !== null && typeof entry === 'object' && typeof entry.usedPercent === 'number'
          ? entry.usedPercent
          : null
        const remaining = used === null ? null : Math.max(0, 100 - used)
        const status = meterStatus(entry)

        const row = document.createElement('div')
        row.className = 'ogq-row'
        const parts = []
        if (used !== null) parts.push(t('used') + ' ' + formatPercent(used))
        const reset = entry !== null && typeof entry === 'object' ? formatReset(entry.resetsAt) : ''
        if (reset !== '') parts.push(t('reset') + ' ' + reset)
        if (entry !== null && typeof entry === 'object' && entry.limited === true) parts.push(t('limited'))
        row.title = t(labelKey) + (parts.length > 0 ? ': ' + parts.join(' · ') : ': ' + t('unknown'))

        const name = document.createElement('span')
        name.className = 'ogq-name'
        name.textContent = t(labelKey)

        const track = document.createElement('span')
        track.className = 'ogq-track ogq-' + status
        const fill = document.createElement('span')
        fill.className = 'ogq-fill'
        fill.style.width = (remaining === null ? 0 : remaining) + '%'
        track.appendChild(fill)

        const value = document.createElement('span')
        value.className = 'ogq-value ogq-' + status
        value.textContent = remaining === null ? '--' : formatPercent(remaining)

        row.append(name, track, value)
        return row
      }

      /** Half-width cell: label and value only, so the two longer windows share one line. */
      const cellFor = (labelKey, entry) => {
        const used = entry !== null && typeof entry === 'object' && typeof entry.usedPercent === 'number'
          ? entry.usedPercent
          : null
        const remaining = used === null ? null : Math.max(0, 100 - used)
        const status = meterStatus(entry)

        const cell = document.createElement('div')
        cell.className = 'ogq-cell'
        const parts = []
        if (used !== null) parts.push(t('used') + ' ' + formatPercent(used))
        const reset = entry !== null && typeof entry === 'object' ? formatReset(entry.resetsAt) : ''
        if (reset !== '') parts.push(t('reset') + ' ' + reset)
        if (entry !== null && typeof entry === 'object' && entry.limited === true) parts.push(t('limited'))
        cell.title = t(labelKey) + (parts.length > 0 ? ': ' + parts.join(' · ') : ': ' + t('unknown'))

        const name = document.createElement('span')
        name.className = 'ogq-name'
        name.textContent = t(labelKey)

        const track = document.createElement('span')
        track.className = 'ogq-track ogq-' + status
        const fill = document.createElement('span')
        fill.className = 'ogq-fill'
        fill.style.width = (remaining === null ? 0 : remaining) + '%'
        track.appendChild(fill)

        const value = document.createElement('span')
        value.className = 'ogq-value ogq-' + status
        value.textContent = remaining === null ? '--' : formatPercent(remaining)

        cell.append(name, track, value)
        return cell
      }

      const keyForm = () => {
        const form = document.createElement('form')
        form.className = 'ogq-form'
        const input = document.createElement('input')
        input.className = 'ogq-input'
        input.type = 'password'
        input.autocomplete = 'off'
        input.spellcheck = false
        input.placeholder = 'oc_sk_…'
        const submit = document.createElement('button')
        submit.type = 'submit'
        submit.className = 'ogq-save'
        submit.textContent = t('save')
        submit.disabled = true
        input.addEventListener('input', () => {
          submit.disabled = input.value.trim() === '' || busy
        })
        form.addEventListener('submit', async (event) => {
          event.preventDefault()
          const apiKey = input.value.trim()
          if (apiKey === '' || busy) return
          busy = true
          submit.disabled = true
          submit.textContent = t('saving')
          try {
            const body = await readValue(apiKey)
            busy = false
            submit.textContent = t('save')
            paint(body !== null && typeof body === 'object' && body.ok === true
              ? { status: 'ready', payload: body }
              : body !== null && typeof body === 'object' && body.configured === false
                ? { status: 'unconfigured' }
                : { status: 'error', message: describeFailureFor(body, t) })
          } catch {
            busy = false
            submit.textContent = t('save')
            paint({ status: 'error', message: t('offline') })
          }
        })
        form.append(input, submit)
        return form
      }

      const paint = (state) => {
        if (!alive) return
        body.textContent = ''
        if (state.status === 'loading') {
          body.appendChild(note(t('loading'), false))
          return
        }
        if (state.status === 'ready') {
          const windows = state.payload.windows !== null && typeof state.payload.windows === 'object'
            ? state.payload.windows
            : {}
          body.appendChild(rowFor('fiveHour', windows.rolling))
          const pair = document.createElement('div')
          pair.className = 'ogq-pair'
          pair.append(cellFor('week', windows.weekly), cellFor('month', windows.monthly))
          body.appendChild(pair)
          return
        }
        if (state.status === 'unconfigured') {
          body.appendChild(note(t('hint'), false))
          body.appendChild(keyForm())
          return
        }
        body.appendChild(note(state.message, true))
        body.appendChild(keyForm())
      }

      const load = async () => {
        if (!alive) return
        try {
          const body = await readCard()
          if (body !== null && typeof body === 'object' && body.ok === true) {
            paint({ status: 'ready', payload: body })
          } else if (body !== null && typeof body === 'object' && body.configured === false) {
            paint({ status: 'unconfigured' })
          } else {
            paint({ status: 'error', message: describeFailureFor(body, t) })
          }
        } catch {
          paint({ status: 'error', message: t('offline') })
        }
      }

      const schedule = () => {
        if (timer !== null) {
          clearInterval(timer)
          timer = null
        }
        const minutes = loadInterval()
        if (minutes > 0) timer = setInterval(load, minutes * 60_000)
      }

      refreshButton.addEventListener('click', async () => {
        if (busy) return
        busy = true
        refreshButton.disabled = true
        await load()
        busy = false
        refreshButton.disabled = false
      })

      const onSettings = () => schedule()
      window.addEventListener(SETTINGS_EVENT, onSettings)
      window.addEventListener('storage', onSettings)

      paint({ status: 'loading' })
      schedule()
      load()

      return {
        host,
        dispose() {
          alive = false
          if (timer !== null) clearInterval(timer)
          window.removeEventListener(SETTINGS_EVENT, onSettings)
          window.removeEventListener('storage', onSettings)
          host.remove()
        },
      }
    }

    /** Slot entry: an invisible anchor; the card joins the seat row as its first, full-width item. */
    function SidebarRow(props) {
      const anchorRef = React.useRef(null)
      React.useEffect(() => {
        const anchor = anchorRef.current
        if (anchor === null) return
        const seat = anchor.parentElement
        if (seat === null) return
        const widget = createCard(props.t)
        const ensure = () => {
          if (seat.firstChild !== widget.host) seat.insertBefore(widget.host, seat.firstChild)
        }
        ensure()
        const observer = typeof MutationObserver === 'function'
          ? new MutationObserver(ensure)
          : null
        if (observer !== null) observer.observe(seat, { childList: true })
        window.addEventListener('resize', ensure)
        return () => {
          if (observer !== null) observer.disconnect()
          window.removeEventListener('resize', ensure)
          widget.dispose()
        }
      }, [])
      return React.createElement('span', { className: 'ogq-anchor', ref: anchorRef })
    }

    /**
     * The panel on this bundle's own page in Settings › Plugins: the refresh cadence the card
     * polls with, and the OpenCode API key the Host half resolves.
     */
    function Settings(props) {
      const t = props.t
      const [intervalMinutes, setIntervalMinutes] = React.useState(loadInterval)
      const [status, setStatus] = React.useState({ phase: 'loading' })
      const [draft, setDraft] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [notice, setNotice] = React.useState('')
      const [noticeKind, setNoticeKind] = React.useState('ok')

      const readStatus = async () => {
        try {
          const response = await fetch(ENDPOINT, { headers: { accept: 'application/json' }, cache: 'no-store' })
          const body = await response.json()
          setStatus({
            phase: 'ready',
            configured: body !== null && typeof body === 'object' && body.configured === true,
            source: body !== null && typeof body === 'object' && typeof body.source === 'string' ? body.source : '',
          })
        } catch {
          setStatus({ phase: 'error' })
        }
      }

      React.useEffect(() => {
        readStatus()
      }, [])

      const chooseInterval = (event) => {
        const value = Number(event.target.value)
        const next = Number.isFinite(value) && value >= 0 ? value : DEFAULT_INTERVAL
        setIntervalMinutes(next)
        saveInterval(next)
        setNotice('')
      }

      const submitKey = async (event) => {
        event.preventDefault()
        const apiKey = draft.trim()
        if (apiKey === '') return
        setBusy(true)
        setNotice('')
        try {
          const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ apiKey }),
          })
          const body = await response.json()
          if (body !== null && typeof body === 'object' && body.ok === true) {
            setDraft('')
            setNotice(t('saved'))
            setNoticeKind('ok')
            await readStatus()
            try {
              window.dispatchEvent(new CustomEvent(SETTINGS_EVENT))
            } catch {
              // The card picks the new key up on its next read either way.
            }
          } else {
            setNotice(describeFailureFor(body, t))
            setNoticeKind('bad')
          }
        } catch {
          setNotice(t('offline'))
          setNoticeKind('bad')
        } finally {
          setBusy(false)
        }
      }

      if (props.view !== undefined && props.view !== 'page') {
        return React.createElement('span', { className: 'ogq-set-note' },
          intervalMinutes > 0 ? intervalMinutes + ' ' + t('minutes') : t('off'))
      }

      const configured = status.phase === 'ready' && status.configured === true
      const options = INTERVAL_CHOICES.map((value) => React.createElement('option', {
        key: String(value),
        value: String(value),
      }, value === 0 ? t('off') : value + ' ' + t('minutes')))

      const children = []
      children.push(React.createElement('style', { key: 's' }, CSS))
      children.push(React.createElement('div', { key: 'i', className: 'ogq-set-line' },
        React.createElement('span', { className: 'ogq-set-label' }, t('interval')),
        React.createElement('select', {
          className: 'ogq-set-select',
          value: String(intervalMinutes),
          onChange: chooseInterval,
        }, options),
      ))
      children.push(React.createElement('form', { key: 'k', className: 'ogq-set-line', onSubmit: submitKey },
        React.createElement('span', { className: 'ogq-set-label' }, t('key')),
        React.createElement('input', {
          className: 'ogq-set-input',
          type: 'password',
          autoComplete: 'off',
          spellCheck: false,
          placeholder: 'oc_sk_…',
          value: draft,
          onChange: (event) => setDraft(event.target.value),
        }),
        React.createElement('button', {
          type: 'submit',
          className: 'ogq-set-btn',
          disabled: busy || draft.trim() === '',
        }, busy ? t('saving') : t('save')),
      ))

      if (status.phase === 'loading') {
        children.push(React.createElement('div', { key: 'n', className: 'ogq-set-note' }, t('loading')))
      } else if (status.phase === 'error') {
        children.push(React.createElement('div', { key: 'n', className: 'ogq-set-note ogq-bad' }, t('offline')))
      } else {
        const suffix = status.source === '' ? '' : ' · ' + t('fromSource') + ' ' + status.source
        children.push(React.createElement('div', {
          key: 'n',
          className: 'ogq-set-note' + (configured ? ' ogq-ok' : ' ogq-bad'),
        }, (configured ? t('keyConfigured') : t('keyMissing')) + suffix))
      }

      if (notice !== '') {
        children.push(React.createElement('div', {
          key: 'm',
          className: 'ogq-set-note' + (noticeKind === 'bad' ? ' ogq-bad' : ' ogq-ok'),
        }, notice))
      }

      return React.createElement('div', { className: 'ogq-set' }, children)
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const slots = ctx.slots !== undefined ? ctx.slots : (typeof ctx.get === 'function' ? ctx.get('slots') : undefined)
        if (slots === undefined || typeof slots.inject !== 'function' || typeof slots.register !== 'function') return
        const t = createTranslator(ctx)
        const SidebarEntry = () => React.createElement(SidebarRow, { t })
        ctx.slots.inject(ANCHOR_SLOT, () => ctx.slots.register({
          name: ANCHOR_SLOT,
          id: 'opencode-go-quota',
          order: -10,
          label: 'OpenCode Go',
        }, SidebarEntry))
        const SettingsPanel = (props) => React.createElement(Settings, {
          t,
          view: props === undefined ? undefined : props.view,
        })
        ctx.slots.inject(SETTINGS_SLOT, () => ctx.slots.register({
          name: SETTINGS_SLOT,
          key: '@pilot12138/dsh-opencodego-usage',
        }, SettingsPanel))
      },
    }
  },
})
