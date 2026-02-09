import { useEffect, useState } from 'react';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const useFakeRequest = (request, deps = [], options = {}) => {
  const { minDelay = 500 } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const [result] = await Promise.all([request(), delay(minDelay)]);
        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error('Request failed'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, deps);

  return { data, loading, error };
};

export default useFakeRequest;
