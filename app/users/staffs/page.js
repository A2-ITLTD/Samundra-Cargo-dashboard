"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/utils/SessionHelper';
import { useRouter } from 'next/navigation';
import Staff from "@/components/user/staff"
export default function Page() {
    const router = useRouter();
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, [router]);
  return (
    <div>
      <Staff/>
    </div>
  )
}
