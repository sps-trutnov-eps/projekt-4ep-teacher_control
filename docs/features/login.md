# Login feature
> Poznámka: Jelikož je tato featura závislá na školní infrastruktuře a active directory, takže část projektu nemůže postupovat do té doby dokuď nám školní administrátoři nedají přístup.

> Dne 9.10.2026 je zatím školní AD nepřístupné, protože nám administrátoři nedali přístup

> V případě že se nakonec ukáže že přístup do školního AD bude nemožný tak se tato featura rozšíří o vytváření, uchovávání, authentikaci, authorizaci uživatelských účtů

## MUSTs
1) Přihlášení do aplikace přes školní účet.
    - Rozpoznání mezi učiteli a žáky
    - V případě že napojení na školní sít nedopadne tak se musí implementovat i registrace účtů
    - Login stránka (jestliže napojení na školní síť bude přes Entra tak login stránka bude přes Microsfot)
    - Uložení daz z AD do lokální databáze
    - **Bude hotová když:** bude se moct přihlásit do aplikace, buďto přes školní účet nebo vytvořený účet
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