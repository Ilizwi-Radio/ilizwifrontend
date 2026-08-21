"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  ScheduleItem,
  MusicItem,
  VideoItem,
  EventItem,
  Presenter,
  LanguageItem,
  CareerItem,
  schedule as defaultSchedule,
  musicItems as defaultMusicItems,
  videos as defaultVideos,
  events as defaultEvents,
  presenters as defaultPresenters,
  languages as defaultLanguages,
  careers as defaultCareers,
  genres as defaultGenres,
} from "./data";

type StoreShape = {
  schedule: ScheduleItem[];
  musicItems: MusicItem[];
  videos: VideoItem[];
  events: EventItem[];
  presenters: Presenter[];
  languages: LanguageItem[];
  careers: CareerItem[];
  genres: string[];
};

const STORAGE_KEY = "ilizwi_content_store_v1";

function defaults(): StoreShape {
  return {
    schedule: defaultSchedule,
    musicItems: defaultMusicItems,
    videos: defaultVideos,
    events: defaultEvents,
    presenters: defaultPresenters,
    languages: defaultLanguages,
    careers: defaultCareers,
    genres: defaultGenres,
  };
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}

type Collection = keyof Omit<StoreShape, "genres">;

type DataStoreContextValue = StoreShape & {
  addItem: <K extends Collection>(collection: K, item: StoreShape[K][number]) => void;
  updateItem: <K extends Collection>(collection: K, id: string, patch: Partial<StoreShape[K][number]>) => void;
  removeItem: <K extends Collection>(collection: K, id: string) => void;
  setGenres: (genres: string[]) => void;
  resetToDefaults: () => void;
};

const DataStoreContext = createContext<DataStoreContextValue | null>(null);

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreShape>(defaults());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setStore({ ...defaults(), ...JSON.parse(raw) });
    } catch {
      // ignore corrupt storage, fall back to defaults already set
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store, hydrated]);

  const addItem: DataStoreContextValue["addItem"] = (collection, item) => {
    setStore((prev) => ({ ...prev, [collection]: [...(prev[collection] as unknown[]), item] as never }));
  };

  const updateItem: DataStoreContextValue["updateItem"] = (collection, id, patch) => {
    setStore((prev) => ({
      ...prev,
      [collection]: (prev[collection] as unknown as { id: string }[]).map((it) => (it.id === id ? { ...it, ...patch } : it)) as never,
    }));
  };

  const removeItem: DataStoreContextValue["removeItem"] = (collection, id) => {
    setStore((prev) => ({
      ...prev,
      [collection]: (prev[collection] as unknown as { id: string }[]).filter((it) => it.id !== id) as never,
    }));
  };

  const setGenres = (genres: string[]) => setStore((prev) => ({ ...prev, genres }));

  const resetToDefaults = () => setStore(defaults());

  return (
    <DataStoreContext.Provider value={{ ...store, addItem, updateItem, removeItem, setGenres, resetToDefaults }}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error("useDataStore must be used within DataStoreProvider");
  return ctx;
}
