import { useEffect, useRef, useState } from "react";

interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

const useIntersect = ({
  root = null,
  rootMargin,
  threshold = 0,
}: IntersectionOptions) => {
  const [entry, updateEntry] = useState<IntersectionObserverEntry | null>(null);
  const [node, setNode] = useState<Element | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => {
        updateEntry(entry);
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    const currentObserver = observer.current;

    if (node) currentObserver.observe(node);
    return () => {
      if (currentObserver) currentObserver.disconnect();
    };
  }, [node, rootMargin, root, threshold]);

  return [setNode, entry] as const;
};

export default useIntersect;
