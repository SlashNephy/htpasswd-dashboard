import { Card, Grid, Group, Image, Text, useMantineTheme } from '@mantine/core'
import React, { useState } from 'react'

import { CredentialModal } from './CredentialModal'
import { GeneratePasswordButton } from './GeneratePasswordButton'

import type { Credential } from '../lib/htpasswd'
import type { Service } from '../lib/services'
import type { CardProps } from '@mantine/core'

export const ServiceCard: React.FC<
  Omit<CardProps<'div'>, 'children'> & { service: Service }
> = ({ service, ...props }) => {
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
          <Text weight={600} size="lg" mb="md">
            {service.name}
          </Text>
        </Group>

        <Card.Section component="a" href={service.url} target="_blank" mb="md">
          <Image
            alt={service.name}
            height={160}
            src={service.imageUrl}
            fit="contain"
          />
        </Card.Section>

        <Grid justify="center">
          <GeneratePasswordButton
            service={service}
            onGenerate={(credential) => {
              setCredential(credential)
              setIsModalOpen(true)
            }}
          />
        </Grid>
      </Card>

      {credential !== undefined && (
        <CredentialModal
          service={service}
          credential={credential}
          size="xl"
          centered
          opened={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setCredential(undefined)
          }}
        />
      )}
    </>
  )
}
