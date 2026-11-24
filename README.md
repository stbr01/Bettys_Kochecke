# Bettys Kochecke – Version 1.0.3

Persönlicher Rezeptgenerator mit Zutaten-Auswahl, Zufallsrezepten, Rezeptlinks und wiederverwendbaren Zutatenlisten-QR-Codes. Bereitstellung als statische Webseite, z. B. über Cloudflare Pages.

## Aktueller Stand

- **228 Rezepte**, darunter die gemeinsam ausgearbeiteten Familienrezepte `betty001` bis `betty037`.
- **183 Zutaten** in den neun von der Anwendung unterstützten Kategorien.
- Die Anzeige der Rezeptanzahl wird beim Laden automatisch aus `data/recipes.json` berechnet.
- **Sauerrahm** hat die interne Zutaten-ID `schmand`, damit vorhandene Rezepte weiter funktionieren.
- Vier zuvor entfernte Internet-Rezepte (`q008`, `q017`, `q030`, `q067`) bleiben ausgeschlossen.
- Das doppelt vorhandene Carbonara-Rezept `v9_001` wurde entfernt. Die persönlich ausgearbeitete Fassung `betty003` bleibt enthalten.
- Vier Zutatenkategorien (`wurst`, `kalbfleisch`, `kuemmel`, `knoedelbrot`) wurden an die sichtbaren Kategorien angepasst.
- Die Webseite zeigt unten **Version 1.0.3** und die dynamische Rezeptanzahl.

## Deployment

Das ZIP enthält den gesamten aktuellen Projektstand. Die Dateien aus dem entpackten Ordner ins Repository übernehmen, Commit erstellen und Push durchführen. Danach die Seite neu laden (bei Bedarf Strg+F5).

Für die Webseite sind `index.html`, `app.js`, `styles.css`, `_headers`, `assets/` und `data/` erforderlich. Andere Textdateien sind Dokumentation.

## Toleranz für fehlende Zutaten (v1.0.3)

Das Dropdown erlaubt 0, 1 oder 2 fehlende Rezeptzutaten. Bei 0 ist der Filter wie bisher strikt. Fehlende Zutaten werden im Rezept gelb hervorgehoben. Die aktuelle Toleranz wird im lokalen Browser gespeichert und mit dem URL-Parameter `m=1` bzw. `m=2` sowohl in QR-Codes als auch in direkten Rezeptlinks übertragen. Fehlt `m` in alten Links, ist die Toleranz 0. Pasta-Austausch und Zitronensaft-aus-Zitrone werden weiterhin berücksichtigt. Die bisherige Mindestanforderung von zwei ausgewählten Zutaten bleibt erhalten.

## QR-Codes und gespeicherte Auswahlen

Neue QR-Codes verwenden wie zuvor `?z=v9.<bitmaske>&draw=1`; die Zutatenreihenfolge ist in 1.0.1 **unverändert**, sodass QR-Codes der unmittelbar vorherigen Projektfassung weiterhin funktionieren. Ältere Formatversionen werden nicht unterstützt; eine zusätzliche Rückwärtskompatibilität ist ausdrücklich nicht vorgesehen.

Der QR-Code speichert eine Zutaten-Auswahl, nicht ein festes Rezept. Jeder Scan zieht ein passendes Zufallsrezept. Ein direkter Rezeptlink verwendet einen Rezept-Identifier; für das entfernte Rezept `v9_001` existiert kein direkter Treffer mehr.

Lokale Zutaten-Auswahlen werden im Browser gespeichert. Salz, Pfeffer und Öl gelten als Grundzutaten. Gängige Pastasorten sind im Rezeptgenerator austauschbar; eine ausgewählte Zitrone kann Zitronensaft ersetzen.

## Datenhinweis

Rezepte sind redaktionelle Alltagsfassungen und nicht durchgängig probegekocht. Externe Quellen oder Bewertungen gelten gegebenenfalls für die verlinkten Inspirationsrezepte, nicht für die eigene Fassung.
