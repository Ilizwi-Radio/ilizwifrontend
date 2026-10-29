import "server-only";

export type PublicShow = {
  id: string;
  title: string;
  description?: string | null;
  display_name?: string | null;
  presenter_name?: string | null;
  presenter_type?: string | null;
  cohost_display_name?: string | null;
  language_code?: string | null;
  scheduled_start?: string | null;
  status?: string | null;
  is_live?: boolean;
  listener_count?: number | null;
};

export type PublicEvent = {
  id: string;
  title: string;
  category?: string | null;
  description?: string | null;
  location?: string | null;
  start_at?: string | null;
  end_at?: string | null;
};

async function getPublicList<T>(path: string): Promise<T[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/${path}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

export async function getPublicHomepageContent() {
  const [shows, events] = await Promise.all([
    getPublicList<PublicShow>("shows"),
    getPublicList<PublicEvent>("events"),
  ]);
  return { shows, events };
}

