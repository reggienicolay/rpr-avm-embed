/**
 * RPR AVM Lead Capture -- Standalone Embeddable Widget
 * Version: 1.0.0
 *
 * Zero-dependency, platform-agnostic embed script.
 * Works on Luxury Presence, Squarespace, Wix, static HTML, or any website.
 *
 * Usage:
 *   <script
 *     src="https://cdn.yourdomain.com/rpr-avm-embed.js"
 *     data-rpr-token="YOUR_RPR_TOKEN"
 *     data-webhook="https://hooks.zapier.com/hooks/catch/..."
 *     data-agent-name="Jane Smith"
 *     data-brokerage="Luxury Realty Group"
 *   ></script>
 *
 * All data-* attributes are optional except data-rpr-token.
 * See EMBED-README.md for full configuration reference.
 */
( function () {
	'use strict';

	/* ================================================================
	   S1  DETECT OUR OWN SCRIPT TAG & READ CONFIG
	   ================================================================ */
	const SCRIPT = document.currentScript || ( function () {
		const scripts = document.querySelectorAll( 'script[data-rpr-token]' );
		return scripts[ scripts.length - 1 ];
	} )();

	if ( ! SCRIPT ) {
		console.error( 'RPR AVM Embed: Could not locate script tag.' );
		return;
	}

	// Prevent double-initialization of the same script tag
	if ( SCRIPT.dataset.rprInitialized ) return;
	SCRIPT.dataset.rprInitialized = '1';

	const attr = ( key, fallback ) => SCRIPT.getAttribute( 'data-' + key ) ?? fallback;
	const attrBool = ( key, fallback ) => {
		const v = SCRIPT.getAttribute( 'data-' + key );
		if ( v === null ) return fallback;
		return v !== 'false' && v !== '0';
	};

	/* -- Configuration from data-* attributes ----------------------- */
	const CFG = {
		// RPR Widget
		rprToken:       attr( 'rpr-token', '' ),
		rprCobrand:     attr( 'rpr-cobrand', '' ),
		rprShowLinks:   attrBool( 'rpr-show-links', true ),

		// Branding
		agentName:      attr( 'agent-name', '' ),
		brokerage:      attr( 'brokerage', '' ),
		logoUrl:        attr( 'logo-url', '' ),
		showHeader:     attrBool( 'show-header', true ),
		showBadge:      attrBool( 'show-badge', true ),
		badgeText:      attr( 'badge-text', 'Powered by RPR' ),

		// Colors
		colorBrand:     attr( 'color-brand', '#0070C1' ),
		colorBrandHover: attr( 'color-brand-hover', '' ),
		colorBtnText:   attr( 'color-btn-text', '#ffffff' ),
		colorHeaderText: attr( 'color-header-text', '#ffffff' ),
		colorCardBg:    attr( 'color-card-bg', '#ffffff' ),
		colorCardBorder: attr( 'color-card-border', '#e2e2e2' ),
		colorPageBg:    attr( 'color-page-bg', '#f7f8fa' ),
		colorInputBorder: attr( 'color-input-border', 'rgba(0,0,0,0.12)' ),
		colorFocusRing: attr( 'color-focus-ring', '' ),
		colorError:     attr( 'color-error', '#c0392b' ),
		colorStripBg:   attr( 'color-strip-bg', '#f7f8fa' ),
		colorLink:      attr( 'color-link', '' ),

		// Fonts
		fontHeading:    attr( 'font-heading', 'DM Serif Display' ),
		fontBody:       attr( 'font-body', 'DM Sans' ),
		fontSize:       attr( 'font-size', '15' ),

		// Text strings
		headline:       attr( 'headline', "What's your home worth?" ),
		subheadline:    attr( 'subheadline', 'Get a free, data-driven estimate powered by Realtors Property Resource\u00a0\u2014 used by over 1.4\u00a0million REALTORS\u00ae nationwide.' ),
		buttonText:     attr( 'button-text', 'Get my free home value estimate' ),
		disclaimer:     attr( 'disclaimer', 'Your information is kept private and will never be sold. A local REALTOR\u00ae may follow up to discuss your results.' ),
		sendingText:    attr( 'sending-text', 'Sending\u2026' ),
		backLinkText:   attr( 'back-link-text', 'Edit my information' ),
		addrPrefix:     attr( 'addr-prefix', 'Estimate for:' ),

		// Layout
		displayMode:    attr( 'display-mode', 'inline' ),
		cardMaxWidth:   attr( 'card-max-width', '520' ),
		cardRadius:     attr( 'card-radius', '18' ),
		showBackLink:   attrBool( 'show-back-link', true ),
		showAddrStrip:  attrBool( 'show-addr-strip', true ),
		widgetMinH:     attr( 'widget-min-height', '320' ),
		widgetPadding:  attr( 'widget-padding', 'comfortable' ),
		floatLabel:     attr( 'float-label', 'Get My Home Value' ),
		floatPos:       attr( 'float-position', 'bottom-right' ),
		modalTrigger:   attr( 'modal-trigger-text', "What's My Home Worth?" ),

		// Lead capture
		webhook:        attr( 'webhook', '' ),
		formId:         ( attr( 'form-id', 'rpr-avm-embed' ) || 'rpr-avm-embed' ).replace( /[^a-zA-Z0-9_-]/g, '' ),

		// Fields config (JSON string or use defaults)
		fieldsJson:     attr( 'fields', '' ),

		// Google Places
		googleKey:      attr( 'google-key', '' ),
		placesCountry:  attr( 'places-country', 'us' ),

		// GDPR
		gdprEnabled:    attrBool( 'gdpr-enabled', false ),
		gdprText:       attr( 'gdpr-text', 'I agree to be contacted about my home value estimate.' ),

		// reCAPTCHA v3
		recaptchaSiteKey: attr( 'recaptcha-site-key', '' ),

		// Widget appearance
		widgetMatchBrand: attrBool( 'widget-match-brand', false ),
		widgetHeaderBg:   attr( 'widget-header-bg', '' ),
		widgetHeaderText: attr( 'widget-header-text', '' ),
		widgetValueColor: attr( 'widget-value-color', '' ),
		widgetLinkColor:  attr( 'widget-link-color', '' ),
		widgetFont:       attr( 'widget-font', '' ),
		widgetBorderRadius: attr( 'widget-border-radius', '' ),
		widgetHideChart:  attrBool( 'widget-hide-chart', false ),
		widgetHideLinks:  attrBool( 'widget-hide-links', false ),
		widgetCustomCss:  attr( 'widget-custom-css', '' ),

		// Target container (if user wants to mount inside a specific element)
		target:         attr( 'target', '' ),
	};

	// Sanitize target selector -- only allow simple ID/class selectors
	if ( CFG.target && ! /^[#.][a-zA-Z0-9_-]+$/.test( CFG.target ) ) {
		console.warn( 'RPR AVM Embed: Invalid data-target selector. Must be a simple #id or .class. Ignoring.' );
		CFG.target = '';
	}

	if ( ! CFG.rprToken ) {
		console.error( 'RPR AVM Embed: data-rpr-token is required.' );
		return;
	}

	if ( CFG.webhook && ! CFG.webhook.startsWith( 'https://' ) ) {
		console.error( 'RPR AVM Embed: data-webhook must use HTTPS. Webhook disabled.' );
		CFG.webhook = '';
	}

	// Block webhooks to localhost/private IPs (defense in depth -- fetch runs client-side but still good practice)
	if ( CFG.webhook ) {
		try {
			const whUrl = new URL( CFG.webhook );
			const blocked = [ 'localhost', '127.0.0.1', '0.0.0.0', '[::1]' ];
			if ( blocked.includes( whUrl.hostname ) || /^(10|172\.(1[6-9]|2\d|3[01])|192\.168)\./.test( whUrl.hostname ) ) {
				console.error( 'RPR AVM Embed: Webhook URL points to a private/local address. Webhook disabled.' );
				CFG.webhook = '';
			}
		} catch ( e ) {
			console.error( 'RPR AVM Embed: Invalid webhook URL. Webhook disabled.' );
			CFG.webhook = '';
		}
	}

	if ( ! CFG.webhook ) {
		console.warn( 'RPR AVM Embed: No webhook configured. Leads will NOT be captured. The RPR widget will still display.' );
	}

	/* -- Derived values --------------------------------------------- */
	function isHex( str ) {
		return /^#?[0-9a-fA-F]{3,6}$/.test( str );
	}

	function hexToRgba( hex, alpha ) {
		if ( ! isHex( hex ) ) return hex; // pass through rgba/named colors unchanged
		hex = hex.replace( '#', '' );
		if ( hex.length === 3 ) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		const r = parseInt( hex.substring(0,2), 16 );
		const g = parseInt( hex.substring(2,4), 16 );
		const b = parseInt( hex.substring(4,6), 16 );
		return `rgba(${r},${g},${b},${alpha})`;
	}

	function darkenHex( hex, amount ) {
		if ( ! isHex( hex ) ) return hex; // can't darken rgba/named -- return as-is
		hex = hex.replace( '#', '' );
		if ( hex.length === 3 ) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		const r = Math.max( 0, parseInt( hex.substring(0,2), 16 ) - amount );
		const g = Math.max( 0, parseInt( hex.substring(2,4), 16 ) - amount );
		const b = Math.max( 0, parseInt( hex.substring(4,6), 16 ) - amount );
		return '#' + [r,g,b].map( c => c.toString(16).padStart(2,'0') ).join('');
	}

	function safeCssColor( val ) {
		// Allow hex, rgb/rgba, hsl/hsla, named colors. Block url(), expression(), etc.
		if ( ! val ) return val;
		if ( /url\s*\(|expression\s*\(|import|javascript:/i.test( val ) ) return '';
		return val;
	}

	const brandHover = CFG.colorBrandHover || darkenHex( CFG.colorBrand, 20 );
	const focusRing  = CFG.colorFocusRing || hexToRgba( CFG.colorBrand, 0.15 );
	const linkColor  = CFG.colorLink || CFG.colorBrand;

	/* -- Default fields --------------------------------------------- */
	let FIELDS;
	if ( CFG.fieldsJson ) {
		try {
			FIELDS = JSON.parse( CFG.fieldsJson );
			// Sanitize field IDs -- they're used in selectors and element IDs
			if ( Array.isArray( FIELDS ) ) {
				FIELDS = FIELDS.filter( f => f && typeof f === 'object' && f.id );
				FIELDS.forEach( f => {
					f.id = String( f.id ).replace( /[^a-zA-Z0-9_-]/g, '' );
					if ( ! f.id ) f.id = 'field_' + Math.random().toString(36).slice(2,6);
				} );
			} else {
				FIELDS = null;
			}
		}
		catch ( e ) { console.warn( 'RPR AVM Embed: Invalid fields JSON, using defaults.' ); FIELDS = null; }
	}
	if ( ! FIELDS ) {
		FIELDS = [
			{ id: 'first_name', label: 'First name', placeholder: 'First name', type: 'text', required: true, width: 'half', order: 1, error_msg: 'Please enter your first name' },
			{ id: 'last_name',  label: 'Last name',  placeholder: 'Smith', type: 'text', required: true, width: 'half', order: 2, error_msg: 'Please enter your last name' },
			{ id: 'email',      label: 'Email',       placeholder: 'email@example.com', type: 'email', required: true, width: 'half', order: 3, error_msg: 'Enter a valid email address' },
			{ id: 'phone',      label: 'Phone',       placeholder: '(555) 555-5555', type: 'tel', required: false, width: 'half', order: 4, error_msg: 'Enter a valid phone number' },
			{ id: 'address',    label: 'Property address', placeholder: '123 Main St, City, ST 00000', type: 'text', required: true, locked: true, width: 'full', order: 5, error_msg: 'Enter the property address' },
		];
	}

	/* ================================================================
	   S2  INJECT STYLES (scoped via .rpr-avm-embed prefix)
	   ================================================================ */
	const STYLE_ID = 'rpr-avm-embed-styles';
	if ( ! document.getElementById( STYLE_ID ) ) {
		const style = document.createElement( 'style' );
		style.id = STYLE_ID;
		style.textContent = `
/* -- RPR AVM Embed -- Scoped Styles ------------------------- */
.rpr-avm-embed *,
.rpr-avm-embed *::before,
.rpr-avm-embed *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* Floating trigger button */
.rpr-avm-embed .rpr-e-float-btn {
	position: fixed; bottom: 24px; right: 24px; z-index: 9998;
	padding: 13px 22px; border: none; border-radius: 50px; cursor: pointer;
	font-size: 14px; font-weight: 500; letter-spacing: .02em;
	transition: transform .15s, opacity .15s;
	box-shadow: 0 4px 20px rgba(0,0,0,.18);
	background: var(--rpr-brand); color: var(--rpr-btn-text);
	font-family: var(--rpr-font-body);
}
.rpr-avm-embed .rpr-e-float-btn:hover { transform: translateY(-2px); opacity: .9; }
.rpr-avm-embed .rpr-e-float-btn.left { right: auto; left: 24px; }

/* Modal trigger button */
.rpr-avm-embed .rpr-e-modal-trigger {
	display: inline-flex; align-items: center; gap: 8px;
	padding: 13px 24px; border: none; border-radius: 8px;
	cursor: pointer; font-size: 15px; font-weight: 500;
	font-family: var(--rpr-font-body); letter-spacing: .01em;
	transition: background .15s, transform .1s;
	background: var(--rpr-brand); color: var(--rpr-btn-text);
}
.rpr-avm-embed .rpr-e-modal-trigger:hover { background: var(--rpr-brand-hover); }

/* Modal overlay */
.rpr-avm-embed .rpr-e-overlay {
	display: none; position: fixed; inset: 0; z-index: 99999;
	background: rgba(0,0,0,.55); align-items: center; justify-content: center;
	padding: 1rem; animation: rprEFadeIn .2s ease;
}
.rpr-avm-embed .rpr-e-overlay.open { display: flex; }
.rpr-avm-embed .rpr-e-overlay .rpr-e-card { max-height: 92vh; overflow-y: auto; }

/* Card */
.rpr-avm-embed .rpr-e-card {
	width: 100%; max-width: var(--rpr-card-max-width, 520px);
	background: var(--rpr-card-bg); border: 1px solid var(--rpr-card-border);
	border-radius: var(--rpr-card-radius, 18px); overflow: hidden;
	margin: 0 auto; animation: rprESlideUp .4s ease both;
	font-family: var(--rpr-font-body); line-height: 1.5; color: #333;
}

/* Header band */
.rpr-avm-embed .rpr-e-header {
	background: var(--rpr-brand); padding: 1.25rem 1.5rem;
	display: flex; align-items: center; gap: 14px;
}
.rpr-avm-embed .rpr-e-avatar {
	width: 46px; height: 46px; border-radius: 50%;
	background: rgba(255,255,255,.2); border: 2px solid rgba(255,255,255,.45);
	display: flex; align-items: center; justify-content: center;
	font-size: 16px; font-weight: 500; color: #fff;
	flex-shrink: 0; overflow: hidden;
}
.rpr-avm-embed .rpr-e-avatar img { width: 100%; height: 100%; object-fit: cover; }
.rpr-avm-embed .rpr-e-agent-info { flex: 1; min-width: 0; }
.rpr-avm-embed .rpr-e-agent-name {
	font-size: 15px; font-weight: 500; color: var(--rpr-header-text);
	line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rpr-avm-embed .rpr-e-agent-brokerage {
	font-size: 12px; color: var(--rpr-header-text); opacity: 0.7;
	line-height: 1.3; margin-top: 1px;
	white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rpr-avm-embed .rpr-e-badge {
	font-size: 10px; font-weight: 500; letter-spacing: .04em;
	text-transform: uppercase; color: rgba(255,255,255,.85);
	background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
	border-radius: 20px; padding: 3px 10px; white-space: nowrap; flex-shrink: 0;
}

/* Body */
.rpr-avm-embed .rpr-e-body { padding: 1.75rem 1.75rem 1.5rem; background: var(--rpr-card-bg); }

/* Hero */
.rpr-avm-embed .rpr-e-headline {
	font-family: var(--rpr-font-heading);
	font-size: 26px; font-weight: 400; line-height: 1.25;
	color: inherit; margin: 0 0 .45rem;
}
.rpr-avm-embed .rpr-e-subheadline {
	font-size: 14px; line-height: 1.65; color: #6b6b6b; margin: 0 0 1.5rem;
}

/* Fields */
.rpr-avm-embed .rpr-e-fields { display: grid; gap: 1rem; }
.rpr-avm-embed .rpr-e-field { display: flex; flex-direction: column; gap: .35rem; }
.rpr-avm-embed .rpr-e-field.half { grid-column: span 1; }
.rpr-avm-embed .rpr-e-field.full { grid-column: 1 / -1; }
.rpr-avm-embed .rpr-e-label {
	font-size: 11px; font-weight: 500; letter-spacing: .07em;
	text-transform: uppercase; color: #6b6b6b;
}
.rpr-avm-embed .rpr-e-input,
.rpr-avm-embed .rpr-e-select {
	width: 100%; padding: 10px 14px;
	font-family: var(--rpr-font-body); font-size: var(--rpr-font-size-base, 15px);
	color: inherit; background: var(--rpr-card-bg);
	border: 1px solid var(--rpr-input-border); border-radius: 8px;
	transition: border-color .15s, box-shadow .15s;
	appearance: none; -webkit-appearance: none; outline: none;
}
.rpr-avm-embed .rpr-e-input::placeholder { color: #aaa; }
.rpr-avm-embed .rpr-e-input:hover,
.rpr-avm-embed .rpr-e-select:hover { border-color: rgba(0,0,0,.25); }
.rpr-avm-embed .rpr-e-input:focus,
.rpr-avm-embed .rpr-e-select:focus {
	border-color: var(--rpr-brand);
	box-shadow: 0 0 0 3px var(--rpr-focus-ring);
}
.rpr-avm-embed .rpr-e-input.is-error { border-color: var(--rpr-error); box-shadow: 0 0 0 3px rgba(192,57,43,.1); }
.rpr-avm-embed .rpr-e-error-msg { font-size: 12px; color: var(--rpr-error); min-height: 1rem; }

/* GDPR */
.rpr-avm-embed .rpr-e-gdpr {
	display: flex; align-items: flex-start; gap: 10px;
	margin-top: .25rem; font-size: 13px; color: #6b6b6b; grid-column: 1 / -1;
}
.rpr-avm-embed .rpr-e-gdpr input { margin-top: 2px; accent-color: var(--rpr-brand); flex-shrink: 0; }

/* Button */
.rpr-avm-embed .rpr-e-submit {
	grid-column: 1 / -1; width: 100%; padding: 13px;
	background: var(--rpr-brand); color: var(--rpr-btn-text);
	font-family: var(--rpr-font-body); font-size: 15px; font-weight: 500;
	border: none; border-radius: 8px; cursor: pointer;
	letter-spacing: .01em; transition: background .15s, transform .1s; margin-top: .25rem;
}
.rpr-avm-embed .rpr-e-submit:hover { background: var(--rpr-brand-hover); }
.rpr-avm-embed .rpr-e-submit:active { transform: scale(.99); }
.rpr-avm-embed .rpr-e-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; }

/* Status / disclaimer */
.rpr-avm-embed .rpr-e-sending { font-size: 13px; color: var(--rpr-brand); text-align: center; min-height: 1.4rem; grid-column: 1 / -1; }
.rpr-avm-embed .rpr-e-disclaimer { font-size: 11.5px; color: #aaa; text-align: center; margin-top: .75rem; line-height: 1.55; grid-column: 1 / -1; }

/* Step 2 */
.rpr-avm-embed .rpr-e-step2-body { background: var(--rpr-card-bg); }
.rpr-avm-embed .rpr-e-back-link {
	display: inline-flex; align-items: center; gap: 5px;
	font-size: 13px; color: var(--rpr-link); background: none; border: none;
	cursor: pointer; padding: 0; font-family: var(--rpr-font-body);
	margin: 1.25rem var(--rpr-widget-padding, 1.75rem) .75rem;
}
.rpr-avm-embed .rpr-e-back-link:hover { text-decoration: underline; }
.rpr-avm-embed .rpr-e-addr-strip {
	background: var(--rpr-strip-bg); border: 1px solid var(--rpr-input-border);
	border-radius: 8px; padding: .6rem 1rem; font-size: 13.5px; color: #6b6b6b;
	margin: 0 var(--rpr-widget-padding, 1.75rem) 1rem;
}
.rpr-avm-embed .rpr-e-addr-strip strong { color: inherit; font-weight: 500; filter: brightness(.7); }
.rpr-avm-embed .rpr-e-widget-mount {
	min-height: var(--rpr-widget-min-h, 320px);
	padding: 0 var(--rpr-widget-padding, 0);
}
.rpr-avm-embed .rpr-e-widget-mount iframe { width: 100%; border: none; display: block; }

/* Honeypot */
.rpr-avm-embed .rpr-e-hp {
	position: absolute !important; left: -9999px !important;
	width: 1px !important; height: 1px !important;
	overflow: hidden !important; opacity: 0 !important; pointer-events: none !important;
}

/* Animations */
@keyframes rprESlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
@keyframes rprEFadeIn  { from { opacity:0; } to { opacity:1; } }

/* Responsive */
@media (max-width: 520px) {
	.rpr-avm-embed .rpr-e-body,
	.rpr-avm-embed .rpr-e-step2-body { padding: 1.25rem; }
	.rpr-avm-embed .rpr-e-header { padding: 1rem 1.25rem; }
	.rpr-avm-embed .rpr-e-headline { font-size: 22px; }
	.rpr-avm-embed .rpr-e-fields { grid-template-columns: 1fr !important; }
	.rpr-avm-embed .rpr-e-field.half { grid-column: span 1; }
}

/* -- Google Places autocomplete dropdown ------------------- */
.pac-container {
	z-index: 999999 !important;
	font-family: var(--rpr-font-body, system-ui, sans-serif) !important;
	border-radius: 8px !important;
	box-shadow: 0 4px 20px rgba(0,0,0,.15) !important;
	border: 1px solid rgba(0,0,0,.08) !important;
	margin-top: 4px !important;
}
`;
		document.head.appendChild( style );
	}

	function safeFontName( name ) {
		// Strip anything that could break out of a CSS font-family declaration
		return ( name || '' ).replace( /[^a-zA-Z0-9 \-]/g, '' );
	}

	function parseDimension( val, fallback ) {
		// Supports: '520' (bare number -> px), '520px', '100%', 'none'
		if ( ! val ) return fallback;
		val = String( val ).trim().toLowerCase();
		if ( val === 'none' ) return 'none';
		if ( val.endsWith( '%' ) ) return val;
		if ( val.endsWith( 'px' ) ) return val;
		if ( val.endsWith( 'vw' ) ) return val;
		var num = parseInt( val, 10 );
		return isNaN( num ) ? fallback : num + 'px';
	}

	/* ================================================================
	   S3  LOAD GOOGLE FONTS
	   ================================================================ */
	function loadFonts() {
		const gFonts = [];
		const system = [ 'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana', 'system-ui', 'inherit' ];
		if ( CFG.fontHeading && ! system.includes( CFG.fontHeading ) ) {
			gFonts.push( CFG.fontHeading.replace( / /g, '+' ) + ':ital,wght@0,400;0,700;1,400' );
		}
		if ( CFG.fontBody && CFG.fontBody !== CFG.fontHeading && ! system.includes( CFG.fontBody ) ) {
			gFonts.push( CFG.fontBody.replace( / /g, '+' ) + ':wght@400;500' );
		}
		if ( gFonts.length && ! document.querySelector( '[data-rpr-embed-font]' ) ) {
			const link  = document.createElement( 'link' );
			link.rel    = 'stylesheet';
			link.href   = 'https://fonts.googleapis.com/css2?family=' + gFonts.join( '&family=' ) + '&display=swap';
			link.setAttribute( 'data-rpr-embed-font', '1' );
			document.head.appendChild( link );
		}
	}

	/* ================================================================
	   S4  LOAD GOOGLE PLACES (if configured)
	   ================================================================ */
	function loadGooglePlaces() {
		if ( ! CFG.googleKey ) return;
		if ( window.google && window.google.maps && window.google.maps.places ) return;
		if ( document.querySelector( 'script[src*="maps.googleapis.com/maps/api"]' ) ) return;

		const s   = document.createElement( 'script' );
		s.src     = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent( CFG.googleKey ) + '&libraries=places';
		s.async   = true;
		s.defer   = true;
		document.head.appendChild( s );
	}

	/* ================================================================
	   S5  LOAD reCAPTCHA v3 (if configured)
	   ================================================================ */
	function loadRecaptcha() {
		if ( ! CFG.recaptchaSiteKey ) return;
		if ( document.querySelector( 'script[src*="recaptcha/api.js"]' ) ) return;

		const s   = document.createElement( 'script' );
		s.src     = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent( CFG.recaptchaSiteKey );
		s.async   = true;
		document.head.appendChild( s );
	}

	/* ================================================================
	   S6  DOM HELPERS
	   ================================================================ */
	function el( tag, props ) {
		const node = document.createElement( tag );
		if ( props ) Object.entries( props ).forEach( ( [ k, v ] ) => {
			if ( k === 'dataset' ) Object.assign( node.dataset, v );
			else node[ k ] = v;
		} );
		return node;
	}

	function initials( name ) {
		return ( name || '' ).split( /\s+/ ).filter( w => w.length > 0 ).map( w => w[0] ).join( '' ).slice( 0, 2 ).toUpperCase();
	}

	function escHtml( str ) {
		return String( str ).replace( /[&<>"']/g, c => ( { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } )[ c ] );
	}

	/* ================================================================
	   S7  BUILD THE WIDGET DOM
	   ================================================================ */
	function buildWidget() {
		loadFonts();
		loadGooglePlaces();
		loadRecaptcha();

		/* -- Mount point -------------------------------------------- */
		let mount;
		if ( CFG.target ) {
			mount = document.querySelector( CFG.target );
		}
		if ( ! mount ) {
			// Insert widget right after the script tag
			mount = el( 'div' );
			SCRIPT.parentNode.insertBefore( mount, SCRIPT.nextSibling );
		}

		/* -- Root wrapper ------------------------------------------- */
		const wrap = el( 'div', { className: 'rpr-avm-embed' } );
		wrap.id = CFG.formId;

		// Apply CSS custom properties
		const s = wrap.style;
		s.setProperty( '--rpr-brand', safeCssColor( CFG.colorBrand ) );
		s.setProperty( '--rpr-brand-hover', safeCssColor( brandHover ) );
		s.setProperty( '--rpr-btn-text', safeCssColor( CFG.colorBtnText ) );
		s.setProperty( '--rpr-header-text', safeCssColor( CFG.colorHeaderText ) );
		s.setProperty( '--rpr-card-bg', safeCssColor( CFG.colorCardBg ) );
		s.setProperty( '--rpr-card-border', safeCssColor( CFG.colorCardBorder ) );
		s.setProperty( '--rpr-page-bg', safeCssColor( CFG.colorPageBg ) );
		s.setProperty( '--rpr-input-border', safeCssColor( CFG.colorInputBorder ) );
		s.setProperty( '--rpr-focus-ring', safeCssColor( focusRing ) );
		s.setProperty( '--rpr-error', safeCssColor( CFG.colorError ) );
		s.setProperty( '--rpr-strip-bg', safeCssColor( CFG.colorStripBg ) );
		s.setProperty( '--rpr-link', safeCssColor( linkColor ) );
		s.setProperty( '--rpr-font-heading', `'${safeFontName( CFG.fontHeading )}', Georgia, serif` );
		s.setProperty( '--rpr-font-body', `'${safeFontName( CFG.fontBody )}', system-ui, sans-serif` );
		s.setProperty( '--rpr-font-size-base', parseInt( CFG.fontSize, 10 ) + 'px' );
		s.setProperty( '--rpr-card-max-width', parseDimension( CFG.cardMaxWidth, '520px' ) );
		s.setProperty( '--rpr-card-radius', parseInt( CFG.cardRadius, 10 ) + 'px' );
		s.setProperty( '--rpr-widget-min-h', parseInt( CFG.widgetMinH, 10 ) + 'px' );
		const padMap = { none: '0', compact: '8px', comfortable: '24px' };
		s.setProperty( '--rpr-widget-padding', padMap[ CFG.widgetPadding ] || '24px' );

		/* -- Display mode: floating / modal triggers ---------------- */
		if ( CFG.displayMode === 'floating' ) {
			const btn = el( 'button', { className: 'rpr-e-float-btn', textContent: CFG.floatLabel } );
			if ( CFG.floatPos === 'bottom-left' ) btn.classList.add( 'left' );
			wrap.appendChild( btn );
		}
		if ( CFG.displayMode === 'modal' ) {
			wrap.appendChild( el( 'button', { className: 'rpr-e-modal-trigger', type: 'button', textContent: CFG.modalTrigger } ) );
		}

		/* -- Card ---------------------------------------------------- */
		const card = el( 'div', { className: 'rpr-e-card' } );

		// Step 1: form
		const step1 = el( 'div', { className: 'rpr-e-step1' } );
		if ( CFG.showHeader ) step1.appendChild( buildHeader() );

		const body = el( 'div', { className: 'rpr-e-body' } );
		const hero = el( 'div', { className: 'rpr-e-hero' } );
		hero.appendChild( el( 'h2', { className: 'rpr-e-headline', textContent: CFG.headline } ) );
		if ( CFG.subheadline ) hero.appendChild( el( 'p', { className: 'rpr-e-subheadline', textContent: CFG.subheadline } ) );
		body.appendChild( hero );

		const hasTwoCols = FIELDS.some( f => f.width === 'half' );
		const grid = el( 'div', { className: 'rpr-e-fields' } );
		grid.style.gridTemplateColumns = hasTwoCols ? 'repeat(2, 1fr)' : '1fr';

		FIELDS.forEach( field => grid.appendChild( buildField( field ) ) );

		// GDPR
		if ( CFG.gdprEnabled ) {
			const gdprWrap = el( 'div', { className: 'rpr-e-gdpr rpr-e-field full' } );
			const consentId = CFG.formId + '-consent';
			const cb = el( 'input', { type: 'checkbox', id: consentId, dataset: { fieldId: 'consent' } } );
			const lbl = el( 'label', { htmlFor: consentId, textContent: CFG.gdprText } );
			gdprWrap.appendChild( cb );
			gdprWrap.appendChild( lbl );
			grid.appendChild( gdprWrap );
		}

		// Honeypot
		grid.appendChild( el( 'input', { type: 'text', name: 'rpr_hp', className: 'rpr-e-hp', tabIndex: -1, autocomplete: 'off' } ) );

		// Submit button
		grid.appendChild( el( 'button', { type: 'button', className: 'rpr-e-submit', textContent: CFG.buttonText } ) );
		grid.appendChild( el( 'div', { className: 'rpr-e-sending', role: 'status' } ) );
		if ( CFG.disclaimer ) grid.appendChild( el( 'p', { className: 'rpr-e-disclaimer', textContent: CFG.disclaimer } ) );

		body.appendChild( grid );
		step1.appendChild( body );
		card.appendChild( step1 );

		// Step 2: RPR widget
		const step2 = el( 'div', { className: 'rpr-e-step2', hidden: true } );
		if ( CFG.showHeader ) step2.appendChild( buildHeader() );

		const step2Body = el( 'div', { className: 'rpr-e-step2-body' } );
		if ( CFG.showBackLink ) {
			const backBtn = el( 'button', { type: 'button', className: 'rpr-e-back-link',
				innerHTML: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> ' + escHtml( CFG.backLinkText ) } );
			step2Body.appendChild( backBtn );
		}
		if ( CFG.showAddrStrip ) {
			const strip = el( 'div', { className: 'rpr-e-addr-strip' } );
			strip.innerHTML = escHtml( CFG.addrPrefix ) + ' <strong class="rpr-e-addr-text"></strong>';
			step2Body.appendChild( strip );
		}
		step2Body.appendChild( el( 'div', { className: 'rpr-e-widget-mount' } ) );
		step2.appendChild( step2Body );
		card.appendChild( step2 );

		wrap.appendChild( card );
		mount.appendChild( wrap );

		/* -- Bind events -------------------------------------------- */
		bindForm( wrap, card, step1, step2 );

		if ( CFG.displayMode === 'floating' || CFG.displayMode === 'modal' ) {
			setupOverlay( wrap, card );
		}

		// Attach Google Places autocomplete after a short delay (API may still be loading)
		if ( CFG.googleKey ) {
			attachPlaces( wrap );
		}
	}

	/* -- Header builder --------------------------------------------- */
	function buildHeader() {
		const header = el( 'div', { className: 'rpr-e-header' } );
		const avatar = el( 'div', { className: 'rpr-e-avatar' } );
		if ( CFG.logoUrl && /^https?:\/\//i.test( CFG.logoUrl ) ) {
			avatar.appendChild( el( 'img', { src: CFG.logoUrl, alt: CFG.agentName } ) );
		} else {
			avatar.textContent = initials( CFG.agentName );
		}
		const info = el( 'div', { className: 'rpr-e-agent-info' } );
		if ( CFG.agentName ) info.appendChild( el( 'div', { className: 'rpr-e-agent-name', textContent: CFG.agentName } ) );
		if ( CFG.brokerage ) info.appendChild( el( 'div', { className: 'rpr-e-agent-brokerage', textContent: CFG.brokerage } ) );
		header.appendChild( avatar );
		header.appendChild( info );
		if ( CFG.showBadge ) {
			header.appendChild( el( 'span', { className: 'rpr-e-badge', textContent: CFG.badgeText } ) );
		}
		return header;
	}

	/* -- Field builder ---------------------------------------------- */
	function buildField( field ) {
		const wrapper = el( 'div', { className: 'rpr-e-field ' + ( field.width === 'half' ? 'half' : 'full' ) } );
		const label = el( 'label', { className: 'rpr-e-label', textContent: field.label } );
		const fieldUid = CFG.formId + '-' + field.id;
		label.setAttribute( 'for', fieldUid );
		wrapper.appendChild( label );

		let input;
		if ( field.type === 'select' ) {
			input = el( 'select', { className: 'rpr-e-select', id: fieldUid } );
			input.appendChild( el( 'option', { value: '', textContent: field.placeholder || 'Select\u2026' } ) );
			( field.options || '' ).split( '\n' ).forEach( opt => {
				opt = opt.trim();
				if ( opt ) input.appendChild( el( 'option', { value: opt, textContent: opt } ) );
			} );
		} else {
			input = el( 'input', {
				type: field.type || 'text', className: 'rpr-e-input',
				id: fieldUid, placeholder: field.placeholder || '',
			} );
			if ( field.required ) input.required = true;
		}
		input.dataset.fieldId = field.id;
		wrapper.appendChild( input );
		wrapper.appendChild( el( 'div', { className: 'rpr-e-error-msg', role: 'alert' } ) );
		return wrapper;
	}

	/* ================================================================
	   S8  FORM LOGIC
	   ================================================================ */
	function bindForm( wrap, card, step1, step2 ) {
		const btn    = step1.querySelector( '.rpr-e-submit' );
		const status = step1.querySelector( '.rpr-e-sending' );

		btn.addEventListener( 'click', async () => {
			// Validate
			const errors = validateForm( step1 );
			if ( errors.length ) return;

			btn.disabled       = true;
			status.textContent = CFG.sendingText;
			status.style.color = '';

			const payload = collectPayload( step1 );

			// reCAPTCHA v3 token
			if ( CFG.recaptchaSiteKey && typeof grecaptcha !== 'undefined' ) {
				try {
					await new Promise( r => grecaptcha.ready( r ) );
					payload.recaptcha_token = await grecaptcha.execute( CFG.recaptchaSiteKey, { action: 'rpr_avm_submit' } );
				} catch ( e ) { /* continue without token */ }
			}

			// Fire webhook
			// Note: Zapier/Make webhooks don't return CORS headers, so we use
			// no-cors mode. The data arrives at Zapier but we get an opaque
			// response (can't read status). This is the standard pattern for
			// cross-origin form submissions from embeddable widgets.
			let webhookOk = true;
			if ( CFG.webhook ) {
				try {
					await fetch( CFG.webhook, {
						method: 'POST',
						mode: 'no-cors',
						headers: { 'Content-Type': 'text/plain' },
						body: JSON.stringify( payload ),
						keepalive: true,
					} );
					// With no-cors we can't verify the response, but the request
					// was sent successfully. Zapier/Make will receive it.
				} catch ( e ) {
					console.warn( 'RPR AVM Embed: Webhook error', e );
					webhookOk = false;
				}
			}

			status.textContent = '';

			if ( ! webhookOk ) {
				// Show brief warning but still proceed to RPR widget
				status.textContent = 'Note: There was an issue saving your information. Your estimate will still display.';
				status.style.color = 'var(--rpr-error)';
				await new Promise( r => setTimeout( r, 2000 ) );
				status.textContent = '';
				status.style.color = '';
			}

			// Show step 2 (button stays disabled -- step transition replaces the view)
			showStep2( card, step1, step2, payload.address );
		} );

		// Enter key submits
		step1.querySelectorAll( '.rpr-e-input, .rpr-e-select' ).forEach( input => {
			input.addEventListener( 'keydown', e => { if ( e.key === 'Enter' ) btn.click(); } );
			input.addEventListener( 'input', () => clearError( input ) );
		} );

		// Back link
		const backBtn = step2.querySelector( '.rpr-e-back-link' );
		if ( backBtn ) {
			backBtn.addEventListener( 'click', () => {
				step2.hidden = true;
				step1.hidden = false;
				btn.disabled = false;
				step2.querySelector( '.rpr-e-widget-mount' ).innerHTML = '';
			} );
		}
	}

	/* -- Validation ------------------------------------------------- */
	function validateForm( step1 ) {
		const errors = [];
		FIELDS.forEach( field => {
			const isRequired = field.required || field.locked;
			if ( ! isRequired ) return;
			const input = step1.querySelector( `[data-field-id="${field.id}"]` );
			if ( ! input ) return;
			const val = input.value.trim();
			let msg = '';

			if ( field.id === 'email' ) {
				if ( ! /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test( val ) ) msg = field.error_msg;
			} else if ( field.id === 'phone' && field.required ) {
				if ( ! /[\d]{7,}/.test( val.replace( /\D/g, '' ) ) ) msg = field.error_msg;
			} else {
				if ( val.length < 2 ) msg = field.error_msg;
			}

			if ( msg ) { setError( input, msg ); errors.push( field.id ); }
		} );

		if ( CFG.gdprEnabled ) {
			const cb = step1.querySelector( '[data-field-id="consent"]' );
			if ( cb && ! cb.checked ) { setError( cb, 'Please accept to continue.' ); errors.push( 'consent' ); }
		}
		return errors;
	}

	function setError( input, msg ) {
		input.classList.add( 'is-error' );
		const errEl = input.closest( '.rpr-e-field' )?.querySelector( '.rpr-e-error-msg' );
		if ( errEl ) errEl.textContent = msg;
	}

	function clearError( input ) {
		input.classList.remove( 'is-error' );
		const errEl = input.closest( '.rpr-e-field' )?.querySelector( '.rpr-e-error-msg' );
		if ( errEl ) errEl.textContent = '';
	}

	/* -- Collect payload -------------------------------------------- */
	function collectPayload( step1 ) {
		const payload = {
			form_instance: CFG.formId,
			agent_name:    CFG.agentName,
			brokerage:     CFG.brokerage,
			custom_fields: {},
			source_url:    window.location.href,
			consent:       0,
			timestamp:     new Date().toISOString(),
		};

		step1.querySelectorAll( '[data-field-id]' ).forEach( input => {
			const id  = input.dataset.fieldId;
			const val = input.type === 'checkbox' ? ( input.checked ? 1 : 0 ) : input.value.trim();
			if ( id === 'consent' ) {
				payload.consent = val;
			} else if ( [ 'first_name','last_name','email','phone','address' ].includes( id ) ) {
				payload[ id ] = val;
			} else if ( id.startsWith( 'custom_' ) ) {
				payload.custom_fields[ id ] = val;
			}
		} );

		// Flatten custom fields for Zapier compatibility
		Object.entries( payload.custom_fields ).forEach( ( [ k, v ] ) => {
			payload[ k ] = v;
		} );

		// Honeypot
		const hp = step1.querySelector( 'input[name="rpr_hp"]' );
		payload.rpr_hp = hp ? hp.value : '';

		return payload;
	}

	/* -- Show step 2: RPR widget ------------------------------------ */
	function showStep2( card, step1, step2, address ) {
		step1.hidden = true;
		step2.hidden = false;
		const addrEl = step2.querySelector( '.rpr-e-addr-text' );
		if ( addrEl ) addrEl.textContent = address;

		const mount = step2.querySelector( '.rpr-e-widget-mount' );
		mount.innerHTML = '';
		loadRprWidget( mount, address );
	}

	function loadRprWidget( mount, address ) {
		const iframe = document.createElement( 'iframe' );
		iframe.style.cssText = 'width:100%;border:none;display:block;';
		iframe.setAttribute( 'scrolling', 'no' );
		iframe.setAttribute( 'title', 'RPR Home Value Estimate' );
		iframe.srcdoc = buildWidgetDoc( address );

		iframe.addEventListener( 'load', function () {
			const resize = () => {
				try {
					const h = iframe.contentDocument?.body?.scrollHeight;
					if ( h > 80 ) iframe.style.height = ( h + 12 ) + 'px';
				} catch ( e ) {}
			};
			resize();
			[ 600, 1200, 2500 ].forEach( t => setTimeout( resize, t ) );
		} );
		mount.appendChild( iframe );
	}

	function safeJsonForScript( val ) {
		// JSON.stringify is safe for data, but the result is embedded inside a <script> block
		// in an srcdoc iframe. We must prevent </script> from appearing in the output.
		return JSON.stringify( val ).replace( /<\//g, '<\\/' );
	}

	function buildWidgetDoc( address ) {
		let widgetCss = buildWidgetCss();
		let safeCss = ( CFG.widgetCustomCss || '' ).replace( /<\/?style[^>]*>/gi, '' ).replace( /<script/gi, '' );
		const customCss = safeCss ? '<style>' + safeCss + '</style>' : '';

		return '<!DOCTYPE html><html><head>' +
			'<meta charset="UTF-8">' +
			'<meta name="viewport" content="width=device-width,initial-scale=1">' +
			'<style>' +
			'*{box-sizing:border-box;margin:0;padding:0}' +
			'html,body{width:100%;overflow-x:hidden;background:transparent;font-family:sans-serif}' +
			'[id^="rprAvmWidget"]{width:100%!important;max-width:100%!important}' +
			'[id^="rprAvmWidget"]>table,[id^="rprAvmWidget"]>div{width:100%!important;max-width:100%!important}' +
			'table.rprw-title-cont{width:100%!important}' +
			'td.rprw-body{width:100%!important}' +
			'td.rprw-body table{width:100%!important;table-layout:auto!important}' +
			'.rprw-chart-cont{width:100%!important;overflow:hidden}' +
			'.rprw-chart-cont img,.rprw-chart-cont canvas,.rprw-chart-cont svg{max-width:100%!important;height:auto!important}' +
			'</style>' +
			( widgetCss ? '<style>' + widgetCss + '</style>' : '' ) +
			customCss +
			'</head><body>' +
			'<script>' +
			'var _f=window.fetch;' +
			'window.fetch=function(u,o){if(typeof u==="string"&&u.startsWith("//"))u="https:"+u;return _f.call(this,u,o);};' +
			'var rprAvmWidgetOptions={' +
			'Token:' + safeJsonForScript( CFG.rprToken ) + ',' +
			'Query:' + safeJsonForScript( address ) + ',' +
			'CoBrandCode:' + safeJsonForScript( CFG.rprCobrand ) + ',' +
			'ShowRprLinks:' + safeJsonForScript( CFG.rprShowLinks ) +
			'};' +
			'<\/script>' +
			'<script src="https://www.narrpr.com/widgets/avm-widget/widget.ashx/script"><\/script>' +
			'</body></html>';
	}

	function safeCssValue( val ) {
		// Strip anything that could break out of a CSS value context
		return ( val || '' ).replace( /[{}<>;]/g, '' ).trim();
	}

	function buildWidgetCss() {
		let css = '';
		let headerBg = '';
		if ( CFG.widgetMatchBrand ) headerBg = safeCssValue( CFG.colorBrand );
		if ( CFG.widgetHeaderBg ) headerBg = safeCssValue( CFG.widgetHeaderBg );
		if ( headerBg ) css += 'table.rprw-title-cont{background:' + headerBg + '!important}';
		if ( CFG.widgetHeaderText ) css += '.rprw-title,table.rprw-title-cont td{color:' + safeCssValue( CFG.widgetHeaderText ) + '!important}';
		if ( CFG.widgetValueColor ) css += 'td.rprw-est-value div{color:' + safeCssValue( CFG.widgetValueColor ) + '!important}';
		if ( CFG.widgetLinkColor ) css += 'a,.rprw-more-about-data,.rprw-links-title a{color:' + safeCssValue( CFG.widgetLinkColor ) + '!important}';
		if ( CFG.widgetFont ) {
			const f = CFG.widgetFont === 'inherit' ? 'inherit' : "'" + safeFontName( CFG.widgetFont ) + "',sans-serif";
			css += 'body,table,td,th,div,span,a{font-family:' + f + '!important}';
		}
		if ( CFG.widgetBorderRadius && parseInt( CFG.widgetBorderRadius ) > 0 ) {
			const r = parseInt( CFG.widgetBorderRadius );
			css += '[id^="rprAvmWidget"]{border-radius:' + r + 'px!important;overflow:hidden}';
			css += 'table.rprw-title-cont{border-radius:' + r + 'px ' + r + 'px 0 0!important}';
		}
		if ( CFG.widgetHideChart ) css += '.rprw-chart-cont,.rprw-chart-title{display:none!important}';
		if ( CFG.widgetHideLinks ) css += '.rprw-links-title,.rprw-more-about-data,.rprw-links-cont{display:none!important}';
		return css;
	}

	/* -- Modal / floating overlay ----------------------------------- */
	function setupOverlay( wrap, card ) {
		const overlay = el( 'div', { className: 'rpr-e-overlay', role: 'dialog' } );
		overlay.setAttribute( 'aria-modal', 'true' );
		overlay.appendChild( card );
		wrap.appendChild( overlay );

		const trigger = wrap.querySelector( '.rpr-e-float-btn, .rpr-e-modal-trigger' );
		if ( trigger ) trigger.addEventListener( 'click', () => overlay.classList.add( 'open' ) );
		overlay.addEventListener( 'click', e => { if ( e.target === overlay ) overlay.classList.remove( 'open' ); } );
		document.addEventListener( 'keydown', e => {
			if ( e.key === 'Escape' && overlay.classList.contains( 'open' ) ) {
				overlay.classList.remove( 'open' );
			}
		} );
	}

	/* -- Google Places autocomplete --------------------------------- */
	function attachPlaces( wrap, retries ) {
		retries = retries || 0;
		if ( typeof google === 'undefined' || ! google.maps || ! google.maps.places ) {
			if ( retries < 8 ) setTimeout( () => attachPlaces( wrap, retries + 1 ), ( retries + 1 ) * 800 );
			return;
		}

		const input = wrap.querySelector( '[data-field-id="address"]' );
		if ( ! input || input.dataset.placesInit ) return;
		input.dataset.placesInit = '1';

		const options = {
			types: [ 'address' ],
			fields: [ 'formatted_address', 'geometry', 'address_components' ],
		};
		if ( CFG.placesCountry ) options.componentRestrictions = { country: CFG.placesCountry };

		const ac = new google.maps.places.Autocomplete( input, options );

		input.addEventListener( 'keydown', e => {
			if ( e.key === 'Enter' ) {
				const pac = document.querySelector( '.pac-container' );
				if ( pac && pac.style.display !== 'none' ) {
					e.preventDefault();
					e.stopPropagation();
				}
			}
		} );

		ac.addListener( 'place_changed', () => {
			const place = ac.getPlace();
			if ( ! place || ! place.formatted_address ) return;
			input.value = place.formatted_address;
			input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
		} );
	}

	/* ================================================================
	   S9  BOOT
	   ================================================================ */
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', buildWidget );
	} else {
		buildWidget();
	}

} )();
