import { createGetInitialProps } from '@mantine/next'
import Document, { Html, Head, Main, NextScript } from 'next/document'

const getInitialProps = createGetInitialProps()

export default class MyDocument extends Document {
  public static getInitialProps = getInitialProps

  public render(): JSX.Element {
    return (
      <Html lang="ja">
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
