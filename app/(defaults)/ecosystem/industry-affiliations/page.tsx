'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function IndustryAffiliationsRedirect() {
  useEffect(() => {
    redirect('/ecosystem/industry-affiliations-certifications');
  }, []);

  return null;
}