import { useState, useEffect } from 'react';
import { checkEligibility } from '../services/credentialService.js';

export function useEligibility(address, isConnected) {
  const [eligibility, setEligibility] = useState({ checked: false, isEligible: false, eventTitle: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setEligibility({ checked: false, isEligible: false, eventTitle: '' });
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await checkEligibility(address);
        setEligibility({ checked: true, isEligible: data.isEligible, eventTitle: data.eventTitle });
      } finally {
        setLoading(false);
      }
    })();
  }, [address, isConnected]);

  return { ...eligibility, loading };
}
