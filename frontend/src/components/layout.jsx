import Head from 'next/head'

import { COMPANY_NAME } from '../constants'

export const Layout = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title ? `${COMPANY_NAME} | ${title}` : COMPANY_NAME}</title>
      </Head>
      <div className='p-2 lg:px-6 lg:py-2 '>{children}</div>
    </>
  )
}
