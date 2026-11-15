# Synchronizacja kodem (opcjonalna)

1. Załóż darmowy projekt na supabase.com.
2. SQL Editor → wklej `supabase.sql` → Run.
3. Settings → API: skopiuj **Project URL** i klucz **anon public**.
4. Wpisz je w `dist/sync-config.js` i wdróż aplikację.

W aplikacji: Mój postęp → „Synchronizacja między urządzeniami”.
Na serwer trafia skrót kodu i postęp nauki (bez treści pytań, bez notatek i bez e-maila).
Kto zna kod, ma dostęp do postępu, więc kod działa jak hasło. Zgubiony kod = brak dostępu do kopii z serwera.

## Łączenie drugiego urządzenia
Na stronie „Mój postęp” jest kod QR i przycisk „Skopiuj link”. Zeskanuj QR telefonem albo otwórz link: aplikacja zapyta o potwierdzenie i połączy urządzenia.
Link i QR zawierają kod synchronizacji, więc traktuj je jak hasło. Kod jest w części adresu po `#`, która nie trafia do serwera.
Biblioteka QR: `dist/qr.js` (qrcode-generator, MIT).
