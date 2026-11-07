import { Grid, Stack } from '@mantine/core'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui'
import { TeacherCard } from './components/TeacherCard'
import { TeacherList } from './components/TeacherList'

export function PololetiPage() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)

  return (
    <Stack>
      <PageHeader
        title="Pololetní hlasování"
        description="Vyber učitele a dej svůj hlas v titulech, které si zaslouží. V každém titulu máš v pololetí jeden hlas, který můžeš kdykoliv přesunout."
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TeacherList selectedTeacherId={selectedTeacherId} onSelect={setSelectedTeacherId} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <TeacherCard teacherId={selectedTeacherId} />
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
