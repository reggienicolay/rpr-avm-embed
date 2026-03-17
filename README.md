# RPR AVM Lead Capture -- Embeddable Widget

A single-script lead capture form that collects visitor information and displays an RPR-powered home valuation estimate. Add one script tag to any website -- all configuration is done via data attributes.

## Installation

```html
<script
  src="https://reggienicolay.github.io/rpr-avm-embed/rpr-avm-embed.js"
  data-rpr-token="YOUR_RPR_TOKEN"
  data-webhook="https://hooks.zapier.com/hooks/catch/12345/abcdef/"
  data-agent-name="Agent Name"
  data-brokerage="Brokerage Name"
></script>
```

Place this tag in any HTML page, code injection area, or tag manager. The form renders where the tag is placed. No dependencies required.

`data-rpr-token` is the only required attribute. Get it from your RPR account at narrpr.com.

## Display Modes

**Inline** (default) -- form renders in the page flow at the script tag location.

**Floating** -- fixed button in the corner that opens the form in a modal:
```
data-display-mode="floating"
data-float-label="What's My Home Worth?"
data-float-position="bottom-right"
```

**Modal** -- inline button that opens the form in a modal:
```
data-display-mode="modal"
data-modal-trigger-text="Get Your Home Value"
```

To mount inside a specific element instead of after the script tag:
```html
<div id="avm-form"></div>
<script src="...rpr-avm-embed.js" data-rpr-token="..." data-target="#avm-form"></script>
```

## Configuration

All options are set as `data-*` attributes on the script tag.

### Branding

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-agent-name` | | Name shown in form header |
| `data-brokerage` | | Brokerage shown in form header |
| `data-logo-url` | | Logo image URL (https only) |
| `data-show-header` | `true` | Show/hide the header bar |
| `data-show-badge` | `true` | Show/hide the badge |
| `data-badge-text` | `Powered by RPR` | Badge label |

### Colors

| Attribute | Default |
|-----------|---------|
| `data-color-brand` | `#0070C1` |
| `data-color-brand-hover` | auto-darkened |
| `data-color-btn-text` | `#ffffff` |
| `data-color-header-text` | `#ffffff` |
| `data-color-card-bg` | `#ffffff` |
| `data-color-card-border` | `#e2e2e2` |
| `data-color-page-bg` | `#f7f8fa` |
| `data-color-input-border` | `rgba(0,0,0,0.12)` |
| `data-color-error` | `#c0392b` |

### Typography

| Attribute | Default |
|-----------|---------|
| `data-font-heading` | `DM Serif Display` |
| `data-font-body` | `DM Sans` |
| `data-font-size` | `15` (px) |

Fonts are auto-loaded from Google Fonts unless they are system fonts (Arial, Georgia, Helvetica, Verdana, Times New Roman, system-ui).

### Text

| Attribute | Default |
|-----------|---------|
| `data-headline` | What's your home worth? |
| `data-subheadline` | Get a free, data-driven estimate... |
| `data-button-text` | Get my free home value estimate |
| `data-disclaimer` | Your information is kept private... |
| `data-sending-text` | Sending... |
| `data-back-link-text` | Edit my information |
| `data-addr-prefix` | Estimate for: |

### Layout

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-display-mode` | `inline` | `inline`, `modal`, or `floating` |
| `data-card-max-width` | `520` | px |
| `data-card-radius` | `18` | px |
| `data-show-back-link` | `true` | Show edit link on results step |
| `data-show-addr-strip` | `true` | Show address on results step |
| `data-widget-min-height` | `320` | px |
| `data-widget-padding` | `comfortable` | `none`, `compact`, or `comfortable` |
| `data-float-label` | `Get My Home Value` | Floating button text |
| `data-float-position` | `bottom-right` | `bottom-right` or `bottom-left` |
| `data-modal-trigger-text` | What's My Home Worth? | Modal button text |
| `data-target` | | CSS selector to mount into |

### Lead Capture

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-webhook` | | HTTPS webhook URL |
| `data-form-id` | `rpr-avm-embed` | Identifier included in payload |

### Google Places Autocomplete

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-google-key` | | Google Maps API key (Places API must be enabled) |
| `data-places-country` | `us` | Country restriction (ISO 3166-1 alpha-2) |

### reCAPTCHA v3

| Attribute | Default |
|-----------|---------|
| `data-recaptcha-site-key` | |

Token is included in the webhook payload as `recaptcha_token`. Verification must be done at the webhook endpoint.

### GDPR Consent

| Attribute | Default |
|-----------|---------|
| `data-gdpr-enabled` | `false` |
| `data-gdpr-text` | I agree to be contacted about my home value estimate. |

### RPR Widget Appearance

Controls the valuation widget shown after form submission:

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-rpr-cobrand` | | RPR CoBrandCode |
| `data-rpr-show-links` | `true` | Show RPR links |
| `data-widget-match-brand` | `false` | Use brand color on widget header |
| `data-widget-header-bg` | | Header background override |
| `data-widget-header-text` | | Header text color |
| `data-widget-value-color` | | Value text color |
| `data-widget-link-color` | | Link color |
| `data-widget-font` | | Font family |
| `data-widget-border-radius` | | Border radius (px) |
| `data-widget-hide-chart` | `false` | Hide value chart |
| `data-widget-hide-links` | `false` | Hide footer links |
| `data-widget-custom-css` | | Custom CSS for widget iframe |

### Custom Fields

Override default fields with a JSON array:

```
data-fields='[
  {"id":"first_name","label":"First Name","placeholder":"Jane","type":"text","required":true,"width":"half","order":1,"error_msg":"Required"},
  {"id":"email","label":"Email","placeholder":"jane@example.com","type":"email","required":true,"width":"full","order":2,"error_msg":"Enter a valid email"},
  {"id":"address","label":"Address","placeholder":"123 Main St","type":"text","required":true,"locked":true,"width":"full","order":3,"error_msg":"Enter the address"},
  {"id":"custom_1","label":"How did you hear about us?","type":"select","required":false,"width":"full","order":4,"error_msg":"Required","options":"Google\nFriend\nOther"}
]'
```

Field properties: `id`, `label`, `placeholder`, `type` (text/email/tel/select), `required`, `locked` (always required + visible), `width` (half/full), `order`, `error_msg`, `options` (newline-separated, select only).

## Webhook Payload

POST request with JSON body:

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

Custom field IDs starting with `custom_` appear both inside `custom_fields` and as top-level keys.

The request uses `Content-Type: text/plain` with `mode: no-cors` for cross-origin compatibility. The body is valid JSON and is parsed correctly by Zapier, Make, GHL, and HubSpot.

## Spam Protection

**Honeypot:** The form includes a hidden `rpr_hp` field. Real users never see or fill it. Bots tend to fill all fields. At your webhook endpoint, discard submissions where `rpr_hp` is not empty.

**reCAPTCHA v3:** When `data-recaptcha-site-key` is set, a score-based token is generated on submission and included in the payload as `recaptcha_token`. Verify this token server-side at your webhook endpoint using Google's siteverify API.

## Security

All user-supplied configuration values are sanitized before use. URL attributes are validated for protocol. Color and font values are stripped of executable patterns. JSON values embedded in the RPR iframe are escaped to prevent script injection. Form field IDs from custom JSON are restricted to safe characters. The webhook endpoint must be HTTPS; private/local IP addresses are blocked.

The RPR token and webhook URL are visible in page source. This is inherent to client-side operation.

## Multiple Installs

This repo powers all installs. Each site gets its own script tag with unique attributes -- all pointing to the same JS file. No configuration bleeds between installs.

For multiple forms on one page, use unique `data-form-id` values.

## Browser Support

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+.
