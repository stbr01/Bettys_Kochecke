# Bettys Kochecke – Rezeptgenerator (Qualitätsausgabe v6)

Statische Website für Cloudflare Workers oder Cloudflare Pages. Keine Datenbank, kein Benutzerkonto und keine KI-API notwendig. QR-Erstellung im Browser per qrcodejs-CDN.

## Was neu ist

- **34 einzeln ausgearbeitete Alltagsgerichte** aus einer Recherche bei Chefkoch, Einfach Kochen und BBC Good Food, davon **18 Pasta- und Nudelgerichte**. Keine Suppen oder Eintöpfe.
- Jede Rezeptkarte verlinkt das **bewertete Inspirationsrezept** mit Bewertungsstand vom 21.11.2026. Die dortigen Sterne beziehen sich ausdrücklich **nicht** auf unsere vereinfachte Rezeptfassung.
- Eigene Mengen für **zwei Portionen** und vier konkrete Arbeitsschritte pro Gericht. Diese Fassungen sind noch **nicht praktisch probegekocht**.
- Zutatenbibliothek von 128 auf **149** ergänzt. Alte Zutaten-IDs und deren Reihenfolge bleiben erhalten.
- Normale Pastasorten (z.B. Penne, Fusilli, Spaghetti) dürfen gegenseitig ersetzt werden. Alle weiteren Rezeptzutaten müssen exakt ausgewählt sein.
- Zutatenliste standardmäßig eingeklappt. QR-Link führt direkt zum Zufallsrezept, „Nächstes Rezept“ bleibt beim Scrollen sichtbar.
- Alte kompakte QR-Codes (128 Zutaten/16 Byte) werden auch mit 149 Zutaten akzeptiert.

## Neue Dateien in dein bestehendes Git-Projekt kopieren

Bei Aktualisierung einer vorhandenen Installation diese **fünf Dateien** ersetzen:

1. `app.js`
2. `index.html`
3. `styles.css`
4. `data/recipes.json`
5. `data/ingredients.json`

Optional zusätzlich die Dokumentation übernehmen. Anschließend in Git Extensions Änderungen kontrollieren, committen und auf GitHub pushen; Cloudflare veröffentlicht den neuen Stand über die bestehende Verbindung.

**Wichtig:** Die Qualitätssammlung ersetzt alle 500 zuvor automatisch generierten Rezepte durch 34 redaktionell überarbeitete. Dadurch kann es bei kleinen Zutatenauswahlen seltener einen Treffer geben. Frühere direkte Rezeptlinks mit alten Rezept-IDs erzeugen automatisch einen neuen passenden Vorschlag, soweit eine Zutatenliste vorhanden ist.

## Lokal testen

Im Projektordner:

```bash
python -m http.server 8000
```

Dann `http://localhost:8000/` öffnen. Das direkte Öffnen der `index.html` per `file://` kann JSON-Fetch blockieren.

## Auswahlkriterien und Quellen

Siehe `RECHERCHE-UND-QUELLEN.md`. Eine mathematisch nachgewiesene Auswahl aus den oberen zehn Prozent **aller** Rezepte der jeweiligen Portale ist aufgrund fehlender vollständiger Bewertungsverteilungen nicht möglich. Die Auswahl verwendet eine dokumentierte strenge praktische Bewertungsgrenze.

## Technische Hinweise

- Zutaten werden in `localStorage` und als URL-Bitmaske (`?z=...`) gespeichert.
- Der QR-Link verwendet `?z=...&draw=1`: Jeder Aufruf zieht ein neues passendes Rezept.
- Die Rezept-Zufallsauswahl prüft strikt alle Pflichtzutaten und unterstützt nur klar definierte Pastasorten als gleichwertigen Austausch.
- `?z=...&recipe=qNNN` ist der Direktlink zu einem ausgewählten Rezept.
- Neue Zutaten werden immer **ans Ende** der `ingredients.json` angehängt – Reihenfolge nie ändern, sonst verlieren bestehende QR-Codes ihre Bedeutung.
