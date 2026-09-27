# Zm@il

Application locale d'envoi de campagnes e-mail : rédaction avec aperçu en direct,
carnet de contacts, dix modèles HTML responsive et envoi par votre propre
serveur SMTP. Interface disponible en **français** et en **anglais**. Tout reste sur
votre ordinateur : aucune donnée n'est transmise à un service tiers, seul l'envoi des
e-mails nécessite une connexion internet.

---

## Premiers pas

Un dépôt fraîchement cloné ne contient **aucune donnée personnelle** : pas de
configuration SMTP, pas de contacts, aucun fichier téléversé. Au premier lancement,
`data/config.json` et `data/contacts.json` sont créés vides, et `static/uploads/` est
créé s'il manque.

Conséquence : **l'envoi reste indisponible tant que l'onglet Paramètres n'est pas
rempli.** Renseignez-y votre serveur SMTP, votre adresse et votre mot de passe
d'application, testez la connexion, puis enregistrez : la pastille de la barre
latérale passe au vert. Le détail des étapes est dans « Première utilisation ».

Votre configuration et vos contacts restent sur votre machine. Ces fichiers sont
exclus par `.gitignore` et ne partent jamais sur GitHub.

---

## Démarrage

```bash
pip install -r requirements.txt
```

```bash
# ou, si « pip » n'est pas reconnu :
python -m pip install -r requirements.txt
```

La seconde forme est la plus sûre : elle installe les dépendances dans
l'installation Python qui s'exécute réellement, alors que `pip` seul dépend du
PATH et peut manquer ou viser un autre interpréteur. Utilisez-la si la première
commande répond que `pip` n'est pas reconnu, ce qui arrive couramment sous
Windows.

```bash
python main.py
```

Ouvrez ensuite **http://localhost:8000** dans votre navigateur.

Au démarrage, les dossiers `data/` et `static/uploads/` sont créés automatiquement
s'ils n'existent pas.

> Python 3.10 ou plus récent est requis (testé jusqu'à Python 3.14).

---

## Première utilisation

1. Ouvrez l'onglet **Paramètres**.
2. Cliquez sur un préréglage (**Gmail**, **Outlook** ou **Yahoo**), ou saisissez
   votre propre serveur SMTP.
3. Renseignez votre adresse e-mail et votre **mot de passe d'application**
   (voir ci-dessous) puis cliquez sur **Tester la connexion**.
4. Cliquez sur **Enregistrer** : la pastille de la barre latérale passe au vert.
5. Retournez dans **Rédaction**, ajoutez des destinataires et envoyez.

### Changer de langue

Onglet **Paramètres**, section **Langue / Language** en haut de la page. Le choix
s'applique immédiatement à toute l'interface, sans recharger la page, et il est
enregistré dans `data/config.json` ainsi que dans le stockage local du navigateur.
Le français est la langue par défaut.

Ce que la langue change :

- tous les libellés, boutons, champs, infobulles et notifications de l'interface ;
- les messages renvoyés par le serveur (erreurs SMTP, confirmations, imports) ;
- les textes fixes des e-mails envoyés (pied de page, mentions, libellés) ;
- le contenu d'exemple affiché dans les aperçus de modèles.

Ce que la langue **ne change jamais** : le texte que vous saisissez. Vous pouvez
utiliser l'interface en anglais et écrire vos e-mails en français, ou l'inverse.
Le nom des groupes de contacts est également une donnée : il reste tel que vous
l'avez saisi.

### Changer la couleur de l'interface

Onglet **Paramètres**, section **Thème**. La couleur choisie habille toute l'interface
(élément actif de la barre latérale, boutons, liens, anneaux de focus) et est enregistrée
dans `data/config.json`. Les fonds sombres ne changent pas.

Cette couleur est **indépendante** de la « Couleur de l'e-mail » de la vue Rédaction :
la première ne concerne que l'application, la seconde ne concerne que le message envoyé.

### Mot de passe d'application

Gmail, Outlook et Yahoo refusent votre mot de passe habituel pour les applications
externes. Vous devez créer un mot de passe dédié :

| Fournisseur | Serveur | Port | Où créer le mot de passe |
|---|---|---|---|
| Gmail | `smtp.gmail.com` | 587 | `myaccount.google.com/apppasswords` (validation en deux étapes requise) |
| Outlook / Microsoft 365 | `smtp.office365.com` | 587 | Sécurité du compte Microsoft → mots de passe d'application |
| Yahoo | `smtp.mail.yahoo.com` | 587 | Sécurité du compte → « Générer un mot de passe d'application » |

Collez les 16 caractères **sans les espaces**. Un serveur SMTP personnalisé
fonctionne aussi : port 587 (STARTTLS) ou 465 (SSL).

---

## Les quatre vues

### Rédaction
Éditeur à gauche, aperçu en direct à droite. L'aperçu est rendu par le serveur
avec le même moteur que l'envoi réel : ce que vous voyez est exactement ce que le
destinataire recevra.

- **Destinataires** : autocomplétion depuis le carnet de contacts, saisie manuelle
  (Entrée, virgule ou point-virgule pour valider), collage d'une liste d'adresses,
  ajout d'un groupe entier ou de tous les contacts.
- **Logo** : deux modes au choix.
  - **Adresse web** (par défaut) : collez l'adresse publique de votre image
    (`https://…`). Elle est utilisée telle quelle dans l'e-mail, qui ne contient alors
    **aucune pièce jointe** : l'image est chargée par le client de messagerie, comme le
    font Mailchimp ou Supabase. La dernière adresse saisie est mémorisée.
  - **Téléversement** : choisissez un fichier, il est intégré au message (pièce jointe
    inline `cid:`). Utile si votre logo n'est hébergé nulle part, mais il apparaît alors
    comme pièce jointe dans Gmail.
- **Message** : les retours à la ligne sont conservés, une ligne vide crée un
  nouveau paragraphe.
- **Signature** : la première ligne est mise en gras automatiquement.
- **Couleur de l'e-mail** : couleur d'accentuation du message envoyé (bandeau, filets,
  boutons du modèle). Sans effet sur l'interface, qui se règle dans Paramètres > Thème.
- **Pièces jointes** : plusieurs fichiers, 15 Mo maximum chacun.
- **Raccourci** : `Ctrl + Entrée` (ou `Cmd + Entrée`) pour envoyer.

Au-delà d'un destinataire, l'envoi est automatiquement espacé d'une seconde afin
de limiter les blocages anti-spam ; chaque personne reçoit un message individuel
(les autres destinataires ne sont pas visibles).

### Contacts
Tableau filtrable (recherche libre et filtre par groupe), ajout manuel, suppression,
et bouton **→** pour envoyer directement à un contact.

**Import CSV / Excel**. Colonnes attendues : `name`, `email`, `group`
(la troisième est facultative). Les en-têtes français sont également reconnus
(`nom`, `courriel`, `groupe`…), tout comme les fichiers exportés par Excel en
point-virgule. Les doublons et les adresses invalides sont ignorés et signalés.

```csv
name,email,group
Jean Martin,jean@exemple.com,Clients
Alice Bernard,alice@exemple.com,VIP
```

### Modèles
| Modèle | Usage | Description |
|---|---|---|
| **Newsletter** | Lettre d'information | Bandeau coloré, logo centré, grand titre, pied de page complet |
| **Professionnel** | Courrier d'entreprise | Fond blanc épuré, logo en haut à gauche, bloc de signature formel |
| **Invitation** | Événement | En-tête en dégradé, mise en page centrée, encart d'appel à l'action |
| **Minimaliste** | Message court | Aucun bandeau, typographie aérée, message sobre |
| **Promotion** | Soldes, offre, lancement | Fond noir, titre géant, bande d'appel à l'action, ton percutant |
| **Bienvenue** | Nouveau client ou abonné | Carte arrondie, pastille ronde, aplat doux, ton chaleureux |
| **Reçu** | Commande, paiement, réservation | Panneau de détails encadré, police à chasse fixe, ton transactionnel |
| **Annonce** | Nouveauté, actualité | Grand hero sombre, titre en serif, mise en page éditoriale |
| **Remerciement** | Après un achat ou un événement | Fond crème, grand mot en italique, composition centrée |
| **Alerte** | Notification, rappel, incident | Barre d'état colorée, encadré technique, mise en page compacte |

Tous sont construits en tableaux HTML avec CSS en ligne uniquement, testés pour
Gmail, Outlook, Apple Mail et les clients mobiles, avec une version texte brut
générée automatiquement. Chacun s'adapte quand vous n'avez pas de logo, pas de
signature ou pas de nom d'entreprise.

### Paramètres
Configuration SMTP, préréglages, test de connexion et rappel de la procédure de
mot de passe d'application.

---

## Structure du projet

```
Zmail/
├── main.py                 # Backend FastAPI : API, rendu des modèles, envoi SMTP
├── i18n.py                 # Traductions serveur : messages API, textes des e-mails
├── constants.py            # Adresses des icônes sociales (SOCIAL_ICON_URLS)
├── assets/
│   └── social-icons/       # Les 6 icônes PNG à héberger
├── requirements.txt
├── README.md
├── static/
│   ├── css/style.css       # Thème sombre
│   ├── js/i18n.js          # Traductions de l'interface (FR / EN)
│   ├── js/app.js           # Logique de l'interface
│   └── uploads/            # Logos et pièces jointes téléversés
├── templates/
│   ├── index.html          # Interface (page unique)
│   └── email_templates/    # Les dix modèles d'e-mail
│       ├── newsletter.html
│       ├── business.html
│       ├── invitation.html
│       ├── minimal.html
│       ├── promotion.html
│       ├── welcome.html
│       ├── receipt.html
│       ├── announcement.html
│       ├── thankyou.html
│       └── alert.html
└── data/
    ├── contacts.json       # [{ id, name, email, group, created_at }]
    └── config.json         # Paramètres SMTP + langue (mot de passe encodé en base64)
```

---

## API

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/` | Interface |
| `POST` | `/api/send` | Envoi à un ou plusieurs destinataires |
| `POST` | `/api/send-bulk` | Envoi en masse, une seconde entre chaque destinataire |
| `POST` | `/api/upload` | Téléversement d'un logo ou d'une pièce jointe |
| `GET` | `/api/contacts` | Liste des contacts (`?q=` et `?group=` pour filtrer) |
| `POST` | `/api/contacts` | Ajout d'un contact ou d'une liste de contacts |
| `POST` | `/api/contacts/import` | Import CSV ou XLSX |
| `DELETE` | `/api/contacts/{id}` | Suppression d'un contact |
| `GET` | `/api/templates` | Liste des modèles disponibles |
| `GET` | `/api/templates/{nom}/preview` | Aperçu d'un modèle avec des données d'exemple |
| `POST` | `/api/preview` | Aperçu avec vos propres variables (aperçu en direct) |
| `GET` | `/api/config` | Configuration SMTP et langue (mot de passe masqué) |
| `POST` | `/api/config` | Enregistrement de la configuration SMTP |
| `POST` | `/api/config/test` | Test de connexion et d'authentification SMTP |
| `POST` | `/api/language` | Enregistrement de la langue (`{ "language": "fr" \| "en" }`) |
| `POST` | `/api/theme` | Couleur de l'interface (`{ "ui_accent_color": "#2563eb" }`) |
| `POST` | `/api/logo` | Dernière adresse de logo (`{ "logo_url": "https://…" }`) |

Exemple d'envoi :

```json
POST /api/send
{
  "to": ["client@exemple.com"],
  "subject": "Invitation à notre soirée annuelle",
  "template": "invitation",
  "variables": {
    "logo_url": "logo-a1b2c3d4.png",
    "title": "Soirée annuelle 2026",
    "body": "Bonjour,\n\nNous avons le plaisir de vous convier…",
    "signature": "Marie Dupont\nDirectrice de la communication",
    "company_name": "Ma Société",
    "accent_color": "#2563eb"
  },
  "attachments": ["programme-e5f6a7b8.pdf"]
}
```

Toutes les erreurs répondent avec `{ "ok": false, "message": "…" }`, message prêt à
être affiché. La langue de la réponse suit l'en-tête `X-Language` (`fr` ou `en`)
envoyé par l'interface ; sans cet en-tête, le serveur utilise la langue enregistrée
dans `data/config.json`.

---

## Notes

- **Mot de passe** : `data/config.json` encode le mot de passe en base64. C'est un
  encodage, pas un chiffrement : il évite la lecture accidentelle, mais protégez ce
  fichier comme n'importe quel fichier de configuration sensible.
- **Changer de port** : `set EMAIL_SENDER_PORT=9000` (Windows) ou
  `export EMAIL_SENDER_PORT=9000` avant `python main.py`.
- **Accès depuis un autre appareil** : l'application n'écoute que sur `127.0.0.1`.
  Pour l'exposer sur votre réseau local, utilisez `EMAIL_SENDER_HOST=0.0.0.0`.
  À ne faire que sur un réseau de confiance : l'application n'a pas d'authentification.
- **Limites d'envoi** : Gmail accepte environ 500 destinataires par jour,
  Outlook environ 300. Au-delà, votre compte peut être temporairement bloqué.
- **Ajouter un modèle** : déposez un fichier `.html` dans
  `templates/email_templates/` utilisant les variables `logo_url`, `title`, `body`,
  `signature`, `company_name`, `accent_color`, `year`, `lang` et `t` (dictionnaire de
  textes traduits). Ajoutez son libellé et sa description dans `TEMPLATE_META`
  (`i18n.py`, français et anglais) et son nom dans `TEMPLATE_ORDER` pour fixer sa place
  dans la liste.
- **Ajouter une langue** : ajoutez son code à `LANGUAGES` dans `i18n.py`, puis un bloc
  complet dans `MESSAGES`, `EMAIL_STRINGS`, `TEMPLATE_META` et `SAMPLE_CONTENT` du même
  fichier, ainsi que dans `STRINGS` et `LANGUAGES` de `static/js/i18n.js`. Une clé
  oubliée retombe automatiquement sur le français, sans casser l'affichage.

---

## Icônes des réseaux sociaux

Les pastilles affichées dans le pied de page des e-mails sont des images PNG
chargées depuis une adresse publique. Ce n'est pas un choix esthétique : Gmail et
Outlook suppriment les `<svg>` à la réception, et intégrer les six icônes au
message ferait apparaître six pièces jointes.

**Les adresses par défaut pointent vers le dépôt GitHub personnel de l'auteur**
(`raw.githubusercontent.com/Dool-creator/ZMAIL/main/assets/social-icons/`). Elles
fonctionnent telles quelles, mais ce sont des fichiers servis par un compte tiers :
si ce dépôt est renommé, rendu privé ou supprimé, les pastilles cessent de s'afficher
dans les e-mails déjà envoyés.

Si vous préférez ne pas dépendre d'un dépôt tiers, hébergez vos propres copies :
les six fichiers sont fournis dans `assets/social-icons/`, il suffit de les
déposer où vous voulez (GitHub, un CDN, votre propre serveur) et de remplacer les
adresses dans **`constants.py`** :

```python
SOCIAL_ICON_URLS = {
    "instagram": "https://votre-domaine.example/icons/instagram.png",
    "facebook":  "https://votre-domaine.example/icons/facebook.png",
    "youtube":   "https://votre-domaine.example/icons/youtube.png",
    "linkedin":  "https://votre-domaine.example/icons/linkedin.png",
    "x":         "https://votre-domaine.example/icons/x.png",
    "tiktok":    "https://votre-domaine.example/icons/tiktok.png",
}
```

C'est le **seul** endroit à modifier : aucune de ces adresses n'apparaît ailleurs
dans le projet. Les adresses doivent être en `https` et servir directement le
fichier PNG (sur GitHub, utilisez le lien **raw**, pas la page du fichier).

Laisser une entrée vide est permis : le réseau concerné s'affiche alors avec une
pastille de la couleur de l'e-mail, sans pictogramme. Aucune image cassée n'est
jamais envoyée.

---

## Licence

Ce projet est distribué sous licence MIT : vous pouvez l'utiliser, le modifier et
le redistribuer, y compris à des fins commerciales, à condition de conserver la
mention de copyright. Le texte complet est dans le fichier [LICENSE](LICENSE).
