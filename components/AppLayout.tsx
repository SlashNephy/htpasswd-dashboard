import {
  Anchor,
  AppShell,
  Container,
  Footer,
  Group,
  Header,
  Text,
  Title,
} from '@mantine/core'
import { IconHeart, IconPackage } from '@tabler/icons-react'

import { ToggleThemeButton } from './ToggleThemeButton'
import packageJson from '../package.json'

import type { PropsWithChildren } from 'react'

export function AppLayout({ children }: PropsWithChildren): JSX.Element {
  return (
    <AppShell
      footer={
        <Footer
          fixed
          height={60}
          p="md"
          position={{ bottom: 0 }}
          style={{
            width: '100%',
          }}
        >
          <Text size="sm" style={{ textAlign: 'center' }}>
            <Anchor href={packageJson.repository.url} size="sm" target="_blank">
              {packageJson.name}
            </Anchor>
            &nbsp;made with{' '}
            <IconHeart color="#d27979" size={16} strokeWidth={2} />. Built with
            Next.js & Mantine.
          </Text>
        </Footer>
      }
      header={
        <Header height={80} p="md">
          <Group style={{ justifyContent: 'center' }}>
            <IconPackage size={40} />
            <Title>{packageJson.name}</Title>
            <ToggleThemeButton />
          </Group>
        </Header>
      }
    >
      <Container>{children}</Container>
    </AppShell>
  )
}
