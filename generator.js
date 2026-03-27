/* generator.js -- RPR AVM Lead Capture Embed Generator
   All event handlers are registered here (no inline onclick/oninput in HTML).
   Enables strict CSP: script-src 'self'. */

var displayMode = 'inline';

/* ----- Boot ----- */
document.addEventListener('DOMContentLoaded', function() {

  /* Bind all text/url inputs to regenerate on typing */
  var inputIds = [
    'rprToken','webhook','formId','agentName','brokerage','logoUrl',
    'colorBrandHex','headline','subheadline','btnLabel',
    'floatLabel','modalTrigger','fontHeading','fontBody',
    'cardBg','cardBorder','cardRadius',
    'googleKey','gdprText','disclaimer'
  ];
  inputIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', generate);
  });

  /* Card max width is a select, not text input */
  document.getElementById('cardMaxWidth').addEventListener('change', generate);

  /* Color picker sync */
  var picker = document.getElementById('colorBrandPicker');
  var hex    = document.getElementById('colorBrandHex');
  picker.addEventListener('input', function() {
    hex.value = picker.value;
    generate();
  });
  hex.addEventListener('input', function() {
    /* Sync picker only on valid 7-char hex; other formats pass through to output */
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
    generate();
  });

  /* Display mode tabs */
  document.querySelectorAll('.mode-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.mode-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      displayMode = tab.getAttribute('data-mode');
      document.getElementById('floatOptions').classList.toggle('visible', displayMode === 'floating');
      document.getElementById('modalOptions').classList.toggle('visible', displayMode === 'modal');
      generate();
    });
  });

  /* Float position */
  document.getElementById('floatPosition').addEventListener('change', generate);

  /* Collapsible section headers */
  document.querySelectorAll('.section-header').forEach(function(header) {
    function toggle() {
      var bodyId = header.getAttribute('data-section');
      var body = document.getElementById(bodyId);
      if (!body) return;
      var collapsed = header.classList.toggle('collapsed');
      body.classList.toggle('collapsed');
      header.setAttribute('aria-expanded', String(!collapsed));
    }
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* GDPR toggle */
  document.getElementById('gdprEnabled').addEventListener('change', function() {
    document.getElementById('gdprTextField').style.display = this.checked ? 'block' : 'none';
    generate();
  });

  /* Widget checkboxes */
  ['widgetMatchBrand','widgetHideChart','widgetHideLinks'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', generate);
  });

  /* Device tabs */
  document.querySelectorAll('.device-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.device-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var device = tab.getAttribute('data-device');
      var frame = document.getElementById('previewFrame');
      frame.classList.toggle('mobile', device === 'mobile');
      frame.classList.toggle('desktop', device === 'desktop');
    });
  });

  /* Copy buttons */
  document.getElementById('copyBtn').addEventListener('click', copyCode);
  document.getElementById('copyLinkBtn').addEventListener('click', copyLink);

  /* Restore config from URL hash or localStorage */
  var hashStr = location.hash.slice(1);
  var stored  = '';
  try { stored = localStorage.getItem('rpr-avm-generator-config') || ''; } catch(e) {}
  var configStr = hashStr || stored;
  if (configStr) applyConfig(hashToConfig(configStr));

  /* Initial render */
  generate();
});

/* ----- Gather config ----- */
function getConfig() {
  return {
    rprToken:       val('rprToken'),
    webhook:        val('webhook'),
    formId:         val('formId'),
    agentName:      val('agentName'),
    brokerage:      val('brokerage'),
    logoUrl:        val('logoUrl'),
    colorBrand:     val('colorBrandHex') || '#0086E6',
    displayMode:    displayMode,
    floatLabel:     val('floatLabel'),
    floatPosition:  document.getElementById('floatPosition').value,
    modalTrigger:   val('modalTrigger'),
    headline:       val('headline'),
    subheadline:    val('subheadline'),
    btnLabel:       val('btnLabel'),
    fontHeading:    val('fontHeading'),
    fontBody:       val('fontBody'),
    cardBg:         val('cardBg'),
    cardBorder:     val('cardBorder'),
    cardRadius:     val('cardRadius'),
    cardMaxWidth:   val('cardMaxWidth'),
    widgetMatchBrand: document.getElementById('widgetMatchBrand').checked,
    widgetHideChart:  document.getElementById('widgetHideChart').checked,
    widgetHideLinks:  document.getElementById('widgetHideLinks').checked,
    googleKey:      val('googleKey'),
    gdprEnabled:    document.getElementById('gdprEnabled').checked,
    gdprText:       val('gdprText'),
    disclaimer:     val('disclaimer'),
  };
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ----- Main generate ----- */
function generate() {
  var cfg = getConfig();
  renderPreview(cfg);
  renderCode(cfg);
  persistConfig();
}

/* ----- Live preview ----- */
function renderPreview(cfg) {
  var brand     = cfg.colorBrand || '#0086E6';
  var cardBg    = cfg.cardBg || '#ffffff';
  var radius    = cfg.cardRadius || '18';
  var cardBdr   = cfg.cardBorder || '#e2e2e2';
  var headFont  = cfg.fontHeading || 'DM Serif Display';
  var bodyFont  = cfg.fontBody || 'DM Sans';
  var textColor = isLight(brand) ? '#18181b' : '#ffffff';
  var card      = document.getElementById('liveCard');

  card.style.borderRadius = radius + 'px';
  card.style.background   = cardBg;
  card.style.borderColor  = cardBdr;
  card.style.fontFamily   = "'" + bodyFont + "', system-ui, sans-serif";

  /* Max width: support px, %, and none */
  var maxW = cfg.cardMaxWidth || '520';
  if (maxW === 'none') {
    card.style.maxWidth = 'none';
  } else if (maxW.indexOf('%') !== -1) {
    card.style.maxWidth = maxW;
  } else {
    card.style.maxWidth = parseInt(maxW, 10) + 'px';
  }

  var html = '';

  /* Header */
  if (cfg.agentName || cfg.brokerage || cfg.logoUrl) {
    html += '<div class="lc-header" style="background:' + esc(brand) + ';color:' + textColor + '">';
    html += '<div class="lc-avatar" style="color:' + textColor + '">';
    if (cfg.logoUrl && /^https?:\/\//i.test(cfg.logoUrl)) {
      html += '<img src="' + esc(cfg.logoUrl) + '" alt="">';
    } else {
      html += initials(cfg.agentName);
    }
    html += '</div>';
    html += '<div class="lc-agent-info">';
    if (cfg.agentName) html += '<div class="lc-agent-name" style="color:' + textColor + '">' + esc(cfg.agentName) + '</div>';
    if (cfg.brokerage) html += '<div class="lc-brokerage" style="color:' + textColor + '">' + esc(cfg.brokerage) + '</div>';
    html += '</div>';
    html += '<span class="lc-badge">Powered by RPR</span>';
    html += '</div>';
  }

  /* Body */
  html += '<div class="lc-body">';
  html += '<div class="lc-headline" style="font-family:\'' + esc(headFont) + '\',Georgia,serif">' + esc(cfg.headline || "What's your home worth?") + '</div>';
  if (cfg.subheadline) {
    html += '<div class="lc-subheadline">' + esc(cfg.subheadline) + '</div>';
  } else {
    html += '<div class="lc-subheadline">Get a free, data-driven estimate powered by Realtors Property Resource.</div>';
  }

  /* Fields */
  html += '<div class="lc-fields" style="grid-template-columns:1fr 1fr">';
  html += fieldPreview('First name', 'First name');
  html += fieldPreview('Last name', 'Smith');
  html += fieldPreview('Email', 'email@example.com');
  html += fieldPreview('Phone', '(555) 555-5555');
  html += '</div>';
  html += '<div class="lc-fields" style="grid-template-columns:1fr;margin-top:0.75rem">';
  html += fieldPreview('Property address', '123 Main St, City, ST 00000');
  html += '</div>';

  /* GDPR */
  if (cfg.gdprEnabled) {
    var gdprTxt = cfg.gdprText || 'I agree to be contacted about my home value estimate.';
    html += '<div class="lc-gdpr"><input type="checkbox" disabled> <span>' + esc(gdprTxt) + '</span></div>';
  }

  /* Button */
  html += '<button class="lc-submit" style="background:' + esc(brand) + ';color:' + textColor + '">' + esc(cfg.btnLabel || 'Get my free home value estimate') + '</button>';

  /* Disclaimer */
  var disc = cfg.disclaimer || 'Your information is kept private and will never be sold.';
  html += '<div class="lc-disclaimer">' + esc(disc) + '</div>';

  html += '</div>';

  card.innerHTML = html;

  /* Floating preview button */
  var floatBtn = document.getElementById('floatPreview');
  if (cfg.displayMode === 'floating') {
    floatBtn.style.display = 'block';
    floatBtn.textContent = cfg.floatLabel || "What's My Home Worth?";
    floatBtn.style.background = brand;
    floatBtn.style.color = textColor;
    if (cfg.floatPosition === 'bottom-left') {
      floatBtn.style.right = 'auto';
      floatBtn.style.left = '24px';
    } else {
      floatBtn.style.left = 'auto';
      floatBtn.style.right = '24px';
    }
    /* Hide inline card in floating mode */
    document.getElementById('liveCardWrap').style.display = 'none';
  } else {
    floatBtn.style.display = 'none';
    document.getElementById('liveCardWrap').style.display = 'block';
  }

  /* Modal mode: show card but with trigger context */
  if (cfg.displayMode === 'modal') {
    document.getElementById('liveCardWrap').style.display = 'block';
  }
}

function fieldPreview(label, placeholder) {
  return '<div><div class="lc-field-label">' + esc(label) + '</div>' +
         '<div class="lc-field-input">' + esc(placeholder) + '</div></div>';
}

/* ----- Code output ----- */
function renderCode(cfg) {
  var lines = [];

  /* Show/hide warning banner */
  var warning = document.getElementById('webhookWarning');
  var warnIcon = '<svg class="output-warning-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" fill="currentColor"/><path d="M8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg> ';
  var webhookInvalid = cfg.webhook && !cfg.webhook.match(/^https:\/\//);
  if (warning) {
    if (webhookInvalid) {
      warning.classList.add('visible');
      warning.innerHTML = warnIcon + 'Webhook URL must start with https:// -- the embed script will reject non-HTTPS URLs.';
    } else if (!cfg.webhook) {
      warning.classList.add('visible');
      warning.innerHTML = warnIcon + 'No webhook URL configured -- leads will not be captured when this embed is live. Add a webhook URL above before deploying.';
    } else {
      warning.classList.remove('visible');
    }
  }

  lines.push('<script');
  lines.push('  src="https://pub-723d8ae87de842b5a806b4ca544eb797.r2.dev/rpr-avm-embed.js"');

  /* Required */
  lines.push('  data-rpr-token="' + escAttr(cfg.rprToken || 'YOUR_RPR_TOKEN') + '"');

  /* Only include non-default values */
  if (cfg.webhook)    lines.push('  data-webhook="' + escAttr(cfg.webhook) + '"');
  if (cfg.formId && cfg.formId !== 'rpr-avm-embed') lines.push('  data-form-id="' + escAttr(cfg.formId) + '"');
  if (cfg.agentName)  lines.push('  data-agent-name="' + escAttr(cfg.agentName) + '"');
  if (cfg.brokerage)  lines.push('  data-brokerage="' + escAttr(cfg.brokerage) + '"');
  if (cfg.logoUrl)    lines.push('  data-logo-url="' + escAttr(cfg.logoUrl) + '"');
  if (cfg.colorBrand && cfg.colorBrand !== '#0086E6') lines.push('  data-color-brand="' + escAttr(cfg.colorBrand) + '"');

  /* Display mode */
  if (cfg.displayMode !== 'inline') {
    lines.push('  data-display-mode="' + cfg.displayMode + '"');
    if (cfg.displayMode === 'floating') {
      if (cfg.floatLabel) lines.push('  data-float-label="' + escAttr(cfg.floatLabel) + '"');
      if (cfg.floatPosition !== 'bottom-right') lines.push('  data-float-position="' + cfg.floatPosition + '"');
    }
    if (cfg.displayMode === 'modal' && cfg.modalTrigger) {
      lines.push('  data-modal-trigger-text="' + escAttr(cfg.modalTrigger) + '"');
    }
  }

  /* Text (only if changed from defaults) */
  if (cfg.headline)    lines.push('  data-headline="' + escAttr(cfg.headline) + '"');
  if (cfg.subheadline) lines.push('  data-subheadline="' + escAttr(cfg.subheadline) + '"');
  if (cfg.btnLabel)    lines.push('  data-button-text="' + escAttr(cfg.btnLabel) + '"');
  if (cfg.disclaimer)  lines.push('  data-disclaimer="' + escAttr(cfg.disclaimer) + '"');

  /* Typography */
  if (cfg.fontHeading) lines.push('  data-font-heading="' + escAttr(cfg.fontHeading) + '"');
  if (cfg.fontBody)    lines.push('  data-font-body="' + escAttr(cfg.fontBody) + '"');

  /* Card */
  if (cfg.cardBg && cfg.cardBg !== '#ffffff')     lines.push('  data-color-card-bg="' + escAttr(cfg.cardBg) + '"');
  if (cfg.cardBorder && cfg.cardBorder !== '#e2e2e2') lines.push('  data-color-card-border="' + escAttr(cfg.cardBorder) + '"');
  if (cfg.cardRadius && cfg.cardRadius !== '18')  lines.push('  data-card-radius="' + escAttr(cfg.cardRadius) + '"');
  if (cfg.cardMaxWidth && cfg.cardMaxWidth !== '520') lines.push('  data-card-max-width="' + escAttr(cfg.cardMaxWidth) + '"');

  /* Widget */
  if (cfg.widgetMatchBrand) lines.push('  data-widget-match-brand="true"');
  if (cfg.widgetHideChart)  lines.push('  data-widget-hide-chart="true"');
  if (cfg.widgetHideLinks)  lines.push('  data-widget-hide-links="true"');

  /* Google Places */
  if (cfg.googleKey) lines.push('  data-google-key="' + escAttr(cfg.googleKey) + '"');

  /* GDPR */
  if (cfg.gdprEnabled) {
    lines.push('  data-gdpr-enabled="true"');
    if (cfg.gdprText) lines.push('  data-gdpr-text="' + escAttr(cfg.gdprText) + '"');
  }

  lines.push('></script>');

  var raw = lines.join('\n');
  var block = document.getElementById('codeBlock');
  block.dataset.raw = raw;
  block.innerHTML = highlight(raw);
}

/* ----- Syntax highlighting (character-by-character tokenizer) ----- */
function highlight(code) {
  var out = '', i = 0, len = code.length;
  while (i < len) {
    /* Closing tag </script> */
    if (code.slice(i, i + 9) === '<\/script>') {
      out += '<span class="tag">&lt;/script&gt;</span>';
      i += 9;
    }
    /* Opening <script */
    else if (code.slice(i, i + 7) === '<script') {
      out += '<span class="tag">&lt;script</span>';
      i += 7;
    }
    /* Closing > of a tag */
    else if (code[i] === '>') {
      out += '<span class="tag">&gt;</span>';
      i++;
    }
    /* Attribute name (letters, digits, hyphens) */
    else if (/[a-zA-Z_]/.test(code[i])) {
      var start = i;
      while (i < len && /[\w-]/.test(code[i])) i++;
      out += '<span class="attr-name">' + esc(code.slice(start, i)) + '</span>';
    }
    /* = sign */
    else if (code[i] === '=') {
      out += '=';
      i++;
    }
    /* Quoted attribute value */
    else if (code[i] === '"') {
      var end = code.indexOf('"', i + 1);
      if (end === -1) end = len - 1;
      out += '<span class="attr-value">' + esc(code.slice(i, end + 1)) + '</span>';
      i = end + 1;
    }
    /* Whitespace and everything else */
    else {
      out += esc(code[i]);
      i++;
    }
  }
  return out;
}

/* ----- Config persistence (URL hash + localStorage) ----- */
var FIELD_KEYS = [
  'rprToken','webhook','formId','agentName','brokerage','logoUrl','colorBrandHex',
  'headline','subheadline','btnLabel','floatLabel','modalTrigger',
  'fontHeading','fontBody','cardBg','cardBorder','cardRadius',
  'googleKey','gdprText','disclaimer'
];

function configToHash() {
  var params = new URLSearchParams();
  FIELD_KEYS.forEach(function(key) {
    var el = document.getElementById(key);
    if (!el) return;
    var v = el.value.trim();
    if (!v) return;
    params.set(key, v);
  });
  if (displayMode !== 'inline') params.set('displayMode', displayMode);
  var floatPos = document.getElementById('floatPosition').value;
  if (floatPos !== 'bottom-right') params.set('floatPosition', floatPos);
  var cardMaxW = document.getElementById('cardMaxWidth').value;
  if (cardMaxW !== '520') params.set('cardMaxWidth', cardMaxW);
  if (document.getElementById('widgetMatchBrand').checked) params.set('widgetMatchBrand', '1');
  if (document.getElementById('widgetHideChart').checked)  params.set('widgetHideChart', '1');
  if (document.getElementById('widgetHideLinks').checked)  params.set('widgetHideLinks', '1');
  if (document.getElementById('gdprEnabled').checked) params.set('gdprEnabled', '1');
  return params.toString();
}

function hashToConfig(str) {
  var config = {};
  var params;
  try { params = new URLSearchParams(str); } catch(e) { return config; }
  FIELD_KEYS.forEach(function(key) {
    if (params.has(key)) config[key] = params.get(key);
  });
  if (params.has('displayMode'))      config.displayMode = params.get('displayMode');
  if (params.has('floatPosition'))    config.floatPosition = params.get('floatPosition');
  if (params.has('cardMaxWidth'))     config.cardMaxWidth = params.get('cardMaxWidth');
  if (params.has('widgetMatchBrand')) config.widgetMatchBrand = true;
  if (params.has('widgetHideChart'))  config.widgetHideChart = true;
  if (params.has('widgetHideLinks'))  config.widgetHideLinks = true;
  if (params.has('gdprEnabled'))      config.gdprEnabled = true;
  return config;
}

function applyConfig(config) {
  FIELD_KEYS.forEach(function(key) {
    if (!(key in config)) return;
    var el = document.getElementById(key);
    if (el) el.value = config[key];
  });
  if (config.colorBrandHex) {
    var hex = config.colorBrandHex;
    if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) {
      document.getElementById('colorBrandPicker').value = hex;
    }
  }
  if (config.displayMode) {
    displayMode = config.displayMode;
    document.querySelectorAll('.mode-tab').forEach(function(t) { t.classList.remove('active'); });
    var activeTab = document.querySelector('.mode-tab[data-mode="' + displayMode + '"]');
    if (activeTab) activeTab.classList.add('active');
    document.getElementById('floatOptions').classList.toggle('visible', displayMode === 'floating');
    document.getElementById('modalOptions').classList.toggle('visible', displayMode === 'modal');
  }
  if (config.floatPosition) document.getElementById('floatPosition').value = config.floatPosition;
  if (config.cardMaxWidth)  document.getElementById('cardMaxWidth').value = config.cardMaxWidth;
  if (config.widgetMatchBrand) document.getElementById('widgetMatchBrand').checked = true;
  if (config.widgetHideChart)  document.getElementById('widgetHideChart').checked = true;
  if (config.widgetHideLinks)  document.getElementById('widgetHideLinks').checked = true;
  if (config.gdprEnabled) {
    document.getElementById('gdprEnabled').checked = true;
    document.getElementById('gdprTextField').style.display = 'block';
  }
}

function persistConfig() {
  var hash = configToHash();
  try { history.replaceState(null, '', hash ? '#' + hash : location.pathname + location.search); } catch(e) {}
  try { localStorage.setItem('rpr-avm-generator-config', hash); } catch(e) {}
}

/* ----- Copy generator link ----- */
function copyLink() {
  var hash = configToHash();
  var url = location.href.split('#')[0] + (hash ? '#' + hash : '');
  var btn = document.getElementById('copyLinkBtn');
  clipboardWrite(url, btn, 'Copy generator link');
}

/* ----- Shared clipboard helper ----- */
function clipboardWrite(text, btn, resetLabel) {
  function onSuccess() {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function() { btn.textContent = resetLabel; btn.classList.remove('copied'); }, 2000);
  }
  function fallback() {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onSuccess();
    } catch(e) {
      btn.textContent = 'Failed';
      setTimeout(function() { btn.textContent = resetLabel; }, 2000);
    }
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess, fallback);
  } else {
    fallback();
  }
}

/* ----- Copy embed code ----- */
function copyCode() {
  var raw = document.getElementById('codeBlock').dataset.raw || '';
  var btn = document.getElementById('copyBtn');
  clipboardWrite(raw, btn, 'Copy');
}

/* ----- Helpers ----- */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(str) {
  /* For data-attribute values in the generated embed code.
     Only escape " (to prevent breaking out of the attribute).
     Do NOT encode &, <, > here -- the highlight() function runs esc()
     separately for display, and the raw copy needs literal characters
     so the browser's attribute parser handles them correctly. */
  return String(str || '').replace(/"/g, '&quot;');
}

function initials(name) {
  return (name || '').split(/\s+/).filter(function(w) { return w.length > 0; })
    .map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

function isLight(hex) {
  hex = (hex || '').replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return false;
  var r = parseInt(hex.substring(0,2), 16);
  var g = parseInt(hex.substring(2,4), 16);
  var b = parseInt(hex.substring(4,6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}
