import React, { useState, useEffect } from 'react';
import { Presenter } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { getPresenters, updatePresenter } from '@/lib/api';
import Icon from './Icon';
import {
  User,
  CheckCircle2,
  Mic2,
  Radio,
  Share2,
  Sparkles,
  Shield,
  Layers,
  Award,
} from 'lucide-react';

export default function ProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Presenter | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [form, setForm] = useState({
    role: '',
    bio: '',
    followers: '',
    microphonePreference: 'Shure SM7B Studio Dynamic',
    from: '#15803d',
    to: '#0f172a',
    twitter: '',
    instagram: '',
  });

  useEffect(() => {
  if (!user?.id) return;

  getPresenters()
    .then((data) => {
      const presenter =
        data.find(
          (p: any) =>
            p.user_id === user.id
        ) || data[0];

      setProfile(presenter);

      setForm({
        role: presenter.role || presenter.presenter_type || "",
        bio: presenter.bio || "",
        followers: presenter.followers || "",
        microphonePreference:
          presenter.microphonePreference ||
          "Shure SM7B Studio Dynamic",
        from: presenter.from || "#15803d",
        to: presenter.to || "#0f172a",
        twitter: presenter.twitter || "",
        instagram: presenter.instagram || "",
      });
    })
    .catch(console.error);
}, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSaving(true);
    try {
      const updated = await updatePresenter(profile.id, {
        role: form.role,
        presenter_type: form.role,
        bio: form.bio,
        microphonePreference: form.microphonePreference,
        from: form.from,
        to: form.to,
        twitter: form.twitter,instagram: form.instagram,
      });
      setProfile(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const gradientOptions = [
    { label: 'Emerald Slate', from: '#15803d', to: '#0f172a' },
    { label: 'Amber Bronze', from: '#b45309', to: '#431407' },
    { label: 'Ocean Blue', from: '#0369a1', to: '#020617' },
    { label: 'Royal Violet', from: '#7e22ce', to: '#18181b' },
    { label: 'Crimson Night', from: '#be123c', to: '#09090b' },
  ];

  if (!profile) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500">
        Loading presenter profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-950">My Presenter Profile</h2>
            <p className="text-stone-500 text-sm mt-1">
              Customize your station on-air identity, biography, hardware settings, and public profile.
            </p>
          </div>
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile saved successfully!
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Avatar Card & Identity Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs text-center space-y-4">
            <div
              className="w-28 h-28 rounded-2xl mx-auto flex items-center justify-center shadow-lg transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${form.from}, ${form.to})` }}
            >
              <Icon name="user" className="w-14 h-14 text-white/70" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-stone-900">{profile.name}</h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">{form.role || profile.role}</p>
              <p className="text-[11px] text-stone-400 font-mono mt-1">{profile.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-left">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Station Followers</span>
                <p className="text-lg font-bold text-stone-900 mt-0.5">{form.followers}</p>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Live Shows</span>
                <p className="text-lg font-bold text-stone-900 mt-0.5">{profile.showsCount || 4}</p>
              </div>
            </div>

            {/* Avatar Theme Colors */}
            <div className="text-left pt-2">
              <label className="block text-xs font-semibold text-stone-600 mb-2">Avatar Color Theme</label>
              <div className="flex items-center gap-2 flex-wrap">
                {gradientOptions.map((g, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, from: g.from, to: g.to }))}
                    className={`w-7 h-7 rounded-lg shadow-xs transition transform hover:scale-110 ${
                      form.from === g.from ? 'ring-2 ring-emerald-600 ring-offset-2' : ''
                    }`}
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                    title={g.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form Editor (8 cols) */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSave}
            className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Display Name</label>
                <input
                  disabled
                  value={profile.name}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-stone-400 mt-1">Contact station admin to modify display name.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Role / On-Air Title</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. Senior Broadcaster & Drive Host"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Followers</label>
                <input
                  disabled
                  value={form.followers}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-stone-400 mt-1">Follower metric is synced by the station network.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Preferred Microphone</label>
                <input
                  value={form.microphonePreference}
                  onChange={(e) => setForm((p) => ({ ...p, microphonePreference: e.target.value }))}
                  placeholder="e.g. Shure SM7B or Electro-Voice RE20"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Presenter Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell listeners about your musical journey, broadcasting style, and show formats..."
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">X / Twitter Handle</label>
                <input
                  value={form.twitter}
                  onChange={(e) => setForm((p) => ({ ...p, twitter: e.target.value }))}
                  placeholder="@MarcusVanceFM"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Instagram Handle</label>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
                  placeholder="@marcus.radio"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-green-900 hover:bg-green-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
