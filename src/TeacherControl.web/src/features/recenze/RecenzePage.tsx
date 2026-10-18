import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Avatar,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Rating,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { useForm, useWatch } from 'react-hook-form'
import { PageHeader } from '@/shared/ui'
import { useCreateReview, useTeacherProfile, useTeacherReviews, useTeachers } from './api'
import { reviewSchema, type ReviewFormValues } from './schema'

export function RecenzePage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const teachersQuery = useTeachers()
  const profileQuery = useTeacherProfile(selectedId)
  const reviewsQuery = useTeacherReviews(selectedId)
  const createReview = useCreateReview(selectedId ?? 0)
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { title: '', content: '', rating: 5 },
  })
  const selectedRating = useWatch({ control: form.control, name: 'rating' })
  const teachers = teachersQuery.data ?? []
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )

  const submitReview = (values: ReviewFormValues) => {
    if (selectedId === null) return
    createReview.mutate(values, { onSuccess: () => form.reset() })
  }

  const sendReaction = (rating: 1 | 5) => {
    if (selectedId === null) return
    createReview.mutate({
      title: rating === 5 ? 'Like' : 'Dislike',
      content: rating === 5 ? 'Like' : 'Dislike',
      rating,
    })
  }

  return (
    <Stack>
      <PageHeader title="Recenze" description="Najděte učitele a přidejte vlastní hodnocení." />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper withBorder p="md" radius="sm">
          <Stack>
            <TextInput
              label="Hledat"
              placeholder="Jméno učitele"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
            <ScrollArea h={{ base: 260, sm: 500 }}>
              <Stack gap="xs">
                {teachersQuery.isLoading ? (
                  <Center p="xl">
                    <Loader />
                  </Center>
                ) : null}
                {teachersQuery.isError ? (
                  <Alert color="red">Učitele se nepodařilo načíst.</Alert>
                ) : null}
                {filteredTeachers.map((teacher) => (
                  <Button
                    key={teacher.id}
                    variant={selectedId === teacher.id ? 'light' : 'subtle'}
                    justify="space-between"
                    fullWidth
                    onClick={() => setSelectedId(teacher.id)}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Avatar src={teacher.photoUrl} radius="xl">
                        {teacher.name[0]}
                      </Avatar>
                      <Stack gap={0} align="flex-start">
                        <Text>{teacher.name}</Text>
                        <Rating value={teacher.averageRating} readOnly size="xs" />
                      </Stack>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {teacher.averageRating.toFixed(1)}
                    </Text>
                  </Button>
                ))}
                {!teachersQuery.isLoading && filteredTeachers.length === 0 ? (
                  <Text c="dimmed">Žádný učitel neodpovídá hledání.</Text>
                ) : null}
              </Stack>
            </ScrollArea>
          </Stack>
        </Paper>
        <Paper withBorder p={{ base: 'md', sm: 'xl' }} radius="sm">
          {selectedId === null ? (
            <Center h="100%">
              <Text c="dimmed">Vyberte učitele ze seznamu.</Text>
            </Center>
          ) : null}
          {selectedId !== null && profileQuery.isLoading ? (
            <Center h="100%">
              <Loader />
            </Center>
          ) : null}
          {selectedId !== null && profileQuery.data ? (
            <Stack>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={2}>{profileQuery.data.name}</Title>
                  <Text c="dimmed">{profileQuery.data.reviewCount} recenzí</Text>
                </div>
                <Button variant="subtle" onClick={() => setSelectedId(null)}>
                  Zpět
                </Button>
              </Group>
              <Text>{profileQuery.data.description || 'Bez popisu.'}</Text>
              <Group>
                <Rating value={profileQuery.data.averageRating} readOnly />
                <Text fw={700}>{profileQuery.data.averageRating.toFixed(1)} / 5</Text>
              </Group>
              <Group grow>
                <Button
                  color="teal"
                  onClick={() => sendReaction(5)}
                  loading={createReview.isPending}
                >
                  Like
                </Button>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => sendReaction(1)}
                  loading={createReview.isPending}
                >
                  Dislike
                </Button>
              </Group>
              <Title order={3}>Recenze</Title>
              {reviewsQuery.isLoading ? <Loader size="sm" /> : null}
              {(reviewsQuery.data ?? []).map((review) => (
                <Paper key={review.id} withBorder p="sm">
                  <Group justify="space-between">
                    <Text fw={600}>{review.title}</Text>
                    <Rating value={review.rating} readOnly size="sm" />
                  </Group>
                  <Text size="sm" mt="xs">
                    {review.content}
                  </Text>
                </Paper>
              ))}
              {reviewsQuery.data?.length === 0 ? (
                <Text c="dimmed">Zatím zde nejsou žádné recenze.</Text>
              ) : null}
              <form onSubmit={form.handleSubmit(submitReview)}>
                <Stack>
                  <Title order={3}>Přidat recenzi</Title>
                  <TextInput
                    label="Nadpis"
                    {...form.register('title')}
                    error={form.formState.errors.title?.message}
                  />
                  <Textarea
                    label="Text recenze"
                    minRows={4}
                    {...form.register('content')}
                    error={form.formState.errors.content?.message}
                  />
                  <Group justify="space-between">
                    <Rating
                      value={selectedRating}
                      onChange={(value) => form.setValue('rating', value)}
                    />
                    <Button type="submit" loading={createReview.isPending}>
                      Odeslat recenzi
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Stack>
          ) : null}
        </Paper>
      </SimpleGrid>
    </Stack>
  )
}
