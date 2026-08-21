import React, { useState, useEffect } from 'react';
import { Show, Presenter } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { getShows, getPresenters, createShow, updateShow, deleteShow } from '@/lib/api';
import {
  Calendar,
  Plus,
  Radio,
  Clock,
  Globe,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ShowsManagementProps {
  onGoLiveWithShow: (showId: string) => void;
}

export default function ShowsManagement({ onGoLiveWithShow }: ShowsManagementProps) {
  const { user } = useAuth();
  const presenterId = user?.id;

  const [shows, setShows] = useState<Show[]>([]);
  const [presentersCount, setPresentersCount] = useState(0);
  const [showsCount, setShowsCount] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', show_type: '', language_code: '',  description: '',  scheduled_start: '',  scheduled_end: '',  status: 'scheduled',});

  const refreshShows = async () => {
    const allShows = await getShows();
    setShows(allShows);
    setShowsCount(allShows.length);
  };

  useEffect(() => {
    getShows()
      .then((data) => {
        setShows(data);
        setShowsCount(data.length);
      })
      .catch(console.error);

    getPresenters()
      .then((data) => {
        setPresentersCount(data.length);
      })
      .catch(console.error);
  }, [presenterId]);

  const startAdd = () => {
    setEditingId(null);
    setForm({ title: '', show_type: 'audio', language_code: 'en', scheduled_start: '', scheduled_end: '',  status: 'scheduled',  description: '',});
    setShowForm(true);
  };

  const startEdit = (s: Show) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      show_type: s.show_type,
      language_code: s.language_code,
      description: s.description || '',
      scheduled_start: s.scheduled_start,
      scheduled_end: s.scheduled_end,
      status: s.status,
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presenterId || !user) return;

    try {
      if (editingId) {
        await updateShow(editingId, {
            title: form.title,
            description: form.description,
            show_type: form.show_type,
            language_code: form.language_code,
            scheduled_start: form.scheduled_start,
            scheduled_end: form.scheduled_end,
            status: form.status,
          });
      } else {
        await createShow({
          title: form.title,
          presenter_id: presenterId,
          description: form.description,
          show_type: form.show_type,
          language_code: form.language_code,
          scheduled_start: form.scheduled_start,
          scheduled_end: form.scheduled_end,
          status: form.status,
        });
      }

      await refreshShows();
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', show_type: 'audio', language_code: 'en', scheduled_start: '',  scheduled_end: '', status: 'scheduled', description: '',});
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this show from your broadcast schedule?')) {
      await deleteShow(id);
      await refreshShows();
    }
  };

  const myShows = shows.filter((s) => s.presenter_id === presenterId || shows.length <= 2);
  const displayShows = myShows.length > 0 ? myShows : shows;

  return (
    <div className="space-y-8">
      {/* Metric Cards matching user requirements */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Available Shows</p>
            <h2 className="text-3xl font-bold text-stone-900 mt-1">{showsCount}</h2>
            <p className="text-xs text-emerald-700 font-medium mt-1">Active broadcast slots</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Presenters</p>
            <h2 className="text-3xl font-bold text-stone-900 mt-1">{presentersCount}</h2>
            <p className="text-xs text-stone-500 font-medium mt-1">Certified station hosts</p>
          </div>
          <div className="p-3 bg-stone-100 text-stone-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">My Assigned Slots</p>
            <h2 className="text-3xl font-bold text-emerald-900 mt-1">{displayShows.length}</h2>
            <p className="text-xs text-stone-500 font-medium mt-1">Ready for studio broadcast</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Radio className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Shows Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-900">My Shows</h2>
            <p className="text-stone-500 text-sm mt-1">
              Manage your own schedule slots and go live when you're broadcasting.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={startAdd}
              className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-xl px-4 py-2.5 flex items-center gap-2 transition shadow-xs self-start"
            >
              <Plus className="w-4 h-4" /> New Show
            </button>
          )}
        </div>

        {/* Show Form */}
        {showForm && (
          <form
            onSubmit={submit}
            className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl p-6 grid sm:grid-cols-2 gap-4 text-white"
          >
            <div className="sm:col-span-2">
              <h3 className="text-base font-bold text-white mb-1">
                {editingId ? 'Edit Broadcast Show' : 'Schedule New Show'}
              </h3>
              <p className="text-xs text-stone-400">Fill in the broadcast metadata for your station slot.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Show Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. The Midnight City Groove"
                className="w-full rounded-xl bg-stone-950 border border-stone-700 px-3.5 py-2.5 text-sm text-white outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Time Slot / Tag *</label>
              <input
                required
                value={form.show_type}
                onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
                placeholder="e.g. 15:00 - 18:00 or WEEKDAYS"
                className="w-full rounded-xl bg-stone-950 border border-stone-700 px-3.5 py-2.5 text-sm text-white outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Language</label>
              <input
                value={form.language_code}
                onChange={(e) => setForm((p) => ({ ...p, lang: e.target.value }))}
                placeholder="e.g. English"
                className="w-full rounded-xl bg-stone-950 border border-stone-700 px-3.5 py-2.5 text-sm text-white outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Expected Listeners</label>
              <input
                onChange={(e) => setForm((p) => ({ ...p, listeners: e.target.value }))}
                placeholder="e.g. 12,500"
                className="w-full rounded-xl bg-stone-950 border border-stone-700 px-3.5 py-2.5 text-sm text-white outline-none focus:border-green-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">Genre / Description</label>
              <input
                onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
                placeholder="e.g. Soul / Talk / Late Night Call-ins"
                className="w-full rounded-xl bg-stone-950 border border-stone-700 px-3.5 py-2.5 text-sm text-white outline-none focus:border-green-500"
              />
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl px-6 py-2.5 transition shadow"
              >
                {editingId ? 'Save Changes' : 'Create Show Slot'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-stone-700 hover:bg-stone-800 text-stone-300 text-sm font-semibold rounded-xl px-5 py-2.5 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Shows List */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100 bg-white">
          {displayShows.length === 0 && (
            <div className="p-8 text-center text-stone-400 text-sm">
              You don&apos;t have any shows scheduled yet. Click "+ New Show" to add your first slot.
            </div>
          )}

          {displayShows.map((s) => (
            <div
              key={s.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 sm:py-4 hover:bg-stone-50/70 transition"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {s.status === 'LIVE'? (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </span>
                  ) : (
                    <span className="bg-stone-100 text-stone-700 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md border border-stone-200">
                      {s.show_type}
                    </span>
                  )}
                  <span className="font-bold text-green-950 text-base truncate">{s.title}</span>
                </div>

                <div className="text-stone-500 text-xs mt-1.5 flex items-center gap-3 flex-wrap">
                  <span className="text-stone-600 font-medium">Host: {s.show_type}</span>
                  {s.language_code && <span>• {s.language_code.toUpperCase()}</span>}                
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onGoLiveWithShow(s.id)}
                  className="bg-green-900 hover:bg-green-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5" /> Go Live in Studio
                </button>
                <button
                  onClick={() => startEdit(s)}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100 px-3 py-2 rounded-xl transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition"
                  title="Delete Show"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
