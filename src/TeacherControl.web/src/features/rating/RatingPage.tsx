import { useSearchParams } from 'react-router'
import { Box, Flex, ScrollArea, Loader, Center, Alert, Card, Stack, Text } from '@mantine/core'
import { PageHeader } from '@/shared/ui'
import { useTeachers, useTeacherDetails } from './api'
import { TeacherList } from './components/TeacherList'
import { TeacherDetail } from './components/TeacherDetail'

export function RatingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const teacherIdParam = searchParams.get('teacher')
  const selectedTeacherId = teacherIdParam ? Number(teacherIdParam) : null

  const { data: teachers, isLoading: isLoadingTeachers, isError: isErrorTeachers } = useTeachers()
  const { data: teacherDetails, isLoading: isLoadingDetails } = useTeacherDetails(selectedTeacherId)

  // Učitel se bere přímo z paměti (ze seznamu načteného přes /api/rating/teachers)
  const selectedTeacher = teachers?.find((t) => t.id === selectedTeacherId) ?? null

  const handleSelectTeacher = (id: number) => {
    setSearchParams({ teacher: String(id) })
  }

  const handleBack = () => {
    setSearchParams({})
  }

  return (
    <Box h="calc(100vh - 100px)" display="flex" style={{ flexDirection: 'column' }}>
      <PageHeader title="Rating" description="Hodnocení učitelů" />

      <Flex flex={1} gap="lg" style={{ overflow: 'hidden' }} mt="md">
        {/* Levý panel – výběr učitelů */}
        <Card
          w={{ base: '100%', sm: 320 }}
          p={0}
          display={{ base: selectedTeacherId ? 'none' : 'block', sm: 'block' }}
          style={{ overflow: 'hidden' }}
        >
          <ScrollArea h="100%">
            {isLoadingTeachers ? (
              <Center h="100%" p="xl">
                <Loader />
              </Center>
            ) : isErrorTeachers || !teachers ? (
              <Box p="md">
                <Alert color="red" radius="lg" title="Chyba">
                  Chyba při načítání učitelů.
                </Alert>
              </Box>
            ) : (
              <TeacherList
                teachers={teachers}
                selectedTeacherId={selectedTeacherId}
                onSelect={handleSelectTeacher}
              />
            )}
          </ScrollArea>
        </Card>

        {/* Pravý panel – detail učitele (/rating?teacher=id) */}
        <Box
          flex={1}
          style={{ overflowY: 'auto' }}
          display={{ base: selectedTeacherId ? 'block' : 'none', sm: 'block' }}
        >
          {selectedTeacherId ? (
            isLoadingDetails || isLoadingTeachers ? (
              <Card h="100%">
                <Center h="100%">
                  <Loader />
                </Center>
              </Card>
            ) : selectedTeacher && teacherDetails ? (
              <TeacherDetail
                teacher={selectedTeacher}
                details={teacherDetails}
                onBack={handleBack}
              />
            ) : (
              <Card h="100%">
                <Center h="100%">
                  <Text c="dimmed">Učitel nebyl nalezen</Text>
                </Center>
              </Card>
            )
          ) : (
            <Card h="100%">
              <Center h="100%">
                <Stack align="center" gap="md">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--mantine-color-dimmed)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <Text c="dimmed">Vyberte učitele ze seznamu pro zobrazení podrobností</Text>
                </Stack>
              </Center>
            </Card>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
