"use client";
import Icon from "./Icon";
import FadeIn from "./FadeIn";
import { getPresenters,followPresenter,unfollowPresenter } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Community() {
  const [presenters, setPresenters] =
  useState<any[]>([]);
  useEffect(() => {

  const loadPresenters = async () => {

    const data =
      await getPresenters();

    const mappedPresenters =
  data.map((presenter: any) => ({
    id: presenter.id,

    name: presenter.display_name,

    role: presenter.presenter_type,

    followers: "0",
    following: false,

    ai:
      presenter.presenter_type
        ?.toLowerCase()
        .includes("ai"),

    from: "#5c1a3a",

    to: "#22091a"
  }));

    setPresenters(
      mappedPresenters
    );

  };

  loadPresenters();

}, []);
const handleFollow = async (
  presenterId: string
) => {

  const token =
    localStorage.getItem("token");

  if (!token) {

    alert(
      "Please login first."
    );

    return;
  }

  const presenter =
    presenters.find(
      (p) => p.id === presenterId
    );

  try {

    if (
      presenter?.following
    ) {

      await unfollowPresenter(
        presenterId
      );

    } else {

      await followPresenter(
        presenterId
      );

    }

    setPresenters(
      (prev) =>
        prev.map((p) => {

          if (
            p.id !== presenterId
          ) {
            return p;
          }

          return {
            ...p,

            following:
              !p.following,

            followers:
              p.following
                ? Math.max(
                    0,
                    p.followers - 1
                  )
                : p.followers + 1,
          };
        })
    );

  } catch (error) {

    console.error(error);

  }

};
if (!presenters.length) {

  return (
    <div className="py-20 text-center">
      Loading presenters...
    </div>
  );

}
  return (
    <FadeIn>
      <section id="community" className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold tracking-wide rounded-full px-4 py-1.5 mb-4">
            <Icon name="people" className="w-3.5 h-3.5" /> OUR COMMUNITY
          </span>
          <h2 className="display text-4xl text-green-900 mb-3">Meet The Voices</h2>
          <p className="text-stone-500 max-w-lg mx-auto mb-10">Follow your favourite human and AI presenters across Africa.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left mb-12">
            {presenters.map((p) => (
              <div key={p.id} className="rounded-xl overflow-hidden bg-white border border-stone-200">
                <div
                  className="h-40 relative flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg,${p.from},${p.to})` }}
                >
                  {p.ai && (
                    <span className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      AI PRESENTER
                    </span>
                  )}
                  <Icon name="user" className="w-10 h-10 text-white/40" />
                </div>
                <div className="p-4">
                  <div className="font-bold text-green-900">{p.name}</div>
                  <div className="text-stone-500 text-sm mb-3">{p.role}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 text-sm">{p.followers} followers</span>
                    <button 
                      className={`text-sm font-semibold rounded-full px-4 py-1.5 ${
                        p.following 
                          ? "bg-stone-200 hover:bg-stone-300 text-stone-800" 
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                      onClick={() => handleFollow(p.id)}
                    >
                      {p.following ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="border border-stone-200 rounded-xl p-6 flex items-center gap-4 bg-white">
              <span className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Icon name="chat" className="w-5 h-5" />
              </span>
              <div className="text-left">
                <div className="font-extrabold text-xl text-green-900">142K</div>
                <div className="text-stone-500 text-sm">Daily Conversations</div>
              </div>
            </div>
            <div className="border border-stone-200 rounded-xl p-6 flex items-center gap-4 bg-white">
              <span className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Icon name="award" className="w-5 h-5" />
              </span>
              <div className="text-left">
                <div className="font-extrabold text-xl text-green-900">38K</div>
                <div className="text-stone-500 text-sm">Cultural Badges Earned</div>
              </div>
            </div>
            <div className="border border-stone-200 rounded-xl p-6 flex items-center gap-4 bg-white">
              <span className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                <Icon name="star" className="w-5 h-5" />
              </span>
              <div className="text-left">
                <div className="font-extrabold text-xl text-green-900">4.9★</div>
                <div className="text-stone-500 text-sm">Community Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
