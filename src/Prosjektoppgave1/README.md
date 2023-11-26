# Gruppe: Prosjektoppgave1
#### Konrad Simsø / Anders Lea Karlskås
<hr>
#### Link til presentasjon på Youtube:
- https://youtu.be/bk_4BveviNc

<hr>
Informasjon om prosjektet og hva som må installeres for å kjøre det. Alle relevante .js filer ligger i katalogen Prosjektoppgave1 og underkatalogene inneholder assets som trengs.

<hr>

## Oppsett og struktur
Generell struktur for oppsett er inspirert på kode fra kurset Datamaskingrafikk. Unntaket er plassering av filer som i stor grad ligger i denne katalogen. Vi har forsøkt å dele opp prosjektet i de forskjellige komponentene slik at vi unngår for lange filer.

```bash
Avhengigheter som må installeres ekstra
# Timeline
npm install gsap
# Lil Gui (settings)
npm install lil-gui
```
<hr>

## Copyright og kreditering

All kode er selvskrevet med noen få unntak. Vi har naturligvis brukt kodebasen fra kurset som inspirasjon for store deler av struktureringen av kode (renderInfo, kommentering etc...). 

#### Partikler (threePatricles.js)
- Inspirert av Werner Farstad sin kode: modul 8, particles1, eksempel 2.

#### Pendulum (threeAmmoPendulum.js)
- Koden er basert på Patrik Andreassen sin kode som igjen er inspirert av armHingeConstraint.js fra modul 7(Werner Farstad) og støttet opp med hjelp av ChatGPT 3.5 for feilsøking.
- Koden for linjen ("tauet") er basert på kodeeksempelet springGeneric6DofSpringConstraint.js i modul 7 (Werner Farstad).

#### Progressbar 
Denne koden er hentet fra https://codepen.io/alvarotrigo/pen/XWemVEj og justert til vårt eget behov. Stort sett kun CSS-delen er mer eller mindre uendret med unntak av bredde/høyde/farge etc.

#### Klosseveggen (threeAmmoWall.js)
Denne koden er tungt inspirert av https://threejs.org/examples/?q=ammo#physics_ammo_rope og tilpasset vårt eget behov. Tauet fra threejs.org har vi ikke tatt med med erstattet det med et enklere eksempel fra kursets kode i modul 7, ammoConstraints.


#### Lyder og musikk
- Hentet fra Pixabay 
- https://pixabay.com/service/license-summary/

#### 3D modeller
- Hentet fra SktechFab 
- https://sketchfab.com/3d-models/space-bunny-68ed23b0ff774a14a5d7eb0bb932c31e
<hr>
