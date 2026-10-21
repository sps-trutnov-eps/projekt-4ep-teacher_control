import { Alert, Divider, Stack } from '@mantine/core'
import { useAuth } from '@/shared/auth'
import { PageHeader } from '@/shared/ui'
import { VzorForm } from './components/VzorForm'
import { VzorList } from './components/VzorList'

export function VzorPage() {
  const { hasRole } = useAuth()

  // Oprávnění se řeší přes role, nikdy přes jméno uživatele.
  const canCreate = hasRole('teacher')

  return (
    <Stack>
      <PageHeader
        title="Vzor"
        description="Referenční featura. Tvar kódu kopíruj odtud, obsah ne."
      />

      {canCreate ? (
        <>
          <VzorForm />
          <Divider my="sm" />
        </>
      ) : (
        <Alert color="blue" title="Formulář je jen pro učitele">
          Přihlášený uživatel nemá roli <strong>teacher</strong>. Ve vývoji si uživatele přepneš
          vpravo nahoře.
        </Alert>
      )}

      <VzorList />
    </Stack>
  )
}
