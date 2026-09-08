import { Divider, Stack, TextInput } from '@mantine/core'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui'
import { useAuth } from '@/shared/auth'
import { RatingForm } from './components/RatingForm'
import { RatingList } from './components/RatingList'

export function RatingPage() {
  const { hasRole } = useAuth()
  const [subject, setSubject] = useState('')

  // Oprávnění se řeší přes role, nikdy přes jméno uživatele.
  const canCreate = hasRole('student')

  return (
    <Stack>
      <PageHeader
        title="Rating"
        description="Referenční featura. Ostatní týmy kopírují tvar kódu odtud."
      />

      {canCreate ? (
        <>
          <RatingForm />
          <Divider my="sm" />
        </>
      ) : null}

      <TextInput
        label="Filtr podle předmětu"
        placeholder="Např. Matematika"
        maw={320}
        value={subject}
        onChange={(event) => setSubject(event.currentTarget.value)}
      />

      <RatingList filters={{ subject: subject || undefined }} />
    </Stack>
  )
}
