import { useSearchParams } from 'react-router'
import { Box, Flex, ScrollArea, Loader, Center, Group, Text } from '@mantine/core'
import { PageHeader } from '@/shared/ui'
import { useTeachers, useTeacher } from './api'
import { TeacherList } from './components/TeacherList'
import { TeacherDetail } from './components/TeacherDetail'

export function RatingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const teacherIdParam = searchParams.get('teacher')
  const selectedTeacherId = teacherIdParam ? Number(teacherIdParam) : null

  const { data: teachers, isLoading: isLoadingTeachers, isError: isErrorTeachers } = useTeachers()
  const { data: selectedTeacher, isLoading: isLoadingTeacher } = useTeacher(selectedTeacherId)

  const handleSelectTeacher = (id: number) => {
    setSearchParams({ teacher: String(id) })
  }

  const handleBack = () => {
    setSearchParams({})
  }

  return (
    <Box
      h="calc(100vh - 100px)"
      display="flex"
      style={{
        flexDirection: 'column',
        backgroundColor: '#F4F7FB',
        fontFamily: "'Inter', Arial, sans-serif",
      }}
    >
      <PageHeader title="Rating" description="Hodnocení učitelů" />

      <Flex flex={1} gap={24} style={{ overflow: 'hidden' }} mt={16}>
        {/* Levý panel – výběr učitelů (karta: bílé pozadí, zaoblení 12 px, okraj a stín #D9E3F0) */}
        <Box
          w={{ base: '100%', sm: 320 }}
          display={{ base: selectedTeacherId ? 'none' : 'block', sm: 'block' }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #D9E3F0',
            boxShadow: '0 2px 4px #D9E3F0',
            overflow: 'hidden',
          }}
        >
          <ScrollArea h="100%">
            {isLoadingTeachers ? (
              <Center h="100%" p={32}>
                <Loader color="#1655A3" />
              </Center>
            ) : isErrorTeachers || !teachers ? (
              <Box p={16}>
                <Box
                  p={16}
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #D9E3F0',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px #D9E3F0',
                    fontFamily: "'Inter', Arial, sans-serif",
                  }}
                >
                  <Group gap={8} align="baseline">
                    <Text
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#DC2626',
                        fontFamily: "'Inter', Arial, sans-serif",
                      }}
                    >
                      Chyba:
                    </Text>
                    <Text
                      style={{
                        fontSize: '0.875rem',
                        color: '#000000',
                        fontFamily: "'Inter', Arial, sans-serif",
                      }}
                    >
                      Chyba při načítání učitelů.
                    </Text>
                  </Group>
                </Box>
              </Box>
            ) : (
              <TeacherList
                teachers={teachers}
                selectedTeacherId={selectedTeacherId}
                onSelect={handleSelectTeacher}
              />
            )}
          </ScrollArea>
        </Box>

        {/* Pravý panel – detail učitele (/rating?teacher=id) */}
        <Box
          flex={1}
          style={{ overflowY: 'auto' }}
          display={{ base: selectedTeacherId ? 'block' : 'none', sm: 'block' }}
        >
          {isLoadingTeacher ? (
            <Box
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D9E3F0',
                boxShadow: '0 2px 4px #D9E3F0',
                padding: '32px',
                minHeight: '100%',
              }}
            >
              <Center h="100%">
                <Loader color="#1655A3" />
              </Center>
            </Box>
          ) : selectedTeacher ? (
            <TeacherDetail teacher={selectedTeacher} onBack={handleBack} />
          ) : (
            <Box
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D9E3F0',
                boxShadow: '0 2px 4px #D9E3F0',
                padding: '32px',
                minHeight: '100%',
              }}
            >
              <Center h="100%">
                <Box ta="center">
                  <Box mb={16}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748B"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ display: 'inline-block' }}
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Box>
                  <Text
                    style={{
                      fontSize: '1rem',
                      color: '#64748B',
                      fontFamily: "'Inter', Arial, sans-serif",
                    }}
                  >
                    Vyberte učitele ze seznamu pro zobrazení podrobností
                  </Text>
                </Box>
              </Center>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
