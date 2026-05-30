# Aplikacja webowa Lista Zadań – Dokumentacja i Specyfikacja Projektu

[![Wersja Produkcyjna](https://img.shields.io/badge/Aplikacja_Live-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://task-list-omega-kohl.vercel.app/)

Aplikacja webowa do zarządzania zadaniami, stworzona przy użyciu Next.js (App Router) i TypeScript. Zapewnia wygodne i płynne środowisko do organizacji czasu, łącząc architekturę opartą na komponentach klienckich z bezpiecznym zapleczem API.

## 1. Specyfikacja Projektu

### i. Opis problemu i projektu

Współczesne środowisko pracy i nauki wymaga przetwarzania dużej ilości informacji i dynamicznie zmieniających się priorytetów. Klasyczne, papierowe formy notowania zadań lub proste aplikacje listowe nie oferują wystarczającej elastyczności.

Niniejsza aplikacja rozwiązuje problem braku przejrzystości w zarządzaniu złożonymi projektami poprzez wprowadzenie struktury drzewiastej (zadań nadrzędnych i subtasków) oraz zaawansowanego systemu filtrowania czasowego i tematycznego. Pozwala to użytkownikowi skupić się na zadaniach krytycznych i minimalizuje ryzyko niedotrzymania terminów.

### ii. Uzasadnienie wyboru technologii aplikacji internetowej

Wybór architektury aplikacji internetowej (Web Application) zamiast aplikacji desktopowej lub mobilnej podyktowany jest następującymi zaletami:

1. Dostępność cross-platform: Brak konieczności instalacji zewnętrznego oprogramowania – aplikacja działa na każdym systemie (Windows, macOS, Linux, iOS, Android) wyposażonym w przeglądarkę internetową.
2. Centralizacja danych w chmurze: Wszystkie zadania synchronizują się w czasie rzeczywistym, co pozwala na płynne przełączanie urządzeń (np. komputer w pracy, telefon w podróży).
3. Optymalizacja dystrybucji zmian (CI/CD): Wszelkie aktualizacje i poprawki bezpieczeństwa (np. mechanizmu JWT) są wdrażane natychmiastowo po stronie serwera chmurowego, bez angażowania użytkownika końcowego.
4. Brak narzutu na zasoby lokalne: Ciężka logika biznesowa i zapytania bazodanowe są przetwarzane po stronie serwera i chmury, co oszczędza zasoby lokalne urządzenia użytkownika.

### iii. Wymagania funkcjonalne

* Konta użytkowników i autoryzacja: Bezpieczne rejestrowanie i logowanie oparte na tokenach JWT z wykorzystaniem ciasteczek HttpOnly. Płynne odnawianie sesji oraz automatyczne logowanie bezpośrednio po rejestracji.
* Złożone zadania i podzadania (Subtasks): Pełny proces CRUD dla struktury hierarchicznej – możliwość tworzenia głównych zadań oraz przypisywania do nich wielu mniejszych podzadań.
* Kategoryzacja za pomocą tagów: Niestandardowe, kolorowe tagi (tworzone dynamicznie) umożliwiające łatwe grupowanie i segmentację zadań.
* Filtracja i wyszukiwanie: Wbudowane inteligentne widoki: Wszystkie, Ważne, Dzisiaj, Nadchodzące, Zaległe, Skończone. Możliwość krzyżowania filtrów z tagami i tekstową wyszukiwarką działającą w czasie rzeczywistym.
* Zarządzanie profilem i bezpieczeństwem: Możliwość dokładnego określenia daty zakończenia zadania (z walidacją UTC), opcja bezpiecznej zmiany hasła oraz trwałego usunięcia konta wraz ze wszystkimi powiązanymi danymi w Strefie Zagrożenia.

### iv. Wymagania pozafunkcjonalne

* Bezpieczeństwo danych: Haszowanie haseł użytkowników za pomocą bezpiecznego algorytmu bcrypt. Autoryzacja oparta o tokeny JWT (JSON Web Tokens) przesyłane w bezpiecznych ciasteczkach HttpOnly, co zapobiega atakom typu XSS.
* Wydajność interfejsu (UX): Asynchroniczne operacje na danych (AJAX/Fetch) eliminujące potrzebę pełnego przeładowania strony internetowej przy interakcjach użytkownika, co upodabnia działanie aplikacji do systemów natywnych.
* Responsywność (RWD): Dostosowanie interfejsu (layoutu) ekranów autoryzacji oraz zarządzania zadaniami do urządzeń o różnych rozdzielczościach ekranu, ze szczególnym uwzględnieniem płynnych transformacji widoku na urządzeniach mobilnych.

### v. Potencjalni odbiorcy systemu

1. Freelancerzy i Programiści: Osoby zarządzające wieloma niezależnymi projektami, potrzebujące rozbijać duże kamienie milowe na mniejsze zadania (subtaski).
2. Studenci i Uczniowie: Osoby poszukujące prostego narzędzia do organizacji terminów egzaminów, projektów grupowych i codziennych obowiązków naukowych.

### vi. Korzyści biznesowe

1. Wzrost produktywności użytkowników: Dzięki eliminacji chaosu informacyjnego i jasnemu podziałowi na priorytety aplikacji, użytkownicy redukują czas marnowany na planowanie i minimalizują ryzyko niedotrzymania terminów.
2. Potencjał monetyzacji (SaaS): Architektura systemu pozwala na łatwe wprowadzenie kont Premium (np. limitowanie liczby tagów lub zaawansowane statystyki produktywności dla firm).

---

## 2. Tech Stack

* Frontend: React, Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React.
* Backend: Node.js, Next.js API Routes, TypeScript.
* Baza danych & ORM: PostgreSQL, Prisma ORM. Struktura bazy danych została w pełni znormalizowana do Trzeciej Postaci Normalnej (3NF) poprzez m.in. wydzielenie relacji wiele-do-wielu dla tagów do osobnej tabeli asocjacyjnej, co zapobiega redundancji danych ustrukturyzowanych.
* Bezpieczeństwo & Auth: Implementacja JWT (Ciasteczka w trybie HttpOnly), Bcrypt.

---

## 3. Struktura i Architektura (Separacja Warstw)

Aplikacja ściśle realizuje zasady czystej architektury poprzez kategoryczny podział na warstwy odpowiedzialności (Separation of Concerns):

* `/_components` – Warstwa Prezentacji (Widoku): Modułowe, izolowane komponenty interfejsu użytkownika (React / "use client") odpowiedzialne za renderowanie HTML i przechwytywanie zdarzeń użytkownika.
* `/app/api` – Warstwa Logiki i Kontrolerów: REST API odbierające żądania HTTP, realizujące procesy biznesowe i kontrolujące przepływ danych.
* `/lib` oraz `/prisma` – Warstwa Danych (Persystencji): Definicja modeli relacyjnych bazy danych oraz wzorzec Singleton dla klienta Prisma ORM, zapewniający bezpieczne transakcje i operacje CRUD.
* `proxy.ts` (Middleware) – Warstwa Bezpieczeństwa: Globalny filtr żądań (Guard/Interceptor) działający jako Middleware do globalnej i bezpiecznej walidacji żądań HTTP (obsługa wygasania tokenów JWT i Silent Refresh).

---

## 4. Dokumentacja Bazy Danych (Model Relacyjny)

Aplikacja opiera się na 3 głównych tabelach z zachowaniem pełnej spójności referencyjnej:

### 1. Tabela User

* `id` (Int, PK) - Unikalny identyfikator użytkownika (Autoincrement).
* `email` (String, Unique Index) - Adres e-mail służący jako login.
* `password` (String) - Zahaszowany ciąg hasła.
* `createdAt` (DateTime) - Data rejestracji konta.

### 2. Tabela Task

* `id` (Int, PK) - Unikalny identyfikator zadania.
* `title` (String) - Nazwa zadania.
* `description` (String, Nullable) - Szczegółowy opis.
* `completed` (Boolean, Default: false) - Status wykonania.
* `isImportant` (Boolean, Default: false) - Flaga priorytetu.
* `deadline` (DateTime, Nullable) - Data ostatecznego wykonania.
* `userId` (Int, FK) - Powiązanie z tabelą `User.id` (Relacja jeden-do-wielu).
* `parentId` (Int, FK, Nullable) - Rekurencyjne powiązanie z `Task.id` (odpowiada za strukturę drzewiastą subtasków).

### 3. Tabela Tag

* `id` (Int, PK) - Unikalny identyfikator tagu.
* `name` (String) - Nazwa etykiety.
* `color` (String) - Kod koloru w formacie HEX.

Między tabelą `Task` a `Tag` występuje relacja wiele-do-wielu (Many-to-Many), reprezentowana w bazie danych przez automatyczną tabelę łączącą `_TagToTask`.

---

## 5. Uruchomienie lokalne (Development)

Postępuj zgodnie z poniższymi krokami, aby uruchomić aplikację w środowisku deweloperskim.

### 1. Wymagania wstępne

* Node.js (zalecana wersja 18+)
* npm lub yarn
* Działający silnik Docker (do szybkiego podniesienia bazy PostgreSQL)

### 2. Klonowanie repozytorium i instalacja zależności

```bash
git clone <adres-repozytorium>
cd task-list
npm install

```

### 3. Konfiguracja zmiennych środowiskowych

Utwórz plik `.env` w głównym katalogu projektu i zdefiniuj połączenie z bazą danych oraz sekret do JWT:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tasklist"
JWT_SECRET="twoj_wygenerowany_bezpieczny_sekret_jwt"

```

### 4. Uruchomienie bazy danych

O ile w projekcie znajduje się `compose.yaml`:

```bash
docker compose up -d

```

### 5. Inicjalizacja Prisma ORM

Zsynchronizuj schemat i wygeneruj klienta Prisma:

```bash
npx prisma generate
npx prisma db push

```

### 6. Uruchomienie serwera Next.js

```bash
npm run dev

```

Aplikacja będzie dostępna pod adresem http://localhost:3000.