# Technischer Prüfbericht – Version 1.0.1

Prüfstand: aus dem hochgeladenen Projekt-ZIP `Bettys_Kochecke-main.zip` bereinigter Datenbestand.

- 228 Rezepte und 183 Zutaten; eindeutige Rezept- und Zutaten-IDs.
- Alle Rezepte verweisen auf bestehende Zutaten-IDs; Mengenobjekte und `ingredientIds` sind positionsgleich.
- Keine doppelten Rezepttitel; `betty003` bleibt, `v9_001` entfällt.
- Alle 183 Zutaten gehören zu einer der neun in `app.js` angebotenen Kategorien.
- Die vier gelöschten Internet-IDs `q008`, `q017`, `q030`, `q067` bleiben entfernt.
- `index.html` zeigt Version 1.0.1 und verwendet `app.js?v=12`, `styles.css?v=12`.
- Die Rezeptzahl wird im Kopfbereich und in der Fußzeile dynamisch ermittelt.
- QR-Bitmaske weiter als `v9`; Zutatenanzahl und -reihenfolge sind gegenüber Version 1.0.0 unverändert.

Die Datenprüfung und JavaScript-Syntaxprüfung sind automatisiert. Sie ersetzen keinen vollständigen manuellen Browser-/Smartphone-Test, keine Prüfung externer Links und keine Verkostung der Rezepte.


## Ergänzung Version 1.0.2
- Globale Option „Alle Zutaten auswählen“ und globales „Alle abwählen“.
- In jeder Zutatenkategorie „Alle auswählen“ / „Alle abwählen“.
- Nach Sammelauswahl werden Rezepttreffer, URL, lokaler Speicher und Oberfläche aktualisiert.

## Ergänzung Version 1.0.3

- Neues Dropdown 0/1/2 erlaubte fehlende Zutaten; bei 0 bisherige Filterlogik.
- Fehlende Rezeptzutaten werden sichtbar als „Fehlt“ markiert.
- Direkte Rezeptlinks und QR-Zutatenlisten-Links enthalten optional `m=1` oder `m=2`; ohne Parameter gilt 0.
- Lokale Auswahl der Toleranz wird gespeichert.
- Geprüft: JavaScript-Syntax (Node.js), JSON-Validität (228/183), Filter für 0/1/2 fehlende Zutaten mit Beispielrezept und QR-Kodierung. Kein vollständiger Browser-Test.
