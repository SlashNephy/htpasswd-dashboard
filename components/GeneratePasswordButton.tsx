import {
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Text,
  Tooltip,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import {
  IconAlertTriangle,
  IconClipboardCheck,
  IconKey,
  IconUserExclamation,
} from '@tabler/icons-react'
import { useCallback } from 'react'
import { useQuery, useQueryClient } from 'react-query'

import { fetcher } from '../lib/fetcher'

import type { IssueResponse, StatusResponse } from '../lib/api'
import type { Credential } from '../lib/htpasswd/backend'
import type { Service } from '../lib/services'

export function GeneratePasswordButton({
  service,
  onGenerate,
}: {
  service: Service
  onGenerate(credential: Credential): void
}): JSX.Element {
  const query = useQueryClient()
  const {
    data: status,
    isLoading,
    isError,
  } = useQuery(['status', service.key], async () =>
    fetcher<StatusResponse>(`/api/${service.key}/status`)
  )

  const clipboard = useClipboard()
  const handleClick = useCallback(() => {
    fetch(`/api/${service.key}/issue`, {
      method: 'PUT',
    })
      .then(async (response) => (await response.json()) as IssueResponse)
      .then(async (response) => {
        if (response.success) {
          onGenerate(response)

          clipboard.copy(response.password)
          showNotification({
            title: `${service.name} のパスワードが発行されました`,
            message: 'パスワードをクリップボードにコピーしました。',
            color: 'green',
            icon: <IconClipboardCheck />,
          })
          await query.invalidateQueries(['status', service.key])
        }
      })
      .catch((error) => {
        showNotification({
          title: `${service.name} のパスワードに失敗しました`,
          message: error.toString(),
          color: 'red',
          icon: <IconAlertTriangle />,
        })
      })
  }, [service.key, service.name, onGenerate, clipboard, query])

  if (isLoading) {
    return (
      <Center>
        <Group>
          <Loader variant="dots" />
          <Text>パスワード生成履歴を確認しています...</Text>
        </Group>
      </Center>
    )
  }

  if (isError || status?.success !== true) {
    return (
      <Alert
        color="red"
        icon={<IconAlertTriangle size={16} />}
        title="エラーが発生しました"
      >
        パスワード生成履歴を取得できませんでした。
      </Alert>
    )
  }

  return (
    <>
      {status.found ? (
        <Tooltip
          label="再生成すると既存のパスワードが無効化されます"
          position="bottom"
        >
          <Button
            fullWidth
            color="red"
            leftIcon={<IconUserExclamation />}
            style={{ marginTop: 20 }}
            onClick={handleClick}
          >
            パスワードを再生成する
          </Button>
        </Tooltip>
      ) : (
        <Button
          fullWidth
          leftIcon={<IconKey />}
          style={{ marginTop: 20 }}
          onClick={handleClick}
        >
          パスワードを生成する
        </Button>
      )}
    </>
  )
}
