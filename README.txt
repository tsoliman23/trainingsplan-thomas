THOMAS TRAININGSPLAN – PWA

1. Alle Dateien und den Ordner icons gemeinsam auf einen HTTPS-Webspace hochladen.
   Zum Beispiel GitHub Pages, Netlify oder einen eigenen HTTPS-Webserver.
   Die Dateien NICHT einzeln per WhatsApp oder direkt per file:// öffnen.
2. Die HTTPS-Adresse auf dem iPhone in Safari öffnen.
3. Teilen > Zum Home-Bildschirm > Hinzufügen.
4. Die App einmal mit Internet laden. Anschließend ist sie offline benutzbar.
5. Daten werden automatisch lokal gespeichert (IndexedDB und localStorage als Fallback).
6. Gelegentlich auf „Datensicherung herunterladen (JSON)“ tippen.
   Die JSON-Datei außerhalb der App aufbewahren und bei Bedarf importieren.
7. PDF-Export ist ohne Internet direkt in der App möglich.

WICHTIG:
- Browserdaten löschen, App entfernen oder Gerät wechseln kann lokale Daten löschen.
- Die App synchronisiert NICHT zwischen Geräten.
- Safari und eine zum Home-Bildschirm hinzugefügte App können getrennte Datenbereiche haben.
  Für den Umzug die JSON-Export-/Importfunktion verwenden.
- Ohne HTTPS bzw. localhost sind Service Worker und PWA-Installation nicht möglich.

Lokaler PC-Test: in diesem Ordner python -m http.server 8080 ausführen
und http://localhost:8080 öffnen.
