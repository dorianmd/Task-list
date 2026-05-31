# Aplikacja webowa Lista Zadań – Dokumentacja i Specyfikacja Projektu

[![Wersja Produkcyjna](https://img.shields.io/badge/Aplikacja_Live-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://task-list-omega-kohl.vercel.app/)

Aplikacja webowa do zarządzania zadaniami, stworzona przy użyciu Next.js (App Router) i TypeScript. Zapewnia wygodne i płynne środowisko do organizacji czasu, łącząc architekturę opartą na komponentach klienckich z bezpiecznym zapleczem API.

## 1. Specyfikacja Projektu

### i. Opis problemu i projektu

Współczesne środowisko pracy, nauki oraz codziennego życia prywatnego generuje ogromną ilość informacji, zobowiązań i dynamicznie zmieniających się priorytetów. Klasyczne, papierowe formy notowania lub proste aplikacje listowe bardzo często okazują się niewystarczające, prowadząc do chaosu informacyjnego, zapominania o drobnych sprawach domowych oraz utraty kontroli nad ważnymi terminami zawodowymi.

Aplikacja *Lista Zadań* rozwiązuje ten problem, oferując elastyczny, cyfrowy system do codziennego planowania obowiązków i kompleksowej organizacji czasu. Zamiast płaskiej, nieczytelnej struktury, system pozwala na rejestrowanie głównych projektów i zadań oraz rozbijanie ich na mniejsze podzadania (subtaski), co umożliwia precyzyjne monitorowanie postępów. Dodatkowo wbudowany moduł dynamicznych tagów i zaawansowane filtry czasowe pozwalają użytkownikowi błyskawicznie oddzielić obowiązki zawodowe od spraw prywatnych, wyselekcjonować zadania krytyczne na dany dzień i skutecznie zarządzać codzienną produktywnością.

### ii. Uzasadnienie wyboru technologii aplikacji internetowej

Wybór architektury aplikacji internetowej typu Single Page Application (SPA) zamiast klasycznego oprogramowania desktopowego uwarunkowany jest następującymi zaletami architektonicznymi i użytkowymi:

1. **Pełna wieloplatformowość (Cross-platform):** Kod źródłowy tworzony jest tylko raz, a użytkownik ma stały dostęp do swoich list z poziomu dowolnego urządzenia (komputer, tablet, smartfon) wyposażonego w przeglądarkę, bez konieczności pobierania i instalowania zewnętrznych aplikacji.
2. **Centralizacja bazy danych w chmurze:** Wszystkie operacje na danych synchronizują się w chmurze w czasie rzeczywistym. Zapewnia to natychmiastową spójność informacji podczas płynnego przełączania się między urządzeniami (np. planowanie zadań na komputerze w biurze i szybki wgląd w listę zakupów czy spraw prywatnych na telefonie podczas powrotu do domu).
3. **Optymalizacja zasobów urządzenia końcowego:** Cała ciężka logika biznesowa, operacje kryptograficzne oraz zapytania relacyjne są oddelegowane na serwer i chmurowy klaster bazodanowy. Urządzenie użytkownika odpowiada jedynie za renderowanie interfejsu (warstwę prezentacji), co gwarantuje wysoką wydajność systemu i niskie zużycie baterii na smartfonach.

### iii. Wymagania funkcjonalne

* **Konta użytkowników i autoryzacja:** Bezpieczna rejestracja oraz logowanie oparte na tokenach JWT (JSON Web Tokens) zapisywanych w ciasteczkach HttpOnly. Automatyczne logowanie po rejestracji oraz mechanizm płynnego odnawiania sesji.
* **Zarządzanie zadaniami i podzadaniami:** Pełna obsługa procesu CRUD (Create, Read, Update, Delete) dla zadań głównych z możliwością dopisywania do nich wielu powiązanych podzadań (subtasków).
* **Dynamiczna kategoryzacja (Tagi):** Możliwość tworzenia w locie własnych etykiet, definiowania ich nazwy oraz wyboru koloru z palety HEX w celu tematycznej segmentacji danych (np. wyraźne rozgraniczenie zadań na tagi: *Praca*, *Dom*, *Zakupy*, *Uczelnia*).
* **Inteligentne filtrowanie i wyszukiwanie:** Wbudowane widoki czasowe (Dzisiaj, Nadchodzące) oraz statusowe (Wszystkie, Ważne, Zaległe, Skończone) współpracujące z tekstową wyszukiwarką działającą w czasie rzeczywistym.
* **Bezpieczeństwo profilu (Strefa Zagrożenia):** Możliwość bezpiecznej zmiany hasła oraz opcja trwałego usunięcia konta, skutkująca kaskadowym wyczyszczeniem z bazy wszystkich powiązanych danych użytkownika.

### iv. Wymagania pozafunkcjonalne

* **Bezpieczeństwo i poufność danych:** Jednokierunkowe haszowanie haseł w bazie danych algorytmem bcrypt. Zabezpieczenie tokenów sesyjnych flagą HttpOnly, co uniemożliwia ich odczyt przez skrypty JavaScript i skutecznie blokuje ataki typu XSS (Cross-Site Scripting).
* **Wydajność i asynchroniczność (UX):** Wykorzystanie architektury SPA i asynchronicznych zapytania Fetch (AJAX) do komunikacji z API. Zmiany statusów zadań czy dodawanie tagów odbywają się bez pełnego przeładowywania strony, zapewniając płynność interfejsu.
* **Responsywność (RWD):** Pełne dostosowanie układu graficznego do smartfonów i monitorów przy użyciu klas responsywnych frameworka Tailwind CSS (Media Queries), gwarantujące brak poziomego przewijania na ekranach mobilnych.

### v. Potencjalni odbiorcy systemu

1. **Osoby pracujące w trybie zadaniowym / Freelancerzy:** Potrzebujący przejrzystego narzędzia do organizacji niezależnych projektów komercyjnych i rozbijania celów na mniejsze etapy.
2. **Studenci i Uczniowie:** Osoby poszukujące centralnego punktu do zarządzania terminami egzaminów, zaliczeń i codziennych obowiązków naukowych.
3. **Użytkownicy indywidualni (Zastosowanie domowe):** Osoby chcące uporządkować swoje codzienne życie prywatne – od planowania domowych budżetów i list zakupów, przez organizację rutynowych obowiązków, aż po zarządzanie długoterminowymi celami osobistymi.

### vi. Korzyści biznesowe

1. **Minimalizacja chaosu informacyjnego:** Struktura zadań i podzadań oraz czytelne filtry redukują czas potrzebny na organizację pracy i bezpośrednio wpływają na wzrost produktywności oraz redukcję stresu w życiu codziennym użytkownika.
2. **Skalowalność i potencjał monetyzacji (SaaS):** Architektura oparta o Next.js i relacyjną bazę w chmurze pozwala na bezproblemowe wdrożenie planów Premium (np. limity liczby zadań, współdzielenie list z członkami rodziny lub zespołem pracowniczym, czy zaawansowane statystyki czasu pracy).

---

## 2. Tech Stack

* Frontend: React, Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React.
* Backend: Node.js, Next.js API Routes, TypeScript.
* Baza danych & ORM: PostgreSQL, Prisma ORM. Struktura bazy danych została w pełni znormalizowana do Trzeciej Postaci Normalnej (3NF) poprzez m.in. wydzielenie relacji wiele-do-wielu dla tagów do osobnej tabeli asocjacyjnej, co zapobiega redundancji danych ustrukturyzowanych.
* Bezpieczeństwo & Auth: Implementacja JWT (Ciasteczka w trybie HttpOnly), Bcrypt.

---

## 3. Struktura i Architektura (Separacja Warstw)

Aplikacja ściśle realizuje zasady czystej architektury poprzez kategoryczny podział na warstwy odpowiedzialności (Separation of Concerns):

* `/app/(protected)/_components` – Warstwa Prezentacji (Widoku): Modułowe, izolowane komponenty interfejsu użytkownika (React / "use client") odpowiedzialne za renderowanie HTML i przechwytywanie zdarzeń użytkownika.
* `/app/api` – Warstwa Logiki i Kontrolerów: REST API odbierające żądania HTTP, realizujące procesy biznesowe i kontrolujące przepływ danych.
* `/lib` oraz `/prisma` – Warstwa Backendowa i Danych: Zawiera pliki narzędziowe backendu oraz definicję modeli relacyjnych wraz z klientem Prisma ORM, co całkowicie uniezależnia logikę biznesową od warstwy prezentacji.
* `proxy.ts` (Middleware) – Warstwa Bezpieczeństwa: Globalny filtr żądań działający jako Middleware do globalnej, bezpiecznej walidacji żądań HTTP oraz weryfikacji i odnawiania tokena JWT.

---

## 4. Dokumentacja Bazy Danych (Model Relacyjny)

Aplikacja opiera się na 3 głównych tabelach z zachowaniem pełnej spójności referencyjnej:

### 1. Tabela User
* `id` (`String`, PK) – Unikalny identyfikator użytkownika generowany jako bezpieczny ciąg tekstowy `UUID`.
* `email` (`String`, Unique) – Adres e-mail z indeksem unikalności, służący jako login do systemu.
* `password` (`String`) – Jednokierunkowo zahaszowany ciąg hasła użytkownika (algorytm bcrypt).
* `createdAt` (`DateTime`) – Znacznik czasu rejestracji konta.

### 2. Tabela Task
* `id` (`Int`, PK) – Automatycznie inkrementowany unikalny identyfikator zadania.
* `userId` (`String`, FK) – Klucz obcy powiązany z `User.id` (Relacja jeden-do-wielu, z regułą `onDelete: Cascade`).
* `parentId` (`Int`, FK, Nullable) – **Klucz obcy w relacji jedno-tabelarycznej (self-relation)**, wskazujący na `id` zadania nadrzędnego. Odpowiada za powiązanie zadań głównych z ich subtaskami.
* `title` (`String`) – Nazwa zadania.
* `description` (`String`) – Szczegółowy opis zadania.
* `completed` (`Boolean`) – Status wykonania zadania (wartość domyślna: `false`).
* `isImportant` (`Boolean`) – Flaga oznaczająca wysoki priorytet (wartość domyślna: `false`).
* `deadline` (`DateTime`) – Data ostatecznego wykonania zadania z walidacją strefy UTC.
* `createdAt` (`DateTime`) – Data utworzenia wpisu.

### 3. Model Tag
* `id` (`Int`, PK) – Automatycznie inkrementowany unikalny identyfikator tagu.
* `name` (`String`) – Nazwa etykiety.
* `userId` (`String`, FK) – Klucz obcy powiązany z `User.id` (Relacja jeden-do-wielu, z regułą `onDelete: Cascade`).

> **Uwaga strukturalna:** Relacja między modelami `Task` a `Tag` to relacja **Wiele-do-Wielu (Many-to-Many)**, zarządzana przez automatyczną tabelę łączącą generowaną przez Prisma ORM. Dodatkowo model `Tag` posiada unikalność złożoną `@@unique([userId, name])`, co uniemożliwia jednemu użytkownikowi stworzenie duplikatów tagów o tej samej nazwie, pozwalając jednocześnie na niezależne tworzenie takich samych tagów przez innych użytkowników.

Między tabelą `Task` a `Tag` występuje relacja wiele-do-wielu (Many-to-Many), reprezentowana w bazie danych przez automatyczną tabelę łączącą `_TagToTask`.

---

## 5. Uruchomienie lokalne (Development)

Postępuj zgodnie z poniższymi krokami, aby uruchomić aplikację w środowisku deweloperskim.

### 1. Wymagania wstępne

* Node.js (zalecana wersja 18+)
* npm lub yarn
* Działający silnik Docker (do szybkiego postawienia PostgreSQL)

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

Development:
```bash
npm run dev

```

Production:
```bash
npm run build
npm start
```

Aplikacja będzie dostępna pod adresem http://localhost:3000.

## 6. Autorzy

* **Dorian Mądrzycki**
* **Kacper Łangowski**
* **Patryk Michałowski**