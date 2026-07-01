"use client";

import { useState, useEffect, useRef } from "react";
import type { YoutubeVideo } from "@/app/api/youtube/search/route";

export function useYoutubeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [selected, setSelected] = useState<YoutubeVideo | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (selected) return;
    if (query.length < 2) { setResults([]); setIsMock(false); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data?.items ?? []);
        setIsMock(json.data?.isMock ?? false);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, selected]);

  const select = (video: YoutubeVideo) => {
    setSelected(video);
    setQuery(video.title);
    setResults([]);
    setIsMock(false);
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    setIsMock(false);
  };

  return { query, setQuery, results, loading, isMock, selected, select, clear };
}
