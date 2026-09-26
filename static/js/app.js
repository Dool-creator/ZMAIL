/* =========================================================================
   Zm@il - logique de l'interface
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------- */
  /* Outils                                                                  */
  /* ----------------------------------------------------------------------- */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const DEFAULT_ACCENT = "#2563eb";
  const MASKED_PASSWORD = "••••••••";
  // Valeur écrite dans contacts.json pour un contact sans groupe (cf. i18n.py).
  const DEFAULT_GROUP = "Général";

  // Raccourci vers le catalogue de traductions (static/js/i18n.js).
  const i18n = window.I18N;
  const t = (key, vars) => i18n.t(key, vars);
  const lang = () => i18n.current();

  const state = {
    contacts: [],
    groups: [],
    templates: [],
    recipients: [],       // [{ email, name }]
    logo: null,           // mode « téléversement » : { filename, url, original_name }
    logoMode: "url",      // « url » (image distante) ou « upload » (pièce jointe CID)
    attachments: [],      // [{ filename, original_name, size }]
    config: null,
    template: "",
    thumbsAccent: null,
    thumbsLang: null,
    previewToken: 0,
    previewHtml: null,
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(fn, wait) {
    let timer = null;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function initials(name, email) {
    const source = (name || email || "?").trim();
    const parts = source.split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }

  function formatBytes(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return t("unit.bytes", { size: size });
    if (size < 1024 * 1024) return t("unit.kb", { size: (size / 1024).toFixed(0) });
    return t("unit.mb", { size: (size / (1024 * 1024)).toFixed(1) });
  }

  function formatDate(iso) {
    if (!iso) return t("preview.empty");
    const date = new Date(iso);
    if (isNaN(date.getTime())) return t("preview.empty");
    return date.toLocaleDateString(t("locale"), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function isValidEmail(value) {
    return /^[^@\s,;]+@[^@\s,;]+\.[A-Za-z]{2,}$/.test(String(value || "").trim());
  }

  /* --------------------------------- API --------------------------------- */

  /** Ajoute l'en-tête de langue pour que le serveur réponde dans la bonne langue. */
  function withLanguage(options) {
    const config = Object.assign({}, options || {});
    config.headers = Object.assign({}, config.headers || {});
    config.headers["X-Language"] = lang();
    return config;
  }

  async function api(url, options) {
    const response = await fetch(url, withLanguage(options));
    const type = response.headers.get("content-type") || "";
    let data;
    if (type.indexOf("application/json") !== -1) {
      data = await response.json().catch(() => null);
    } else {
      data = { message: await response.text().catch(() => "") };
    }
    if (!response.ok) {
      const message = (data && data.message) || t("error.generic", { status: response.status });
      throw new Error(message);
    }
    return data;
  }

  function postJson(url, body) {
    return api(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  /* ------------------------------ Notifications -------------------------- */

  const ICONS = { ok: "✓", err: "✕", warn: "!", info: "i" };
  const TITLE_KEYS = { ok: "toast.ok", err: "toast.err", warn: "toast.warn", info: "toast.info" };

  function toast(message, type, title) {
    const kind = type || "info";
    const host = $("#toasts");
    const node = document.createElement("div");
    node.className = "toast toast-" + kind;
    node.innerHTML =
      '<span class="toast-icon">' + ICONS[kind] + "</span>" +
      '<div class="toast-text"><strong>' + escapeHtml(title || t(TITLE_KEYS[kind])) + "</strong>" +
      escapeHtml(message) + "</div>" +
      '<button class="toast-close" type="button" aria-label="' + escapeHtml(t("toast.close")) +
      '">×</button>';

    const remove = () => {
      node.classList.add("is-out");
      setTimeout(() => node.remove(), 180);
    };
    $(".toast-close", node).addEventListener("click", remove);
    host.appendChild(node);
    setTimeout(remove, kind === "err" ? 8000 : 4800);
    while (host.children.length > 5) host.firstChild.remove();
  }

  function setLoading(button, loading) {
    if (!button) return;
    const spinner = $(".spinner", button);
    if (spinner) spinner.hidden = !loading;
    button.classList.toggle("is-loading", !!loading);
    button.disabled = !!loading;
  }

  /* ----------------------------------------------------------------------- */
  /* Navigation                                                              */
  /* ----------------------------------------------------------------------- */

  function showView(name) {
    $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === "view-" + name));
    $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === name));
    if (name === "templates") renderTemplateCards();
  }

  function bindNav() {
    $$(".nav-item").forEach((item) => {
      item.addEventListener("click", () => showView(item.dataset.view));
    });
    $$("[data-goto]").forEach((button) => {
      button.addEventListener("click", () => showView(button.dataset.goto));
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Couleurs                                                                */
  /*                                                                         */
  /* Deux couleurs INDÉPENDANTES :                                           */
  /*   - celle de l'INTERFACE, réglée dans Paramètres > Thème, enregistrée   */
  /*     dans config.json sous « ui_accent_color » ;                         */
  /*   - celle de l'E-MAIL, réglée dans la vue Rédaction, envoyée avec le    */
  /*     message et sans aucun effet sur l'interface.                        */
  /* ----------------------------------------------------------------------- */

  function isHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || ""));
  }

  function hexToRgb(hex) {
    const clean = String(hex || "").replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16) || 0,
      g: parseInt(clean.slice(2, 4), 16) || 0,
      b: parseInt(clean.slice(4, 6), 16) || 0,
    };
  }

  /**
   * Applique la couleur d'accentuation de l'INTERFACE.
   *
   * Seule --accent-color est posée ici : --accent-hover et --accent-glow en
   * sont dérivées par la feuille de style (color-mix), ce qui évite de tenir
   * le même calcul à deux endroits. --accent-text ne peut pas l'être en CSS,
   * il dépend de la luminance et garde les libellés lisibles sur fond coloré.
   */
  function applyUiAccent(hex) {
    const color = isHexColor(hex) ? hex : DEFAULT_ACCENT;
    const rgb = hexToRgb(color);
    const root = document.documentElement;
    root.style.setProperty("--accent-color", color);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    root.style.setProperty("--accent-text", luminance > 0.68 ? "#0f172a" : "#ffffff");
    root.setAttribute("data-ui-accent", color);
    return color;
  }

  function currentUiAccent() {
    const value = $("#uiAccentInput").value;
    return isHexColor(value) ? value : DEFAULT_ACCENT;
  }

  /**
   * Le groupe par défaut est stocké tel quel dans contacts.json (« Général »),
   * quelle que soit la langue : c'est une donnée. Seul son affichage est traduit.
   */
  function groupLabel(group) {
    const value = String(group || DEFAULT_GROUP);
    return value === DEFAULT_GROUP ? t("defaultGroup") : value;
  }

  /** Couleur de l'E-MAIL : sert uniquement au rendu du modèle, jamais à l'interface. */
  function currentAccent() {
    const value = $("#accentInput").value;
    return isHexColor(value) ? value : DEFAULT_ACCENT;
  }

  /* ----------------------------------------------------------------------- */
  /* Destinataires (jetons + autocomplétion)                                 */
  /* ----------------------------------------------------------------------- */

  let suggestionIndex = -1;

  function renderRecipients() {
    const host = $("#recipientChips");
    host.innerHTML = state.recipients
      .map((recipient, index) => {
        const invalid = isValidEmail(recipient.email) ? "" : " is-invalid";
        const label = recipient.name && recipient.name !== recipient.email
          ? recipient.name + " <" + recipient.email + ">"
          : recipient.email;
        return (
          '<span class="chip' + invalid + '" title="' + escapeHtml(recipient.email) + '">' +
          "<span>" + escapeHtml(label) + "</span>" +
          '<button class="chip-x" type="button" data-index="' + index + '" aria-label="' +
          escapeHtml(t("recipients.remove")) + '">×</button>' +
          "</span>"
        );
      })
      .join("");

    $$(".chip-x", host).forEach((button) => {
      button.addEventListener("click", () => {
        state.recipients.splice(Number(button.dataset.index), 1);
        renderRecipients();
      });
    });

    const total = state.recipients.length;
    $("#recipientCount").textContent =
      total === 0 ? t("recipients.none") : t("recipients.count", { count: total });
    updateSendBar();
    updatePreviewMeta();
  }

  function addRecipient(email, name) {
    const address = String(email || "").trim().replace(/^<|>$/g, "");
    if (!address) return false;
    const exists = state.recipients.some(
      (recipient) => recipient.email.toLowerCase() === address.toLowerCase()
    );
    if (exists) return false;
    state.recipients.push({ email: address, name: name || "" });
    return true;
  }

  function addRecipientsFromText(text) {
    const parts = String(text || "").split(/[,;\s]+/).filter(Boolean);
    let added = 0;
    let invalid = 0;
    parts.forEach((part) => {
      if (!isValidEmail(part)) invalid += 1;
      if (addRecipient(part)) added += 1;
    });
    if (added) renderRecipients();
    if (invalid) toast(t("recipients.suspicious", { count: invalid }), "warn");
    return added;
  }

  function hideSuggestions() {
    $("#suggestions").hidden = true;
    suggestionIndex = -1;
  }

  function renderSuggestions(query) {
    const box = $("#suggestions");
    const needle = String(query || "").trim().toLowerCase();
    const chosen = new Set(state.recipients.map((r) => r.email.toLowerCase()));

    let matches = state.contacts.filter((contact) => !chosen.has(String(contact.email).toLowerCase()));
    if (needle) {
      matches = matches.filter(
        (contact) =>
          String(contact.name || "").toLowerCase().indexOf(needle) !== -1 ||
          String(contact.email || "").toLowerCase().indexOf(needle) !== -1 ||
          String(contact.group || "").toLowerCase().indexOf(needle) !== -1
      );
    }
    matches = matches.slice(0, 8);

    if (!matches.length) {
      if (!needle || !state.contacts.length) return hideSuggestions();
      box.innerHTML =
        '<div class="suggestion-empty">' + escapeHtml(t("recipients.noMatch")) + "</div>";
      box.hidden = false;
      suggestionIndex = -1;
      return;
    }

    box.innerHTML = matches
      .map(
        (contact, index) =>
          '<button class="suggestion" type="button" data-email="' + escapeHtml(contact.email) +
          '" data-name="' + escapeHtml(contact.name || "") + '" data-index="' + index + '">' +
          '<span class="suggestion-avatar">' + escapeHtml(initials(contact.name, contact.email)) + "</span>" +
          '<span class="suggestion-main"><strong>' + escapeHtml(contact.name || contact.email) + "</strong>" +
          "<span>" + escapeHtml(contact.email) + "</span></span>" +
          '<span class="suggestion-group">' + escapeHtml(groupLabel(contact.group)) + "</span>" +
          "</button>"
      )
      .join("");

    $$(".suggestion", box).forEach((button) => {
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        if (addRecipient(button.dataset.email, button.dataset.name)) renderRecipients();
        $("#recipientInput").value = "";
        hideSuggestions();
        $("#recipientInput").focus();
      });
    });

    box.hidden = false;
    suggestionIndex = -1;
  }

  function moveSuggestion(step) {
    const items = $$(".suggestion", $("#suggestions"));
    if (!items.length) return;
    suggestionIndex = (suggestionIndex + step + items.length) % items.length;
    items.forEach((item, index) => item.classList.toggle("is-active", index === suggestionIndex));
    items[suggestionIndex].scrollIntoView({ block: "nearest" });
  }

  function bindRecipients() {
    const input = $("#recipientInput");

    input.addEventListener("input", () => renderSuggestions(input.value));
    input.addEventListener("focus", () => renderSuggestions(input.value));
    input.addEventListener("blur", () => setTimeout(hideSuggestions, 120));

    // Filet de sécurité : un clic hors du champ ferme la liste même si le focus
    // a été perdu autrement (changement de vue, fenêtre désactivée…).
    document.addEventListener("click", (event) => {
      if (!$("#recipientsBox").contains(event.target)) hideSuggestions();
    });

    input.addEventListener("keydown", (event) => {
      const items = $$(".suggestion", $("#suggestions"));
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSuggestion(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSuggestion(-1);
      } else if (event.key === "Escape") {
        hideSuggestions();
      } else if (event.key === "Enter" || event.key === "," || event.key === ";" || event.key === "Tab") {
        if (event.key === "Tab" && !input.value.trim() && suggestionIndex < 0) return;
        event.preventDefault();
        if (suggestionIndex >= 0 && items[suggestionIndex]) {
          const chosen = items[suggestionIndex];
          if (addRecipient(chosen.dataset.email, chosen.dataset.name)) renderRecipients();
        } else if (input.value.trim()) {
          addRecipientsFromText(input.value);
        }
        input.value = "";
        hideSuggestions();
      } else if (event.key === "Backspace" && !input.value && state.recipients.length) {
        state.recipients.pop();
        renderRecipients();
      }
    });

    input.addEventListener("paste", (event) => {
      const text = (event.clipboardData || window.clipboardData).getData("text");
      if (text && /[,;\s]/.test(text)) {
        event.preventDefault();
        addRecipientsFromText(text);
      }
    });

    $("#groupSelect").addEventListener("change", (event) => {
      const group = event.target.value;
      event.target.value = "";
      if (!group) return;
      let added = 0;
      state.contacts
        .filter((contact) => (contact.group || DEFAULT_GROUP) === group)
        .forEach((contact) => {
          if (addRecipient(contact.email, contact.name)) added += 1;
        });
      renderRecipients();
      toast(
        added
          ? t("recipients.groupAdded", { count: added, group: groupLabel(group) })
          : t("recipients.groupAlreadyIn"),
        added ? "ok" : "info"
      );
    });

    $("#addAllBtn").addEventListener("click", () => {
      if (!state.contacts.length) {
        toast(t("recipients.bookEmpty"), "warn");
        return;
      }
      let added = 0;
      state.contacts.forEach((contact) => {
        if (addRecipient(contact.email, contact.name)) added += 1;
      });
      renderRecipients();
      toast(t("recipients.added", { count: added }), added ? "ok" : "info");
    });

    $("#clearRecipientsBtn").addEventListener("click", () => {
      state.recipients = [];
      renderRecipients();
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Aperçu en direct                                                        */
  /* ----------------------------------------------------------------------- */

  /**
   * Valeur de `logo_url` envoyée au serveur :
   *   - mode « url »    : l'adresse publique telle quelle, utilisée directement
   *     dans le <img src> du modèle, sans pièce jointe ni base64 ;
   *   - mode « upload » : le nom du fichier téléversé, que le serveur intègre
   *     au message en pièce jointe inline (CID).
   */
  function currentLogo() {
    if (state.logoMode === "url") return $("#logoUrlInput").value.trim();
    return state.logo ? state.logo.filename : "";
  }

  // Champs des blocs optionnels : id du champ -> nom de la variable de modele.
  const OPTIONAL_FIELDS = {
    ctaText: "cta_text",
    ctaUrl: "cta_url",
    videoThumb: "video_thumbnail",
    videoUrl: "video_url",
    socialInstagram: "social_instagram",
    socialFacebook: "social_facebook",
    socialYoutube: "social_youtube",
    socialLinkedin: "social_linkedin",
    socialX: "social_x",
    socialTiktok: "social_tiktok",
  };

  function collectVariables() {
    const vars = {
      logo_url: currentLogo(),
      title: $("#titleInput").value,
      body: $("#bodyInput").value,
      signature: $("#signatureInput").value,
      company_name: $("#companyInput").value,
      accent_color: currentAccent(),
    };
    Object.keys(OPTIONAL_FIELDS).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) vars[OPTIONAL_FIELDS[id]] = el.value.trim();
    });
    return vars;
  }

  function updatePreviewMeta() {
    const config = state.config || {};
    const from = config.email
      ? (config.display_name ? config.display_name + " <" + config.email + ">" : config.email)
      : t("preview.notConfigured");
    $("#metaFrom").textContent = from;

    const total = state.recipients.length;
    let to = t("preview.empty");
    if (total === 1) to = state.recipients[0].email;
    else if (total > 1) {
      to = t("preview.othersCount", {
        email: state.recipients[0].email,
        count: total - 1,
      });
    }
    $("#metaTo").textContent = to;

    $("#metaSubject").textContent = $("#subject").value.trim() || t("preview.noSubject");
  }

  // Le rendu est identique à celui reçu par le destinataire : c'est le serveur qui
  // rend le modèle. Un jeton évite qu'une réponse tardive écrase une réponse récente,
  // et on ne réécrit l'iframe que si le HTML a changé (sinon elle clignote ou reste vide).
  async function refreshPreview(force) {
    if (!state.template) return;
    const token = ++state.previewToken;
    const loader = $("#previewLoading");
    loader.hidden = false;
    try {
      const response = await fetch(
        "/api/preview",
        withLanguage({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template: state.template, variables: collectVariables() }),
        })
      );
      const html = await response.text();
      if (token !== state.previewToken) return;
      if (!response.ok) throw new Error(t("preview.unavailable"));
      if (force === true || html !== state.previewHtml) {
        state.previewHtml = html;
        $("#previewFrame").srcdoc = html;
      }
    } catch (error) {
      if (token === state.previewToken) {
        state.previewHtml = null;
        $("#previewFrame").srcdoc =
          '<body style="font-family:sans-serif;padding:24px;color:#64748b">' +
          escapeHtml(t("preview.unavailableWith", { error: error.message })) + "</body>";
      }
    } finally {
      if (token === state.previewToken) loader.hidden = true;
    }
  }

  // Toutes les modifications passent par ce planificateur : deux changements
  // rapprochés ne déclenchent qu'un seul rendu.
  const schedulePreview = debounce(refreshPreview, 280);

  function bindPreviewTools() {
    $$(".preview-tools .seg").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".preview-tools .seg").forEach((other) => other.classList.remove("is-active"));
        button.classList.add("is-active");
        $("#previewStage").classList.toggle("is-mobile", button.dataset.width === "mobile");
      });
    });
    $("#refreshPreview").addEventListener("click", () => refreshPreview(true));
  }

  /* ----------------------------------------------------------------------- */
  /* Téléversements (logo & pièces jointes)                                  */
  /* ----------------------------------------------------------------------- */

  /** Mémorise l'adresse pour la prochaine session. Silencieux : seul l'échec parle. */
  async function saveLogoUrl(url) {
    try {
      await postJson("/api/logo", { logo_url: url });
    } catch (error) {
      toast(error.message, "err");
    }
  }

  async function uploadFile(file, kind) {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    return api("/api/upload", { method: "POST", body: form });
  }

  /** Affiche le panneau correspondant au mode choisi et rafraîchit l'aperçu. */
  function setLogoMode(mode, options) {
    const next = mode === "upload" ? "upload" : "url";
    state.logoMode = next;
    $$("#logoModes .seg").forEach((button) =>
      button.classList.toggle("is-active", button.dataset.logoMode === next)
    );
    $("#logoUrlPane").hidden = next !== "url";
    $("#logoUploadPane").hidden = next !== "upload";
    if (!(options && options.silent)) schedulePreview();
  }

  function renderLogo() {
    const box = $("#logoPreview");
    if (!state.logo) {
      box.hidden = true;
      $("#logoHint").hidden = false;
      return;
    }
    box.hidden = false;
    $("#logoHint").hidden = true;
    $("#logoThumb").src = state.logo.url;
    $("#logoName").textContent = state.logo.original_name || state.logo.filename;
  }

  function renderAttachments() {
    const list = $("#attachList");
    list.innerHTML = state.attachments
      .map(
        (file, index) =>
          '<li class="attach-item">' +
          '<span class="attach-icon">📎</span>' +
          '<span class="attach-name">' + escapeHtml(file.original_name || file.filename) + "</span>" +
          '<span class="attach-size">' + formatBytes(file.size) + "</span>" +
          '<button class="chip-x" type="button" data-index="' + index + '" title="' +
          escapeHtml(t("composer.removeFile")) + '">×</button>' +
          "</li>"
      )
      .join("");

    $$(".chip-x", list).forEach((button) => {
      button.addEventListener("click", () => {
        state.attachments.splice(Number(button.dataset.index), 1);
        renderAttachments();
      });
    });
  }

  function bindUploads() {
    $$("#logoModes .seg").forEach((button) => {
      button.addEventListener("click", () => setLogoMode(button.dataset.logoMode));
    });

    // Saisie : aperçu à chaque frappe (anti-rebond), enregistrement à la validation.
    $("#logoUrlInput").addEventListener("input", schedulePreview);
    $("#logoUrlInput").addEventListener("change", (event) => {
      const url = event.target.value.trim();
      if (url && !/^https?:\/\/\S+$/i.test(url)) {
        toast(t("composer.logoUrlInvalid"), "warn");
        return;
      }
      saveLogoUrl(url);
    });

    $("#logoBtn").addEventListener("click", () => $("#logoInput").click());

    $("#logoInput").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) return;
      const button = $("#logoBtn");
      button.disabled = true;
      try {
        const result = await uploadFile(file, "logo");
        state.logo = {
          filename: result.filename,
          url: result.url,
          original_name: result.original_name,
        };
        renderLogo();
        schedulePreview();
        toast(t("files.logoAdded"), "ok");
      } catch (error) {
        toast(error.message, "err");
      } finally {
        button.disabled = false;
      }
    });

    $("#logoRemove").addEventListener("click", () => {
      state.logo = null;
      renderLogo();
      schedulePreview();
    });

    $("#attachBtn").addEventListener("click", () => $("#attachInput").click());

    $("#attachInput").addEventListener("change", async (event) => {
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      if (!files.length) return;
      const button = $("#attachBtn");
      button.disabled = true;
      let ok = 0;
      for (const file of files) {
        try {
          const result = await uploadFile(file, "attachment");
          state.attachments.push({
            filename: result.filename,
            original_name: result.original_name,
            size: result.size,
          });
          ok += 1;
        } catch (error) {
          toast(file.name + " : " + error.message, "err");
        }
      }
      renderAttachments();
      button.disabled = false;
      if (ok) toast(t("files.attachmentsAdded", { count: ok }), "ok");
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Envoi                                                                   */
  /* ----------------------------------------------------------------------- */

  function updateSendBar() {
    const total = state.recipients.length;
    const configured = !!(state.config && state.config.email && state.config.has_password);
    const summary = $("#sendSummary");
    const hint = $("#sendHint");
    const button = $("#sendBtn");

    summary.textContent =
      total === 0 ? t("send.noRecipient") : t("send.toCount", { count: total });

    if (!configured) {
      hint.textContent = t("send.hintNoConfig");
    } else if (total === 0) {
      hint.textContent = t("send.hintNoRecipient");
    } else if (total > 1) {
      hint.textContent = t("send.hintDelay");
    } else {
      hint.textContent = t("send.hintReady");
    }

    button.disabled = total === 0 || !configured;
    $(".btn-label", button).textContent =
      total > 1 ? t("send.buttonCount", { count: total }) : t("send.button");
  }

  async function sendCampaign() {
    const button = $("#sendBtn");
    const subject = $("#subject").value.trim();
    const body = $("#bodyInput").value.trim();
    const title = $("#titleInput").value.trim();

    if (!state.recipients.length) return toast(t("send.needRecipient"), "warn");
    if (!subject) {
      toast(t("send.needSubject"), "warn");
      return $("#subject").focus();
    }
    if (!body && !title) {
      toast(t("send.needBody"), "warn");
      return $("#bodyInput").focus();
    }

    const invalid = state.recipients.filter((recipient) => !isValidEmail(recipient.email));
    if (invalid.length) {
      return toast(
        t("send.invalidAddresses", { addresses: invalid.map((r) => r.email).join(", ") }),
        "err"
      );
    }

    const total = state.recipients.length;
    if (total > 1) {
      const seconds = Math.max(1, total - 1);
      const confirmed = window.confirm(t("send.confirm", { count: total, seconds: seconds }));
      if (!confirmed) return;
    }

    const payload = {
      to: state.recipients.map((recipient) => recipient.email),
      subject: subject,
      template: state.template,
      variables: collectVariables(),
      attachments: state.attachments.map((file) => ({
        filename: file.filename,
        original_name: file.original_name || file.filename,
      })),
    };

    setLoading(button, true);
    $(".btn-label", button).textContent = total > 1 ? t("send.sendingBulk") : t("send.sending");
    try {
      const endpoint = total > 1 ? "/api/send-bulk" : "/api/send";
      const result = await postJson(endpoint, payload);
      if (result.ok) {
        toast(result.message, "ok", t("send.sentTitle"));
      } else {
        toast(result.message, result.sent ? "warn" : "err");
      }
      (result.results || [])
        .filter((row) => !row.ok)
        .slice(0, 3)
        .forEach((row) => toast(row.email + " : " + row.message, "err", t("send.failedTitle")));
    } catch (error) {
      toast(error.message, "err");
    } finally {
      setLoading(button, false);
      updateSendBar();
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Champs de l'éditeur                                                     */
  /* ----------------------------------------------------------------------- */

  function bindEditor() {
    ["#titleInput", "#bodyInput", "#signatureInput", "#companyInput"].forEach((selector) => {
      $(selector).addEventListener("input", schedulePreview);
    });

    // Blocs optionnels : meme chemin d'aperçu que les autres champs, donc
    // meme anti-rebond. La liste vient de OPTIONAL_FIELDS : un champ ajoute
    // la-bas est cable ici sans rien oublier.
    Object.keys(OPTIONAL_FIELDS).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", schedulePreview);
    });

    $("#subject").addEventListener("input", updatePreviewMeta);

    $("#templateSelect").addEventListener("change", (event) => {
      state.template = event.target.value;
      schedulePreview();
      markSelectedTemplate();
    });

    // Couleur de l'e-mail : elle n'alimente que l'aperçu et le message envoyé.
    $("#accentInput").addEventListener("input", (event) => {
      const color = isHexColor(event.target.value) ? event.target.value : DEFAULT_ACCENT;
      $("#accentHex").value = color;
      schedulePreview();
    });

    $("#accentHex").addEventListener("change", (event) => {
      let value = event.target.value.trim();
      if (value && value[0] !== "#") value = "#" + value;
      if (!isHexColor(value)) {
        toast(t("composer.invalidColor"), "warn");
        event.target.value = currentAccent();
        return;
      }
      $("#accentInput").value = value;
      schedulePreview();
    });

    $$("#swatches .swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        const color = swatch.dataset.color;
        $("#accentInput").value = color;
        $("#accentHex").value = color;
        schedulePreview();
      });
    });

    $("#sendBtn").addEventListener("click", sendCampaign);

    $("#resetBtn").addEventListener("click", () => {
      if (!window.confirm(t("composer.resetConfirm"))) return;
      state.recipients = [];
      state.logo = null;
      state.attachments = [];
      ["#subject", "#titleInput", "#bodyInput", "#signatureInput", "#companyInput"].forEach(
        (selector) => ($(selector).value = "")
      );
      // Les blocs optionnels se vident aussi : « Réinitialiser » doit rendre
      // un formulaire reellement vierge, pas seulement ses champs d'origine.
      Object.keys(OPTIONAL_FIELDS).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      renderRecipients();
      renderLogo();
      renderAttachments();
      schedulePreview();
      toast(t("composer.resetDone"), "info");
    });

    // Ctrl/Cmd + Entrée pour envoyer.
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        const composerVisible = $("#view-composer").classList.contains("is-active");
        if (composerVisible && !$("#sendBtn").disabled) {
          event.preventDefault();
          sendCampaign();
        }
      }
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Modèles                                                                 */
  /* ----------------------------------------------------------------------- */

  async function loadTemplates() {
    try {
      const data = await api("/api/templates");
      state.templates = data.templates || [];
      const select = $("#templateSelect");
      // Le modèle choisi est conservé lors d'un rechargement (changement de langue).
      const previous = state.template;
      select.innerHTML = state.templates
        .map(
          (template) =>
            '<option value="' + escapeHtml(template.name) + '">' +
            escapeHtml(template.label) + "</option>"
        )
        .join("");
      if (state.templates.length) {
        const keep = state.templates.some((item) => item.name === previous);
        state.template = keep ? previous : state.templates[0].name;
        select.value = state.template;
      }
    } catch (error) {
      toast(t("templates.loadError", { error: error.message }), "err");
    }
  }

  /**
   * Charge un aperçu dans une iframe via srcdoc plutôt que src : le document reste
   * inerte (sandbox), aucune navigation n'est déclenchée et le rendu fonctionne
   * dans tous les navigateurs, y compris ceux qui filtrent les sous-cadres.
   */
  async function loadFrame(frame, url) {
    if (!frame) return;
    try {
      const response = await fetch(url, withLanguage());
      const html = await response.text();
      if (!response.ok) throw new Error(t("preview.unavailable"));
      frame.srcdoc = html;
    } catch (error) {
      frame.srcdoc =
        '<body style="font-family:sans-serif;padding:20px;color:#64748b">' +
        escapeHtml(error.message) + "</body>";
    }
  }

  // Largeur de dessin des miniatures : le modèle fait 600 px, le reste laisse
  // respirer ses marges. Le facteur de réduction est recalculé à chaque rendu.
  const THUMB_WIDTH = 1000;

  /** Met les miniatures à l'échelle pour qu'elles remplissent la largeur des cartes. */
  function fitThumbnails() {
    $$(".tpl-thumb").forEach((thumb) => {
      const frame = $("iframe", thumb);
      if (!frame || !thumb.clientWidth) return;
      const scale = thumb.clientWidth / THUMB_WIDTH;
      frame.style.transform = "scale(" + scale + ")";
      frame.style.height = Math.ceil(thumb.clientHeight / scale) + "px";
    });
  }

  function markSelectedTemplate() {
    $$(".tpl-card").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.name === state.template);
      const badge = $(".badge-current", card);
      if (badge) badge.hidden = card.dataset.name !== state.template;
    });
  }

  function renderTemplateCards() {
    const accent = currentAccent();
    const grid = $("#templateGrid");
    if (
      grid.dataset.rendered === "1" &&
      state.thumbsAccent === accent &&
      state.thumbsLang === lang()
    ) {
      markSelectedTemplate();
      return;
    }

    grid.innerHTML = state.templates
      .map((template) => {
        return (
          '<article class="tpl-card" data-name="' + escapeHtml(template.name) + '">' +
          '<div class="tpl-thumb"><iframe sandbox="" title="' +
          escapeHtml(template.label) + '" scrolling="no"></iframe></div>' +
          '<div class="tpl-body"><h3>' + escapeHtml(template.label) +
          '<span class="badge-current" hidden>' + escapeHtml(t("templates.current")) + "</span></h3>" +
          "<p>" + escapeHtml(template.description) + "</p></div>" +
          '<div class="tpl-actions">' +
          '<button class="btn btn-primary" type="button" data-use="' + escapeHtml(template.name) +
          '">' + escapeHtml(t("templates.use")) + "</button>" +
          '<button class="btn btn-soft" type="button" data-preview="' + escapeHtml(template.name) +
          '">' + escapeHtml(t("templates.preview")) + "</button>" +
          "</div></article>"
        );
      })
      .join("");

    grid.dataset.rendered = "1";
    state.thumbsAccent = accent;
    state.thumbsLang = lang();
    fitThumbnails();

    $$(".tpl-card", grid).forEach((card) => {
      loadFrame(
        $("iframe", card),
        "/api/templates/" + encodeURIComponent(card.dataset.name) +
          "/preview?accent=" + encodeURIComponent(accent)
      );
    });

    $$(".tpl-card", grid).forEach((card) => {
      card.addEventListener("click", (event) => {
        const useName = event.target.dataset ? event.target.dataset.use : null;
        const previewName = event.target.dataset ? event.target.dataset.preview : null;
        if (useName) return useTemplate(useName);
        if (previewName) return openTemplateModal(previewName);
        openTemplateModal(card.dataset.name);
      });
    });

    markSelectedTemplate();
  }

  function useTemplate(name) {
    state.template = name;
    $("#templateSelect").value = name;
    markSelectedTemplate();
    schedulePreview();
    showView("composer");
    const template = state.templates.find((item) => item.name === name);
    toast(t("templates.selected", { label: (template && template.label) || name }), "ok");
  }

  function openTemplateModal(name) {
    const template = state.templates.find((item) => item.name === name);
    if (!template) return;
    $("#modalTitle").textContent = template.label;
    $("#modalDesc").textContent = template.description;
    $("#modalFrame").srcdoc = "";
    loadFrame(
      $("#modalFrame"),
      "/api/templates/" + encodeURIComponent(name) + "/preview?accent=" +
        encodeURIComponent(currentAccent())
    );
    $("#modal").hidden = false;
    $("#modalUse").dataset.name = name;
  }

  function closeModal() {
    $("#modal").hidden = true;
    $("#modalFrame").removeAttribute("srcdoc");
  }

  function bindThumbnails() {
    window.addEventListener("resize", debounce(fitThumbnails, 150));
  }

  function bindModal() {
    $$("[data-close]").forEach((element) => element.addEventListener("click", closeModal));
    $("#modalUse").addEventListener("click", (event) => {
      closeModal();
      useTemplate(event.currentTarget.dataset.name);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("#modal").hidden) closeModal();
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Contacts                                                                */
  /* ----------------------------------------------------------------------- */

  function filteredContacts() {
    const needle = $("#contactSearch").value.trim().toLowerCase();
    const group = $("#contactGroupFilter").value;
    return state.contacts.filter((contact) => {
      if (group && (contact.group || DEFAULT_GROUP) !== group) return false;
      if (!needle) return true;
      return (
        String(contact.name || "").toLowerCase().indexOf(needle) !== -1 ||
        String(contact.email || "").toLowerCase().indexOf(needle) !== -1 ||
        String(contact.group || "").toLowerCase().indexOf(needle) !== -1
      );
    });
  }

  function renderContacts() {
    const rows = filteredContacts();
    const body = $("#contactsBody");

    body.innerHTML = rows
      .map(
        (contact) =>
          "<tr>" +
          '<td><div class="cell-name"><span class="cell-avatar">' +
          escapeHtml(initials(contact.name, contact.email)) + "</span>" +
          escapeHtml(contact.name || t("preview.empty")) + "</div></td>" +
          '<td class="cell-email">' + escapeHtml(contact.email) + "</td>" +
          '<td><span class="tag">' + escapeHtml(groupLabel(contact.group)) + "</span></td>" +
          '<td class="cell-date">' + escapeHtml(formatDate(contact.created_at)) + "</td>" +
          '<td class="col-actions">' +
          '<button class="row-btn row-use" type="button" data-add="' + escapeHtml(contact.id) +
          '" title="' + escapeHtml(t("contacts.addToRecipients")) + '">→</button>' +
          '<button class="row-btn" type="button" data-delete="' + escapeHtml(contact.id) +
          '" title="' + escapeHtml(t("contacts.delete")) + '">🗑</button>' +
          "</td></tr>"
      )
      .join("");

    $("#contactsEmpty").hidden = rows.length > 0;
    $("#contactStats").textContent =
      rows.length === state.contacts.length
        ? t("contacts.count", { count: state.contacts.length })
        : t("contacts.filtered", { shown: rows.length, total: state.contacts.length });
    $("#contactsBadge").textContent = String(state.contacts.length);

    $$("[data-delete]", body).forEach((button) => {
      button.addEventListener("click", () => deleteContact(button.dataset.delete));
    });
    $$("[data-add]", body).forEach((button) => {
      button.addEventListener("click", () => {
        const contact = state.contacts.find((item) => item.id === button.dataset.add);
        if (!contact) return;
        if (addRecipient(contact.email, contact.name)) {
          renderRecipients();
          toast(t("contacts.addedToRecipients", { email: contact.email }), "ok");
        } else {
          toast(t("contacts.alreadyRecipient"), "info");
        }
      });
    });
  }

  function renderGroups() {
    const groups = state.groups.length
      ? state.groups
      : Array.from(
          new Set(state.contacts.map((contact) => contact.group || DEFAULT_GROUP))
        ).sort();

    // value = valeur stockée, libellé = version traduite pour le groupe par défaut.
    const options = groups
      .map(
        (group) =>
          '<option value="' + escapeHtml(group) + '">' + escapeHtml(groupLabel(group)) + "</option>"
      )
      .join("");

    const filter = $("#contactGroupFilter");
    const previous = filter.value;
    filter.innerHTML =
      '<option value="">' + escapeHtml(t("contacts.allGroups")) + "</option>" + options;
    if (groups.indexOf(previous) !== -1) filter.value = previous;

    $("#groupSelect").innerHTML =
      '<option value="">' + escapeHtml(t("composer.addGroup")) + "</option>" + options;
    $("#groupList").innerHTML = options;
  }

  async function loadContacts() {
    try {
      const data = await api("/api/contacts");
      state.contacts = data.contacts || [];
      state.groups = data.groups || [];
      renderGroups();
      renderContacts();
    } catch (error) {
      toast(t("contacts.loadError", { error: error.message }), "err");
    }
  }

  async function deleteContact(id) {
    const contact = state.contacts.find((item) => item.id === id);
    const label = contact ? contact.name || contact.email : t("contacts.thisContact");
    if (!window.confirm(t("contacts.deleteConfirm", { name: label }))) return;
    try {
      const data = await api("/api/contacts/" + encodeURIComponent(id), { method: "DELETE" });
      state.contacts = data.contacts || [];
      renderGroups();
      renderContacts();
      toast(data.message, "ok");
    } catch (error) {
      toast(error.message, "err");
    }
  }

  function bindContacts() {
    $("#contactForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = $("#contactForm button[type=submit]");
      const email = $("#cEmail").value.trim();
      if (!isValidEmail(email)) {
        toast(t("contacts.needValidEmail"), "warn");
        return $("#cEmail").focus();
      }
      setLoading(button, true);
      try {
        await postJson("/api/contacts", {
          name: $("#cName").value.trim(),
          email: email,
          group: $("#cGroup").value.trim(),
        });
        $("#cName").value = "";
        $("#cEmail").value = "";
        await loadContacts();
        toast(t("contacts.added"), "ok");
      } catch (error) {
        toast(error.message, "err");
      } finally {
        setLoading(button, false);
      }
    });

    $("#contactSearch").addEventListener("input", renderContacts);
    $("#contactGroupFilter").addEventListener("change", renderContacts);

    $("#importBtn").addEventListener("click", () => $("#importInput").click());

    $("#importInput").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) return;
      const button = $("#importBtn");
      setLoading(button, true);
      try {
        const form = new FormData();
        form.append("file", file);
        const result = await api("/api/contacts/import", { method: "POST", body: form });
        await loadContacts();
        toast(result.message, (result.added || []).length ? "ok" : "warn", t("contacts.importTitle"));
      } catch (error) {
        toast(error.message, "err", t("contacts.importTitle"));
      } finally {
        setLoading(button, false);
      }
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Paramètres                                                              */
  /* ----------------------------------------------------------------------- */

  const PRESETS = {
    gmail: { server: "smtp.gmail.com", port: 587, label: "Gmail" },
    outlook: { server: "smtp.office365.com", port: 587, label: "Outlook" },
    yahoo: { server: "smtp.mail.yahoo.com", port: 587, label: "Yahoo" },
  };

  function applyConfigToUi(config) {
    state.config = config;
    $("#smtpServer").value = config.smtp_server || "";
    $("#smtpPort").value = config.smtp_port || 587;
    $("#smtpEmail").value = config.email || "";
    $("#displayName").value = config.display_name || "";
    $("#smtpPassword").value = config.has_password ? MASKED_PASSWORD : "";

    const configured = !!(config.smtp_server && config.email && config.has_password);
    const name = config.display_name || (config.email ? config.email.split("@")[0] : "");

    $("#fromName").textContent = name || t("sidebar.notConfigured");
    $("#fromEmail").textContent = config.email || t("composer.fromPlaceholder");
    $("#fromAvatar").textContent = initials(config.display_name, config.email);

    $("#accountEmail").textContent = config.email || t("sidebar.notConfigured");
    $("#accountServer").textContent = config.smtp_server
      ? config.smtp_server + ":" + config.smtp_port
      : t("sidebar.openSettings");
    $("#statusDot").classList.toggle("is-ok", configured);
    $("#statusDot").title = configured ? t("sidebar.statusOk") : t("sidebar.statusIncomplete");

    updateSendBar();
    updatePreviewMeta();
  }

  async function loadConfig() {
    try {
      const data = await api("/api/config");
      const saved = (data.config || {}).language;
      // La configuration serveur fait foi ; localStorage n'est qu'un cache d'affichage.
      if (saved && saved !== lang()) changeLanguage(saved, { silent: true });
      $("#languageSelect").value = lang();
      // Couleur de l'interface enregistrée (déjà injectée dans le HTML, on
      // réaligne les champs et la nuance de texte).
      changeUiAccent((data.config || {}).ui_accent_color, { silent: true });
      // Adresse de logo mémorisée (déjà injectée dans le HTML, on réaligne).
      const savedLogo = (data.config || {}).logo_url || "";
      if (savedLogo && $("#logoUrlInput").value.trim() !== savedLogo) {
        $("#logoUrlInput").value = savedLogo;
        schedulePreview();
      }
      applyConfigToUi(data.config || {});
      if (!data.configured) {
        toast(t("settings.welcome"), "info", t("settings.welcomeTitle"));
      }
    } catch (error) {
      toast(t("settings.loadError", { error: error.message }), "err");
    }
  }

  function readSettingsForm() {
    return {
      smtp_server: $("#smtpServer").value.trim(),
      smtp_port: Number($("#smtpPort").value) || 587,
      email: $("#smtpEmail").value.trim(),
      password: $("#smtpPassword").value,
      display_name: $("#displayName").value.trim(),
    };
  }

  function showTestResult(message, ok) {
    const node = $("#testResult");
    node.textContent = message;
    node.className = "test-result " + (ok ? "is-ok" : "is-err");
  }

  function bindSettings() {
    $$("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        const preset = PRESETS[button.dataset.preset];
        if (!preset) return;
        $("#smtpServer").value = preset.server;
        $("#smtpPort").value = preset.port;
        toast(t("settings.presetApplied", { preset: preset.label }), "info");
        $("#smtpEmail").focus();
      });
    });

    $("#settingsForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = $("#settingsForm button[type=submit]");
      const form = readSettingsForm();
      if (!form.smtp_server) {
        toast(t("settings.needServer"), "warn");
        return $("#smtpServer").focus();
      }
      if (!isValidEmail(form.email)) {
        toast(t("settings.needEmail"), "warn");
        return $("#smtpEmail").focus();
      }
      if (!form.password) {
        toast(t("settings.needPassword"), "warn");
        return $("#smtpPassword").focus();
      }
      setLoading(button, true);
      try {
        const result = await postJson("/api/config", form);
        applyConfigToUi(result.config);
        showTestResult("", true);
        toast(result.message, "ok");
      } catch (error) {
        toast(error.message, "err");
      } finally {
        setLoading(button, false);
      }
    });

    $("#testBtn").addEventListener("click", async () => {
      const button = $("#testBtn");
      setLoading(button, true);
      showTestResult(t("settings.testing"), true);
      try {
        const result = await postJson("/api/config/test", readSettingsForm());
        showTestResult(result.message, result.ok);
        toast(
          result.message,
          result.ok ? "ok" : "err",
          result.ok ? t("settings.connectionTitle") : t("send.failedTitle")
        );
      } catch (error) {
        showTestResult(error.message, false);
        toast(error.message, "err", t("send.failedTitle"));
      } finally {
        setLoading(button, false);
      }
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Langue                                                                  */
  /* ----------------------------------------------------------------------- */

  function renderVersion() {
    $("#appVersion").textContent = t("sidebar.version", {
      year: window.APP_YEAR || new Date().getFullYear(),
    });
  }

  /**
   * Applique une langue : traduction immédiate de toute l'interface, puis
   * enregistrement côté serveur (data/config.json). L'écriture sur disque est
   * asynchrone, l'affichage n'attend pas.
   */
  async function changeLanguage(code, options) {
    const applied = i18n.set(code);
    $("#languageSelect").value = applied;
    if (options && options.silent) return applied;

    try {
      await postJson("/api/language", { language: applied });
      toast(t("settings.languageSaved", { label: i18n.label(applied) }), "ok");
    } catch (error) {
      toast(t("settings.languageError", { error: error.message }), "err");
    }
    return applied;
  }

  /**
   * Applique la couleur de l'interface puis l'enregistre côté serveur.
   * L'affichage n'attend pas l'écriture sur disque.
   */
  async function changeUiAccent(color, options) {
    const applied = applyUiAccent(color);
    $("#uiAccentInput").value = applied;
    $("#uiAccentHex").value = applied;
    if (options && options.silent) return applied;

    try {
      await postJson("/api/theme", { ui_accent_color: applied });
      toast(t("settings.themeSaved", { color: applied }), "ok");
    } catch (error) {
      toast(t("settings.themeError", { error: error.message }), "err");
    }
    return applied;
  }

  function bindTheme() {
    // Aperçu instantané pendant le glissement, enregistrement au relâchement :
    // évite une requête par pixel parcouru dans le sélecteur natif.
    $("#uiAccentInput").addEventListener("input", (event) => {
      changeUiAccent(event.target.value, { silent: true });
    });
    $("#uiAccentInput").addEventListener("change", (event) => {
      changeUiAccent(event.target.value);
    });

    $("#uiAccentHex").addEventListener("change", (event) => {
      let value = event.target.value.trim();
      if (value && value[0] !== "#") value = "#" + value;
      if (!isHexColor(value)) {
        toast(t("composer.invalidColor"), "warn");
        event.target.value = currentUiAccent();
        return;
      }
      changeUiAccent(value);
    });

    $$("#uiSwatches .swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => changeUiAccent(swatch.dataset.color));
    });
  }

  function bindLanguage() {
    $("#languageSelect").addEventListener("change", (event) => {
      changeLanguage(event.target.value);
    });

    // Tout ce qui est rendu par JS est reconstruit à chaque changement de langue.
    i18n.onChange(() => {
      renderVersion();
      renderRecipients();          // met aussi à jour la barre d'envoi et l'en-tête d'aperçu
      renderAttachments();
      renderGroups();
      renderContacts();
      if (state.config) applyConfigToUi(state.config);
      showTestResult("", true);

      // Libellés des modèles : ils viennent du serveur, il faut les recharger.
      $("#templateGrid").dataset.rendered = "0";
      loadTemplates().then(() => {
        markSelectedTemplate();
        if ($("#view-templates").classList.contains("is-active")) renderTemplateCards();
      });

      // L'aperçu est rendu par le serveur : ses textes fixes changent aussi.
      refreshPreview(true);
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Démarrage                                                               */
  /* ----------------------------------------------------------------------- */

  async function init() {
    // Traduit le balisage statique avant tout affichage.
    i18n.apply();
    renderVersion();

    bindNav();
    bindRecipients();
    bindEditor();
    bindUploads();
    bindPreviewTools();
    bindContacts();
    bindSettings();
    bindModal();
    bindLanguage();
    bindTheme();
    bindThumbnails();

    // Couleur de l'interface : celle injectée par le serveur fait foi au premier rendu.
    applyUiAccent(document.documentElement.getAttribute("data-ui-accent"));
    // Mode « adresse web » par défaut : l'e-mail ne porte alors aucune pièce jointe.
    setLogoMode("url", { silent: true });
    renderRecipients();
    renderAttachments();
    renderLogo();

    await Promise.all([loadConfig(), loadTemplates(), loadContacts()]);
    refreshPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
