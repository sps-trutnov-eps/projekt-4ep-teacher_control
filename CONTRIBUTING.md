# Pravidla and Guidelines Vývoje

Vývoj v Teacher Control projektu vypadá podle toho, jakou roli plníte.

## Pro Feature Vývojáře (Frontend, Backend, Design)

Vaše práce tvoří samotný projekt. Všechen vývoj budete dělat na své osobní git větvi která bude pojmenovaná podle `váš tým/vaše role` (eg. `bingo/frontend`, `login/backend`, `pololeti/design`).

Na této větvi vás nebude nikdo jiný otravovat a až budete mít hotovo, můžete udělat Pull Request na vaší týmovou větev (eg. `feat/bingo`, `feat/rating`). (nebo to za vás může manuálně mergnout team lead)

Po review s core týmem se vám pravdě podobně vrátí pár požadavků a změn, po udělání změn vše funguje stejně jako předtím. (další PR na týmovou větev, atd.)

---

Pokud budete potřebovat kód nebo změny z jiného týmu (nebo jiného člená vašeho týmu), můžete udělat merge z `main` na vaší osobní větev, tím uděláte "update" a můžete pracovat se všemi změnami co udělali ostatní.

## Pro Feature Leads

Vaše práce je oversight a management práce všech členů pod vámi. Po dokončení nějaké práce se vám bude shromažďovat commity na vaší týmové větvi pojmenovaná podle vašeho týmu (eg. `feat/bingo`, `feat/rating`), ať pomocí Pull Requestů které budou dělat členové vašeho týmu, nebo vašeho manualního mergovaní.

Po tom co dostatek práce bude dodělano (nebo nějaké zadaní bude splněno) můžete otevřít Pull Request na větev `staging`. Core tým pak provede review a popřípadě požádá o pár změn předtím než se muže PR mergnout do core větve. (PR zůstane v tento bod otevřené) Je pak na vás, aby jste změny předali vašim členům a ty je opravili. (nebo je můžete opravit sami)

> [!note]
> změny můžete pushovat do vaší týmové větve stále dál, PR se automaticky obnoví s novými commity.

Po uzavření PR do `staging` je vaše práce přijata a "odevzdána", vaše týmová větev zůstane a můžete na ní pokračovat s dalším zadáním.

---

note: Jako tým lead jste jediný, kdo může do vaší týmové větve přidávat nebo mergovat, takže buďte prosím responsivní k vaším členům týmu.

## Guidelines

- jména commitu také prefixovat podle týmu: 
    - `abstence: nové API endpointy pro frontend`
    - `rating: úprava styling`
    - `login: oprava logoutu v blah, blah...`
    - ...
