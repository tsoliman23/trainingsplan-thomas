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
- **Erinnerung:** optionale Benachrichtigungsprüfung um 06:00 Uhr an Trainingstagen, solange die App ausgeführt wird (siehe Einschränkungen).

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

## 9. Neu: Geburtsdatum mit Scrollrädern

Im zweiten Einrichtungsschritt werden Tag, Monat und Jahr in drei getrennten vertikalen Auswahlrädern gewählt (Wischen, Tippen oder Pfeiltasten). Der Tag passt sich dem ausgewählten Monat an; der Februar berücksichtigt Schaltjahre. Eine bewusste Auswahl ist erforderlich. Intern wird das Datum weiterhin im ISO-Format `YYYY-MM-DD` gespeichert. Vorhandene Profile lassen sich ohne Datenmigration bearbeiten.

## 10. Kostenloser Push-Dienst mit Cloudflare Workers

**Wichtig:** Die ZIP enthält die Push-Anbindung und den Cloudflare-Worker als **Quellcode**, aber keinen bereits bereitgestellten Worker. Hintergrund-Push funktioniert erst nach der folgenden Einrichtung. Ohne Worker bleibt der Erinnerungs-Schalter deaktiviert; es wird keine bereits funktionierende Erinnerung vorgetäuscht. Nach Aktivierung kann eine echte Testbenachrichtigung über den Worker ausgelöst werden.

### Voraussetzungen

- MyTraining über HTTPS / GitHub Pages veröffentlicht.
- Auf dem iPhone (iOS 16.4+) über Safari zum Home-Bildschirm hinzugefügt und **über das App-Symbol geöffnet**.
- Kostenloses Cloudflare-Konto; Node.js 22+ und npm auf dem Computer.
- Für Push ein gültiges VAPID-Schlüsselpaar (Private Key bleibt **ausschließlich** als Cloudflare-Secret).

### Cloudflare Worker bereitstellen

1. Im Terminal in `cloudflare-push/` wechseln und `npm install` ausführen.
2. In Cloudflare eine KV-Namespace anlegen. Alternativ im Worker-Verzeichnis `npx wrangler kv namespace create SUBSCRIPTIONS` ausführen und die ausgegebene Namespace-ID in `cloudflare-push/wrangler.toml` beim Feld `id` einsetzen.
3. Ein VAPID-Schlüsselpaar generieren, zum Beispiel mit `npx web-push generate-vapid-keys`. Den **Public Key** in `wrangler.toml` als `VAPID_SERVER_PUBLIC_KEY` eintragen. `VAPID_SUBJECT` auf die eigene `mailto:`-Adresse ändern. **Private Key niemals ins Repository eintragen.**
4. Im Worker-Verzeichnis `npx wrangler secret put VAPID_SERVER_PRIVATE_KEY` ausführen und den privaten VAPID-Key im Terminal eingeben.
5. `ALLOWED_ORIGIN` in `wrangler.toml` auf die GitHub-Pages-**Origin** setzen, normalerweise `https://tsoliman23.github.io` (ohne Repository-Pfad).
6. `npm run deploy` starten. Die ausgegebene Worker-URL in `push-config.js` bei `MYTRAINING_PUSH_URL` eintragen. Die Konfigurationsdatei enthält **nur die öffentliche Worker-Adresse**, keine geheimen Schlüssel.
7. Änderungen in Git committen und GitHub Pages aktualisieren. Danach MyTraining auf dem iPhone einmal online starten, in **Mehr → Einstellungen** die Erinnerungen aktivieren und die Berechtigung erlauben. Anschließend **„Testbenachrichtigung senden“** antippen und die Zustellung prüfen. Der Test ist auf höchstens einen Versand pro 60 Sekunden und registriertem Gerät begrenzt.

### Funktion und Datenschutz

- Der Cloudflare-Cron-Trigger läuft Montag, Mittwoch und Freitag um 04:00 bzw. 05:00 UTC und sendet ausschließlich, wenn es in der Zeitzone `Europe/Berlin` tatsächlich 06:00 Uhr ist. Eine exakte Zustellsekunde wird nicht garantiert.
- Der Worker speichert nur Push-Endpunkt, kryptografische Subscription-Schlüssel und ein zufälliges Registrierungstoken in Cloudflare KV. **Keine Namen, Geburtsdaten, Körpergewichte, Trainingsinhalte oder PDF-Dateien.**
- Nach einer Abmeldung wird die Registrierung am Server gelöscht und die Browser-Push-Subscription beendet (Internetverbindung erforderlich).
- Der Worker weiß nicht, ob du das heutige Training bereits abgeschlossen hast. Die Erinnerung wird unabhängig vom lokal gespeicherten Trainingsstatus versendet.
- Ein ausgefallener Push-Service oder Offline-Zustand des Geräts kann Zustellungen verzögern oder verhindern.
- Cloudflare Workers und KV besitzen kostenlose Nutzungskontingente; bei deren Überschreitung gelten aktuelle Cloudflare-Bedingungen. Die App selbst bleibt auf GitHub Pages hostbar.
- **Sicherheit:** Das Worker-Projekt enthält keine privaten Schlüssel. `cloudflare-push/node_modules/` und `.dev.vars` gehören nicht ins Repository. Vor dem produktiven Einsatz Endgeräte- und Zugriffsverhalten testen.

### Lokales Testen und Grenzen

Die JavaScript-Syntax kann mit `node --check` geprüft werden. Damit ist noch nicht bestätigt, dass eine echte iOS-Benachrichtigung ankommt; das erfordert das reale Cloudflare-Deployment und einen Push-Test auf dem Gerät. **Die App ist ohne Cloudflare weiterhin als Offline-Trainingsplan nutzbar**, nur Hintergrund-Push bleibt dann aus.


## Mehrsprachigkeit und Geburtsdatumsauswahl

Beim ersten Start erscheint zunächst die Sprachauswahl für Deutsch, Englisch, Französisch oder ägyptisches Arabisch. Die Sprache bleibt unter dem Schlüssel `mytraining-language-v1` lokal gespeichert und lässt sich unter **Mehr > Einstellungen > Sprache** ändern. Das Datenmodell (Trainingsziele, IDs, historische Daten und ISO-Datumswerte) bleibt unabhängig von der Oberflächensprache.

Übersetzungen liegen in `translations.json` und werden offline über `i18n.js` geladen. Die Datei ist im Service-Worker-Cache enthalten. Bei Ergänzungen neuer Features müssen alle sichtbaren Texte in allen vier Sprachen gepflegt werden. Selbst eingegebene Notizen und Übungsnamen werden nicht automatisch übersetzt.

Das Geburtsdatum wird mit drei gerätenativen Auswahlfeldern für Tag, Monat und Jahr gewählt. Die gewählten Optionen werden direkt als `YYYY-MM-DD` im versteckten Formularfeld gespeichert. Eine zweite Datumsanzeige wurde entfernt. Die Tagesliste passt sich an Monat und Schaltjahr an.

Zum Aktualisieren bei GitHub Pages müssen die neue `translations.json`, `i18n.js` und `language.css` mit veröffentlicht werden. Die Cache-Version in `sw.js` wurde erhöht. Nach der Installation der neuen Version die App online neu öffnen.


### Startbildschirm und Sprachwahl (v20)

Die Sprachwahl ist bei einer Neuinstallation im initialen HTML enthalten. Die App-Oberfläche bleibt während der Ersteinrichtung verborgen, um das kurze Anzeigen des Dashboards zu verhindern. Die arabische Auswahl heißt **عربي** (ägyptisches Arabisch, Locale `ar-EG`). Bestehende Profil-, Trainings- und PDF-Daten werden nicht geändert. Nach dem Deployment die PWA einmal online öffnen, damit die neue Service-Worker-Version geladen wird.


## Sprachauswahl als erster Einrichtungsschritt

Die erste Seite zeigt ausschließlich **WILLKOMMEN**, **Wähle deine Sprache**, vier Sprachoptionen und den Button **Weiter**. Beim Antippen einer Sprache wird sie lediglich markiert; die Überschrift und der Weiter-Button wechseln sofort in die ausgewählte Sprache. Die Auswahl wird erst durch **Weiter** dauerhaft gespeichert. Danach öffnet sich die bestehende Profilerstellung. Bei vorhandener Spracheinstellung wird die Sprachwahl übersprungen. Die Versionsnummer des Offline-Caches wurde aktualisiert.

## Home-Bildschirm statt Browser

**iPhone (iOS):** Die GitHub-Pages-HTTPS-Adresse in **Safari** öffnen, auf **Teilen** tippen, **Zum Home-Bildschirm** auswählen und mit **Hinzufügen** bestätigen. Danach die App über ihr neues Symbol auf dem Home-Bildschirm öffnen (nicht über den Safari-Tab). Die vorhandene `manifest.webmanifest` definiert `display: standalone`; auf iOS ergänzen die Apple-Web-App-Metadaten den Vollbild-/Standalone-Start. Bei manchen iOS-Versionen ist die Safari-Aktion erst unter „Aktionen bearbeiten“ sichtbar.

**Android:** GitHub-Pages-Seite in Chrome öffnen, Menü (drei Punkte) → **App installieren** beziehungsweise **Zum Startbildschirm hinzufügen**. Danach über das App-Symbol öffnen.

GitHub Pages dient nur zur Veröffentlichung. Die Trainingsdaten werden weiterhin lokal im Browser-/App-Speicher gehalten. Vor einem Wechsel zwischen Safari und Home-Bildschirm-App bitte eine JSON-Sicherung anlegen; Speicherbereiche können je nach Plattform getrennt sein.

**Ersteinrichtung:** Sprache markieren, **Weiter** drücken; daraufhin öffnet sich für neue Nutzer der vierstufige Profilassistent. Er startet auch dann, wenn die lokale Datenbank erst nach der Sprachauswahl geladen ist.


## Einrichtungsablauf (Version 23)

Die Einrichtung umfasst **fünf Schritte** mit einer einheitlichen segmentierten Fortschrittsanzeige:

1. Sprache auswählen und mit **Weiter** bestätigen.
2. Vor- und Nachname eingeben.
3. Geburtsdatum und Körpergröße erfassen.
4. Start- und Zielgewicht eingeben.
5. Trainingsziel festlegen und Profil speichern.

Die Sprachseite schaltet beim Klick auf **Weiter** unmittelbar auf die Profilerstellung um. Wenn IndexedDB noch lädt, wird der Übergang nach dem Laden nachgeholt. Die übrige App-Oberfläche bleibt während der ersten Einrichtung verborgen. Das Sprachmerkmal bleibt im bisherigen lokalen Speicher erhalten, ebenso alle Trainingsdaten.

**Prüfhinweis:** Sprachwahl, Übergang und Wiederaufruf nach Profilerstellung zusätzlich auf dem Zielgerät testen.

## Trainingsziele (Mehrfachauswahl)

Bei der Profilerstellung und unter **Profil bearbeiten** können mehrere Trainingsziele ausgewählt werden. Die Ziele **Abnehmen** und **Zunehmen** schließen sich gegenseitig aus: Wird eines aktiviert, wird das jeweils andere automatisch deaktiviert. **Muskelaufbau**, **Gewicht halten** und **Ernährung / Diät** können zusätzlich ausgewählt werden. Mindestens ein Ziel ist erforderlich.

Die Ziele werden im lokalen Profil unter `trainingGoals` als Liste gespeichert. Für ältere Funktionen bleibt `trainingGoal` als erstes ausgewähltes Ziel erhalten. Vorhandene Profile mit einem einzelnen `trainingGoal` bleiben kompatibel.

## Design- und Bedienkorrekturen (Version 25)

- **Geburtsdatum:** Drei gerätenative Auswahllisten für Tag, Monat und Jahr. Auf iOS erfolgt die Auswahl über den nativen iOS-Picker. Der Jahresbereich reicht von 1900 bis zum aktuellen Jahr. Die Tagesliste passt sich automatisch an den gewählten Monat und das Jahr an (28/29/30/31 Tage). Die tatsächliche Auswahl wird als `YYYY-MM-DD` gespeichert. Die früheren künstlichen Scrollräder wurden entfernt, da sie bei schnellen Wischgesten zu Synchronisationsproblemen führten.
- **Zielauswahl:** Bei einem neu eingerichteten Benutzerprofil ist kein Trainingsziel vorausgewählt. Vorhandene gespeicherte Ziele bleiben beim Bearbeiten erhalten.
- **Ersteinrichtung:** Nach dem Speichern wird das Dashboard aufgerufen und die Scrollposition auf den Seitenanfang gesetzt.
- **Farbsystem:** Die zusätzliche Datei `design-v2.css` vereinheitlicht Hell- und Dunkelmodus in einer zusammenhängenden blauen Palette. Beide Modi verwenden konsistente Hintergründe, Karten, Eingabefelder und Navigation ohne harte weiße Hintergründe auf dunklen Seiten.
- **Kalender:** Normale Tageszahlen mit kleinen **runden** Statusmarkierungen darunter: grün = Training abgeschlossen, rot = vergangener offener Trainingstag, blau = Regeneration. Tage vor dem Einrichtungsdatum werden nicht als versäumt gezählt. Zukünftige Tage sind nur einsehbar.

### Technische Prüfpunkte

1. Eine Ersteinrichtung ohne vorhandene Daten öffnen: Sprache wählen, Namen eingeben und bei der Zielauswahl sicherstellen, dass keine Option markiert ist.
2. Geburtsdatum testen: Februar 2000 -> 29 Tage, Februar 2001 -> 28 Tage, April -> 30 Tage, Januar -> 31 Tage, Jahr 1900 auswählbar.
3. Profil speichern: Dashboard wird am oberen Seitenanfang angezeigt. Daten nach Schließen und erneutem Öffnen kontrollieren.
4. Einstellungen > Design zwischen Hell und Dunkel wechseln. Kalender in beiden Modi prüfen.
5. GitHub Pages aktualisieren und die installierte Home-Bildschirm-App einmal online starten, damit der neue Service-Worker-Cache geladen wird.

**Hinweis:** Die Datumauswahl verwendet bewusst native Auswahlfelder statt einer nachgebauten Scrollanimation. Das ist insbesondere für Safari/iOS zuverlässiger. Für iOS werden die Auswahloptionen als System-Picker dargestellt; unter Windows als Dropdown.


## Fehlerkorrektur und Release-Prüfung (Version 26)

- **Gewicht:** Die Karte „Körperwerte“ auf dem Dashboard erfasst ausschließlich das heutige Gewicht (Schrittweite 0,1 kg), auch wenn zuletzt ein anderer Kalendertag geöffnet war. Das Gewicht wird in `training-calendar-days-v1` unter dem Tagesdatum gespeichert. Das bei der Profilerstellung hinterlegte Startgewicht dient als unveränderter Ausgangswert. Zielgewicht steht daneben. Für frühere Werte den jeweiligen Tag in der Trainingsansicht öffnen.
- **Zurücksetzen:** In **Mehr > App zurücksetzen** muss zuerst das Bestätigungsfenster mit rotem „Alles löschen“ bestätigt werden. Danach wird die laufende Speicherung gestoppt, die Trainings- und PDF-Datenbank geschlossen und gelöscht sowie die MyTraining-spezifischen lokalen Schlüssel entfernt. Andere Dateien auf dem Gerät werden nicht angerührt. Der Browser-Cache mit dem App-Code bleibt für die Offline-Nutzung erhalten. Bestehende PDF-Downloads in der Dateien-App können nicht automatisch gelöscht werden.
- **Push:** Bei eingerichteter Cloudflare-Verbindung wird vor dem lokalen Reset auch die Push-Registrierung abgemeldet; bei nicht erreichbarem Server wird der Reset unterbrochen und ein Fehler angezeigt. Ohne Cloudflare ist die Erinnerung nur als lokale Prüfung bei laufender App verfügbar; 06:00 Uhr im geschlossenen Zustand ist damit nicht garantiert.
- **Einstellungen:** Apple-artiger Schalter, lesbare Sicherungsbuttons, einheitliche Kontraste und der explizite Hidden-Zustand des Reset-Dialogs.
- **Übersetzungen:** Korrigierter Zugriff auf `aria-label`-Attribute; Monatsnamen werden nur bei tatsächlichem Sprachwechsel neu aufgebaut.

### Prüfstand

JavaScript-Syntax, ZIP-Struktur und isolierte Browserprüfungen der Gewichtstasten, des Reset-Dialogs und der Sprachskripte wurden durchgeführt. Ein kompletter Browser-End-to-End-Test über einen lokalen HTTP-Server war in der Ausführungsumgebung durch eine Zugriffssperre nicht möglich. Ein Gerätetest unter iOS und Android ist deshalb weiterhin erforderlich.

### Git

Nur den Inhalt von `MyTraining/` ins vorhandene Repository kopieren. Die Release-ZIP enthält **keinen** `.git`-Ordner. Vor dem Update die JSON-Datensicherung und wichtige PDFs exportieren.

```bash
git add .
git commit -m "Gewichtserfassung und App-Reset korrigiert sowie Darstellung verbessert"
git push
```


## Update 27 – Navigation, Sprachwahl, Lesbarkeit

- Schritt 2 (Vor- und Nachname) hat nun einen Zurück-Knopf zum Sprachschritt. Eingegebene Werte bleiben beim Zurück- und Weitergehen erhalten. Die Schritte 3 bis 5 behalten ebenfalls ihre Werte.
- Kalender-Monat und gewählter Trainingstag sind separate Zustände. Datum antippen: Trainingsansicht öffnen, Monat im Kalender behalten. „Heute“ im Kalender setzt die Monatsansicht auf heute zurück. Monat und Jahr können direkt über die zentralen Auswahlfelder geändert werden.
- Trainingstage vor dem Einrichtungsdatum zeigen nur den Hinweis; keine editierbare Trainingsmaske und keinen Abschluss-Button. Zukünftige Termine bleiben schreibgeschützt.
- Zusätzliche Übersetzungen für Bedienflächen und Hilfetexte in Deutsch, Englisch, Französisch und ägyptischem Arabisch. Der App-Name MyTraining bleibt unverändert. Freie Nutzernotizen werden nicht automatisch übersetzt.
- Informations-Buttons (i) schalten ergänzende Hinweise ein oder aus. Wichtige Fehlermeldungen bleiben sichtbar.
- Überflüssige weiße Rahmen entfernt und Kalenderkopf auf kleine, zentrierte Monats- und Jahreswahl umgestellt.
- Erinnerungsschalter: Die Einstellung ist auch ohne Push-Dienst auswählbar, wird jedoch ausdrücklich nur als Präferenz gespeichert. Eine Push-Zustellung bei geschlossener App setzt die konfigurierte Cloudflare-Anbindung voraus.

### Tests vor dem Deployment

1. Erstinstallation: Sprache auswählen; in Profil-Schritt 2 zurück zur Sprachwahl und wieder vorgehen, ohne den Namen zu verlieren.
2. Kalender: zu einem anderen Monat wechseln, Datum antippen, zum Kalender zurückkehren; derselbe Monat bleibt gewählt. „Heute“ setzt den Kalender zurück.
3. Vor Einrichtungsdatum: keine Eingabefelder und kein aktiver Abschluss-Knopf.
4. Einstellungen: Sprachwechsel und Hilfeknöpfe prüfen. Den Schalter für Erinnerungen nicht als erfolgreich aktivierte iOS-Push-Zustellung interpretieren, bevor der Worker konfiguriert wurde.
5. Vor dem Update JSON-Sicherung und PDFs separat sichern.


## Update 28 – echter Web-Push und Testbenachrichtigung

- Die Push-Berechtigung wird auf iOS **unmittelbar beim Antippen des Schalters** angefordert. Ohne eingerichtete Worker-Adresse kann der Schalter nicht fälschlich einen funktionierenden Hintergrund-Push anzeigen.
- Der Cloudflare-Worker bietet `POST /test` für einen echten Testversand an die **zuvor registrierte Push-Subscription**. Der Test wird mittels gerätebezogenem Token und einfachem 60-Sekunden-Limit geschützt.
- Im Einstellungsbereich erscheint nach der Cloudflare-Konfiguration ein Button „Testbenachrichtigung senden“. Dieser wird erst nach aktivierter Push-Registrierung anklickbar.
- Der regelmäßige Cron-Versand ist auf Mo/Mi/Fr, 06:00 Uhr `Europe/Berlin` ausgelegt. Die Zustellung kann durch Betriebssystem und Netzzustand verzögert werden.
- **Deployment ist weiterhin erforderlich:** `cloudflare-push/wrangler.toml` mit KV-Namespace, VAPID Public Key, VAPID Subject und Origin befüllen; Private Key als Cloudflare-Secret setzen; Worker deployen; öffentliche URL in `push-config.js` eintragen.
- **Datenschutz:** Der Worker speichert nur Push-Empfangsdaten und das zufällige Registrierungstoken, keine Trainingsdaten. Bei Deaktivierung wird die Registrierung gelöscht.

Die App wurde nicht auf einem realen iPhone mit einem aktiven Cloudflare-Worker end-to-end getestet. Eine erfolgreiche Syntaxprüfung ersetzt weder Deployment noch einen Zustelltest auf dem Gerät.

## Aktualisierung 1.0.1 – 07.11.2026

- Sprachwechsel im ersten Einrichtungsschritt aktualisiert die Schreibrichtung unmittelbar (Arabisch RTL; Deutsch/Englisch/Franzoesisch LTR).
- Koerperwerte lesen Startgewicht aus dem Profil, Zielgewicht aus dem gespeicherten Ziel und das Tagesgewicht aus dem Kalender. Die Tasten + / - aendern das heutige Gewicht in 0,1-kg-Schritten und speichern es sofort.
- Kalender: Monat/Jahr bleiben direkt auswaehlbar, aber ohne sichtbare Auswahlpfeile.
- Uebungs- und Zusatzinformationen: kleine i-Schalter mit wiederholtem Ein-/Ausblenden.
- Kontrastkorrekturen fuer Abbrechen-Button beim Zuruecksetzen sowie PDF-Aktionen im Dunkelmodus.
- Bereich „Ueber die App“ auf App-Name, Version 1.0 und Kurzbeschreibung umgestellt.
- Der zuvor vorhandene, aber durch einen JavaScript-Laufzeitfehler nicht erreichte Push-Einstellungsbereich ist wieder erreichbar. Das Vorhandensein einer Worker-URL bedeutet noch nicht, dass die Push-Zustellung getestet wurde.
- PDF-Archiv: Schaltflaeche „Zurueck zu Einstellungen“.
- Kalender: Regenerationstage nutzen denselben blauen Statuspunkt wie die Legende.

Die erweiterte ZIP enthaelt keine Git-Verzeichnisse, node_modules oder lokalen Wrangler-Caches. Ein kompletter iPhone-Test muss auf dem Endgeraet erfolgen.


## MyTraining 1.0.2 – Profil & Erinnerungen

- Persönliche Profilbearbeitung ist unabhängig vom Einrichtungsassistenten.
- Push-Erinnerungen laufen jetzt Mo/Mi/Fr um 06:00 Uhr Europe/Berlin, inklusive Sommerzeit.
- **Cloudflare muss nach der Änderung separat erneut bereitgestellt werden:** im Ordner `cloudflare-push` `npm.cmd run deploy` ausführen. Ein GitHub-Push allein aktualisiert den bereits veröffentlichten Worker nicht.
- Der Testnachrichten-Button wurde aus den Einstellungen entfernt.
- Ergänzende Hilfetexte stehen gesammelt hinter einem Info-Button neben der zugehörigen Überschrift.


## Update 1.0.3 – iPhone-Bedienung und Rückmeldungen

- Unbeabsichtigte Seitenvergrößerung per Doppeltipp/Pinch in der App unterdrückt. Die System-Zoomfunktionen bleiben davon unabhängig.
- Das Geburtsdatumsfeld in der separaten Profilbearbeitung ist auf die Dialogbreite begrenzt.
- Der PDF-Erstellungsbutton ist im Dunkelmodus blau mit weißer Schrift.
- Speicher-, Sicherungs-, PDF- und Profilaktionen zeigen kurz eine Bestätigung unten am Bildschirm. Häufige automatische Speichervorgänge werden gedrosselt.
