import {
  Alert,
  Avatar,
  Center,
  Grid,
  Group,
  Loader,
  Space,
  Text,
} from '@mantine/core'
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'
import gravatar from 'gravatar'
import React from 'react'
import { useQuery } from 'react-query'

import { AppLayout } from '../components/AppLayout'
import { ServiceCard } from '../components/ServiceCard'
import { fetcher } from '../lib/fetcher'
import packageJson from '../package.json'

import type { HelloResponse } from '../lib/api'
import type { NextPage } from 'next'
import { Service } from '../lib/services'

const Index: NextPage = () => {
  const {
    data: hello,
    isLoading,
    isError,
  } = useQuery('hello', async () => fetcher<HelloResponse>('/api/hello'))
  const { data: services } = useQuery('services', async () =>
    fetcher<Service[]>('/api/services')
  )

  return (
    <AppLayout>
      <Alert color="cyan" icon={<IconInfoCircle />}>
        {packageJson.name} では、各種サービスへのアクセスに使用する Basic{' '}
        認証の資格情報を発行することができます。
        <br />
        サービスごとに1つのパスワードを発行可能です。
        <br />
        発行されたパスワードには有効期限はありません。
      </Alert>

      <Space p={10} />

      {isLoading ? (
        <Center>
          <Group>
            <Loader variant="dots" />
            <Text>ユーザーを確認しています...</Text>
          </Group>
        </Center>
      ) : isError || hello?.success !== true ? (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="エラーが発生しました"
          color="red"
        >
          ユーザーを確認できませんでした。
        </Alert>
      ) : (
        <Alert
          color="green"
          icon={<Avatar src={gravatar.url(hello.email)} size={30} />}
        >
          {hello.email} としてログインしています。
        </Alert>
      )}

      <Space h={200} />

      <Grid justify="center">
        {services?.map((service) => (
          <Grid.Col key={service.key} span={6}>
            <ServiceCard service={service} shadow="md" p="lg" m="lg" />
          </Grid.Col>
        ))}
      </Grid>
    </AppLayout>
  )
}

export default Index
