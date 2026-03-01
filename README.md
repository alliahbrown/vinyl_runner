# Vinyl Runner — Platine Vinyle Interactive 3D

> Mini-application web 3D simulant une platine vinyle dans un bureau, développée avec THREE.js.

**[Live demo](https://alliahbrown.github.io/vinyl_runner/)**

---

## Description

Vinyl Runner simule une platine vinyle dans un environnement de bureau 3D. L'utilisateur peut interagir avec la platine, choisir des albums depuis un casier à vinyles, les poser sur le plateau et écouter de la musique accompagnée d'un visualiseur audio.

---

## Mode d'emploi

### Navigation

| Action | Effet |
|--------|-------|
| Clic gauche + drag | Faire pivoter la caméra |
| Molette | Zoom avant/arrière |
| Survol | Mise en surbrillance des boutons interactifs |

### Interactions avec la platine

| Action | Effet |
|--------|-------|
| Bouton Power | Allume/éteint la platine, pose/lève le bras |
| Bouton 33 | Change la vitesse à 33 RPM |
| Bouton 45 | Change la vitesse à 45 RPM |
| Casier a vinyles | Ouvre le sélecteur d'albums |
| Fleches gauche/droite | Naviguer entre les albums |
| Entree | Confirmer la sélection |
| Echap | Fermer le sélecteur |

### Workflow

1. Cliquer sur le casier pour ouvrir le sélecteur d'albums
2. Choisir un disque avec les fleches ou le clavier
3. Cliquer "Poser ce vinyle" — le disque tombe sur le plateau
4. Appuyer sur Power — le bras se pose, le plateau tourne, la musique démarre

---

## Difficultés rencontrées

- **Pivot du bras** : l'origine du mesh dans le GLB n'était pas au bon endroit, nécessitant un ajustement de l'origine dans Blender et la création d'un `Object3D` pivot en Three.js.
- **Taille du disque** : le plateau ayant un scale non uniforme (`0.705`), le disque enfant était automatiquement redimensionné, rendant la correspondance avec le disque animé impossible sans mesurer la bounding box réelle.
- **Suivi de la souris en 3D** : le raycasting sur un plan horizontal donnait des résultats très éloignés selon l'angle de caméra, résolu avec une hauteur de drag fixe calculée au moment du pick.
- **Intégration de Rapier** : tentative de physique réaliste abandonnée car trop lourde et incompatible avec la hiérarchie de scène existante.

---

## Fonctionnalités

### Interactions
- Raycasting pour la détection des clics sur les objets 3D
- Hover avec mise en surbrillance des boutons (émissivité)
- Navigation clavier dans le sélecteur d'albums

### Animations (TWEEN.js)
- Bras qui se pose sur le disque avec easing `Quadratic.InOut`
- Bras qui avance lentement vers le centre (simulation réaliste)
- Vinyle qui tombe sur le plateau avec effet `Bounce.Out`
- Transitions de pochettes dans le sélecteur (fade)
- Rotation continue du plateau et du disque

### Audio
- Chargement de fichiers MP3 locaux
- Lecture en boucle avec contrôle du volume
- Visualiseur audio avec Web Audio API (`AnalyserNode`) — barres de fréquences animées

### Rendu
- `WebGLRenderer` avec `antialias` et `setPixelRatio`
- `AmbientLight` + `PointLight` pour l'éclairage
- Lumières colorées d'ambiance avec oscillation
- Lumière rose qui s'allume sur la platine lors de la lecture

---

## Architecture

```
src/
├── main.ts            # Point d'entrée, scène, boucle d'animation
├── turntable.ts       # Classe Turntable (plateau, bras, audio, lumière)
├── vinylSelector.ts   # Sélecteur d'albums + modal UI
├── vinylDisc.ts       # Disque vinyle 3D sur le plateau
├── audioVisualizer.ts # Visualiseur audio Web Audio API
├── buttons.ts         # Gestion hover/press des boutons 3D
└── album.ts           # Dictionnaire des albums
```

### Assets 3D
- `chambre.glb` — Scène principale (bureau, tapis, lampe, tabouret)
- Platine vinyle intégrée — avec tous les composants nommés (platter, armBase, needle...)
- Casier à vinyles intégré — avec 56 slots de vinyles

---

## Installation

```bash
git clone https://github.com/VOTRE_USERNAME/vinyl_runner.git
cd vinyl_runner
npm install
npm run dev
```

```bash
npm run build
npm run deploy
```

### Dépendances

| Package | Usage |
|---------|-------|
| `three` | Moteur 3D |
| `@tweenjs/tween.js` | Animations fluides |
| `vite` | Bundler |
| `typescript` | Typage |

---

## Sources & Credits

### Musiques

| Titre | Auteur | Licence |
|-------|--------|---------|
| Dolling | Cybersdf | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/deed.fr) — [Source](https://soundcloud.com/cybersdf) via [auboutdufil.com](https://www.auboutdufil.com/index.php?id=502) |
| Lofi | Roman Rumyantsev | [Pixabay License](https://pixabay.com/fr/users/bransboynd-51721546/) |
| Summer | prettyjohn1 | [Pixabay License](https://pixabay.com/fr/users/prettyjohn1-54616349/) |

### Photos de pochettes

| Pochette | Auteur | Source |
|----------|--------|--------|
| Dolling | landsmann | [Pexels](https://www.pexels.com/fr-fr/photo/29263620/) |
| Lofi | Rognut | [Pexels](https://www.pexels.com/fr-fr/photo/trois-personnes-assises-sur-un-banc-marron-3154217/) |
| Summer | Hieu Ho | [Pexels](https://www.pexels.com/fr-fr/photo/gens-personnes-individus-building-16414740/) |

### Modèles 3D
- Vinyle — [Sketchfab](https://skfb.ly/6T9Iq)
- Tapis — [Sketchfab](_ https://skfb.ly/pwQtw)
- Art desk — [Sketchfab](https://skfb.ly/o6QEo)
- Casier à vinyles — [Sketchfab](https://sketchfab.com/3d-models/casier-pour-disques-253f558e4a3f4601a205a94d6e77ea25)


### References

- [THREE.js documentation](https://threejs.org/docs/)
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [TWEEN.js](https://github.com/tweenjs/tween.js)
- [Web Audio API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Cannon.js](https://fdoganis.github.io/slides/cannon.html)

---

## Licence

MIT License — voir [LICENSE](./LICENSE)

"Art Drafting Desk" (https://skfb.ly/o6QEo) by Raphael Escamilla is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

"Casier pour disques" (https://skfb.ly/pwGVN) by Antoine is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

"Colorful Woven Round Rug – Game-Ready 3D Model" (https://skfb.ly/pwQtw) by CHEN is licensed under CC Attribution-NonCommercial-NoDerivs (http://creativecommons.org/licenses/by-nc-nd/4.0/).

"Vinyl player" (https://skfb.ly/6T9Iq) by AlexEsfell is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).