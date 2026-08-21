// "use client";

// import {useEffect, useState } from "react";
// import RequireRole from "@/components/RequireRole";
// import DashboardHeader from "@/components/DashboardHeader";
// import Icon from "@/components/Icon";
// import { useAuth } from "@/lib/auth";
// import { getShows, getPresenters, createShow, updateShow, deleteShow,updatePresenter} from "@/lib/api";



// function PresenterContent() {
//         const { user } = useAuth();
//         const presenterId = user?.id;
//         const [shows, setShows] = useState<any[]>([]);
//         const myShows = shows;
//         console.log(shows);
//         console.log(myShows);
//         const [myProfile, setMyProfile] = useState<any>(null);

//         const [showForm, setShowForm] = useState(false);
//         const [editingId, setEditingId] = useState<string | null>(null);
//         const [form, setForm] = useState({ title: "", tag: "", lang: "", listeners: "" });

//         const [profileForm, setProfileForm] = useState({ role: "", followers: "", });

//         const [showsCount, setShowsCount] = useState(0);
//         const [presentersCount, setPresentersCount] = useState(0);

//         useEffect(() => {
//           if (myProfile) {
//             setProfileForm({
//               role:
//                 myProfile.role ||
//                 myProfile.presenter_type ||
//                 "",
//               followers:
//                 myProfile.followers || "",
//             });
//           }
//         }, [myProfile]);
//         useEffect(() => {
//         getShows()
//           .then((data) => {
//             setShows(data);
//             setShowsCount(data.length);
//           })
//           .catch(console.error);

//         getPresenters()
//           .then((data) => {
//             setPresentersCount(data.length);

//             const profile = data.find( (p: any) => p.user_id === user?.id ) || data[0];
//             setMyProfile(profile);
//           })
//           .catch(console.error);
//       }, [presenterId]);

//       useEffect(() => {
//         console.log("Shows:", shows);
//       }, [shows]);


//       const refreshShows = async () => {
//           const data = await getShows();

//           setShows(data);
//           setShowsCount(data.length);
//         };

//       const startAdd = () => {
//         setEditingId(null);
//         setForm({ title: "", tag: "", lang: "", listeners: "" });
//         setShowForm(true);
//       };

//       const startEdit = (s: any) => {
//         setEditingId(s.id);
//         setForm({ title: s.title, tag: s.tag, lang: s.lang, listeners: s.listeners ?? "" });
//         setShowForm(true);
//       };

//     const submit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!presenterId || !user) return;

//         try {
//           if (editingId) {
//             await updateShow(editingId, {
//               title: form.title,
//               tag: form.tag,
//               lang: form.lang,
//               listeners: form.listeners || null,
//             });
//           } else {
//             await createShow({
//               title: form.title,
//               tag: form.tag || "TBD",
//               type: "LIVE HOST",
//               host: user.full_name,
//               lang: form.lang,
//               listeners: form.listeners || null,
//               presenter_id: presenterId,
//             });
//           }

//           await refreshShows();

//           setShowForm(false);
//           setEditingId(null);

//           setForm({
//             title: "",
//             tag: "",
//             lang: "",
//             listeners: "",
//           });
//         } catch (error) {
//           console.error(error);
//         }
//       };

//      const goLive = async (id: string) => {
//         console.log("Go live", id);
//       };

//       const endLive = async (id: string) => {
//         console.log("End live", id);
//       };

//       const saveProfile = async (
//             e: React.FormEvent
//           ) => {
//             e.preventDefault();

//             if (!myProfile?.id) return;

//             try {
//               await updatePresenter(
//                 myProfile.id,
//                 {
//                   presenter_type:
//                     profileForm.role,
//                 }
//               );

//               const data =
//                 await getPresenters();

//               const updated =
//                 data.find(
//                   (p: any) =>
//                     p.id === myProfile.id
//                 );

//               setMyProfile(updated);

//               alert(
//                 "Profile updated successfully."
//               );
//             } catch (error) {
//               console.error(error);
//             }
//           };

//   if (!presenterId || !myProfile) {
//     return (
//       <div className="min-h-screen bg-stone-50">
//         <DashboardHeader title="Presenter Dashboard" subtitle="Manage your shows" />
//         <div className="max-w-3xl mx-auto px-6 py-12 text-stone-500">
//           Your account isn&apos;t linked to a presenter profile yet. Ask an admin to link your account to a presenter
//           record in the Presenters tab.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-stone-50">
//       <DashboardHeader title="Presenter Dashboard" subtitle={`Welcome back, ${user?.full_name}`} />

//       <div className="grid md:grid-cols-2 gap-4 mb-8">

//   <div className="bg-white border rounded-2xl p-5">
//     <p className="text-sm text-stone-500">
//       Available Shows
//     </p>

//     <h2 className="text-3xl font-bold">
//       {showsCount}
//     </h2>
//   </div>

//   <div className="bg-white border rounded-2xl p-5">
//     <p className="text-sm text-stone-500">
//       Presenters
//     </p>

//     <h2 className="text-3xl font-bold">
//       {presentersCount}
//     </h2>
//   </div>

// </div>

//       <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
//         <div>
//           <div className="flex items-center justify-between gap-4 mb-5">
//             <div>
//               <h1 className="display text-3xl text-green-900">My Shows</h1>
//               <p className="text-stone-500 text-sm mt-1">Manage your own schedule slots and go live when you're broadcasting.</p>
//             </div>
//             {!showForm && (
//               <button onClick={startAdd} className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2">
//                 + New Show
//               </button>
//             )}
//           </div>

//           {showForm && (
//             <form onSubmit={submit} className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl p-5 mb-6 grid sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold text-stone-600 mb-1.5">Show Title</label>
//                 <input
//                   required
//                   value={form.title}
//                   onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
//                   className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-stone-600 mb-1.5">Time Slot</label>
//                 <input
//                   required
//                   value={form.tag}
//                   onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
//                   placeholder="e.g. 15:00"
//                   className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-stone-600 mb-1.5">Language</label>
//                 <input
//                   value={form.lang}
//                   onChange={(e) => setForm((p) => ({ ...p, lang: e.target.value }))}
//                   className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-stone-600 mb-1.5">Listener Count (optional)</label>
//                 <input
//                   value={form.listeners}
//                   onChange={(e) => setForm((p) => ({ ...p, listeners: e.target.value }))}
//                   className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
//                 />
//               </div>
//               <div className="sm:col-span-2 flex gap-3">
//                 <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg px-5 py-2.5">
//                   {editingId ? "Save Changes" : "Create"}
//                 </button>
//                 <button type="button" onClick={() => setShowForm(false)} className="border border-stone-300 hover:bg-stone-100 text-sm font-semibold rounded-lg px-5 py-2.5">
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           )}

//           <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 bg-white">
//             {myShows.length === 0 && <div className="p-5 text-stone-400 text-sm">You don&apos;t have any shows scheduled yet.</div>}
//             {myShows.map((s) => (
//               <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
//                 <div className="min-w-0">
//                   <div className="flex items-center gap-2">
//                     {s.tag === "LIVE" && (
//                       <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
//                         <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
//                       </span>
//                     )}
//                     <span className="font-semibold text-green-900 truncate">{s.title}</span>
//                   </div>
//                   <div className="text-stone-500 text-xs mt-0.5">
//                     {s.tag !== "LIVE" && s.tag} {s.lang && `• ${s.lang}`} {s.listeners && `• ${s.listeners} listeners`}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 shrink-0">
//                   {s.tag === "LIVE" ? (
//                     <button onClick={() => endLive(s.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">
//                       End Live
//                     </button>
//                   ) : (
//                     <button onClick={() => goLive(s.id)} className="text-xs font-semibold text-green-800 hover:text-green-900">
//                       Go Live
//                     </button>
//                   )}
//                   <button onClick={() => startEdit(s)} className="text-xs font-semibold text-stone-500 hover:text-stone-700">
//                     Edit
//                   </button>
//                   <button
//                     onClick={async () => {
//                       if (confirm("Remove this show from your schedule?")) {
//                       await deleteShow(s.id);
//                       await refreshShows();
//                       }}}
//                     className="text-xs font-semibold text-red-600 hover:text-red-700"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div>
//           <h2 className="display text-2xl text-green-900 mb-4">My Profile</h2>
//           <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
//             <div
//               className="w-24 h-24 rounded-xl shrink-0 flex items-center justify-center"
//               style={{ background: `linear-gradient(135deg,${myProfile.from},${myProfile.to})` }}
//             >
//               <Icon name="user" className="w-10 h-10 text-white/50" />
//             </div>
//             <form onSubmit={saveProfile} className="flex-1 space-y-4">
//               <div>
//                 <label className="block text-xs font-semibold text-stone-600 mb-1.5">Display Name</label>
//                 <input disabled value={myProfile.name} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500" />
//                 <p className="text-[11px] text-stone-400 mt-1">Contact an admin to change your display name.</p>
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-stone-600 mb-1.5">Role / Title</label>
//                 <input
//                   value={profileForm.role}
//                   onChange={(e) => setProfileForm((p) => ({ ...p, role: e.target.value }))}
//                   className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-green-700"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-stone-600 mb-1.5">Followers</label>
//                 <input disabled value={profileForm.followers} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500" />
//                 <p className="text-[11px] text-stone-400 mt-1">Follower counts are calculated by the platform, not self-editable.</p>
//               </div>
//               <button type="submit" className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5">
//                 Save Profile
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function PresenterDashboardPage() {
//   return (
//     <RequireRole role="presenter">
//       <PresenterContent />
//     </RequireRole>
//   );
// }
