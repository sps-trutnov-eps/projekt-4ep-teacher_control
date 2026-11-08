# Teacher Control

Údaje pro databázi a testovacího uživatele. Databázi lze lokálně vyřešit pomocí db-only.compose.yaml.

- Database: `localhost:5432`, database/user `control`.
- Development login: `test@example.com` / `TeacherControl123`.
[.env](.env)

## Zobrazení verze ve webové aplikaci
API vrací commit, ze kterého běží, na adrese `GET /api/version`. Používá proměnnou `SOURCE_COMMIT`.
Při sestavení Docker image se commit vloží příkazem `--build-arg SOURCE_COMMIT=<SHA>`;
v Compose lze hodnotu přepsat v `.env`. Při lokálním spuštění přes `dotnet run`
nastavte `SOURCE_COMMIT` v prostředí nebo v souboru `src/TeacherControl.Api/Properties/launchSettings.json`.
