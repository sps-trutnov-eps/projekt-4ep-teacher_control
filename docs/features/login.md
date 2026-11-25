# Login feature

## MUSTs
1) Přihlášení do aplikace přes verifikaci školního emailu.
    - Registrace
    - Login
    - Uložení do lokální databáze
    - **Bude hotová když:** bude se moct přihlásit do aplikace, vytvořit účet
    - **Zodpovědný:** Ondřej Imlauf

2) Profil/Stránka uživatele
    - Stránka, která bude ukazovat informace o uživateli
    - **Bude hotová když:** bude se moct jít na stránku uživatele každého uživatele.
    - **Zodpovědný:** Honza Serbousek

3) Session access
    - Po přihlášení se vytvoří session cookie v prohlížeči. Následující přístupy na stránku budou kontrolovat jestli je cookie validný a jestli ano tak přihlásí uživatele, bez potřeby se přihlásit
    - Session cookie by měla mít TTL
    - Měla by být completně secured a neexplotable
    - **Bude hotová když: ** přihlášení nebude vždy potřeba explicitní login, ale bude automatický
    - **Zodpovědný:** Martin Hoffmann

## D4 – Nasazení pro žáky

Bez přihlášení není nic o učitelích vidět. Položky odpovídají cílům týmu LOGIN (vedoucí týmu položku nemá).

1) Registrace s ověřením e-mailem na nasazené aplikaci
    - Registrace školním e-mailem `@spstrutnov.cz` odešle 6místný ověřovací kód skutečným e-mailem přes SMTP (přihlašovací údaje se zadávají konfigurací `Email__*`, kód se navíc vypíše do konzole API). Znovuodeslání kódu a potvrzení kódu.
    - **Bude hotová když:** na nasazené aplikaci se žák zaregistruje školním e-mailem, do jeho schránky přijde e-mail s kódem, po zadání kódu je účet aktivní a žák se může přihlásit. Špatný kód je odmítnut, e-mail mimo `@spstrutnov.cz` je odmítnut. Nepřihlášený návštěvník vidí jen přihlášení/registraci, žádná data o učitelích.
    - **Zodpovědný:** Ondřej Imlauf

2) Zapomenuté heslo
    - Na přihlašovací stránce odkaz „Zapomenuté heslo“: žák zadá školní e-mail, přijde mu e-mailem kód (stejným způsobem jako při registraci, s omezenou platností a počtem pokusů), zadá kód a nové heslo (splňující pravidla hesla).
    - **Bude hotová když:** na nasazené aplikaci žák klikne na „Zapomenuté heslo“, zadá svůj e-mail, obdrží e-mail s kódem, zadá kód a nové heslo a poté se přihlásí novým heslem; staré heslo už nefunguje. Nesprávný nebo prošlý kód heslo nezmění.
    - **Zodpovědný:** Martin Hoffmann

3) Můj profil – vlastní aktivita žáka
    - Stránka Můj profil ukazuje přihlášenému žákovi jeho vlastní aktivitu: jeho recenze, jeho hlasy v pololetním hlasování a jeho hlášky z binga (včetně stavu schválení). Data vidí jen jejich autor.
    - **Bude hotová když:** žák se přihlásí, napíše recenzi, zahlasuje v pololetí a přidá hlášku; na stránce Můj profil vidí všechny tři věci ve svých seznamech. Jiný žák je ve svém profilu nevidí. Nepřihlášený uživatel je přesměrován na přihlášení.
    - **Zodpovědný:** Honza Serbousek
