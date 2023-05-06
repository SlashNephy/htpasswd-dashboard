import {
  ActionIcon,
  Alert,
  Code,
  Divider,
  List,
  Modal,
  Space,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import {
  IconClipboardCheck,
  IconClipboardText,
  IconExclamationMark,
} from '@tabler/icons-react'

import type { Credential } from '../lib/htpasswd/backend'
import type { Service } from '../lib/services'
import type { ModalProps } from '@mantine/core'

export function CredentialModal({
  service,
  credential,
  ...props
}: ModalProps & { service: Service; credential: Credential }): JSX.Element {
  const clipboard = useClipboard()
  const handleClipboardClick = (value: string) => {
    clipboard.copy(value)
    showNotification({
      message: 'クリップボードにコピーしました。',
      color: 'green',
      icon: <IconClipboardCheck />,
    })
  }

  return (
    <Modal {...props}>
      <Title>{service.name}</Title>
      <Divider />
      <Space p={15} />

      <Alert color="red" icon={<IconExclamationMark />}>
        このウィンドウを閉じるとパスワードは再表示されません。
        紛失した場合は再発行してください。
        <br />
        パスワードは絶対に他者と共有しないでください。
      </Alert>

      <Space p={15} />

      <Text>発行された資格情報は以下の通りです。</Text>
      <List withPadding>
        <List.Item>
          ユーザ名:{' '}
          <Code style={{ display: 'inline' }}>{credential.username}</Code>
          <Tooltip label="ユーザー名をコピー" position="right">
            <ActionIcon
              style={{ display: 'inline' }}
              onClick={() => {
                handleClipboardClick(credential.username)
              }}
            >
              <IconClipboardText size={18} />
            </ActionIcon>
          </Tooltip>
        </List.Item>
        <List.Item>
          パスワード:{' '}
          <Code style={{ display: 'inline' }}>{credential.password}</Code>
          <Tooltip label="パスワードをコピー" position="right">
            <ActionIcon
              style={{ display: 'inline' }}
              onClick={() => {
                handleClipboardClick(credential.password)
              }}
            >
              <IconClipboardText size={18} />
            </ActionIcon>
          </Tooltip>
        </List.Item>
      </List>

      <Space p={15} />

      <Text>
        {service.name} に Basic 認証でアクセスするには、
        以下のエンドポイントを使用します。
      </Text>
      <Code block>{service.urls.api_base}</Code>

      <Space p={15} />

      <Text>curl でのリクエスト例:</Text>
      <Code block>
        $ curl -X GET \<br />
        {'    '}
        -u &quot;{credential.username}:{credential.password}&quot; \<br />
        {'    '}
        {service.urls.example_api}
      </Code>
    </Modal>
  )
}
