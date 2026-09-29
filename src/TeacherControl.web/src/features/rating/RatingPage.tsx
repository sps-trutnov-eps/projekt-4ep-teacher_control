import { Box, Flex, ScrollArea } from '@mantine/core'
import { PageHeader } from '@/shared/ui'
import { TeacherList } from './components/TeacherList'

export function RatingPage() {
  return (
    <Box h="calc(100vh - 100px)" display="flex" style={{ flexDirection: 'column' }}>
      <PageHeader title="Rating" description="Hodnocení učitelů" />
      
      <Flex flex={1} style={{ overflow: 'hidden' }} mt="md">
        <Box w={{ base: '100%', sm: 300 }} style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
          <ScrollArea h="100%">
            <TeacherList />
          </ScrollArea>
        </Box>
        
        <Box flex={1} style={{ overflowY: 'auto' }} p="xl">
          {/* Prostor pro detail učitele - zatím prázdný */}
        </Box>
      </Flex>
    </Box>
  )
}
