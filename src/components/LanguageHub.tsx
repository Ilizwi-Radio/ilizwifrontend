"use client";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import { getCourses } from "@/lib/api";
import { useEffect, useState } from "react";

export default function LanguageHub() {
  const [languages, setLanguages] =  useState<any[]>([]);

  useEffect(() => {

  const loadCourses = async () => {

    const data = await getCourses();

    const mappedLanguages =
      data.map((course: any) => ({

        code: "ZA",

        name:
          course.name,

        region:
          course.language_code || "Africa",

        speakers:
          "Available",

        phrase:
          "Start Learning",

        translation:
          course.description || "",

        from:
          "#1c8a4e",

        to:
          "#0b3a20"

      }));

    setLanguages(
      mappedLanguages
    );

  };

  loadCourses();

}, []);

if (!languages.length) {

  return (
    <div className="py-20 text-center">
      Loading languages...
    </div>
  );

}
  return (
    <FadeIn>
      <section id="languages" className="py-20" style={{ background: "#fdf6e8" }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold tracking-wide rounded-full px-4 py-1.5 mb-5">
            <Icon name="book" className="w-3.5 h-3.5" /> LANGUAGE HUB
          </span>
          <h2 className="display text-4xl sm:text-5xl text-green-900 mb-4">Learn African Languages</h2>
          <p className="text-stone-500 max-w-xl mx-auto mb-12">
            AI-powered pronunciation, daily phrases, and cultural context. Preserve heritage, one word at a time.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {languages.map((language,index) => (
              <div key={`${language.name}-${index}`} className="rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg transition-shadow">
                <div
                  className="h-28 relative flex flex-col justify-center px-4 overflow-hidden"
                  style={{ background: `linear-gradient(135deg,${language.from},${language.to})` }}
                >
                  <span className="absolute -right-1 -top-2 text-7xl font-black text-white/10 select-none leading-none">
                    {language.code[0]}
                  </span>
                  <span className="text-white/70 text-xs font-bold tracking-wide mb-1">{language.code}</span>
                  <span className="text-white font-extrabold text-xl leading-tight">{language.name}</span>
                  <span className="text-white/70 text-xs mt-0.5">
                    {language.region} • {language.speakers}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between bg-stone-50 border border-stone-100 rounded-lg px-3 py-2.5 mb-4">
                    <div>
                      <div className="font-bold text-green-900 text-sm">{language.phrase}</div>
                      <div className="text-stone-500 text-xs">{language.translation}</div>
                    </div>
                    <button
                      aria-label={`Hear pronunciation of ${language.phrase}`}
                      className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 flex items-center justify-center shrink-0"
                    >
                      <Icon name="vol" className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="w-full bg-green-900 hover:bg-green-800 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                    Start Lesson 1 <Icon name="chevron" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
