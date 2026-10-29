import HomeClient from "./HomeClient";
import { getPublicHomepageContent } from "@/lib/public-content";

export const revalidate = 300;

export default async function HomePage() {
  const { shows, events } = await getPublicHomepageContent();
  return <HomeClient initialShows={shows} initialEvents={events} />;
}
