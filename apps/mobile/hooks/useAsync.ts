import { useState, useCallback, useEffect, useRef } from 'react';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useAsync<T, P extends any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  immediate = false,
  initialArgs?: P
) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
    loading: false,
  });

  // Use ref to avoid re-renders and dependency issues
  const asyncFunctionRef = useRef(asyncFunction);
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  // Store initialArgs in a ref to avoid dependency array issues
  const initialArgsRef = useRef(initialArgs);
  useEffect(() => {
    initialArgsRef.current = initialArgs;
  }, [initialArgs]);

  // Function to execute the async function
  const execute = useCallback(
    async (...args: P) => {
      setState({
        status: 'loading',
        data: null,
        error: null,
        loading: true,
      });

      try {
        // Use either the provided args or fall back to initial args
        const argsToUse = args.length > 0 ? args : (initialArgsRef.current || []) as P;
        const data = await asyncFunctionRef.current(...argsToUse);
        
        setState({
          status: 'success',
          data,
          error: null,
          loading: false,
        });
        return data;
      } catch (error) {
        setState({
          status: 'error',
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
        });
        throw error;
      }
    },
    [] // No dependencies needed with ref
  );

  // Execute async function on mount if immediate is true
  const initialRef = useRef(true);
  useEffect(() => {
    if (immediate && initialRef.current && initialArgsRef.current) {
      initialRef.current = false;
      execute(...initialArgsRef.current);
    }
  }, [execute, immediate]);

  return { execute, ...state };
} 