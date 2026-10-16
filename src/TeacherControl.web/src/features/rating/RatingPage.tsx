import { useState } from 'react'
import { Box, Flex, ScrollArea, Loader, Center, Alert } from '@mantine/core'
import { PageHeader } from '@/shared/ui'
import { useTeachers, useTeacher } from './api'
import { TeacherList } from './components/TeacherList'
import { TeacherDetail } from './components/TeacherDetail'

export function RatingPage() {
  const { data: teachers, isLoading: isLoadingTeachers, isError: isErrorTeachers } = useTeachers()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: selectedTeacher, isLoading: isLoadingTeacher } = useTeacher(selectedId)

  return (
    <Box h="calc(100vh - 100px)" display="flex" style={{ flexDirection: 'column' }}>
      <PageHeader title="Rating" description="Hodnocení učitelů" />

      <Flex flex={1} style={{ overflow: 'hidden' }} mt="md">
        {/* Levý panel - seznam učitelů. Na mobilu se schová, pokud je vybrán učitel */}
        <Box
          w={{ base: '100%', sm: 300 }}
          display={{ base: selectedId ? 'none' : 'block', sm: 'block' }}
          style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}
        >
          <ScrollArea h="100%">
            {isLoadingTeachers ? (
              <Center h="100%">
                <Loader />
              </Center>
            ) : isErrorTeachers || !teachers ? (
              <Alert color="red">Chyba při načítání učitelů.</Alert>
            ) : (
              <TeacherList
                teachers={teachers}
                selectedTeacherId={selectedId}
                onSelect={setSelectedId}
              />
            )}
          </ScrollArea>
        </Box>

        {/* Pravý panel - detail učitele. Na mobilu je přes celou šířku a zobrazí se jen pokud je vybrán */}
        <Box
          flex={1}
          style={{ overflowY: 'auto' }}
          bg="white"
          display={{ base: selectedId ? 'block' : 'none', sm: 'block' }}
        >
          {isLoadingTeacher ? (
            <Center h="100%">
              <Loader />
            </Center>
          ) : selectedTeacher ? (
            <TeacherDetail teacher={selectedTeacher} onBack={() => setSelectedId(null)} />
          ) : (
            <Center h="100%" c="dimmed">
              Vyberte učitele ze seznamu pro zobrazení podrobností
            </Center>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
