import { ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Head from 'next/head'
import React from 'react'

import packageJson from './../package.json'
import { useColorScheme } from '../lib/useColorScheme'

import type { AppProps } from 'next/app'

const queryClient = new QueryClient()

export default function MyApp({
  Component,
  pageProps,
}: AppProps): React.JSX.Element {
  const [colorScheme, toggleColorScheme] = useColorScheme()

  return (
    <>
      <Head>
        <title>{packageJson.name}</title>
        <meta
          content="minimum-scale=1, initial-scale=1, width=device-width"
          name="viewport"
        />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme,
            }}
          >
            <NotificationsProvider autoClose={7000} position="top-right">
              {/* @ts-expect-error temporary fix for broken type */}
              <Component {...pageProps} />
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </>
  )
}
