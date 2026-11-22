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
