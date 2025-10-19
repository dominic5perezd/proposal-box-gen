import { useState } from 'react';
import { initializeFHE } from '@/lib/fhe';

export function useFHE() {
  const [fhe, setFhe] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initialize = async () => {
    if (fhe || isInitializing) return;

    setIsInitializing(true);
    try {
      const instance = await initializeFHE();
      setFhe(instance);
    } catch (error) {
      console.error('FHE初始化失败:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  return { fhe, initialize, isInitializing };
}
