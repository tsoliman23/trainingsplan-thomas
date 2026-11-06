# Trainingsplan – Offline-PWA

## Funktionen

- Dashboard mit Wochenfortschritt und Gewichtsänderung seit dem ersten Wiegeeintrag
- Kalender: grün = abgeschlossen, rot = nicht eingetragen, blau = Regeneration; Training Montag/Mittwoch/Freitag
- Tagesansicht per Pfeilnavigation und Wischen; zukünftige Einträge schreibgeschützt
- Übungsdaten inklusive Wiederholungen und Gewichten pro Satz
- Trainingsabschluss und Historie, lokale Statistik
- PDF-Report (3 Seiten) und lokales PDF-Archiv (IndexedDB)
- Export/Import einer JSON-Sicherungsdatei einschließlich Profildaten und Trainingshistorie

## Bereitstellung

Die Dateien auf einem HTTPS-Webserver im selben Verzeichnis bereitstellen. `index.html` kann danach als PWA zum Startbildschirm hinzugefügt werden. Nach dem ersten Online-Laden stehen die App-Dateien offline bereit.

## Datenschutz und Datensicherung

Alle Trainingsdaten und PDF-Dokumente werden lokal im Browserprofil gespeichert. Es findet keine Cloud-Synchronisierung statt. Das PDF-Archiv ist **kein frei wählbarer Ordner** im Dateisystem; PDFs aus der App herunterladen und extern sichern. Die JSON-Sicherung enthält die Trainingsdaten, jedoch **nicht** die PDF-Dateien. Browserdatenverlust kann sowohl Trainingseinträge als auch das interne PDF-Archiv löschen.

## Kalenderlogik

Ein Trainingstag gilt erst nach Betätigung von „Aktuellen Trainingstag abschließen“ als abgeschlossen. Nicht abgeschlossene Trainingstage ab der ersten Erfassung werden in vergangenen Tagen als nicht eingetragen markiert. Künftige Tage werden nur angezeigt.
