"""
Traductions côté serveur / Server-side translations.

Quatre catalogues :
  * MESSAGES        - messages de l'API (erreurs, confirmations) renvoyés au client
  * EMAIL_STRINGS   - textes fixes des modèles d'e-mail (pied de page, mentions)
  * SAMPLE_CONTENT  - contenu d'exemple des aperçus de modèles
  * TEMPLATE_META   - libellé et description de chaque modèle, par langue

Les chaînes de l'interface vivent dans static/js/i18n.js. Toute clé absente d'une
langue retombe sur le français, jamais sur une valeur vide.
"""

from __future__ import annotations

from typing import Any

LANGUAGES: tuple[str, ...] = ("fr", "en")
DEFAULT_LANGUAGE = "fr"

# Libellés affichés dans le sélecteur de langue.
LANGUAGE_LABELS: dict[str, str] = {
    "fr": "Français",
    "en": "English",
}

# Groupe attribué à un contact qui n'en déclare pas. Stocké tel quel dans
# contacts.json quelle que soit la langue : c'est une donnée, pas un libellé.
# L'interface l'affiche traduite (clé « defaultGroup » de static/js/i18n.js).
DEFAULT_GROUP = "Général"


# --------------------------------------------------------------------------- #
# Messages de l'API
# --------------------------------------------------------------------------- #

MESSAGES: dict[str, dict[str, str]] = {
    "fr": {
        # -- Configuration SMTP --------------------------------------------- #
        "missing_server": "le serveur SMTP",
        "missing_email": "l'adresse e-mail",
        "missing_password": "le mot de passe",
        "config_incomplete": (
            "Configuration SMTP incomplète : renseignez {missing} dans l'onglet Paramètres."
        ),
        "invalid_sender": "L'adresse d'expédition « {email} » n'est pas valide.",
        "server_required": "Le serveur SMTP est obligatoire.",
        "config_email_invalid": "L'adresse e-mail d'expédition n'est pas valide.",
        "port_not_number": "Le port SMTP doit être un nombre.",
        "port_out_of_range": "Le port SMTP doit être compris entre 1 et 65535.",
        "config_saved": "Paramètres SMTP enregistrés.",
        "language_saved": "Langue enregistrée.",
        "language_unknown": "Langue inconnue : {language}. Valeurs acceptées : {allowed}.",
        "theme_saved": "Couleur de l'interface enregistrée.",
        "theme_invalid": "Couleur invalide : {color}. Format attendu : #2563eb.",
        "logo_saved": "Adresse du logo enregistrée.",
        "logo_url_invalid": (
            "Adresse de logo invalide : {url}. Elle doit commencer par https:// ou http://."
        ),
        "test_success": "Connexion réussie à {server}:{port} avec {email}.",
        # -- Erreurs SMTP --------------------------------------------------- #
        "smtp_auth": (
            "Échec de l'authentification SMTP. Vérifiez l'adresse e-mail et le mot de "
            "passe. Pour Gmail, Outlook ou Yahoo, un mot de passe d'application est "
            "obligatoire (votre mot de passe habituel ne fonctionne pas)."
        ),
        "smtp_recipient_refused": "Le serveur a refusé le destinataire. Vérifiez l'adresse saisie.",
        "smtp_sender_refused": (
            "Le serveur a refusé l'adresse d'expédition. Vérifiez la configuration SMTP."
        ),
        "smtp_data": "Le serveur a rejeté le message : {error}.",
        "smtp_connect": "Connexion impossible à {server}:{port}. Vérifiez le serveur et le port.",
        "smtp_disconnected": "Le serveur SMTP a coupé la connexion. Réessayez dans un instant.",
        "smtp_ssl": (
            "Erreur de chiffrement TLS/SSL. Utilisez le port 587 (STARTTLS) "
            "ou le port 465 (SSL)."
        ),
        "smtp_timeout": (
            "Délai dépassé en contactant {server}:{port}. Vérifiez votre connexion "
            "internet ou votre pare-feu."
        ),
        "smtp_network": (
            "Impossible de joindre {server}:{port} ({error}). "
            "Vérifiez le serveur, le port et votre connexion internet."
        ),
        "smtp_generic": "Erreur SMTP : {error}.",
        "smtp_unexpected": "Erreur inattendue lors de l'envoi : {error}.",
        # -- Envoi ---------------------------------------------------------- #
        "no_recipients": "Aucun destinataire n'a été indiqué.",
        "invalid_addresses": "Adresse(s) invalide(s) : {addresses}",
        "subject_required": "Le sujet de l'e-mail est obligatoire.",
        "empty_message": "Le message est vide : saisissez au moins un titre ou un texte.",
        "result_sent": "Envoyé",
        "result_error": "Erreur : {error}",
        "summary_all_sent": "{sent} e-mail(s) envoyé(s) avec succès.",
        "summary_none_sent": "Aucun e-mail envoyé. {failed} échec(s).",
        "summary_mixed": "{sent} e-mail(s) envoyé(s), {failed} échec(s).",
        # -- Modèles -------------------------------------------------------- #
        "unknown_template": "Modèle inconnu : {name}",
        # -- Fichiers ------------------------------------------------------- #
        "file_not_found": "Fichier introuvable : {name}",
        "no_file": "Aucun fichier reçu.",
        "empty_file": "Le fichier est vide.",
        "file_too_large": "Fichier trop volumineux ({size} Ko). Limite : {limit} Mo.",
        "logo_not_image": "Le logo doit être une image (PNG, JPG, GIF, WEBP ou SVG).",
        "upload_done": "« {name} » a été téléversé.",
        # -- Contacts ------------------------------------------------------- #
        "contact_email_required": "L'adresse e-mail du contact est obligatoire.",
        "contact_exists": "Ce contact existe déjà.",
        "contact_email_invalid": "Adresse e-mail invalide.",
        "contact_not_found": "Contact introuvable.",
        "contact_deleted": "Contact supprimé.",
        "contacts_added": "{count} contact(s) ajouté(s)",
        "contacts_duplicates": "{count} doublon(s) ignoré(s)",
        "contacts_invalid": "{count} adresse(s) invalide(s)",
        # -- Import --------------------------------------------------------- #
        "import_unsupported": "Format non pris en charge. Utilisez un fichier .csv ou .xlsx.",
        "import_no_contacts": (
            "Aucun contact trouvé. Le fichier doit contenir les colonnes name, email "
            "et group (optionnelle)."
        ),
        "import_excel_unreadable": "Fichier Excel illisible : {error}",
        "import_no_sheet": "Le classeur Excel ne contient aucune feuille.",
        "import_openpyxl_missing": (
            "Le module openpyxl est absent : lancez « pip install -r requirements.txt »."
        ),
        "import_done": "Import terminé : {summary}",
        # -- Divers --------------------------------------------------------- #
        "invalid_data": "Données invalides pour « {field} ».",
        "bad_request": "Requête invalide.",
        "request_field": "la requête",
    },
    "en": {
        # -- SMTP configuration --------------------------------------------- #
        "missing_server": "the SMTP server",
        "missing_email": "the email address",
        "missing_password": "the password",
        "config_incomplete": "Incomplete SMTP configuration: fill in {missing} in the Settings tab.",
        "invalid_sender": "The sender address “{email}” is not valid.",
        "server_required": "The SMTP server is required.",
        "config_email_invalid": "The sender email address is not valid.",
        "port_not_number": "The SMTP port must be a number.",
        "port_out_of_range": "The SMTP port must be between 1 and 65535.",
        "config_saved": "SMTP settings saved.",
        "language_saved": "Language saved.",
        "language_unknown": "Unknown language: {language}. Accepted values: {allowed}.",
        "theme_saved": "Interface colour saved.",
        "theme_invalid": "Invalid colour: {color}. Expected format: #2563eb.",
        "logo_saved": "Logo address saved.",
        "logo_url_invalid": (
            "Invalid logo address: {url}. It must start with https:// or http://."
        ),
        "test_success": "Successfully connected to {server}:{port} as {email}.",
        # -- SMTP errors ---------------------------------------------------- #
        "smtp_auth": (
            "SMTP authentication failed. Check your email address and password. "
            "Gmail, Outlook and Yahoo require an app password (your usual password "
            "will not work)."
        ),
        "smtp_recipient_refused": "The server rejected the recipient. Check the address you entered.",
        "smtp_sender_refused": (
            "The server rejected the sender address. Check your SMTP settings."
        ),
        "smtp_data": "The server rejected the message: {error}.",
        "smtp_connect": "Could not connect to {server}:{port}. Check the server and port.",
        "smtp_disconnected": "The SMTP server closed the connection. Try again in a moment.",
        "smtp_ssl": (
            "TLS/SSL encryption error. Use port 587 (STARTTLS) or port 465 (SSL)."
        ),
        "smtp_timeout": (
            "Timed out contacting {server}:{port}. Check your internet connection "
            "or your firewall."
        ),
        "smtp_network": (
            "Could not reach {server}:{port} ({error}). "
            "Check the server, the port and your internet connection."
        ),
        "smtp_generic": "SMTP error: {error}.",
        "smtp_unexpected": "Unexpected error while sending: {error}.",
        # -- Sending -------------------------------------------------------- #
        "no_recipients": "No recipient was provided.",
        "invalid_addresses": "Invalid address(es): {addresses}",
        "subject_required": "The email subject is required.",
        "empty_message": "The message is empty: enter at least a title or some text.",
        "result_sent": "Sent",
        "result_error": "Error: {error}",
        "summary_all_sent": "{sent} email(s) sent successfully.",
        "summary_none_sent": "No email sent. {failed} failure(s).",
        "summary_mixed": "{sent} email(s) sent, {failed} failure(s).",
        # -- Templates ------------------------------------------------------ #
        "unknown_template": "Unknown template: {name}",
        # -- Files ---------------------------------------------------------- #
        "file_not_found": "File not found: {name}",
        "no_file": "No file received.",
        "empty_file": "The file is empty.",
        "file_too_large": "File too large ({size} KB). Limit: {limit} MB.",
        "logo_not_image": "The logo must be an image (PNG, JPG, GIF, WEBP or SVG).",
        "upload_done": "“{name}” has been uploaded.",
        # -- Contacts ------------------------------------------------------- #
        "contact_email_required": "The contact's email address is required.",
        "contact_exists": "This contact already exists.",
        "contact_email_invalid": "Invalid email address.",
        "contact_not_found": "Contact not found.",
        "contact_deleted": "Contact deleted.",
        "contacts_added": "{count} contact(s) added",
        "contacts_duplicates": "{count} duplicate(s) skipped",
        "contacts_invalid": "{count} invalid address(es)",
        # -- Import --------------------------------------------------------- #
        "import_unsupported": "Unsupported format. Use a .csv or .xlsx file.",
        "import_no_contacts": (
            "No contact found. The file must contain the columns name, email "
            "and group (optional)."
        ),
        "import_excel_unreadable": "Unreadable Excel file: {error}",
        "import_no_sheet": "The Excel workbook contains no sheet.",
        "import_openpyxl_missing": (
            "The openpyxl module is missing: run “pip install -r requirements.txt”."
        ),
        "import_done": "Import finished: {summary}",
        # -- Misc ----------------------------------------------------------- #
        "invalid_data": "Invalid data for “{field}”.",
        "bad_request": "Invalid request.",
        "request_field": "the request",
    },
}


# --------------------------------------------------------------------------- #
# Textes fixes des modèles d'e-mail
# --------------------------------------------------------------------------- #

EMAIL_STRINGS: dict[str, dict[str, str]] = {
    "fr": {
        "logo_alt": "Logo",
        "title_newsletter": "Newsletter",
        "title_message": "Message",
        "title_invitation": "Invitation",
        "invitation_label": "Invitation",
        "invitation_cta": "Nous comptons sur vous",
        "invitation_closing": "Au plaisir de vous accueillir.",
        "rights_reserved": "Tous droits réservés.",
        "subscription_note": (
            "Vous recevez cet e-mail car vous êtes inscrit à notre liste de diffusion."
        ),
        "confidential_note": "Ce message est confidentiel et destiné à son seul destinataire.",
        # Chaque « title_* » sert de titre de repli et d'intitulé affiché en
        # haut du message.
        "title_promotion": "Offre spéciale",
        "title_welcome": "Bienvenue",
        "title_receipt": "Reçu",
        "title_announcement": "Annonce",
        "title_thanks": "Merci",
        "title_alert": "Notification",
        "promo_note": "Offre à durée limitée, dans la limite des stocks disponibles.",
        "welcome_note": "Nous sommes ravis de vous compter parmi nous.",
        "receipt_details": "Détails",
        "receipt_note": "Conservez cet e-mail comme justificatif.",
        "thanks_note": "Votre confiance compte beaucoup pour nous.",
        "alert_note": "Message automatique, merci de ne pas y répondre.",
        # Blocs optionnels : repris dans la version texte du message.
        "video_link": "Voir la vidéo",
        "social_follow": "Suivez-nous :",
    },
    "en": {
        "logo_alt": "Logo",
        "title_newsletter": "Newsletter",
        "title_message": "Message",
        "title_invitation": "Invitation",
        "invitation_label": "Invitation",
        "invitation_cta": "We hope to see you there",
        "invitation_closing": "We look forward to welcoming you.",
        "rights_reserved": "All rights reserved.",
        "subscription_note": "You are receiving this email because you subscribed to our mailing list.",
        "confidential_note": "This message is confidential and intended solely for its recipient.",
        # Each "title_*" is both the fallback title and the in-message heading.
        "title_promotion": "Special offer",
        "title_welcome": "Welcome",
        "title_receipt": "Receipt",
        "title_announcement": "Announcement",
        "title_thanks": "Thank you",
        "title_alert": "Notification",
        "promo_note": "Limited time offer, while stocks last.",
        "welcome_note": "We are delighted to have you on board.",
        "receipt_details": "Details",
        "receipt_note": "Keep this email as your proof of purchase.",
        "thanks_note": "Your trust means a great deal to us.",
        "alert_note": "Automated message, please do not reply.",
        # Optional blocks, echoed in the plain-text part.
        "video_link": "Watch the video",
        "social_follow": "Follow us:",
    },
}


# --------------------------------------------------------------------------- #
# Libellés des modèles (vue « Modèles » et liste déroulante)
# --------------------------------------------------------------------------- #

TEMPLATE_META: dict[str, dict[str, dict[str, str]]] = {
    "fr": {
        "newsletter": {
            "label": "Newsletter",
            "description": "Bandeau coloré, logo centré, grand titre et pied de page complet.",
        },
        "business": {
            "label": "Professionnel",
            "description": "Fond blanc épuré, logo en haut à gauche, bloc de signature formel.",
        },
        "invitation": {
            "label": "Invitation",
            "description": "En-tête en dégradé, mise en page centrée, idéal pour un événement.",
        },
        "minimal": {
            "label": "Minimaliste",
            "description": "Aucun bandeau, typographie aérée, message sobre et direct.",
        },
        "promotion": {
            "label": "Promotion",
            "description": "Titre géant, bande d'appel à l'action, ton percutant pour une offre.",
        },
        "welcome": {
            "label": "Bienvenue",
            "description": "Carte arrondie, pastille ronde et aplat doux, ton chaleureux.",
        },
        "receipt": {
            "label": "Reçu",
            "description": "Panneau de détails encadré, police à chasse fixe, ton transactionnel.",
        },
        "announcement": {
            "label": "Annonce",
            "description": "Grand hero sombre, titre en serif, mise en page éditoriale aérée.",
        },
        "thankyou": {
            "label": "Remerciement",
            "description": "Fond crème, grand mot en italique, composition centrée et douce.",
        },
        "alert": {
            "label": "Alerte",
            "description": "Barre d'état colorée, encadré technique, mise en page compacte.",
        },
    },
    "en": {
        "newsletter": {
            "label": "Newsletter",
            "description": "Coloured banner, centred logo, large title and a full footer.",
        },
        "business": {
            "label": "Business",
            "description": "Clean white background, logo top left, formal signature block.",
        },
        "invitation": {
            "label": "Invitation",
            "description": "Gradient header, centred layout, ideal for an event.",
        },
        "minimal": {
            "label": "Minimal",
            "description": "No banner, airy typography, plain and direct message.",
        },
        "promotion": {
            "label": "Promotion",
            "description": "Giant headline, call-to-action band, punchy tone for an offer.",
        },
        "welcome": {
            "label": "Welcome",
            "description": "Rounded card, circular badge and soft panel, warm tone.",
        },
        "receipt": {
            "label": "Receipt",
            "description": "Framed details panel, monospaced type, transactional tone.",
        },
        "announcement": {
            "label": "Announcement",
            "description": "Large dark hero, serif headline, airy editorial layout.",
        },
        "thankyou": {
            "label": "Thank you",
            "description": "Cream background, large italic word, soft centred composition.",
        },
        "alert": {
            "label": "Alert",
            "description": "Coloured status bar, technical callout, compact layout.",
        },
    },
}

# Ordre d'affichage des modèles fournis avec l'application.
TEMPLATE_ORDER: tuple[str, ...] = (
    "newsletter",
    "business",
    "invitation",
    "minimal",
    "promotion",
    "welcome",
    "receipt",
    "announcement",
    "thankyou",
    "alert",
)


# --------------------------------------------------------------------------- #
# Contenu d'exemple des aperçus
# --------------------------------------------------------------------------- #

SAMPLE_CONTENT: dict[str, dict[str, str]] = {
    "fr": {
        "logo_url": "",
        "title": "Votre titre apparaît ici",
        "body": (
            "Bonjour,\n\n"
            "Ceci est un aperçu du modèle avec des données d'exemple. Remplacez ce texte "
            "par votre message : chaque retour à la ligne est conservé dans l'e-mail final.\n\n"
            "Bien cordialement,"
        ),
        "signature": "Marie Dupont\nDirectrice de la communication\n+33 6 12 34 56 78",
        "company_name": "Ma Société",
    },
    "en": {
        "logo_url": "",
        "title": "Your title goes here",
        "body": (
            "Hello,\n\n"
            "This is a preview of the template with sample data. Replace this text "
            "with your message: every line break is preserved in the final email.\n\n"
            "Kind regards,"
        ),
        "signature": "Mary Davis\nHead of Communications\n+44 20 7946 0123",
        "company_name": "My Company",
    },
}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #


def normalize_language(value: Any) -> str:
    """Renvoie un code de langue valide, « fr » par défaut.

    Accepte « en », « EN », « en-GB », « en_US » et retombe sur la langue par
    défaut pour toute valeur inconnue ou vide.
    """
    code = str(value or "").strip().lower().replace("_", "-")
    if not code:
        return DEFAULT_LANGUAGE
    if code in LANGUAGES:
        return code
    base = code.split("-")[0]
    return base if base in LANGUAGES else DEFAULT_LANGUAGE


def tr(lang: Any, key: str, **kwargs: Any) -> str:
    """Traduit une clé de MESSAGES, avec interpolation ``{nom}``.

    Retombe sur le français si la clé manque dans la langue demandée, puis sur la
    clé elle-même : une traduction oubliée ne provoque jamais d'erreur.
    """
    code = normalize_language(lang)
    catalog = MESSAGES.get(code, {})
    template = catalog.get(key) or MESSAGES[DEFAULT_LANGUAGE].get(key) or key
    if not kwargs:
        return template
    try:
        return template.format(**kwargs)
    except (KeyError, IndexError, ValueError):
        return template


def email_strings(lang: Any) -> dict[str, str]:
    """Textes fixes d'un modèle d'e-mail, complétés par le français si besoin."""
    code = normalize_language(lang)
    merged = dict(EMAIL_STRINGS[DEFAULT_LANGUAGE])
    merged.update(EMAIL_STRINGS.get(code, {}))
    return merged


def sample_content(lang: Any) -> dict[str, str]:
    """Contenu d'exemple utilisé par les aperçus de modèles."""
    code = normalize_language(lang)
    merged = dict(SAMPLE_CONTENT[DEFAULT_LANGUAGE])
    merged.update(SAMPLE_CONTENT.get(code, {}))
    return merged


def template_meta(lang: Any, name: str) -> dict[str, str]:
    """Libellé et description d'un modèle, avec repli sur le français puis sur le nom."""
    code = normalize_language(lang)
    meta = TEMPLATE_META.get(code, {}).get(name) or TEMPLATE_META[DEFAULT_LANGUAGE].get(name)
    if meta:
        return dict(meta)
    # Modèle déposé à la main dans templates/email_templates/ : aucun libellé connu.
    fallback = {
        "fr": "Modèle d'e-mail personnalisé.",
        "en": "Custom email template.",
    }
    return {
        "label": name.replace("_", " ").replace("-", " ").capitalize(),
        "description": fallback.get(code, fallback[DEFAULT_LANGUAGE]),
    }
