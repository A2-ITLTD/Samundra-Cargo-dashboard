"use client" 
import React, { useEffect } from 'react'
import { getAuthToken } from '@/utils/SessionHelper';
import { useRouter } from 'next/navigation';
import CreateShipment from "@/components/bookings/createBookings"
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
      <CreateShipment/>
    </div>
  )
}

export default Page
