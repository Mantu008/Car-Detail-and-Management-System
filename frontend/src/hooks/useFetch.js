import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../config/api';
import { errorMessage } from '../utils/format';

/**
 * GET `url` and expose { data, loading, error, reload, setData }.
 * `data` is the `data` field of the API response. Pass url = null to skip.
 */
const useFetch = (url, { initialData = null, params } = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(params || {});
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, { params: JSON.parse(paramsKey) });
      if (id === requestId.current) setData(res.data.data);
    } catch (err) {
      if (id === requestId.current) setError(errorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [url, paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
};

export default useFetch;
