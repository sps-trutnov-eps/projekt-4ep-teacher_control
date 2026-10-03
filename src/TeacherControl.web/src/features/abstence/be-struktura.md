# Struktura controller-based API
Toto je pouze příklad struktury, ne každá složka/soubor tam nutně bude. Příklad: Common/Extensions/ tam nejspíš nebude. Spíše jde o vaše porozumění, že máte zůstat ve své složce v Features/ a pokud budete chtít upravovat schéma databáze, tak se na mě obraťte, jelikož nelze mergovat migrace. Udržujte layered strukturu.

Pro testování můžete migrace vytvořit u sebe, ale v žádném případě je nesmíte commitovat. Jakýkoliv PR s upravenými migracemi bude odmítnut.

        src/
        └── TeacherControl.Api/
            ├── Features/
            │   ├── TeacherBingo/
            │   │   ├── Controllers/
            │   │   │   └── TeacherBingoController.cs
            │   │   ├── Services/
            │   │   │   ├── ITeacherBingoService.cs
            │   │   │   └── TeacherBingoService.cs
            │   │   ├── DTOs/
            │   │   │   ├── CreateBingoRequest.cs
            │   │   │   └── BingoResponse.cs
            │   │   ├── Models/
            │   │   │   ├── BingoGame.cs
            │   │   │   └── BingoCell.cs
            │   │   └── Configurations/
            │   │       └── BingoGameConfiguration.cs
            │   │
            │   ├── FeatureTwo/
            │   │   ├── Controllers/
            │   │   ├── Services/
            │   │   ├── DTOs/
            │   │   ├── Models/
            │   │   └── Configurations/
            │   │
            │   ├── FeatureThree/
            │   │   ├── Controllers/
            │   │   ├── Services/
            │   │   ├── DTOs/
            │   │   ├── Models/
            │   │   └── Configurations/
            │   │
            │   ├── FeatureFour/
            │   │   ├── Controllers/
            │   │   ├── Services/
            │   │   ├── DTOs/
            │   │   ├── Models/
            │   │   └── Configurations/
            │   │
            │   ├── FeatureFive/
            │   │   ├── Controllers/
            │   │   ├── Services/
            │   │   ├── DTOs/
            │   │   ├── Models/
            │   │   └── Configurations/
            │   │
            │   └── FeatureSix/
            │       ├── Controllers/
            │       ├── Services/
            │       ├── DTOs/
            │       ├── Models/
            │       └── Configurations/
            │
            ├── Data/
            │   ├── AppDbContext.cs
            │   └── Migrations/
            │
            ├── Common/
            │   ├── Middleware/
            │   ├── Exceptions/
            │   └── Extensions/
            │
            ├── Properties/
            │   └── launchSettings.json
            │
            ├── Program.cs
            ├── appsettings.json
            ├── appsettings.Development.json
            ├── .env
            ├── env.example
            └── TeacherControl.Api.csproj

        tests/
        └── TeacherControl.Tests/
            ├── Features/
            │   ├── TeacherBingo/
            │   ├── FeatureTwo/
            │   ├── FeatureThree/
            │   ├── FeatureFour/
            │   ├── FeatureFive/
            │   └── FeatureSix/
            └── TeacherControl.Tests.csproj