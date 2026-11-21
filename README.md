# Was kochen wir? – persönlicher Rezeptgenerator

Statische Website für Cloudflare Pages. Keine Datenbank, kein Backend und keine KI-API erforderlich.

## Enthalten
- Zutatenbibliothek mit Kategorien und Suche
- 500 vorbereitete Rezeptdatensätze
- Auswahl wird lokal gespeichert und in einen persönlichen URL-Link codiert
- Wiederverwendbarer Zutatenlisten-QR: Jeder Scan zieht automatisch ein neues passendes Zufallsrezept
- Direkter Link zum jeweils angezeigten Rezept kann separat kopiert werden
- Strikte Zufallsauswahl: Alle benötigten Rezeptzutaten müssen ausgewählt sein (Salz, Pfeffer und Öl gelten als Grundzutaten)
- Pasta-Schwerpunkt; keine Suppen und Eintöpfe

## Lokal testen
Einfach `index.html` im Browser öffnen. Falls der Browser `fetch()` für lokale JSON-Dateien blockiert, einen lokalen statischen Server verwenden, z. B.:

```bash
python -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## Veröffentlichung über GitHub + Cloudflare Pages
1. Dieses Projekt in ein neues GitHub-Repository hochladen.
2. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. GitHub verbinden und das Repository auswählen.
4. Framework preset: **None**.
5. Build command leer lassen.
6. Build output directory: `/` (Projekt-Root).
7. Deploy klicken.

Bei jedem Push auf den verbundenen Branch veröffentlicht Cloudflare Pages die Änderungen automatisch.

## Hinweise zur Datenbank
Die 500 Einträge sind ein erster kuratierter, regelbasiert zusammengestellter Rezeptbestand. Die Rezepte sind Rezeptideen mit generischen Zubereitungsschritten und sollten vor dem Kochen hinsichtlich Garzeiten, Würzung und Mengen geprüft und bei Bedarf redaktionell verbessert werden. Sie sind keine geprüfte redaktionelle Kochbuchsammlung.

## Link- und QR-Code-Verhalten
Die ausgewählten Zutaten-IDs werden als `?i=id1,id2,...` in der URL gespeichert. Der QR-Code verwendet zusätzlich `&draw=1`; beim Öffnen wird automatisch ein zufälliges Rezept erzeugt, dessen vollständige Zutatenliste in der Auswahl enthalten ist. Nach der Ziehung wird die Browser-Adresse zu einem direkten Rezeptlink (`?i=...&recipe=rNNNN`). Es gibt kein Benutzerkonto und keine zentrale Synchronisierung. Wer den Link besitzt, kann dieselbe Auswahl öffnen. Die lokale Auswahl wird zusätzlich im Browser gespeichert.
