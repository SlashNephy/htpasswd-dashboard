import { ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useMemorableColorScheme } from '../lib/useMemorableColorScheme'

import type { AppProps } from 'next/app'

const queryClient = new QueryClient()

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [colorScheme, toggleColorScheme] = useMemorableColorScheme()

  return (
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
          <NotificationsProvider position="top-right" autoClose={7000}>
            <Component {...pageProps} />
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </QueryClientProvider>
  )
}

// noinspection JSUnusedGlobalSymbols
export default MyApp
