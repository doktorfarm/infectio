# Infectio

Podgląd do oceny: https://doktorfarm.github.io/infectio/ (strona oznaczona noindex; materiał edukacyjny, nie jest recenzją kliniczną).


Responsywna aplikacja do nauki chorób zakaźnych, bez zależności frontendowych.

## Uruchomienie

`npm start` (Python 3), następnie http://localhost:4173. Testy: `npm test` (Node.js 18+). Nie otwieraj index.html jako file:// — wymagany HTTP.

## Funkcje

Pulpit, biblioteka z filtrami, fiszki i samoocena, odpowiedzi otwarte z rubrykami, quiz ABCDE, lokalne statystyki i powtórki (10 minut / 3 dni), import i eksport JSON, eksport postępu. Animacje respektują prefers-reduced-motion i przełącznik. Dane w localStorage; brak kont i synchronizacji. Eksport postępu jest kopią do odczytu, bez interfejsu przywracania.

## Dane i weryfikacja

Wbudowane: 410 rekordów, baza v7. Aplikacja pokazuje 406 jako quiz A–E z automatycznym wynikiem; 4 są oznaczone „do poprawy” i wyłączone z nauki. Wyniki przeglądu kluczy (kto, kiedy, uwagi) są w `dist/verification.json`; to nie jest recenzja kliniczna. W 308 pytaniach błędne warianty zostały przepisane przez AI (Claude, 2026-11-15) i nie przeszły recenzji klinicznej; wcześniej były to ogólnikowe zdania z „zawsze/wyłącznie”, łatwe do odrzucenia bez wiedzy. Poprzednia baza v4 (109 rekordów) jest w historii git. Nie dostarczono archiwum 392 rekordów ani kodu prototypu; to nowa implementacja na podstawie opisu produktu. Nie uzupełniano nieznanej treści ani oryginalnych odpowiedzi studentów. Rok/tura filtrują jawne pola year/round; baza wejściowa ich nie zawiera.

Klucze 15 autorskich ABCDE (EBM001–013, EBM017–018) porównano 2026-11-11 z treścią CDC: HBV diagnosis-testing (przegląd CDC 2026-11-02, zalecenia 2023), measles clinical-overview (2026-08-05), HCV infection-control (przegląd CDC 2026-11-03, wytyczne 2020). Linki są w rekordach. To sprawdzenie zgodności ze źródłem, nie recenzja lekarska. Pozostałe statusy są deklaracjami z importu; pozostałe 4 ABCDE nie są automatycznie oceniane. Brak pełnej symulacji egzaminu ze względu na niereprezentatywną pulę. Treść medyczna bazy pozostaje niezmieniona.

## Import

Tablica rekordów albo obiekt z polem items lub records. Każdy rekord wymaga niepustego tekstowego id. Pola question, answer, options, kind, topic, provenance, reference muszą być tekstami, jeśli występują. Pozostałe metadane są zachowywane. Brak question/answer nie usuwa rekordu z biblioteki, ale wyklucza z nauki. Format opcji: A) ...; B) ...; C) ...; D) ...; E) ...

ID mają osobne przestrzenie źródłową i autorską (provenance zawiera AUTHOR_EBM). Konflikt w jednej przestrzeni anuluje cały import bez nadpisania danych. Maks. 20 MB. Importowany status nie odblokowuje oceny: wymagane dopasowanie do wbudowanego rejestru sprawdzonych kluczy.

## Pliki

dist/index.html, style.css, app.js — interfejs; dist/core.js — import i quiz; dist/data.json — niezmieniony plik użytkownika; tests.mjs — testy logiki. Publikacja statyczna przez Sites.

## Landing page i App Shell

Strona startowa jest pod `/`, platforma pod `/app/`. Interfejs zachowuje istniejący stack HTML/CSS/ES Modules. `landing.css` zawiera tokeny LP, `shell.css` nadpisania platformy, `ui.js` współdzielone stany, a `shell.js` obsługuje zwijanie nawigacji i Escape na telefonach. Stan błędu pobierania danych oferuje ponowną próbę. Brak wyników wyszukiwania oferuje wyczyszczenie filtrów.

Fonty Inter/Plus Jakarta Sans są preferowane, jeśli dostępne lokalnie; w przeciwnym razie używany jest font systemowy bez pobierania i zamiany fontu. LP korzysta z niewielkiego modułu motion.js, bez obrazów zewnętrznych. Brak layout shift od asynchronicznych zasobów jest założeniem projektu; CLS wymaga pomiaru w docelowej przeglądarce.

## Animacje przewijania

`motion.css` i `motion.js`: odwracalne odsłanianie sekcji, wskaźnik przewinięcia, perspektywa podglądu, sticky cards i ruch ilustracji HTML/CSS. Inspiracja: https://scroll-driven-animations.style/ oraz przekazane nagranie projektu Outcrowd. Implementacja własna, bez kopiowania mediów. CSS scroll()/view() wykorzystuje natywne osie czasu. Starsze przeglądarki otrzymują ograniczony fallback requestAnimationFrame (odsłanianie i wskaźnik), bez polyfill. Sticky cards wyłączone na telefonach. Ruch można wyłączyć; prefers-reduced-motion ma pierwszeństwo. Preferencja jest współdzielona z aplikacją. Bez JS treść pozostaje widoczna.

## Dashboard w stylistyce referencji

Nowy dashboard korzysta z `dashboard.js`, `dashboard.css` oraz wspólnego `theme.css`: lawenda, róż, jasnoszare tło, czarne przyciski i miękkie karty. Zachowuje dane Infectio, bez fikcyjnego zespołu, czatu lub zdjęć. Zakładki filtrują rzeczywiste rekordy; kalendarz pokazuje daty lokalnych powtórek; timer 25 minut zachowuje termin zakończenia między widokami, a notatki zapisują się lokalnie. Kalendarz korzysta ze strefy czasowej urządzenia.

`transitions.css` deklaruje przejścia dokumentów LP ↔ /app/ dla przeglądarek obsługujących View Transitions. Starsze przeglądarki korzystają ze zwykłej nawigacji. Przełącznik animacji i prefers-reduced-motion wyłączają efekty. Moduły nauki zachowano.

## Sekwencja scen z nowego nagrania

`scenes.css` i `scenes.js` zamieniają prezentację trzech trybów nauki w jedną przypiętą scenę sterowaną pozycją przewijania. Ruch kart, tekstu i ilustracji jest odwracalny. Bez przechwytywania kółka myszy; nawigacja klawiaturą przez przyciski etapów. Ukryte sceny mają inert i aria-hidden. Telefon, niski ekran, wyłączony ruch i prefers-reduced-motion otrzymują zwykły układ bloków.

### Korekta UX po przeglądzie
Nawigacja wskazuje aktywny tryb podczas sesji. Pulpit ma dwie kolumny, większy tekst i spójne przyciski. Przypięte sceny zastępuje slider z przyciskami, klawiaturą i gestem. Animacje działają domyślnie i respektują prefers-reduced-motion. Usunięto przełączniki ruchu i wskazany napis o pochodzeniu materiałów. Widoki 390 px sprawdzone bez poziomego przepełnienia.

### Plan powtórek i przyciski
Własne terminy dostępne z pulpitu, kalendarza, karty pytania oraz sesji. Plan w sekcji postępu pozwala zmienić i usunąć datę oraz otworzyć konkretne pytanie. Zapis w localStorage, bez powiadomień. Przyszły termin ręczny nie jest nadpisywany samooceną. Ujednolicone przyciski i ikony SVG po lewej stronie. Zweryfikowano tworzenie, zmianę, odświeżenie, kalendarz, usuwanie i formularz 390 px; 10 testów automatycznych.

### Przegląd UX: dashboard i ruch landingu (gałąź ux/landing-motion-dashboard)
Dashboard: `control.css` ładuje się ostatni i porządkuje układ w dwie kolumny (nauka po lewej, status po prawej). Jedna akcja główna: „Rozpocznij powtórki (n)", a gdy nic nie czeka, „Zacznij naukę". Na kartach pytanie jest nagłówkiem, temat cichą etykietą. Tryby nauki to trzy kafelki z liczbą pozycji. Timer i notatki są neutralne, bez kolorowych gradientów. Z paska bocznego usunięto zdublowane linki. Wejście kart trwa 0,5 s i zmienia tylko przezroczystość oraz 8 px położenia.

Landing: `flair-pre.js`, `flair.css` i `flair.js` dodają ruch o wspólnej idei aktywnego przypominania. Nagłówek wjeżdża słowami, podgląd pochyla się za kursorem i liczy do 109/75/15/19, karty funkcji wchodzą kolejno, a trzy sceny trybów odgrywają własny scenariusz (odwrócenie fiszki, pisanie odpowiedzi, wybór w quizie). Scenariusze zaczynają się, gdy karta jest widoczna i na ekranie. `prefers-reduced-motion` i przełącznik ruchu wyłączają całość, a treść pozostaje kompletna. Bez JS strona jest statyczna.
