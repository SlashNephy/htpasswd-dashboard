import { Card, Grid, Group, Image, Text, useMantineTheme } from '@mantine/core'
import React, { useState } from 'react'

import { CredentialModal } from './CredentialModal'
import { GeneratePasswordButton } from './GeneratePasswordButton'

import type { Credential } from '../lib/htpasswd/backend'
import type { Service } from '../lib/services'
import type { CardProps } from '@mantine/core'

export function ServiceCard({
  service,
  ...props
}: Omit<CardProps, 'children'> & { service: Service }): React.JSX.Element {
  const theme = useMantineTheme()
  const [credential, setCredential] = useState<Credential>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card {...props}>
        <Group
          position="apart"
          style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
        >
          <Text mb="md" size="lg" weight={600}>
            {service.name}
          </Text>
        </Group>

        <Card.Section
          component="a"
          href={service.urls.app}
          mb="md"
          target="_blank"
        >
          <Image
            alt={service.name}
            fit="contain"
            height={160}
            src={service.urls.logo}
          />
        </Card.Section>

        <Grid justify="center">
          <GeneratePasswordButton
            service={service}
            onGenerate={(c) => {
              setCredential(c)
              setIsModalOpen(true)
            }}
          />
        </Grid>
      </Card>

      {credential !== undefined && (
        <CredentialModal
          centered
          credential={credential}
          opened={isModalOpen}
          service={service}
          size="xl"
          onClose={() => {
            setIsModalOpen(false)
            setCredential(undefined)
          }}
        />
      )}
    </>
  )
}
