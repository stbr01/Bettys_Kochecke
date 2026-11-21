# Bettys Kochecke – Version 9 (Vorabversion)

## Ergebnis

- **196 individuell ausgearbeitete Rezepte**: 75 aus Version 8, dazu 121 neue Alltagsrezepte.
- **162 auswählbare Zutaten** in den unveränderten neun Kategorien (vorher 165).
- Doppelte Zutaten-IDs vereinheitlicht:
  - `spinat_tk` → `spinat` (Anzeige: **Spinat (frisch oder TK)**)
  - `sauerrahm` → `schmand` (Anzeige: **Sauerrahm**)
  - `kohl` → `kraut` (Anzeige: **Weißkraut / Weißkohl**)
- Alte lokal gespeicherte Auswahl wird beim Laden automatisch anhand dieser drei IDs zusammengeführt. Falls beide Varianten ausgewählt waren, zählt die zusammengelegte Zutat nur einmal.
- **Bestehende Rezept-IDs unverändert.** Alle 75 vorhandenen Rezepte referenzieren weiterhin vollständige und gültige Zutatenlisten.
- **Strenges Matching** bleibt bestehen: Nur Zutaten aus der aktivierten Auswahl, außer den explizit erlaubten Grundzutaten Salz, Pfeffer und Öl. Normale Pastasorten sind weiterhin tauschbar.
- Zusätzlich kann eine **ausgewählte frische Zitrone** die Zutat **Zitronensaft** abdecken, nicht umgekehrt (Schale oder Scheiben erfordern eine frische Zitrone).
- Der Zutatenbereich bleibt standardmäßig zugeklappt, und der aktuelle **Trefferzähler** ist schon im zugeklappten Zustand sichtbar.

## Wichtiger Hinweis zu QR-Codes

**Neue QR-Codes erstellen.** Die Reihenfolge/Anzahl der Zutaten wurde geändert. Auf Wunsch wurde auf QR-Abwärtskompatibilität verzichtet. Neue Codes verwenden ausdrücklich das Format `?z=v9.<codierte-zutaten>&draw=1`. Alte Vorab-Codes werden absichtlich nicht mit falschen Zutaten entschlüsselt. Ein solcher Link zeigt eine Meldung an.

**Lokal gespeicherte Zutaten bleiben dagegen erhalten** (einschließlich der drei zusammengeführten IDs), sofern die Website ohne alten QR-Link geöffnet wird.

## Für Git Extensions: Dateien ersetzen

1. Die Datei `Bettys-Kochecke-v9-Update.zip` entpacken.
2. Folgende Dateien in deinem bestehenden Projekt ersetzen:
   - `app.js`
   - `index.html`
   - `styles.css`
   - `data/ingredients.json`
   - `data/recipes.json`
3. In Git Extensions die Änderungen ansehen, **Commit** und dann **Push** ausführen.
4. Cloudflare neu laden (falls nötig mit `Strg+F5`).
5. Zutaten prüfen, ein zufälliges Rezept ziehen und **einen neuen QR-Code** erzeugen.

Die Dateien `RECHERCHE-UND-QUELLEN.md` und `TESTBERICHT.md` sind nur zur Dokumentation und müssen nicht mit hochgeladen werden.

## Datenqualität und Herkunft

Die **121 neu hinzugefügten Rezepte** sind selbstständig formulierte Alltagsfassungen mit Zutatenmengen für zwei Portionen und mindestens drei eigenen Zubereitungsschritten. Die Rezepte wurden fachlich auf offensichtliche Plausibilität geprüft, aber **nicht gekocht, verkostet oder von Nutzern bewertet**. Bei wenigen ist ein externes Inspirationsrezept verlinkt; bei den anderen handelt es sich um eigene Vorschläge. Bestehende 75 Rezepte behalten die früheren Quellenangaben und Originalbewertungen. Solche Bewertungen gelten ausschließlich für die verlinkten Originale.

Die Qualitätskriterien wurden gegenüber v7 gelockert: Wichtig sind einfache Zubereitung, plausible Zutaten, vernünftige Menge und Zeit, sowie kulinarisch sinnvolle Kombinationen. Kein globaler „Top-10-%“-Anspruch. Keine Suppen/Eintöpfe. Bei Unsicherheiten ist das Rezept vor einer Veröffentlichung noch zu testen.

Siehe `RECHERCHE-UND-QUELLEN.md` für die konkret überprüften Rezeptportale und Links.
