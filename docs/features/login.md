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