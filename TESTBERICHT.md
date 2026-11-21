# Technischer Testbericht – Version 9

Validiert mit Python 3 und Node.js 22:

1. **196 eindeutige Rezept-IDs und eindeutige Titel**, davon 75 unveränderte Rezept-IDs aus v8 und 121 neue Einträge.
2. Alle `ingredientIds` existieren in der neuen 162er-Zutatenliste und stimmen **in Reihenfolge und Anzahl** mit den Rezeptmengenangaben überein; keine doppelten Pflichtzutat-IDs in einem Rezept.
3. Alte Rezeptzuordnungen bleiben nach Umwandlung von `spinat_tk → spinat`, `sauerrahm → schmand` und `kohl → kraut` erhalten: **75/75 Rezepte bestehen den Migrationstest**.
4. 162 einzelne QR-Roundtrips sowie 2.000 zufällige QR-Roundtrips erfolgreich.
5. Die neue QR-Versionskennung verhindert, dass alte Vorab-Codes nach der Zutatenumsortierung falsch entschlüsselt werden.
6. 2.000 zufällige Zutatenmengen wurden gegen alle 196 Rezepte geprüft: **Kein Treffer hat eine fehlende erforderliche Zutat**, unter Berücksichtigung der ausdrücklich erlaubten Pasta- und Zitronen-Ersetzungen.
7. JavaScript-Syntax mit `node --check` erfolgreich.
8. Keine Suppen oder Eintöpfe unter den neuen Rezepten.
9. Datenbank- und Matchingtests sind **keine Geschmackstests** und garantieren weder die Praxistauglichkeit aller Zeitangaben noch die erfolgreiche Kameralesbarkeit des QR-Codes auf allen Geräten.

## Beispiel-Zutatenvorräte

| Beispiel | Treffer aus den bisherigen 75 | Treffer aus allen 196 |
|---|---:|---:|
| Pasta + Vorrat (22 Zutaten) | 0 | 13 |
| Reis + Gemüse (17 Zutaten) | 0 | 2 |
| Kleiner Vorrat (8 Zutaten) | 0 | 3 |
| Größere Küchenauswahl (43 Zutaten) | 6 | 51 |

Die Vergleichswerte stammen aus der lokalen JavaScript-Matchinglogik; sie sind keine allgemeingültigen Mittelwerte für jeden Haushalt.
