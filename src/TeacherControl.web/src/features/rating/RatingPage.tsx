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
        <Box w={{ base: '100%', sm: 300 }} style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
          <ScrollArea h="100%">
            {isLoadingTeachers ? (
              <Center h="100%"><Loader /></Center>
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
        
        <Box flex={1} style={{ overflowY: 'auto' }} bg="white">
          {isLoadingTeacher ? (
             <Center h="100%"><Loader /></Center>
          ) : selectedTeacher ? (
            <TeacherDetail teacher={selectedTeacher} />
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
