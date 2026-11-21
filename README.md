# Bettys Kochecke – v7

75 sorgfältiger formulierte Rezepte (zuvor 34), davon 29 in „Pasta & Nudelgerichte“. 165 Zutaten in der auswählbaren Bibliothek.

## Git Extensions Update

Das Paket `Bettys-Kochecke-v7-Update.zip` enthält nur die zu ändernden Dateien: `data/recipes.json`, `data/ingredients.json` und `index.html`. In deine lokale Projektstruktur kopieren und Dateien überschreiben, danach Commit + Push. Die Dateien `app.js`, `styles.css` und QR-Code-Logik werden nicht verändert.

## Auswahl & Hinweise

Originalquellen und Ratings sind in `RECHERCHE-UND-QUELLEN.md` aufgelistet. Die Rezepte sind vereinfachte, selbstständig formulierte Alltagsfassungen für zwei Personen und nicht probegekocht. Quellenbewertungen gelten nur für die dort veröffentlichten Rezepte. Ein exaktes Top-10-Prozent-Perzentil kann nicht verifiziert werden. Keine Suppen/Eintöpfe. Zutaten vollständig benötigt außer den vordefinierten Grundzutaten.

Hinweis zu QR-Codes: Die neuen Zutaten werden angehängt; eine formelle QR-Abwärtskompatibilität für Vorabversionen wird nicht zugesichert. Neue QR-Codes nach dem Deployment erzeugen.

## Version 8 – Zutatenübersicht
- Die 165 Zutaten sind nun in neun praxisnahen Kategorien organisiert.
- Der Reiter „Alle Zutaten“ zeigt Zutaten in Gruppen mit Überschriften, Anzahl und alphabetischer Sortierung.
- Jeder Reiter filtert eine Gruppe; die Suche wechselt automatisch auf „Alle Zutaten“ und findet gruppenübergreifend.
- Die Zutaten bleiben standardmäßig eingeklappt. Rezepte, Auswahl, QR-Code und Zufallsfunktion bleiben unverändert.
- **Wichtig:** Die Reihenfolge der Zutaten im JSON-Array bleibt unverändert. Nur `category`-Werte wurden angepasst, damit der QR-Bitcode weiterhin dieselben IDs referenziert.
