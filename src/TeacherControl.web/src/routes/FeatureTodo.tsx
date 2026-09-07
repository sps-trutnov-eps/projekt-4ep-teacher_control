import { Alert } from '@mantine/core'

/** Zástupná stránka featury, kterou zatím nikdo neudělal. Smaž ji, až přidáš svou stránku. */
export function FeatureTodo({ code, name }: { code: string; name: string }) {
  return (
    <Alert title={`${code} ${name}`}>
      Tuhle featuru zatím nikdo neudělal. Až budeš mít stránku, nahraď ji v `src/routes/index.tsx`.
    </Alert>
  )
}
