"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/utils/SessionHelper';
import { useRouter } from 'next/navigation';
import Invoice from '@/components/invoice'
function Page() {
  const router = useRouter();
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div>
      <Invoice />
    </div>
  )
}

export default Page
