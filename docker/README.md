# Používání compose souborů

## docker-compose.yaml

Pro použití tohoto souboru stačí pouze spustit příkaz `docker compose up -d`.

Má čtyři proměnné, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_USER` a `PORT`, s tím že vyjma `POSTGRES_PASSWORD` je vše volitelné a
ve výchozí hodnota portu je `8080`, ostatní mají výchozí hodnotu `teacher_control`.

Kvůli tomu, že `POSTGRES_PASSWORD` je povinná proměnná, musíte ji nějak nastavit. Pokud zkopírujete `.env.example` a
udělá z něj `.env`, tak máte vlastně vše potřebné nastavené, jelikož si bere hodnoty z `.env`.

## db-only.docker-compose.yaml

Spustí pouze databázi PostgreSQL, například pro lokální vývoj, kdy API běží mimo Docker.
Příkaz: `docker compose -f db-only.docker-compose.yaml up -d`.

Má tři proměnné, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_USER` a `POSTGRES_PORT`, s tím že vyjma
`POSTGRES_PASSWORD` je vše volitelné. Výchozí hodnota portu je `5432`, `POSTGRES_DB` a `POSTGRES_USER`
mají výchozí hodnotu `teacher_control`. Hodnoty se opět berou z `.env`.

Databáze je dostupná pouze z místního počítače (`127.0.0.1`).

## app.docker-compose.yaml

Spustí aplikaci (web a API) bez databáze, ta se připojuje k externímu serveru PostgreSQL.
Příkaz: `docker compose -f app.docker-compose.yaml up -d --build`.

Povinné proměnné jsou `POSTGRES_HOST` a `POSTGRES_PASSWORD`. Volitelné jsou `POSTGRES_PORT` (výchozí `5432`),
`POSTGRES_DB` a `POSTGRES_USER` (obě výchozí `teacher_control`), `POSTGRES_SSL_MODE` (výchozí `VerifyFull`)
a `PORT` (port webu, výchozí `80`).

Spojení s databází je šifrované pomocí TLS. Pokud server používá self-signed certifikát, nastav
`POSTGRES_SSL_MODE` na `Require` nebo `VerifyCA` a poskytni kořenový certifikát.