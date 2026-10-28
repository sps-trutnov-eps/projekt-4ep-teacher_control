# shared/theme

Jednotný vzhled celé aplikace podle [design_rules.md](../../../../../docs/design/design_rules.md).
Je zapojený v `main.tsx`, takže ve featuře nic nenastavuješ, jen používáš Mantine komponenty.

- Barvy: `color="brand"` (výchozí, modrá `#1655A3`), `color="red"` na mazání a chyby, `color="green"` na
  potvrzení. Tmavě modrá je `brand.8`, světle modrá `brand.0`. Pomocný text je `c="dimmed"`.
- Nadpisy: `<Title order={1|2|3}>`, velikost i barvu mají z tématu. Hlavička stránky je `PageHeader`.
- Mezery: `xs` 8, `sm` 12, `md` 16, `lg` 24, `xl` 32 px, tedy `gap="md"`, `p="lg"` atd.
- Font Inter, pozadí stránky, zaoblení, `Card`, `Modal` a `Rating` jsou nastavené globálně.
- Vedlejší tlačítko je `variant="outline"`.

Ve featuře nepiš vlastní `theme.ts`, hex barvy ani `font-family`. Chybí ti něco, napiš frontend masterovi.

V testech předávej téma do provideru, viz `features/vzor/VzorPage.test.tsx`.
