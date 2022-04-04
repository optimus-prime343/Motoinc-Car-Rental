import '../styles/tailwind.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@stripe/stripe-js'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NotificationsProvider } from '@mantine/notifications'
import { useState } from 'react'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { Navbar } from '../components/navbar'

function MyApp({ Component, pageProps }) {
  const [client] = useState(() => new QueryClient())
  return (
    <MantineProvider
      withGlobalStyles
      theme={{ colorScheme: 'dark', primaryColor: 'violet' }}
      emotionOptions={{ key: 'mantine', prepend: false }}
    >
      <QueryClientProvider client={client}>
        <ReactQueryDevtools />
        <NotificationsProvider>
          <ModalsProvider>
            <Hydrate state={pageProps.dehydratedState}>
              <Navbar />
              <Component {...pageProps} />
            </Hydrate>
          </ModalsProvider>
        </NotificationsProvider>
      </QueryClientProvider>
    </MantineProvider>
  )
}

export default MyApp
