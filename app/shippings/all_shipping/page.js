"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/utils/SessionHelper';
import { useRouter } from 'next/navigation';
import AllShipping from "@/components/shippings/allShipping"
function AllShippingPage() {
    const router = useRouter();
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, [router]);
  return (
    <div>
      <AllShipping/>
    </div>
  )
}

export default AllShippingPage
