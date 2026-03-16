# RPR AVM Lead Capture -- Embeddable Widget

**Version:** 1.0.3  
**Based on:** RPR AVM Lead Capture WordPress Plugin v4.2.1  
**Author:** RPR Marketing

---

## What It Does

A standalone, zero-dependency JavaScript widget that embeds an RPR-powered "What's My Home Worth?" lead capture form on any website. One hosted JS file powers unlimited installs -- each configured independently via `data-*` attributes on the script tag.

When a visitor fills out the form, the widget:

1. Sends lead data to a webhook endpoint (Zapier, Make, GHL, HubSpot, or any HTTPS endpoint)
2. Displays the RPR AVM widget showing the property's estimated value
3. Optionally integrates Google Places autocomplete and reCAPTCHA v3

---

## Installation

Add a single `<script>` tag to any HTML page, site-wide code injection area, or tag manager:

```html
<script
  src="https://reggienicolay.github.io/rpr-avm-embed/rpr-avm-embed.js"
  data-rpr-token="YOUR_RPR_TOKEN"
  data-webhook="https://hooks.zapier.com/hooks/catch/12345/abcdef/"
  data-agent-name="Agent Name"
  data-brokerage="Brokerage Name"
></script>
```

The widget renders immediately after the script tag. No build tools, no dependencies, no framework required.

### Display Modes

**Inline** (default) -- renders the form card directly in the page flow where the script tag is placed.

**Floating** -- adds a fixed-position button (bottom-right or bottom-left) that opens the form in a modal overlay:

```html
data-display-mode="floating"
data-float-label="What's My Home Worth?"
data-float-position="bottom-right"
```

**Modal** -- renders a trigger button inline that opens the form in a modal overlay:

```html
data-display-mode="modal"
data-modal-trigger-text="Get Your Home Value"
```

### Mounting to a Specific Element

By default, the widget inserts itself after the script tag. To mount inside a specific container:

```html
<div id="avm-form"></div>
<script src="..." data-rpr-token="..." data-target="#avm-form"></script>
```

---

## Configuration Reference

Every option is a `data-*` attribute on the script tag. Only `data-rpr-token` is required.

### Core

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-rpr-token` | *(required)* | RPR AVM widget token from narrpr.com |
| `data-webhook` | *(empty)* | HTTPS webhook URL for lead data |
| `data-form-id` | `rpr-avm-embed` | Form identifier included in webhook payload |

### Branding

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-agent-name` | *(empty)* | Name displayed in form header |
| `data-brokerage` | *(empty)* | Brokerage name displayed in form header |
| `data-logo-url` | *(empty)* | Logo image URL (must be https://) |
| `data-show-header` | `true` | Show the branded header bar |
| `data-show-badge` | `true` | Show badge in header |
| `data-badge-text` | `Powered by RPR` | Badge label text |

### Colors

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-color-brand` | `#0070C1` | Primary brand color (header, button, focus ring) |
| `data-color-brand-hover` | *(auto-darkened)* | Button hover state color |
| `data-color-btn-text` | `#ffffff` | Button text color |
| `data-color-header-text` | `#ffffff` | Header text color |
| `data-color-card-bg` | `#ffffff` | Card background |
| `data-color-card-border` | `#e2e2e2` | Card border |
| `data-color-page-bg` | `#f7f8fa` | Address strip background |
| `data-color-input-border` | `rgba(0,0,0,0.12)` | Input border |
| `data-color-error` | `#c0392b` | Validation error color |

### Typography

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-font-heading` | `DM Serif Display` | Heading font family (auto-loaded from Google Fonts) |
| `data-font-body` | `DM Sans` | Body font family (auto-loaded from Google Fonts) |
| `data-font-size` | `15` | Base font size in px |

System fonts (Arial, Georgia, Helvetica, Verdana, Times New Roman, system-ui) are used directly without loading from Google Fonts.

### Text Strings

All user-facing text is configurable:

| Attribute | Default |
|-----------|---------|
| `data-headline` | What's your home worth? |
| `data-subheadline` | Get a free, data-driven estimate powered by Realtors Property Resource -- used by over 1.4 million REALTORS(R) nationwide. |
| `data-button-text` | Get my free home value estimate |
| `data-disclaimer` | Your information is kept private and will never be sold. A local REALTOR(R) may follow up to discuss your results. |
| `data-sending-text` | Sending... |
| `data-back-link-text` | Edit my information |
| `data-addr-prefix` | Estimate for: |

### Layout

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-display-mode` | `inline` | `inline`, `modal`, or `floating` |
| `data-card-max-width` | `520` | Max card width in px |
| `data-card-radius` | `18` | Card border radius in px |
| `data-show-back-link` | `true` | Show "Edit my info" link on results step |
| `data-show-addr-strip` | `true` | Show address confirmation strip on results step |
| `data-widget-min-height` | `320` | RPR widget area min height in px |
| `data-widget-padding` | `comfortable` | `none`, `compact`, or `comfortable` |
| `data-float-label` | `Get My Home Value` | Floating button text |
| `data-float-position` | `bottom-right` | `bottom-right` or `bottom-left` |
| `data-modal-trigger-text` | What's My Home Worth? | Modal trigger button text |
| `data-target` | *(empty)* | CSS selector to mount into (e.g., `#my-div`) |

### Google Places Autocomplete

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-google-key` | *(empty)* | Google Maps API key with Places API enabled |
| `data-places-country` | `us` | Country restriction (ISO 3166-1 alpha-2 code) |

When configured, the address field gets autocomplete with address suggestions. The Google Maps JS API is loaded only when a key is provided.

### reCAPTCHA v3

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-recaptcha-site-key` | *(empty)* | reCAPTCHA v3 site key |

When configured, a reCAPTCHA token is generated on form submission and included in the webhook payload as `recaptcha_token`. Verification must be done server-side at the webhook endpoint.

### GDPR Consent

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-gdpr-enabled` | `false` | Show a required consent checkbox |
| `data-gdpr-text` | I agree to be contacted about my home value estimate. | Consent checkbox label |

When enabled, the form cannot be submitted without checking the consent box. The `consent` field in the webhook payload will be `1` when checked.

### RPR Widget Appearance

These control the styling of the RPR AVM valuation widget that displays after form submission:

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-rpr-cobrand` | *(empty)* | RPR CoBrandCode |
| `data-rpr-show-links` | `true` | Show RPR attribution links |
| `data-widget-match-brand` | `false` | Apply `data-color-brand` to widget header |
| `data-widget-header-bg` | *(empty)* | Widget header background (overrides match-brand) |
| `data-widget-header-text` | *(empty)* | Widget header text color |
| `data-widget-value-color` | *(empty)* | Estimated value text color |
| `data-widget-link-color` | *(empty)* | Widget link color |
| `data-widget-font` | *(empty)* | Widget font family (`inherit` to match host page) |
| `data-widget-border-radius` | *(empty)* | Widget border radius in px |
| `data-widget-hide-chart` | `false` | Hide the value trend chart |
| `data-widget-hide-links` | `false` | Hide footer links |
| `data-widget-custom-css` | *(empty)* | Raw CSS injected into the widget iframe |

### Custom Fields

Override the default form fields by passing a JSON array:

```html
data-fields='[
  {"id":"first_name","label":"First Name","placeholder":"Jane","type":"text","required":true,"width":"half","order":1,"error_msg":"Required"},
  {"id":"last_name","label":"Last Name","placeholder":"Smith","type":"text","required":true,"width":"half","order":2,"error_msg":"Required"},
  {"id":"email","label":"Email","placeholder":"jane@example.com","type":"email","required":true,"width":"full","order":3,"error_msg":"Enter a valid email"},
  {"id":"address","label":"Property Address","placeholder":"123 Main St","type":"text","required":true,"locked":true,"width":"full","order":4,"error_msg":"Enter the address"},
  {"id":"custom_1","label":"How did you hear about us?","placeholder":"","type":"select","required":false,"width":"full","order":5,"error_msg":"Required","options":"Google\nFriend\nSocial Media\nOther"}
]'
```

Field properties: `id` (unique identifier), `label`, `placeholder`, `type` (text/email/tel/select), `required` (boolean), `locked` (always visible + required), `width` (half/full), `order` (sort position), `error_msg` (validation message), `options` (newline-separated, for select type only).

Standard field IDs (`first_name`, `last_name`, `email`, `phone`, `address`) are mapped to top-level payload keys. Any ID starting with `custom_` is placed in both `custom_fields` and flattened to the top level.

---

## Webhook Payload

Sent as a POST request with `Content-Type: text/plain` body containing valid JSON:

```json
{
  "form_instance": "rpr-avm-embed",
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah@example.com",
  "phone": "555-555-5555",
  "address": "456 Oak Ave, Anytown, CA 90210",
  "agent_name": "Agent Name",
  "brokerage": "Brokerage Name",
  "consent": 0,
  "source_url": "https://example.com/home-value",
  "timestamp": "2026-03-16T10:00:00.000Z",
  "custom_fields": {},
  "rpr_hp": ""
}
```

**Content type note:** The webhook uses `mode: 'no-cors'` with `Content-Type: text/plain` to avoid CORS preflight rejections from webhook endpoints (Zapier, Make, etc. don't return CORS headers for cross-origin browser requests). The body is valid JSON and is parsed correctly by all major webhook receivers. The trade-off is the response status cannot be read -- delivery is fire-and-forget.

**Honeypot:** `rpr_hp` is a hidden field that should always be empty for real users. Bots tend to fill all fields. Filter submissions where `rpr_hp` is non-empty at the webhook/automation level.

**Custom fields:** Any fields with IDs starting with `custom_` appear both inside `custom_fields` and flattened to the top level for easy CRM field mapping.

---

## Multi-Instance Support

The script supports multiple independent instances on the same page. Each `<script>` tag creates its own form with its own configuration:

```html
<script src="...rpr-avm-embed.js" data-rpr-token="TOKEN_A" data-form-id="form-a" data-agent-name="Agent A"></script>
<script src="...rpr-avm-embed.js" data-rpr-token="TOKEN_B" data-form-id="form-b" data-agent-name="Agent B"></script>
```

All element IDs are scoped to `data-form-id` to prevent collisions. Use unique `data-form-id` values when placing multiple forms on one page.

---

## Security

| Protection | Detail |
|------------|--------|
| Iframe XSS prevention | JSON values embedded in iframe `srcdoc` are escaped via `safeJsonForScript()` to prevent `</script>` breakout |
| Logo URL validation | Only `http://` and `https://` protocols accepted |
| Font name sanitization | Non-alphanumeric characters stripped before CSS injection |
| CSS color sanitization | `url()`, `expression()`, `import`, `javascript:` patterns blocked |
| CSS value sanitization | `{}<>;` characters stripped from widget iframe CSS values |
| Numeric attribute parsing | Dimension values parsed through `parseInt()` before use |
| Target selector validation | Only simple `#id` or `.class` selectors allowed |
| Custom field ID sanitization | IDs restricted to `[a-zA-Z0-9_-]` |
| Form ID sanitization | Special characters stripped before use as element ID |
| Webhook URL validation | Must be HTTPS; localhost and private IP ranges (10.x, 172.16-31.x, 192.168.x) blocked |
| Honeypot spam detection | Hidden `rpr_hp` field catches automated submissions |
| Double-initialization guard | Same script tag cannot be processed twice |
| Double-click protection | Submit button stays disabled through step transition |
| Widget CSS injection guard | `</style>` and `<script` tags stripped from custom CSS |
| Multi-instance ID scoping | All element IDs prefixed with `formId` to prevent DOM collisions |

### Inherent Limitations

These are architectural constraints of client-side-only operation, documented for transparency:

- **RPR token is visible in page source.** Inherent to client-side widget rendering. Cannot be hidden without a server proxy.
- **Webhook URL is visible in page source.** Same constraint. Webhook endpoints should validate payloads if abuse is a concern.
- **No server-side rate limiting.** Implement at the webhook/automation level.
- **Webhook delivery is fire-and-forget.** Due to `no-cors` mode, the script cannot confirm delivery. The request is sent but the response is opaque.
- **Third-party RPR script.** The narrpr.com widget script runs inside a sandboxed iframe. This is the same trust model as the WordPress plugin.

---

## Hosting

The JS file must be hosted at a publicly accessible HTTPS URL. Options:

| Method | URL Pattern | Notes |
|--------|-------------|-------|
| GitHub Pages | `https://username.github.io/repo/file.js` | Free, auto-deploys on commit, soft rate limits |
| CDN (CloudFront, R2, Netlify) | `https://cdn.yourdomain.com/avm/embed.js` | Recommended for production scale |
| Any web server | `https://yourdomain.com/path/rpr-avm-embed.js` | Full control over caching/versioning |

To update: replace the hosted file and all installs pick up changes automatically (subject to browser/CDN caching).

---

## Differences from WordPress Plugin

| Feature | WordPress Plugin | Embeddable Widget |
|---------|-----------------|-------------------|
| Lead storage | Custom DB table | Webhook only |
| Nonce verification | WordPress REST nonce | N/A |
| Rate limiting | 10/IP/hour via transients | N/A (webhook level) |
| Email notifications | Built-in PHP mailer | Configure via automation |
| Admin dashboard | Full WP admin UI | N/A |
| Agent system | DB-backed agents table | One embed per agent |
| reCAPTCHA verification | Server-side | Token in payload (verify downstream) |
| Analytics | Built-in Chart.js | Use GA4 / GTM events |
| Webhook delivery | Server-side `wp_remote_post` | Client-side `fetch` (no-cors) |

---

## Troubleshooting

**Form doesn't appear** -- Check browser console (F12 -> Console) for errors. Verify the script URL loads directly in a browser tab. Confirm `data-rpr-token` is set.

**Leads not arriving at webhook** -- Confirm the automation/Zap is published, not in draft. Check task history for errors. Temporarily remove any filter steps. Verify the webhook URL starts with `https://`.

**Address autocomplete not working** -- Verify the Google Places API key. Ensure the Places API (not just Maps) is enabled in Google Cloud Console. Check API key referrer restrictions.

**RPR widget not displaying** -- Verify the RPR token is valid at narrpr.com. Check that the address submitted is a real US property address.

**Form styling conflicts with host site** -- The widget scopes all styles via `.rpr-avm-embed` prefix and CSS custom properties. It does not inherit host page styles by design. Adjust `data-color-*` and `data-font-*` attributes to match the host site's aesthetic.

---

## Version History

| Version | Changes |
|---------|---------|
| 1.0.0 | Initial release -- extracted from WordPress plugin v4.2.1 |
| 1.0.1 | 14 bug fixes: multi-instance ID collisions, validation logic, escape key scoping, webhook error UX, double-click protection |
| 1.0.2 | Security hardening: iframe XSS, URL validation, CSS sanitization, numeric parsing, field ID sanitization, private IP blocking |
| 1.0.3 | CORS fix: `mode: 'no-cors'` + `Content-Type: text/plain` for cross-origin webhook compatibility |

---

## Browser Support

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+. Requires `async/await`, template literals, `const/let`, arrow functions, optional chaining.
