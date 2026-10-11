import { useSearchParams } from 'react-router'
import { Box, Flex, ScrollArea, Loader, Center, Alert } from '@mantine/core'
import { PageHeader } from '@/shared/ui'
import { useTeachers, useTeacher } from './api'
import { TeacherList } from './components/TeacherList'
import { TeacherDetail } from './components/TeacherDetail'

export function RatingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const teacherIdParam = searchParams.get('teacher')

  const { data: teachers, isLoading: isLoadingTeachers, isError: isErrorTeachers } = useTeachers()
  const { data: selectedTeacher, isLoading: isLoadingTeacher } = useTeacher(teacherIdParam)

  const handleSelectTeacher = (id: string | number) => {
    setSearchParams({ teacher: String(id) })
  }

  const handleBack = () => {
    setSearchParams({})
  }

  return (
    <Box h="calc(100vh - 100px)" display="flex" style={{ flexDirection: 'column' }}>
      <PageHeader title="Rating" description="Hodnocení učitelů" />

      <Flex flex={1} style={{ overflow: 'hidden' }} mt="md">
        {/* Levý panel - výběr učitelů. Na mobilu se schová, pokud je vybrán učitel (?teacher=id) */}
        <Box
          w={{ base: '100%', sm: 300 }}
          display={{ base: teacherIdParam ? 'none' : 'block', sm: 'block' }}
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
                selectedTeacherId={teacherIdParam}
                onSelect={handleSelectTeacher}
              />
            )}
          </ScrollArea>
        </Box>

        {/* Pravý panel - detail učitele (/rating?teacher=id). Na mobilu se zobrazí jen pokud je vybrán */}
        <Box
          flex={1}
          style={{ overflowY: 'auto' }}
          bg="white"
          display={{ base: teacherIdParam ? 'block' : 'none', sm: 'block' }}
        >
          {isLoadingTeacher ? (
            <Center h="100%">
              <Loader />
            </Center>
          ) : selectedTeacher ? (
            <TeacherDetail teacher={selectedTeacher} onBack={handleBack} />
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
