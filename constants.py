"""
Constantes de déploiement / Deployment constants.

Ce fichier rassemble les réglages qui dépendent de l'hébergement, pas du code.
C'est le seul endroit à modifier pour les changer : rien n'est dupliqué ailleurs.
"""

from __future__ import annotations

# --------------------------------------------------------------------------- #
# ADRESSES DES ICÔNES DE RÉSEAUX SOCIAUX
#
# Ces images sont affichées dans le pied de page des e-mails envoyés, en
# <img src="..."> pointant vers une adresse publique. Elles ne peuvent pas être
# intégrées au message : six pièces jointes apparaîtraient dans Gmail. Un SVG
# inline ne fonctionne pas non plus, Gmail et Outlook le suppriment.
#
# Les adresses par défaut ci-dessous pointent vers le dépôt GitHub personnel de
# l'auteur du projet. Elles fonctionnent telles quelles, mais ce sont des fichiers
# hébergés par un tiers : si vous préférez ne pas en dépendre, les mêmes PNG sont
# fournis dans assets/social-icons/. Déposez-les où vous voulez et remplacez les
# six adresses ici.
#
# CHANGER D'HÉBERGEUR : remplacez les six adresses ci-dessous, et rien d'autre
# dans le projet. Aucun autre fichier ne contient ces URL.
#
# Les adresses doivent être en https, publiques, et servir directement le PNG.
# Sur GitHub, la forme « raw.githubusercontent.com/<compte>/<dépôt>/<branche>/… »
# est préférée à « github.com/…/blob/…?raw=true » : la seconde fonctionne, mais
# passe par deux redirections avant d'atteindre l'image.
#
# Laisser une entrée vide est permis : le réseau correspondant s'affiche alors
# avec une pastille de la couleur de l'e-mail, sans pictogramme. Aucune image
# cassée n'est jamais envoyée.
# --------------------------------------------------------------------------- #

_ICON_BASE = "https://raw.githubusercontent.com/Dool-creator/ZMAIL/main/assets/social-icons"

SOCIAL_ICON_URLS: dict[str, str] = {
    "instagram": f"{_ICON_BASE}/instagram.png",
    "facebook": f"{_ICON_BASE}/facebook.png",
    "youtube": f"{_ICON_BASE}/youtube.png",
    "linkedin": f"{_ICON_BASE}/linkedin.png",
    "x": f"{_ICON_BASE}/x.png",
    "tiktok": f"{_ICON_BASE}/tiktok.png",
}

# Taille d'affichage des pastilles dans l'e-mail, en pixels. Les PNG fournis
# font 96 px de côté : ils restent nets sur un écran à haute densité.
SOCIAL_ICON_SIZE = 36
