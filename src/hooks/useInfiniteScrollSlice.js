import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const useInfiniteScrollSlice = (items, options = {}) => {
  const pageSize = Number(options.pageSize || 9);
  const resetDeps = options.resetDeps || [];
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const observerRef = useRef(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, ...resetDeps]);

  const hasMore = visibleCount < items.length;

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || !hasMore) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
          }
        },
        {
          rootMargin: "300px 0px",
        }
      );

      observerRef.current.observe(node);
    },
    [hasMore, items.length, pageSize]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    visibleItems,
    hasMore,
    loadMoreRef,
  };
};

export default useInfiniteScrollSlice;
