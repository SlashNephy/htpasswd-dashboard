import {
  ActionIcon,
  Alert,
  Anchor,
  AppShell,
  Avatar,
  Container,
  Footer,
  Grid,
  Group,
  Header,
  Space,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core'
import gravatar from 'gravatar'
import Head from 'next/head'
import { useQuery } from 'react-query'
import { Heart, InfoCircle, MoonStars, Package, Sun } from 'tabler-icons-react'

import { IssueButton } from '../components/IssueButton'
import { services } from '../lib/services'
import nextConfigJs from '../next.config.js'
import packageJson from '../package.json'

import type { HelloResponse } from './api/hello'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const { data: hello } = useQuery<HelloResponse>('hello', async () =>
    fetch(`${nextConfigJs.basePath}/api/hello`).then(async (res) => res.json())
  )

  if (!hello || !hello.success) {
    return null
  }

  return (
    <>
      <Head>
        <title>{packageJson.name}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <AppShell
        header={
          <Header height={80} p="md">
            <Group style={{ justifyContent: 'center' }}>
              <Package size={40} />
              <Title>{packageJson.name}</Title>
              <ActionIcon
                variant="outline"
                color={colorScheme === 'dark' ? 'yellow' : 'blue'}
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
              >
                {colorScheme === 'dark' ? (
                  <Sun size={18} />
                ) : (
                  <MoonStars size={18} />
                )}
              </ActionIcon>
            </Group>
          </Header>
        }
        footer={
          <Footer
            height={60}
            p="md"
            fixed
            position={{ bottom: 0 }}
            style={{
              width: '100%',
            }}
          >
            <Text size="sm" style={{ textAlign: 'center' }}>
              <Anchor size="sm" href={packageJson.repository} target="_blank">
                {packageJson.name}
              </Anchor>
              &nbsp;made with{' '}
              <Heart size={16} strokeWidth={2} color="#d27979" />. Built with
              Next.js & Mantine.
            </Text>
          </Footer>
        }
      >
        <Container>
          <Alert color="cyan" icon={<InfoCircle />}>
            {packageJson.name} では、各種サービスへのアクセスに使用する Basic
            認証の資格情報を発行することができます。
            <br />
            サービスごとに1つのアクセストークンを発行可能です。
            <br />
            発行されたアクセストークンには有効期限はありません。
          </Alert>
          <Space p={10} />
          <Alert
            color="green"
            icon={<Avatar src={gravatar.url(hello?.email)} size={30} />}
          >
            {hello?.email} としてログイン中です。
          </Alert>

          <Space h={200} />

          <Grid justify="center">
            <Group>
              {services.map((service) => (
                <IssueButton key={service.name} service={service} />
              ))}
            </Group>
          </Grid>
        </Container>
      </AppShell>
    </>
  )
}

export default Home
