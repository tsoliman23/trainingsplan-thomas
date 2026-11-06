# MyTraining

Eine installierbare, offlinefähige Trainingsplan-App (Progressive Web App, PWA) mit eigener lokaler Datenspeicherung. Die ANIMUS-Mockups dienten nur als gestalterische Referenz. Die App ist ein **Trainingsplan**, kein Mood- oder Ernährungstracker.

## 1. Funktionen

- **Einrichtung:** Vorname, Nachname, Geburtstag, Körpergröße, aktuelles Gewicht, Zielgewicht und Ziel (Abnehmen, Zunehmen, Muskelaufbau, Gewicht halten, Ernährung / Diät). Pflichtfelder; kein Konto und keine Cloud.
- **Dashboard:** personalisierte Startseite, Wochenfortschritt, nächste Einheit, Gewichtsänderung seit dem ersten Wiegeeintrag.
- **Kalender:** Monatsübersicht, grüne Häkchen für als abgeschlossen gespeicherte Trainingstage, rote X für vergangene Trainingstage ohne Abschluss, blaue Kreise für Regenerationstage. Vor Einrichtungsdatum werden keine Tage als verpasst markiert.
- **Tagesansicht:** per Pfeil oder horizontalem Wischen Tage wechseln, einschließlich zukünftiger Tage als schreibgeschützte Vorschau.
- **Trainingstage:** Montag, Mittwoch, Freitag, bestehende Übungen, eigene Übungen, Übungshinweise ein-/ausklappen, Sätze, Wiederholungen pro Satz und Gewichte.
- **Statistik:** Trainingstage und Gewichtsverlauf, Trainingshistorie, Übungsverlauf.
- **PDF:** kompakter Report mit bis zu drei Trainingstagen pro Ausgabe; Hinweise optional, PDF-Archiv mit Datum und lokalem Download.
- **Sicherung:** JSON-Datei mit Trainingsstand, Historie, Kalenderdaten, Profil und Einstellungen herunterladen und wiederherstellen. PDFs müssen getrennt gesichert werden.
- **Design:** Blau aus dem vorhandenen Logo, Light Mode, Dark Mode und Systemeinstellung. Untere Hauptnavigation auf Mobilgeräten.
- **Erinnerung:** optionale Benachrichtigungsprüfung um 08:00 Uhr an Trainingstagen, solange die App ausgeführt wird (siehe Einschränkungen).

## 2. Technische Entscheidung

Die bestehende Anwendung bleibt eine **PWA mit HTML, CSS und JavaScript**. Ein kompletter Neuaufbau in Flutter/Swift/Kotlin würde lokale Datenmigration, Offline-Speicher und PDF-Export erheblich aufwendiger machen, ohne einen automatischen Qualitätsgewinn bei den vorhandenen Funktionen. Diese Version benötigt kein Backend, keine externen Bibliotheken und keine Online-API.

Wer garantierte systemseitige Benachrichtigungen zu einer Uhrzeit **bei geschlossener App** benötigt, sollte eine native Umsetzung (z. B. Flutter mit lokalen Systembenachrichtigungen) planen. Eine rein lokale PWA kann das auf iOS/Android **nicht zuverlässig garantieren**. Die vorhandene Einstellung versendet **keine serverseitigen Pushnachrichten**.

## 3. App lokal starten

Im Projektverzeichnis einen lokalen Webserver starten:

```bash
python -m http.server 8080
```

Dann `http://localhost:8080/` im Browser öffnen. Die Installation auf dem Smartphone erfordert im Regelfall eine HTTPS-Adresse. Ein direkt geöffnetes `file://`-Dokument ist **keine** vollwertige installierbare PWA.

Für GitHub Pages: GitHub-Repository → Settings → Pages → Deploy from a branch → `main` / root. Nach Veröffentlichung die HTTPS-Adresse auf dem Handy öffnen und „Zum Home-Bildschirm“ wählen. *GitHub Pages ist öffentlich: keine persönlichen JSON-Sicherungen, PDF-Berichte oder Profildaten ins Repository committen!*

## 4. Migration und Datenspeicherung

Die App behält die bisherigen Schlüssel und Datenformate (`training-profile-v1`, vorhandener Trainingsstand, `training-calendar-days-v1`, Historie) bei. Zusätzliche Angaben landen unter `training-full-profile-v1`, das Einrichtungsdatum unter `training-setup-date-v1` und Einstellungen unter `training-preferences-v1`.

**Vor dem Update eine Sicherung herunterladen.** Für Nutzer früherer Versionen werden die zusätzlichen Pflichtangaben beim nächsten Start angefragt. Das Statistik-Startdatum ist dann der Tag dieser ergänzten Einrichtung; frühere Daten werden nicht gelöscht, aber in den neuen Datums-Kennzahlen nicht als versäumte Trainingstage ausgewertet.

Speicherung geschieht browserintern (`localStorage`, `IndexedDB`), nicht in einer frei wählbaren Datei auf dem Gerät. **Deinstallieren, Browserdaten löschen oder Gerätewechsel kann zum Datenverlust führen.** Regelmäßig eine JSON-Sicherung und PDF-Dateien außerhalb der App speichern.

## 5. Struktur

```text
index.html           Trainingseingaben und bisherige App-Funktionen
calendar.js          Tagesdaten, Kalender, Navigation, PDF-Archiv
progress.js          Satzprotokoll, Trainingshistorie, Datensicherung
modern-pdf.js        PDF-Export
experience.js        Profilunabhängige Oberfläche, Design, Navigation, Erinnerung
theme.css            Responsive Design, Light/Dark Mode
sw.js                Offline-Service-Worker
manifest.webmanifest App-Metadaten
icons/               Originales App-Logo
```

## 6. Update und Git

Die ZIP-Dateien **in das vorhandene Git-Projekt kopieren**, dabei `.git` nicht löschen oder überschreiben.

```bash
git status
git add index.html calendar.js progress.js modern-pdf.js experience.js theme.css sw.js manifest.webmanifest README.md icons/
git commit -m "Trainings-App mit Dashboard, Profil, Kalender und Dark Mode erweitert"
git push
```

Falls die neue Oberfläche nach dem Deployment nicht erscheint, App einmal online neu laden; der Service-Worker aktualisiert die zwischengespeicherten Dateien.

## 7. Test-Checkliste vor produktiver Nutzung

1. Neues Profil ausfüllen, App neu laden, Profil und Startdatum prüfen.
2. Im Kalender vor das Ersteinrichtungsdatum navigieren: keine roten X; future days read-only.
3. Trainingssatz erfassen, Tagesabschluss speichern, zwischen Tagen wechseln und neu laden.
4. Hell/Dunkel/System umschalten und nach einem Neustart erneut prüfen.
5. Sicherung herunterladen, testweise importieren und wiederhergestellte Daten kontrollieren.
6. PDF mit/ohne Hinweise erzeugen, PDF-Archiv öffnen und Datei separat herunterladen.
7. Erinnerung nur nach Berechtigung aktivieren; zeitgesteuerte Hintergrund-Pushs nicht erwarten.

## 8. Grenzen

Die Trainingsplanung ist auf Montag/Mittwoch/Freitag ausgelegt. Eine abgeschlossene Einheit wird aktiv über die Abschlussfunktion markiert. Der PDF-Export ist auf drei Trainingstage optimiert; sehr viele selbst hinzugefügte Übungen oder lange Hinweise können die Lesbarkeit einschränken. Die App bietet keine verschlüsselte Cloud-Sicherung und keine medizinische oder ernährungsbezogene Beratung.


## Responsiver Profilassistent

Die Ersteinrichtung wird in vier Schritte gegliedert: Name, Basisdaten, Gewicht und Trainingsziel. Auf kleinen Bildschirmen passt sich der Dialog an die verfügbare Höhe an; nur bei eingeschränkter Höhe oder geöffnetem Tastaturfeld ist der Inhaltsbereich intern scrollbar. Die bestehende Profilspeicherung und das Datenformat bleiben unverändert. `wizard.css` und `wizard.js` gehören zum Offline-Cache in `sw.js`.


## Version 17 – Layout und PDF-Vorschau

- Ersteinrichtung: vier Schritte, jeweils mit vertikalem Formular und eigenen responsiven Begrenzungen.
- Die Profilansicht hat keine globalen Eingabefelder, die über den Dialogrand hinausreichen sollen.
- Kein Einstellungsbutton mehr im oberen Kopfbereich; Einstellungen über **Mehr** in der unteren Navigation.
- Hell/Dunkel/System bleiben in den Einstellungen umschaltbar; dunkle Formulare und Karten wurden hinsichtlich Kontrast nachgebessert.
- PDF-Export: **Vorschau** öffnet den Bericht, ohne ihn sofort herunterzuladen. **Speichern / Teilen** speichert ihn im lokalen PDF-Archiv und bietet die gerätespezifische Exportfunktion an.
- **PDFs**: gespeicherte Berichte mit Zeitstempel ansehen, herunterladen oder löschen. Die Dateiablage erfolgt in IndexedDB **dieses Browsers bzw. dieser PWA**, nicht automatisch im iOS-Dateisystem. Ein Download ist für langfristige Backups nötig.
- Auf einigen iPhone-Versionen lässt sich ein PDF-Blob nicht im integrierten Vorschaufenster darstellen. Dafür gibt es **In neuem Tab öffnen** und **Herunterladen**.

### Deployment

Alle Dateien in den GitHub-Pages-Projektordner kopieren. Nicht die `.git`-Daten löschen.

```bash
git add .
git commit -m "Profilansicht und Dark Mode verbessert sowie PDF-Vorschau ergänzt"
git push
```

**Technologie:** Weiterhin eine offlinefähige PWA. Für eine echte native iOS-App wären ein eigener SwiftUI- oder Flutter-Build, Apple-Signierung und Datenmigration nötig. Ein solcher nativer Build ist nicht Teil dieser ZIP.
