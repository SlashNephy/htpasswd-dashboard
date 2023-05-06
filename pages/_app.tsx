import { ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'

import packageJson from './../package.json'
import { useColorScheme } from '../lib/useColorScheme'

import type { AppProps } from 'next/app'

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const [colorScheme, toggleColorScheme] = useColorScheme()

  return (
    <>
      <Head>
        <title>{packageJson.name}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
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
            <NotificationsProvider position="top-right" autoClose={7000}>
              {/* @ts-ignore */}
              <Component {...pageProps} />
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </>
  )
}
