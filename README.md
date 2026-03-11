# Login Security Lab

Dette projekt demonstrerer forskellen mellem en usikker og en forbedret version af en login-applikation.

Repositoryet indeholder to versioner:

* **insecure-login** – original version med flere sikkerhedssårbarheder
* **secure-login** – forbedret version hvor de identificerede sårbarheder er rettet

---

# Identificerede sårbarheder

Den oprindelige applikation indeholdt flere klassiske web-sikkerhedsproblemer:

* SQL injection i login og profilopdatering
* Passwords gemt i klartekst i databasen
* Mulighed for privilege escalation (brugere kunne ændre deres egen rolle)
* Usikker session-konfiguration
* Eksponering af brugerdata via debug endpoint

Disse sårbarheder kompromitterede primært **Confidentiality** og **Integrity**.

---

# Implementerede sikkerhedsforbedringer

I den sikre version er følgende forbedringer implementeret:

**1. Parameteriserede SQL-forespørgsler**

Alle databasekald bruger parameteriserede queries (`?`) i stedet for string interpolation.
Dette forhindrer SQL injection-angreb.

**2. Password hashing med bcrypt**

Passwords lagres nu som bcrypt-hashes i stedet for klartekst.
Ved login verificeres passwordet med `bcrypt.compare()`.

**3. Fjernelse af privilege escalation**

Brugere kan ikke længere ændre deres egen rolle via profilopdatering.

**4. Sikker session-konfiguration**

Session cookies er konfigureret med:

* `httpOnly: true`
* `sameSite: "strict"`

Dette reducerer risikoen for XSS- og CSRF-relaterede angreb.

**5. Fjernelse af debug endpoint**

Endpointet `/debug/users`, som eksponerede alle brugere og passwords, er fjernet fra den sikre version.

---

# Resultat

Den forbedrede version reducerer systemets angrebsflade betydeligt og beskytter bedre mod:

* SQL injection
* credential leakage
* privilege escalation
* session hijacking
