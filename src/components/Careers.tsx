"use client";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import {useEffect,useState} from "react";
import { getCareers } from "@/lib/api";
getCareers();

export default function Careers() {
  const [careers, setCareers] =  useState<any[]>([]);
  useEffect(() => {

  const loadCareers = async () => {

    const data = await getCareers();

    const mappedCareers =
      data.map((career: any) => ({

        title:
          career.title,

        dept:
          career.department,

        deadline:
          new Date(
            career.deadline
          ).toLocaleDateString(),

        tag:
          career.type,

        icon:
          "briefcase",

        iconBg:
          "bg-blue-100 text-blue-700",

        tagStyle:
          "bg-green-900 text-white"

      }));

    setCareers(
      mappedCareers
    );

  };

  loadCareers();

}, []);
if (!careers.length) {

  return (
    <div className="py-20 text-center">
      Loading careers...
    </div>
  );

}
  return (
    <FadeIn>
      <section id="careers" className="py-20" style={{ background: "#fbf3df" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
                <Icon name="briefcase" /> OPPORTUNITIES
              </div>
              <h2 className="display text-4xl text-green-900 mb-2">Careers &amp; Empowerment</h2>
              <p className="text-stone-500 max-w-lg">
                Build your future with us — internships, scholarships, ambassadorships, and creator programs for African youth.
              </p>
            </div>
            <a href="#" className="text-orange-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              All Opportunities <Icon name="arrow" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {careers.map((c) => (
              <div key={c.title} className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
                    <Icon name={c.icon as "mic" | "briefcase" | "heart" | "cap"} className="w-[18px] h-[18px]" />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`${c.tagStyle} text-[10px] font-bold px-2.5 py-1 rounded-full`}>{c.tag}</span>
                    <span className="text-stone-400 text-xs">Deadline: {c.deadline}</span>
                  </div>
                </div>
                <div className="font-bold text-green-900 mb-0.5">{c.title}</div>
                <div className="text-stone-500 text-sm mb-4">{c.dept}</div>
                <a href="#" className="text-orange-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Apply Now <Icon name="chevron" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
