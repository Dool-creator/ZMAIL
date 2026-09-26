/* =========================================================================
   Zm@il - traductions de l'interface / UI translations

   Expose window.I18N :
     .languages            liste des langues disponibles
     .current()            code de la langue active
     .set(code)            change la langue et retraduit toute la page
     .t(key, vars)         traduit une clé, avec interpolation {nom}
     .apply(root)          traduit les éléments [data-i18n*] d'un sous-arbre
     .onChange(fn)         enregistre un abonné (rendu des listes dynamiques)

   apply() rend aux éléments dynamiques leur libellé par défaut ; ce sont les
   abonnés onChange() qui y réinjectent les valeurs courantes. Les deux vont
   toujours de pair, sous peine de laisser l'interface sur ses textes de repli.

   Les éléments statiques portent un attribut :
     data-i18n="cle"             -> textContent
     data-i18n-html="cle"        -> innerHTML (libellé contenant des balises)
     data-i18n-placeholder="cle" -> placeholder
     data-i18n-title="cle"       -> title (infobulle)
     data-i18n-aria-label="cle"  -> aria-label
   ========================================================================= */
(function () {
  "use strict";

  var DEFAULT_LANGUAGE = "fr";
  var STORAGE_KEY = "emailSender.language";

  var LANGUAGES = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
  ];

  /* ----------------------------------------------------------------------- */
  /* Catalogues                                                              */
  /* ----------------------------------------------------------------------- */

  var STRINGS = {
    fr: {
      /* -- Document & barre latérale -------------------------------------- */
      "app.title": "Zm@il - Campagnes e-mail",
      "brand.name": "Zm@il",
      "brand.tagline": "Campagnes professionnelles",
      "nav.composer": "Rédaction",
      "nav.contacts": "Contacts",
      "nav.templates": "Modèles",
      "nav.settings": "Paramètres",
      "sidebar.notConfigured": "Non configuré",
      "sidebar.openSettings": "Ouvrez Paramètres pour commencer",
      "sidebar.statusTitle": "Configuration SMTP",
      "sidebar.statusOk": "Configuration SMTP complète",
      "sidebar.statusIncomplete": "Configuration SMTP incomplète",
      "sidebar.version": "Version 1.1 · {year}",

      /* -- Vue Rédaction -------------------------------------------------- */
      "composer.title": "Rédaction",
      "composer.subtitle": "Composez votre e-mail et vérifiez le rendu en direct à droite.",
      "composer.reset": "Réinitialiser",
      "composer.resetConfirm": "Effacer le message en cours de rédaction ?",
      "composer.resetDone": "Formulaire réinitialisé.",
      "composer.from": "Expéditeur",
      "composer.fromPlaceholder": "Renseignez vos paramètres SMTP",
      "composer.edit": "Modifier",
      "composer.to": "Destinataires",
      "composer.addGroup": "Ajouter un groupe…",
      "composer.allContacts": "Tous les contacts",
      "composer.clear": "Vider",
      "composer.subject": "Sujet",
      "composer.subjectPlaceholder": "Objet de votre e-mail",
      "composer.template": "Modèle",
      "composer.logo": "Logo",
      "composer.chooseLogo": "Choisir un logo",
      "composer.logoHint": "PNG, JPG, GIF, WEBP ou SVG · 15 Mo max",
      "composer.logoModeUrl": "Adresse web",
      "composer.logoModeUpload": "Téléversement",
      "composer.logoUrlPlaceholder": "https://exemple.com/logo.png",
      "composer.logoUrlHint":
        "L'image est chargée depuis le web : aucune pièce jointe dans l'e-mail.",
      "composer.logoUrlInvalid": "Adresse invalide : elle doit commencer par https://.",
      "composer.logoUploadHint":
        "Le logo est joint au message (il peut apparaître en pièce jointe).",
      "composer.removeLogo": "Retirer le logo",
      "composer.mainTitle": "Titre principal",
      "composer.mainTitlePlaceholder": "Le grand titre affiché dans l'e-mail",
      "composer.message": "Message",
      "composer.messagePlaceholder":
        "Bonjour,\n\nVotre message ici. Une ligne vide crée un nouveau paragraphe.",
      "composer.messageHint": "Les retours à la ligne sont conservés dans l'e-mail.",
      "composer.signature": "Signature",
      "composer.signaturePlaceholder":
        "Marie Dupont\nDirectrice commerciale\n+33 6 12 34 56 78",
      "composer.signatureHint": "La première ligne est mise en gras.",
      "composer.company": "Nom de l'entreprise",
      "composer.companyPlaceholder": "Ma Société",
      "composer.accent": "Couleur de l'e-mail",
      "composer.accentHint": "N'affecte que l'e-mail envoyé, pas l'interface.",
      "composer.invalidColor": "Couleur invalide : utilisez le format #2563eb.",
      "composer.cta": "Bouton d'action",
      "composer.ctaText": "Texte du bouton",
      "composer.ctaUrl": "Lien du bouton",
      "composer.ctaTextPlaceholder": "Rejoindre maintenant",
      "composer.ctaUrlPlaceholder": "https://exemple.com/inscription",
      "composer.ctaHint":
        "Les deux champs sont nécessaires : si l'un manque, aucun bouton n'apparaît.",
      "composer.video": "Vidéo",
      "composer.chooseThumb": "Choisir une image",
      "composer.removeThumb": "Retirer la vignette",
      "composer.videoThumbUploadHint":
        "La vignette est jointe au message (elle peut apparaître en pièce jointe).",
      "composer.videoThumb": "Image de la vignette",
      "composer.videoUrl": "Lien de la vidéo",
      "composer.videoThumbPlaceholder": "https://exemple.com/vignette.jpg",
      "composer.videoUrlPlaceholder": "https://youtube.com/watch?v=…",
      "composer.videoHint":
        "Un clic sur la vignette ouvre la vidéo dans le navigateur : aucun client " +
        "de messagerie ne sait lire une vidéo dans le message. Les deux champs " +
        "sont nécessaires.",
      "composer.social": "Réseaux sociaux",
      "composer.socialHint":
        "Seuls les réseaux renseignés apparaissent, en pastilles rondes dans le " +
        "pied de page de l'e-mail.",
      "composer.attachments": "Pièces jointes",
      "composer.addFiles": "Ajouter des fichiers",
      "composer.removeFile": "Retirer",

      /* -- Barre d'envoi -------------------------------------------------- */
      "send.button": "Envoyer",
      "send.buttonCount": "Envoyer ({count})",
      "send.sending": "Envoi…",
      "send.sendingBulk": "Envoi en cours…",
      "send.noRecipient": "Aucun destinataire",
      "send.toCount": "Envoi à {count} destinataire(s)",
      "send.hintNoConfig": "Configurez d'abord vos paramètres SMTP.",
      "send.hintNoRecipient": "Ajoutez au moins une adresse pour envoyer.",
      "send.hintDelay": "Envoi espacé d'une seconde entre chaque destinataire.",
      "send.hintReady": "Prêt à partir.",
      "send.confirm":
        "Envoyer cet e-mail à {count} destinataires ?\n\nL'envoi est espacé d'une seconde : comptez environ {seconds} seconde(s).",
      "send.needRecipient": "Ajoutez au moins un destinataire.",
      "send.needSubject": "Le sujet est obligatoire.",
      "send.needBody": "Écrivez un message avant d'envoyer.",
      "send.invalidAddresses": "Adresse(s) invalide(s) : {addresses}",
      "send.sentTitle": "Envoyé",
      "send.failedTitle": "Échec",

      /* -- Aperçu --------------------------------------------------------- */
      "preview.live": "Aperçu en direct",
      "preview.desktop": "Bureau",
      "preview.mobile": "Mobile",
      "preview.refresh": "Rafraîchir",
      "preview.frameTitle": "Aperçu de l'e-mail",
      "preview.from": "De",
      "preview.to": "À",
      "preview.subject": "Objet",
      "preview.noSubject": "(sans objet)",
      "preview.notConfigured": "(non configuré)",
      "preview.empty": "-",
      "preview.othersCount": "{email} + {count} autre(s)",
      "preview.unavailable": "Aperçu indisponible.",
      "preview.unavailableWith": "Aperçu indisponible : {error}",

      /* -- Vue Contacts --------------------------------------------------- */
      "contacts.title": "Contacts",
      "contacts.subtitle": "Gérez votre liste de destinataires et vos groupes.",
      "contacts.import": "Importer CSV / Excel",
      "contacts.name": "Nom",
      "contacts.namePlaceholder": "Jean Martin",
      "contacts.email": "E-mail",
      "contacts.emailPlaceholder": "jean@exemple.com",
      "contacts.group": "Groupe",
      "contacts.groupPlaceholder": "Clients",
      "contacts.add": "Ajouter",
      "contacts.search": "Rechercher un nom, un e-mail, un groupe…",
      "contacts.allGroups": "Tous les groupes",
      "contacts.addedOn": "Ajouté le",
      "contacts.actions": "Actions",
      "contacts.emptyTitle": "Aucun contact",
      "contacts.emptyHint":
        "Ajoutez un contact ci-dessus ou importez un fichier CSV / Excel (colonnes : <code>name</code>, <code>email</code>, <code>group</code>).",
      "contacts.count": "{count} contact(s)",
      "contacts.filtered": "{shown} / {total} contacts",
      "contacts.addToRecipients": "Ajouter aux destinataires",
      "contacts.delete": "Supprimer",
      "contacts.deleteConfirm": "Supprimer « {name} » du carnet de contacts ?",
      "contacts.thisContact": "ce contact",
      "contacts.added": "Contact ajouté.",
      "contacts.needValidEmail": "Saisissez une adresse e-mail valide.",
      "contacts.addedToRecipients": "{email} ajouté aux destinataires.",
      "contacts.alreadyRecipient": "Ce contact est déjà destinataire.",
      "contacts.loadError": "Chargement des contacts impossible : {error}",
      "contacts.importTitle": "Import",
      "defaultGroup": "Général",

      /* -- Destinataires -------------------------------------------------- */
      "recipients.count": "{count} destinataire(s)",
      "recipients.none": "0 destinataire",
      "recipients.remove": "Retirer",
      "recipients.suspicious":
        "{count} adresse(s) au format douteux ont été ajoutées en rouge.",
      "recipients.noMatch":
        "Aucun contact : appuyez sur Entrée pour utiliser cette adresse.",
      "recipients.groupAdded": "{count} contact(s) du groupe « {group} » ajouté(s).",
      "recipients.groupAlreadyIn": "Tous les contacts de ce groupe sont déjà dans la liste.",
      "recipients.bookEmpty": "Votre carnet de contacts est vide.",
      "recipients.added": "{count} contact(s) ajouté(s).",

      /* -- Fichiers ------------------------------------------------------- */
      "files.logoAdded": "Logo ajouté.",
      "files.thumbAdded": "Vignette ajoutée.",
      "files.attachmentsAdded": "{count} pièce(s) jointe(s) ajoutée(s).",

      /* -- Vue Modèles ---------------------------------------------------- */
      "templates.title": "Modèles",
      "templates.subtitle":
        "Dix mises en page testées sur Gmail, Outlook, Apple Mail et mobile.",
      "templates.use": "Utiliser",
      "templates.preview": "Aperçu",
      "templates.current": "Actuel",
      "templates.useThis": "Utiliser ce modèle",
      "templates.close": "Fermer",
      "templates.modalTitle": "Aperçu",
      "templates.frameTitle": "Aperçu du modèle",
      "templates.selected": "Modèle « {label} » sélectionné.",
      "templates.loadError": "Chargement des modèles impossible : {error}",

      /* -- Vue Paramètres ------------------------------------------------- */
      "settings.title": "Paramètres",
      "settings.subtitle":
        "Configuration du serveur d'envoi. Tout reste stocké sur votre ordinateur.",
      "settings.language": "Langue / Language",
      "settings.languageHint": "Change immédiatement toute l'interface.",
      "settings.theme": "Thème",
      "settings.themeHint": "Couleur d'accentuation de l'interface. Sans effet sur les e-mails.",
      "settings.themeSaved": "Couleur de l'interface : {color}.",
      "settings.themeError": "Enregistrement de la couleur impossible : {error}",
      "settings.languageSaved": "Langue enregistrée : {label}.",
      "settings.languageError": "Enregistrement de la langue impossible : {error}",
      "settings.presets": "Préréglages",
      "settings.server": "Serveur SMTP",
      "settings.port": "Port",
      "settings.email": "Adresse e-mail",
      "settings.emailPlaceholder": "vous@gmail.com",
      "settings.displayName": "Nom affiché",
      "settings.displayNamePlaceholder": "Marie Dupont - Ma Société",
      "settings.password": "Mot de passe d'application",
      "settings.passwordPlaceholder": "16 caractères sans espaces",
      "settings.passwordHint":
        "Stocké localement dans <code>data/config.json</code> (encodé en base64).",
      "settings.save": "Enregistrer",
      "settings.test": "Tester la connexion",
      "settings.testing": "Connexion en cours…",
      "settings.needServer": "Indiquez le serveur SMTP.",
      "settings.needEmail": "Indiquez une adresse e-mail d'expédition valide.",
      "settings.needPassword": "Indiquez votre mot de passe d'application.",
      "settings.presetApplied":
        "Préréglage {preset} appliqué. Pensez au mot de passe d'application.",
      "settings.connectionTitle": "Connexion SMTP",
      "settings.loadError": "Chargement de la configuration impossible : {error}",
      "settings.welcomeTitle": "Bienvenue",
      "settings.welcome":
        "Aucun compte d'envoi configuré. Ouvrez l'onglet Paramètres pour ajouter votre serveur SMTP.",

      /* -- Encadré « mot de passe d'application » ------------------------- */
      "note.title": "Mot de passe d'application",
      "note.intro":
        "Depuis 2022, Gmail, Outlook et Yahoo refusent votre mot de passe habituel pour les applications externes. Il faut créer un <strong>mot de passe d'application</strong> dédié.",
      "note.gmail1": "Activez la validation en deux étapes sur votre compte Google.",
      "note.gmail2": "Ouvrez <code>myaccount.google.com/apppasswords</code>.",
      "note.gmail3": "Créez un mot de passe pour « Autre (nom personnalisé) ».",
      "note.gmail4": "Copiez les 16 caractères ici, <strong>sans les espaces</strong>.",
      "note.outlookTitle": "Outlook / Microsoft 365",
      "note.outlook1": "Serveur <code>smtp.office365.com</code>, port <code>587</code>.",
      "note.outlook2":
        "Créez un mot de passe d'application dans la sécurité du compte (la validation en deux étapes doit être active).",
      "note.yahoo1": "Serveur <code>smtp.mail.yahoo.com</code>, port <code>587</code>.",
      "note.yahoo2":
        "Rubrique « Sécurité du compte » → « Générer un mot de passe d'application ».",
      "note.warn":
        "Un envoi vers plus de 50 destinataires d'un coup peut être bloqué par votre fournisseur. L'application espace automatiquement les envois d'une seconde.",

      /* -- Notifications -------------------------------------------------- */
      "toast.ok": "Succès",
      "toast.err": "Erreur",
      "toast.warn": "Attention",
      "toast.info": "Information",
      "toast.close": "Fermer",
      "error.generic": "Erreur {status}.",

      /* -- Divers --------------------------------------------------------- */
      "unit.bytes": "{size} o",
      "unit.kb": "{size} Ko",
      "unit.mb": "{size} Mo",
      "locale": "fr-FR",
    },

    en: {
      /* -- Document & sidebar --------------------------------------------- */
      "app.title": "Zm@il - Email campaigns",
      "brand.name": "Zm@il",
      "brand.tagline": "Professional campaigns",
      "nav.composer": "Compose",
      "nav.contacts": "Contacts",
      "nav.templates": "Templates",
      "nav.settings": "Settings",
      "sidebar.notConfigured": "Not configured",
      "sidebar.openSettings": "Open Settings to get started",
      "sidebar.statusTitle": "SMTP configuration",
      "sidebar.statusOk": "SMTP configuration complete",
      "sidebar.statusIncomplete": "SMTP configuration incomplete",
      "sidebar.version": "Version 1.1 · {year}",

      /* -- Compose view --------------------------------------------------- */
      "composer.title": "Compose",
      "composer.subtitle": "Write your email and check the live preview on the right.",
      "composer.reset": "Reset",
      "composer.resetConfirm": "Discard the message you are writing?",
      "composer.resetDone": "Form reset.",
      "composer.from": "Sender",
      "composer.fromPlaceholder": "Fill in your SMTP settings",
      "composer.edit": "Edit",
      "composer.to": "Recipients",
      "composer.addGroup": "Add a group…",
      "composer.allContacts": "All contacts",
      "composer.clear": "Clear",
      "composer.subject": "Subject",
      "composer.subjectPlaceholder": "Your email subject",
      "composer.template": "Template",
      "composer.logo": "Logo",
      "composer.chooseLogo": "Choose a logo",
      "composer.logoHint": "PNG, JPG, GIF, WEBP or SVG · 15 MB max",
      "composer.logoModeUrl": "Web address",
      "composer.logoModeUpload": "Upload",
      "composer.logoUrlPlaceholder": "https://example.com/logo.png",
      "composer.logoUrlHint":
        "The image loads from the web: no attachment in the email.",
      "composer.logoUrlInvalid": "Invalid address: it must start with https://.",
      "composer.logoUploadHint":
        "The logo is attached to the message (it may show up as an attachment).",
      "composer.removeLogo": "Remove the logo",
      "composer.mainTitle": "Main title",
      "composer.mainTitlePlaceholder": "The large heading shown in the email",
      "composer.message": "Message",
      "composer.messagePlaceholder":
        "Hello,\n\nYour message here. An empty line starts a new paragraph.",
      "composer.messageHint": "Line breaks are preserved in the email.",
      "composer.signature": "Signature",
      "composer.signaturePlaceholder":
        "Mary Davis\nSales Director\n+44 20 7946 0123",
      "composer.signatureHint": "The first line is shown in bold.",
      "composer.company": "Company name",
      "composer.companyPlaceholder": "My Company",
      "composer.accent": "Email colour",
      "composer.accentHint": "Affects the sent email only, not the interface.",
      "composer.invalidColor": "Invalid colour: use the #2563eb format.",
      "composer.cta": "Call-to-action button",
      "composer.ctaText": "Button text",
      "composer.ctaUrl": "Button link",
      "composer.ctaTextPlaceholder": "Join now",
      "composer.ctaUrlPlaceholder": "https://example.com/signup",
      "composer.ctaHint":
        "Both fields are required: if either is missing, no button is rendered.",
      "composer.video": "Video",
      "composer.chooseThumb": "Choose an image",
      "composer.removeThumb": "Remove thumbnail",
      "composer.videoThumbUploadHint":
        "The thumbnail travels with the message (it may show as an attachment).",
      "composer.videoThumb": "Thumbnail image",
      "composer.videoUrl": "Video link",
      "composer.videoThumbPlaceholder": "https://example.com/thumbnail.jpg",
      "composer.videoUrlPlaceholder": "https://youtube.com/watch?v=…",
      "composer.videoHint":
        "Clicking the thumbnail opens the video in the browser: no email client " +
        "can play a video inside the message. Both fields are required.",
      "composer.social": "Social media",
      "composer.socialHint":
        "Only the networks you fill in are shown, as round badges in the email " +
        "footer.",
      "composer.attachments": "Attachments",
      "composer.addFiles": "Add files",
      "composer.removeFile": "Remove",

      /* -- Send bar ------------------------------------------------------- */
      "send.button": "Send",
      "send.buttonCount": "Send ({count})",
      "send.sending": "Sending…",
      "send.sendingBulk": "Sending…",
      "send.noRecipient": "No recipient",
      "send.toCount": "Sending to {count} recipient(s)",
      "send.hintNoConfig": "Set up your SMTP settings first.",
      "send.hintNoRecipient": "Add at least one address to send.",
      "send.hintDelay": "Sends are spaced one second apart.",
      "send.hintReady": "Ready to go.",
      "send.confirm":
        "Send this email to {count} recipients?\n\nSends are spaced one second apart: expect about {seconds} second(s).",
      "send.needRecipient": "Add at least one recipient.",
      "send.needSubject": "The subject is required.",
      "send.needBody": "Write a message before sending.",
      "send.invalidAddresses": "Invalid address(es): {addresses}",
      "send.sentTitle": "Sent",
      "send.failedTitle": "Failed",

      /* -- Preview -------------------------------------------------------- */
      "preview.live": "Live preview",
      "preview.desktop": "Desktop",
      "preview.mobile": "Mobile",
      "preview.refresh": "Refresh",
      "preview.frameTitle": "Email preview",
      "preview.from": "From",
      "preview.to": "To",
      "preview.subject": "Subject",
      "preview.noSubject": "(no subject)",
      "preview.notConfigured": "(not configured)",
      "preview.empty": "-",
      "preview.othersCount": "{email} + {count} more",
      "preview.unavailable": "Preview unavailable.",
      "preview.unavailableWith": "Preview unavailable: {error}",

      /* -- Contacts view -------------------------------------------------- */
      "contacts.title": "Contacts",
      "contacts.subtitle": "Manage your recipient list and your groups.",
      "contacts.import": "Import CSV / Excel",
      "contacts.name": "Name",
      "contacts.namePlaceholder": "John Miller",
      "contacts.email": "Email",
      "contacts.emailPlaceholder": "john@example.com",
      "contacts.group": "Group",
      "contacts.groupPlaceholder": "Customers",
      "contacts.add": "Add",
      "contacts.search": "Search a name, an email, a group…",
      "contacts.allGroups": "All groups",
      "contacts.addedOn": "Added on",
      "contacts.actions": "Actions",
      "contacts.emptyTitle": "No contact",
      "contacts.emptyHint":
        "Add a contact above or import a CSV / Excel file (columns: <code>name</code>, <code>email</code>, <code>group</code>).",
      "contacts.count": "{count} contact(s)",
      "contacts.filtered": "{shown} / {total} contacts",
      "contacts.addToRecipients": "Add to recipients",
      "contacts.delete": "Delete",
      "contacts.deleteConfirm": "Delete “{name}” from your address book?",
      "contacts.thisContact": "this contact",
      "contacts.added": "Contact added.",
      "contacts.needValidEmail": "Enter a valid email address.",
      "contacts.addedToRecipients": "{email} added to the recipients.",
      "contacts.alreadyRecipient": "This contact is already a recipient.",
      "contacts.loadError": "Could not load contacts: {error}",
      "contacts.importTitle": "Import",
      "defaultGroup": "General",

      /* -- Recipients ----------------------------------------------------- */
      "recipients.count": "{count} recipient(s)",
      "recipients.none": "0 recipient",
      "recipients.remove": "Remove",
      "recipients.suspicious":
        "{count} address(es) look malformed and were added in red.",
      "recipients.noMatch": "No contact: press Enter to use this address.",
      "recipients.groupAdded": "{count} contact(s) from group “{group}” added.",
      "recipients.groupAlreadyIn": "Every contact in this group is already listed.",
      "recipients.bookEmpty": "Your address book is empty.",
      "recipients.added": "{count} contact(s) added.",

      /* -- Files ---------------------------------------------------------- */
      "files.logoAdded": "Logo added.",
      "files.thumbAdded": "Thumbnail added.",
      "files.attachmentsAdded": "{count} attachment(s) added.",

      /* -- Templates view ------------------------------------------------- */
      "templates.title": "Templates",
      "templates.subtitle":
        "Ten layouts tested on Gmail, Outlook, Apple Mail and mobile.",
      "templates.use": "Use",
      "templates.preview": "Preview",
      "templates.current": "Current",
      "templates.useThis": "Use this template",
      "templates.close": "Close",
      "templates.modalTitle": "Preview",
      "templates.frameTitle": "Template preview",
      "templates.selected": "Template “{label}” selected.",
      "templates.loadError": "Could not load templates: {error}",

      /* -- Settings view -------------------------------------------------- */
      "settings.title": "Settings",
      "settings.subtitle":
        "Sending server configuration. Everything stays on your computer.",
      "settings.language": "Language / Langue",
      "settings.languageHint": "Updates the whole interface immediately.",
      "settings.theme": "Theme",
      "settings.themeHint": "Interface accent colour. Has no effect on emails.",
      "settings.themeSaved": "Interface colour: {color}.",
      "settings.themeError": "Could not save the colour: {error}",
      "settings.languageSaved": "Language saved: {label}.",
      "settings.languageError": "Could not save the language: {error}",
      "settings.presets": "Presets",
      "settings.server": "SMTP server",
      "settings.port": "Port",
      "settings.email": "Email address",
      "settings.emailPlaceholder": "you@gmail.com",
      "settings.displayName": "Display name",
      "settings.displayNamePlaceholder": "Mary Davis - My Company",
      "settings.password": "App password",
      "settings.passwordPlaceholder": "16 characters, no spaces",
      "settings.passwordHint":
        "Stored locally in <code>data/config.json</code> (base64 encoded).",
      "settings.save": "Save",
      "settings.test": "Test connection",
      "settings.testing": "Connecting…",
      "settings.needServer": "Enter the SMTP server.",
      "settings.needEmail": "Enter a valid sender email address.",
      "settings.needPassword": "Enter your app password.",
      "settings.presetApplied":
        "{preset} preset applied. Remember the app password.",
      "settings.connectionTitle": "SMTP connection",
      "settings.loadError": "Could not load the configuration: {error}",
      "settings.welcomeTitle": "Welcome",
      "settings.welcome":
        "No sending account configured yet. Open the Settings tab to add your SMTP server.",

      /* -- App password panel --------------------------------------------- */
      "note.title": "App password",
      "note.intro":
        "Since 2022, Gmail, Outlook and Yahoo reject your usual password for external applications. You need to create a dedicated <strong>app password</strong>.",
      "note.gmail1": "Turn on two-step verification on your Google account.",
      "note.gmail2": "Open <code>myaccount.google.com/apppasswords</code>.",
      "note.gmail3": "Create a password for “Other (custom name)”.",
      "note.gmail4": "Copy the 16 characters here, <strong>without the spaces</strong>.",
      "note.outlookTitle": "Outlook / Microsoft 365",
      "note.outlook1": "Server <code>smtp.office365.com</code>, port <code>587</code>.",
      "note.outlook2":
        "Create an app password in your account security settings (two-step verification must be on).",
      "note.yahoo1": "Server <code>smtp.mail.yahoo.com</code>, port <code>587</code>.",
      "note.yahoo2":
        "Go to “Account security” → “Generate app password”.",
      "note.warn":
        "Sending to more than 50 recipients at once may be blocked by your provider. The app automatically spaces sends one second apart.",

      /* -- Notifications -------------------------------------------------- */
      "toast.ok": "Success",
      "toast.err": "Error",
      "toast.warn": "Warning",
      "toast.info": "Information",
      "toast.close": "Close",
      "error.generic": "Error {status}.",

      /* -- Misc ----------------------------------------------------------- */
      "unit.bytes": "{size} B",
      "unit.kb": "{size} KB",
      "unit.mb": "{size} MB",
      "locale": "en-GB",
    },
  };

  /* ----------------------------------------------------------------------- */
  /* Moteur                                                                  */
  /* ----------------------------------------------------------------------- */

  var listeners = [];
  var current = DEFAULT_LANGUAGE;

  function normalize(code) {
    var value = String(code || "").trim().toLowerCase().replace(/_/g, "-");
    if (!value) return DEFAULT_LANGUAGE;
    if (STRINGS[value]) return value;
    var base = value.split("-")[0];
    return STRINGS[base] ? base : DEFAULT_LANGUAGE;
  }

  /** Langue mémorisée par le navigateur. Ne lève jamais : stockage souvent bloqué. */
  function stored() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function remember(code) {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (error) {
      // Stockage indisponible (mode privé) : la langue reste celle du serveur.
    }
  }

  /**
   * Traduit une clé. Les variables {nom} sont remplacées par vars.nom.
   * Clé absente -> repli sur le français, puis sur la clé elle-même : une
   * traduction oubliée n'efface jamais un libellé à l'écran.
   */
  function t(key, vars) {
    var table = STRINGS[current] || STRINGS[DEFAULT_LANGUAGE];
    var value = table[key];
    if (value === undefined) value = STRINGS[DEFAULT_LANGUAGE][key];
    if (value === undefined) return key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match;
    });
  }

  /** Traduit tous les éléments marqués d'un sous-arbre (document par défaut). */
  function apply(root) {
    var scope = root || document;
    var attrs = [
      ["data-i18n", "text"],
      ["data-i18n-html", "html"],
      ["data-i18n-placeholder", "placeholder"],
      ["data-i18n-title", "title"],
      ["data-i18n-aria-label", "aria-label"],
    ];

    attrs.forEach(function (pair) {
      var selector = "[" + pair[0] + "]";
      var nodes = scope.querySelectorAll(selector);
      Array.prototype.forEach.call(nodes, function (node) {
        var key = node.getAttribute(pair[0]);
        if (!key) return;
        var value = t(key);
        if (pair[1] === "text") node.textContent = value;
        else if (pair[1] === "html") node.innerHTML = value;
        else node.setAttribute(pair[1], value);
      });
    });

    if (!root) {
      document.documentElement.lang = current;
      document.documentElement.setAttribute("data-lang", current);
      document.title = t("app.title");
    }
  }

  /** Change la langue, retraduit la page et notifie les abonnés. */
  function set(code, options) {
    var next = normalize(code);
    var force = !!(options && options.force);

    // Rien a faire si la langue est deja active : on sort AVANT apply().
    // apply() rend aux elements dynamiques (carte du compte, barre d'envoi,
    // compteurs...) leur libelle par defaut ; ce sont les abonnes qui y
    // reinjectent ensuite les vraies valeurs. Les deux doivent donc toujours
    // s'executer ensemble, sinon l'interface reste sur le texte de repli.
    if (next === current && !force) {
      remember(next);
      return next;
    }

    current = next;
    remember(next);
    apply();
    listeners.forEach(function (fn) {
      try {
        fn(next);
      } catch (error) {
        console.error("i18n listener", error);
      }
    });
    return next;
  }

  function label(code) {
    var found = LANGUAGES.filter(function (l) {
      return l.code === normalize(code);
    })[0];
    return found ? found.label : normalize(code);
  }

  /**
   * Langue de depart : celle injectee par le serveur (donc celle enregistree
   * dans data/config.json, aucun clignotement), sinon celle memorisee par le
   * navigateur, sinon le francais.
   */
  function initial() {
    var fromServer = document.documentElement.getAttribute("data-lang");
    return normalize(fromServer || stored() || DEFAULT_LANGUAGE);
  }

  window.I18N = {
    languages: LANGUAGES,
    defaultLanguage: DEFAULT_LANGUAGE,
    storageKey: STORAGE_KEY,
    current: function () {
      return current;
    },
    normalize: normalize,
    stored: stored,
    initial: initial,
    label: label,
    t: t,
    apply: apply,
    set: set,
    onChange: function (fn) {
      if (typeof fn === "function") listeners.push(fn);
    },
  };

  // Applique la langue initiale des le chargement du script, avant le premier
  // rendu de app.js : l'interface n'affiche jamais la mauvaise langue.
  current = initial();
})();
