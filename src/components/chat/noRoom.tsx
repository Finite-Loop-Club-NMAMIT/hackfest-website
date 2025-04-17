import React from 'react'
import { useRouter } from 'next/router'

import GradientBackground from '../layout/backgroundGradient'
import { Button } from '../ui/button'

export default function NoRoom() {
    const router = useRouter()

  return (
    <GradientBackground className='flex h-full w-full flex-col items-center justify-center'>
        <div className='flex justify-center flex-col flex-nowrap gap-2 items-center'>
            <h1 className='text-4xl font-bold text-white mx-2 text-wrap gradient-text'>Select a Chat to Start</h1>
            <p className='text-blue-300'>Please use the chat feature responsibly and respectfully.</p>
        </div>
        <div className='flex gap-2 flex-row mt-4'>
            <Button variant={"secondary"} onClick={async() => { await router.push("/") }}>Home</Button>
            <Button onClick={async() => { await router.push("/profile")}}>Profile</Button>
        </div>
    </GradientBackground>
  )
}
