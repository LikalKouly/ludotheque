# La Ludothèque (Ludoteca) — contexte du projet

Jeu d'aventure inspiré de Lazy Jones (1984), en français. Échanger avec l'équipe en français, simplement : ce ne sont pas des développeurs.

## Le jeu en bref

- **Héroïne** : Nella, poupée de **5 cm** (couettes noires, rubans rouges, yeux bleus, gilet marine, jupe rouge à pois, clé en laiton). Elle a perdu la mémoire : ses pages de livre ont été arrachées.
- **Twist** : Nella est *le bug* des jeux, sans le savoir. Son nom vient de *Coccinella*.
- **Il Mago** est le codeur qui tente de supprimer les bugs. Il reste **invisible** presque tout le jeu ; Nella ne peut pas le voir. Le joueur aperçoit parfois sa main de lumière (La Mano).
- **Créatures du codeur** (noms italiens) : Le Lenti (antivirus), Il Disinfettore (antimalware), Le Toppe (correctifs cousus), La Campana (quarantaine), I Fermi (points d'arrêt), Il Registro (journal), Lo Spazzino (ramasse-miettes, taille humaine), La Sfinge (captcha), Il Sigillo (sceau).
- **Contrastes de taille énormes** : de 1 cm (Toppe) à 2 m (La Mano). Tableau complet dans le document de game design.
- **Trois fins**, chacune avec un twist. Poursuites et mini-jeux ont **plusieurs issues**.
- **Hub** : 14 salles sur 4 niveaux reliées par le grand escalier, 31 scènes (angles de vue).
  - Vues **en coupe**, de face, comme une maison de poupée : exploration, poursuites sur plusieurs étages et infiltration à la Mark of the Ninja. Les boîtes de jeux et les livres sont **de face** : ce sont des portes vers les mini-jeux.
  - Vues **macro**, au ras des surfaces : point & click.
  - Une vue **de dessus** : les phases de plateau.
- **Mini-jeux** : hommages originaux aux classiques, jamais de licence, de nom ou d'image d'origine.
- **Direction artistique** : stop-motion, bibliothèque magique de nuit, bois sombre, lampes ambrées, lueurs violettes et turquoise. Les images sont générées par l'équipe avec Gemini.

## Documents (à lire avant de proposer des changements)

- Document de game design : https://claude.ai/code/artifact/ad4f0153-8269-4b48-ac5a-a28efed4200e. Le plan du hub et l'échelle des personnages sont à jour ; certaines sections plus anciennes parlent encore de « Pico » et d'un magicien visible, et sont dépassées.
- Prompts des décors, avec les croquis : https://claude.ai/code/artifact/f724eadb-5f31-4473-b888-6776d7ed1f60
- Jeu jouable en ligne : https://claude.ai/artifact/XqpuX9CSBK4oPjXYS5TDDX

## Technique

- Jeu web : **Phaser 3.90 + TypeScript + Vite**, sorti en un seul fichier HTML (`npm run build` → `dist/index.html`). `npm run dev` pour jouer en local.
- Cibles : PC/Steam et tablette d'abord.
- `src/scenes` : Title, Hub (point & click), Chase (poursuite), Barrels (mini-jeu « Barils en Folie »), End.
- `src/systems` : état et sauvegarde (localStorage), dialogues et portraits, commandes clavier et tactiles, graphismes provisoires dessinés en code (`art.ts`).
- **Images de l'équipe** : déposer `src/assets/sprites/<clé>.png` remplace le dessin provisoire de même clé. Les portraits vont dans `src/assets/portraits/`.
- **Croquis de composition** : `python3 tools/croquis/render.py` génère `design/croquis/*.png` (à joindre à Gemini) et `design/scenes.json`, à partir de `tools/croquis/scenes.py`. Ces mêmes données doivent servir au jeu pour les surfaces où marcher, les échelles, les portes et les sorties. `tools/croquis/check.py` signale les chevauchements.

## Suite prévue

1. Générer les décors avec Gemini, à partir des croquis (une conversation par salle, retouches plutôt que nouvelles générations).
2. Construire le moteur commun aux scènes en coupe : marcher, courir, sauter, grimper, se cacher, ombre et lumière, cercles de bruit, boîtes-portes. Puis une poursuite sur plusieurs étages et une infiltration avec les Lenti, à partir de `design/scenes.json`.
3. Animer Nella : modèle 3D (Meshy, Tripo) → squelette (Mixamo) → rendus PNG à 12 images par seconde, fond transparent, pieds à hauteur constante.
