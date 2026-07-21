'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ImpactMeasurementRedirect() {
  useEffect(() => {
    redirect('/ecosystem/impact-measurement-esg');
  }, []);

  return null;
}