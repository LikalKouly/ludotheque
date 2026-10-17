# La Ludothèque

Prototype jouable d'un jeu d'aventure en point & click, mêlé de mini-jeux hommages aux classiques de l'arcade.
Une souris apprentie rangeuse poursuit Maître Bidouille, le magicien qui a volé les pages de son livre et les a cachées dans les boîtes de jeux.

## Contenu du prototype

- **Le hub** : un rayon de la Ludothèque, en point & click (Madame Hulotte, les fiches d'emprunt, l'étagère des jeux).
- **La poursuite** : six issues possibles (rattrapé, presque, plongé, perdu de vue, raccourci, aider Grignote).
- **Barils en Folie** : hommage détourné par le magicien, avec plusieurs issues (victoire nette, victoire « autrement » en libérant le gorille, victoire partielle, défaite, chute dans une autre boîte, abandon) et une page secrète.
- **Sauvegarde automatique** dans le navigateur.

Les graphismes sont provisoires (dessinés en code) et seront remplacés par les vrais dessins.

## Commandes

| Action | Clavier | Tablette |
| --- | --- | --- |
| Se déplacer dans le hub | clic | toucher |
| Sauter | Espace | bouton SAUT (poursuite : toucher la droite de l'écran) |
| Bouger dans les mini-jeux | flèches ou ZQSD | boutons à l'écran |
| Sprinter (poursuite) | flèche → | maintenir la gauche de l'écran |
| Choisir une réponse | clic ou touches 1, 2, 3… | toucher |

## Développement

```bash
npm install
npm run dev      # serveur local, jouable sur le réseau (PC, tablette)
npm run build    # produit dist/index.html, un seul fichier jouable
```

Technologies : [Phaser 3](https://phaser.io), TypeScript, Vite.
