import { NextRequest } from "next/server";
import { ok, err, requireSession, isErrorResponse } from "@/lib/api-helpers";

export interface YoutubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export interface YoutubeSearchResult {
  items: YoutubeVideo[];
  isMock: boolean;
}

const MAX_QUERY_LENGTH = 100;

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return ok<YoutubeSearchResult>({ items: [], isMock: false });
  if (q.length > MAX_QUERY_LENGTH) return err("Consulta muito longa.");

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return ok<YoutubeSearchResult>({ items: [], isMock: true });
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "6");
  url.searchParams.set("q", q);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return err("Erro ao buscar vídeos.");

  const json = await res.json();
  const items: YoutubeVideo[] = (json.items ?? []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url ?? "",
  }));

  return ok<YoutubeSearchResult>({ items, isMock: false });
}
