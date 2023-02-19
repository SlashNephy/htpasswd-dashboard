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
import React from 'react'

import { ToggleThemeButton } from './ToggleThemeButton'
import packageJson from '../package.json'

export const AppLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <AppShell
      header={
        <Header height={80} p="md">
          <Group style={{ justifyContent: 'center' }}>
            <IconPackage size={40} />
            <Title>{packageJson.name}</Title>
            <ToggleThemeButton />
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
            <IconHeart size={16} strokeWidth={2} color="#d27979" />. Built with
            Next.js & Mantine.
          </Text>
        </Footer>
      }
    >
      <Container>{children}</Container>
    </AppShell>
  )
}
