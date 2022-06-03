import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Code,
  Divider,
  Grid,
  Group,
  Image,
  List,
  Modal,
  Space,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import React from 'react'
import { useQuery, useQueryClient } from 'react-query'
import {
  ClipboardCheck,
  ClipboardText,
  ExclamationMark,
  UserExclamation,
  UserPlus,
} from 'tabler-icons-react'

import nextConfigJs from '../next.config.js'

import type {
  IssueResponse,
  StatusResponse,
} from '../pages/api/token/[...slug]'

export type Service = {
  name: string
  url: string
  imageUrl: string
  apiUrl: string
  exampleApiUrl: string
}

export const IssueButton: React.FC<{ service: Service }> = ({ service }) => {
  const theme = useMantineTheme()
  const query = useQueryClient()
  const clipboard = useClipboard({ timeout: 500 })
  const { data: status, isError } = useQuery<StatusResponse>(
    ['status', service.name],
    async () =>
      fetch(
        `${
          nextConfigJs.basePath
        }/api/token/${service.name.toLowerCase()}/status`
      ).then(async (res) => res.json())
  )
  const [issue, setIssue] = React.useState<IssueResponse & { success: true }>()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const handleClick = () => {
    void fetch(
      `${nextConfigJs.basePath}/api/token/${service.name.toLowerCase()}/issue`,
      {
        method: 'PUT',
      }
    )
      .then(async (response) => (await response.json()) as IssueResponse)
      .then(async (response) => {
        if (response.success) {
          setIssue(response)
          clipboard.copy(response.token)
          showNotification({
            title: `${service.name} のアクセストークンが発行されました`,
            message: 'クリップボードにコピーしました。',
            color: 'green',
            icon: <ClipboardCheck />,
          })
          setIsModalOpen(true)
          await query.invalidateQueries(['status', service.name])
        }
      })
  }

  const handleClipboardClick = (value?: string) => {
    if (!value) {
      return
    }

    clipboard.copy(value)
    showNotification({
      message: 'クリップボードにコピーしました。',
      color: 'green',
      icon: <ClipboardCheck />,
    })
  }

  if (!status?.success || isError) {
    return <></>
  }

  return (
    <>
      <Card shadow="md" p="lg" m="lg">
        <Card.Section component="a" href={service.url} target="_blank">
          <Image
            alt={service.name}
            height={160}
            src={service.imageUrl}
            fit="contain"
          />
        </Card.Section>

        <Group
          position="apart"
          style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
        >
          <Text weight={500}>{service.name}</Text>
        </Group>

        <Grid justify="center">
          {status.found ? (
            <Tooltip
              label="再生成すると既存のアクセストークンが無効になります"
              position="bottom"
            >
              <Button
                color="red"
                leftIcon={<UserExclamation />}
                onClick={handleClick}
                fullWidth
                style={{ marginTop: 20 }}
              >
                アクセストークンを再生成する
              </Button>
            </Tooltip>
          ) : (
            <Button
              leftIcon={<UserPlus />}
              onClick={handleClick}
              fullWidth
              style={{ marginTop: 20 }}
            >
              アクセストークンを生成する
            </Button>
          )}
        </Grid>
      </Card>

      <Modal
        centered
        opened={!!issue && isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <Title>{service.name}</Title>
        <Divider />
        <Space p={15} />

        <Alert color="red" icon={<ExclamationMark />}>
          このウィンドウを閉じるとアクセストークンは再表示されません。
          紛失した場合は再発行してください。
          アクセストークンは絶対に他者と共有しないでください。
        </Alert>

        <Space p={15} />

        <Text>発行されたアクセストークンは以下の通りです。</Text>
        <List withPadding>
          <List.Item>
            ユーザ名:{' '}
            <Code style={{ display: 'inline' }}>{issue?.username}</Code>
            <Tooltip label="ユーザー名をコピー" position="right">
              <ActionIcon
                style={{ display: 'inline' }}
                onClick={() => handleClipboardClick(issue?.username)}
              >
                <ClipboardText size={18} />
              </ActionIcon>
            </Tooltip>
          </List.Item>
          <List.Item>
            パスワード:{' '}
            <Code style={{ display: 'inline' }}>{issue?.token}</Code>
            <Tooltip label="パスワードをコピー" position="right">
              <ActionIcon
                style={{ display: 'inline' }}
                onClick={() => handleClipboardClick(issue?.token)}
              >
                <ClipboardText size={18} />
              </ActionIcon>
            </Tooltip>
          </List.Item>
        </List>

        <Space p={15} />

        <Text>
          {service.name} に Basic 認証でアクセスするには
          次のエンドポイントを使用します。
        </Text>
        <Code block>{service.apiUrl}</Code>

        <Space p={15} />

        <Text>curl でのリクエスト例:</Text>
        <Code block>
          $ curl -X GET \<br />
          {'    '}
          -u &quot;{issue?.username}:{issue?.token}&quot; \<br />
          {'    '}
          {service.exampleApiUrl}
        </Code>
      </Modal>
    </>
  )
}
