'use client'

import React, { useEffect } from 'react'

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="text-center text-rose-500 py-20 text-lg">
      {error ? `An error ${error} occurred on server` : 'An error occurred on client'}

      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}

// Error.getInitialProps = ({ res, err }) => {
//   const statusCode = res ? res.statusCode : err ? err.statusCode : 404
//   return { statusCode }
// }

export default Error
