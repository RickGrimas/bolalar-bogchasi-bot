import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getAdminHeaders } from '../utils/api';

interface InlineButton {
  title: string;
  type: 'URL' | 'FILE' | 'TEXT';
  value: string;
}

interface BroadcastItem {
  id: string;
  text: string;
  photo_url?: string;
  video_url?: string;
  inline_buttons?: InlineButton[];
  sent_count: number;
  failed_count: number;
  created_at: string;
}

export const BroadcastPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'archive'>('create');

  // New Broadcast Form States
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [buttons, setButtons] = useState<InlineButton[]>([]);

  // File Uploading States
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Inline button builder
  const [btnTitle, setBtnTitle] = useState('');
  const [btnType, setBtnType] = useState<'URL' | 'FILE' | 'TEXT'>('URL');
  const [btnValue, setBtnValue] = useState('');

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Archive States
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [editingBcastId, setEditingBcastId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Manual Restore Past Post Form State
  const [showRestoreForm, setShowRestoreForm] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restorePhotoUrl, setRestorePhotoUrl] = useState('');
  const [restoreVideoUrl, setRestoreVideoUrl] = useState('');
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoints = ['/api/admin/broadcasts', `${targetUrl}/api/admin/broadcasts`];

    let list: BroadcastItem[] = [];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { headers: getAdminHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            list = data;
            break;
          }
        }
      } catch (err) {}
    }

    if (list.length === 0) {
      const { data } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) list = data;
    }

    setBroadcasts(list);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const base64 = await fileToBase64(file);
      const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const endpoints = ['/api/admin/upload', `${targetUrl}/api/admin/upload`];

      let uploadedUrl = '';
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              filename: file.name,
              file_base64: base64,
              content_type: file.type
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              uploadedUrl = data.url;
              break;
            }
          }
        } catch (err) {}
      }

      if (uploadedUrl) {
        setPhotoUrl(uploadedUrl);
      } else {
        const fileExt = file.name.split('.').pop();
        const filePath = `broadcasts/photo_${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('bogcha-assets')
          .upload(filePath, file, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from('bogcha-assets')
          .getPublicUrl(filePath);

        setPhotoUrl(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      alert("Rasm yuklashda xatolik: " + (err.message || 'Xato yuz berdi'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const base64 = await fileToBase64(file);
      const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const endpoints = ['/api/admin/upload', `${targetUrl}/api/admin/upload`];

      let uploadedUrl = '';
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_base64: base64,
              content_type: file.type
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              uploadedUrl = data.url;
              break;
            }
          }
        } catch (err) {}
      }

      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
      } else {
        const fileExt = file.name.split('.').pop();
        const filePath = `broadcasts/video_${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('bogcha-assets')
          .upload(filePath, file, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from('bogcha-assets')
          .getPublicUrl(filePath);

        setVideoUrl(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      alert("Video yuklashda xatolik: " + (err.message || 'Xato yuz berdi'));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleAddButton = () => {
    if (!btnTitle || !btnValue) return;
    setButtons([...buttons, { title: btnTitle, type: btnType, value: btnValue }]);
    setBtnTitle('');
    setBtnValue('');
  };

  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setSending(true);
    setResult(null);

    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoints = ['/api/admin/broadcast', `${targetUrl}/api/admin/broadcast`];

    let successRes: any = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            photo_url: photoUrl || undefined,
            video_url: videoUrl || undefined,
            inline_buttons: buttons
          })
        });

        if (res.ok) {
          successRes = await res.json();
          break;
        }
      } catch (err) {}
    }

    if (successRes) {
      setResult(successRes);
      setText('');
      setPhotoUrl('');
      setVideoUrl('');
      setButtons([]);
      fetchBroadcasts();
    } else {
      setResult({ error: "E'lon yuborishda server bilan bog'lanib bo'lmadi (`npm run bot` yoniqligini tekshiring)." });
    }

    setSending(false);
  };

  // MANUAL RESTORE PAST BROADCAST POST
  const handleRestorePastBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreText) return;

    setRestoring(true);
    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoints = ['/api/admin/save-broadcast-archive', `${targetUrl}/api/admin/save-broadcast-archive`];

    let success = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: restoreText,
            photo_url: restorePhotoUrl || undefined,
            video_url: restoreVideoUrl || undefined
          })
        });

        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {}
    }

    if (!success) {
      await supabase.from('broadcasts').insert([{
        text: restoreText,
        photo_url: restorePhotoUrl || null,
        video_url: restoreVideoUrl || null,
        sent_count: 0,
        failed_count: 0,
        recipient_messages: []
      }]);
    }

    setRestoreText('');
    setRestorePhotoUrl('');
    setRestoreVideoUrl('');
    setShowRestoreForm(false);
    setRestoring(false);
    fetchBroadcasts();
  };

  // EDIT BROADCAST POST
  const handleSaveEditBroadcast = async (bcastId: string) => {
    if (!editText.trim()) return;

    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoints = ['/api/admin/edit-broadcast', `${targetUrl}/api/admin/edit-broadcast`];

    let success = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            broadcast_id: bcastId,
            text: editText.trim()
          })
        });

        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {}
    }

    if (!success) {
      await supabase.from('broadcasts').update({ text: editText.trim() }).eq('id', bcastId);
    }

    setEditingBcastId(null);
    setEditText('');
    fetchBroadcasts();
  };

  // DELETE BROADCAST POST
  const handleDeleteBroadcast = async (bcastId: string) => {
    if (!confirm("Ushbu e'lonni barcha Telegram foydalanuvchilarining chatlaridan o'chirib tashlaysizmi?")) return;

    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoints = ['/api/admin/delete-broadcast', `${targetUrl}/api/admin/delete-broadcast`];

    let success = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ broadcast_id: bcastId })
        });

        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {}
    }

    if (!success) {
      await supabase.from('broadcasts').delete().eq('id', bcastId);
    }

    fetchBroadcasts();
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl max-w-5xl mx-auto shadow-2xl my-2 border border-slate-800">
      {/* Page Title & Sub Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            📢 Ommaviy E'lonlar Boshqaruvi (Broadcast)
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Telegram bot foydalanuvchilariga e'lonlar yuborish, yuborilgan e'lonlarni tahrirlash va o'chirish.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'create' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ➕ Yangi E'lon Yaratish
          </button>
          <button
            onClick={() => { setActiveTab('archive'); fetchBroadcasts(); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'archive' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📜 E'lonlar Arxivi ({broadcasts.length})
          </button>
        </div>
      </div>

      {/* CREATE TAB CONTENT */}
      {activeTab === 'create' && (
        <>
          {result && (
            <div className={`p-4 mb-5 rounded-lg text-xs ${result.error ? 'bg-red-950 border border-red-500/50 text-red-300' : 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'}`}>
              {result.error ? (
                <p>❌ {result.error}</p>
              ) : (
                <div>
                  <p className="font-bold text-sm">✅ E'lon yuborildi va arxivga saqlandi!</p>
                  <p className="mt-1">Jami foydalanuvchilar: {result.total} | Muvaffaqiyatli: {result.sent} | Yetib bormadi: {result.failed}</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-5">
            {/* Post Text */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-300">E'lon Matni (Markdown qo'llab-quvvatlanadi)</label>
              <textarea
                rows={4}
                placeholder="Hurmatli ota-onalar! Ertaga bog'chamizda barcha guruhlar uchun bayram tadbiri bo'lib o'tadi..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 text-xs"
                required
              />
            </div>

            {/* Media Files Direct Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              
              {/* Photo Upload Box */}
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  🖼️ Rasm Faylini Yuklash (Kompyuterdan)
                </label>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    disabled={uploadingPhoto}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-900 border border-slate-700 rounded-lg p-1.5"
                  />
                  {uploadingPhoto && (
                    <div className="mt-1 text-[10px] text-emerald-400 font-bold animate-pulse">
                      ⏳ Rasm yuklanmoqda...
                    </div>
                  )}
                </div>

                {/* Photo Preview */}
                {photoUrl ? (
                  <div className="relative mt-1 w-full h-28 bg-slate-900 border border-emerald-500/50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={photoUrl} alt="E'lon rasmi preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-1 right-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow"
                    >
                      ✕ O'chirish
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 text-[10px] text-slate-500">
                    Yoki rasm URL havolasi:
                    <input
                      type="text"
                      placeholder="https://..."
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white text-[11px] mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Video Upload Box */}
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  🎬 Video Faylini Yuklash (Kompyuterdan)
                </label>

                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    disabled={uploadingVideo}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-900 border border-slate-700 rounded-lg p-1.5"
                  />
                  {uploadingVideo && (
                    <div className="mt-1 text-[10px] text-emerald-400 font-bold animate-pulse">
                      ⏳ Video yuklanmoqda...
                    </div>
                  )}
                </div>

                {/* Video Preview */}
                {videoUrl ? (
                  <div className="relative mt-1 w-full h-28 bg-slate-900 border border-emerald-500/50 rounded-lg overflow-hidden flex items-center justify-center">
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="absolute top-1 right-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10"
                    >
                      ✕ O'chirish
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 text-[10px] text-slate-500">
                    Yoki video URL havolasi:
                    <input
                      type="text"
                      placeholder="https://..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white text-[11px] mt-1"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Inline Buttons Builder */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-semibold text-xs text-emerald-300">🔗 E'longa Inline Tugma Biriktirish</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Tugma sarlavhasi (masalan: Batafsil)"
                  value={btnTitle}
                  onChange={(e) => setBtnTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                />
                <select
                  value={btnType}
                  onChange={(e) => setBtnType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                >
                  <option value="URL">Veb-sayt / Link (URL)</option>
                  <option value="FILE">Fayl Yuklash Havolasi</option>
                  <option value="TEXT">Matnli Javob</option>
                </select>
                <input
                  type="text"
                  placeholder="Qiymat (Link yoki Matn)"
                  value={btnValue}
                  onChange={(e) => setBtnValue(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleAddButton}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-medium"
              >
                + Tugma Qo'shish
              </button>

              {/* Added Buttons Preview */}
              {buttons.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {buttons.map((b, i) => (
                    <span key={i} className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-3 py-1 rounded-full text-xs font-semibold">
                      [{b.type}] {b.title}
                      <button
                        type="button"
                        onClick={() => handleRemoveButton(i)}
                        className="text-red-400 hover:text-red-300 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending || uploadingPhoto || uploadingVideo}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg font-bold text-white transition shadow-lg text-xs"
            >
              {sending ? "🚀 E'lon jo'natilmoqda..." : "🚀 Barcha Foydalanuvchilarga Jo'natish"}
            </button>
          </form>
        </>
      )}

      {/* ARCHIVE TAB CONTENT */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          {/* Top Bar inside Archive: Restore past post button */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs text-slate-400">Jami saqlangan e'lonlar: {broadcasts.length} ta</span>
            <button
              onClick={() => setShowRestoreForm(!showRestoreForm)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              {showRestoreForm ? '✕ Yopish' : '➕ Avvalgi E\'lonni Arxivga Kiritish'}
            </button>
          </div>

          {/* Manual Restore Form */}
          {showRestoreForm && (
            <form onSubmit={handleRestorePastBroadcast} className="p-4 bg-slate-800/80 rounded-xl border border-emerald-500/60 space-y-3 text-xs">
              <h4 className="font-bold text-emerald-300 text-sm">📥 Avvalgi Yuborilgan E'lonni Arxivga Kiritish</h4>
              <p className="text-slate-400 text-[11px]">
                Ilgari yuborilgan post matnini bu yerga kiriting. Saqlangach u arxivda paydo bo'ladi va uni tahrirlash/o'chirish imkoni beriladi.
              </p>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">E'lon Matni:</label>
                <textarea
                  rows={3}
                  placeholder="Avval yuborilgan e'lon matni..."
                  value={restoreText}
                  onChange={(e) => setRestoreText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Rasm URL (ixtiyoriy)"
                  value={restorePhotoUrl}
                  onChange={(e) => setRestorePhotoUrl(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Video URL (ixtiyoriy)"
                  value={restoreVideoUrl}
                  onChange={(e) => setRestoreVideoUrl(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreForm(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={restoring}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded"
                >
                  {restoring ? 'Saqlanmoqda...' : 'Arxivga Saqlash'}
                </button>
              </div>
            </form>
          )}

          {broadcasts.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
              Hozircha saqlangan e'lonlar arxivi mavjud emas. Yuqoridagi "➕ Avvalgi E'lonni Arxivga Kiritish" tugmasi orqali o'tgan e'lonlaringizni qo'shishingiz mumkin.
            </div>
          ) : (
            broadcasts.map((b) => (
              <div key={b.id} className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-400">
                      📅 {new Date(b.created_at).toLocaleString()}
                    </span>
                    {b.photo_url && <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[10px] border border-blue-800">🖼️ Rasm</span>}
                    {b.video_url && <span className="bg-purple-950 text-purple-300 px-2 py-0.5 rounded text-[10px] border border-purple-800">🎬 Video</span>}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-300">✅ Yetkazildi: {b.sent_count}</span>
                    {b.failed_count > 0 && <span className="text-red-400">❌ Yetmadi: {b.failed_count}</span>}

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => { setEditingBcastId(b.id); setEditText(b.text); }}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs flex items-center gap-1"
                      >
                        ✏️ Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDeleteBroadcast(b.id)}
                        className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs flex items-center gap-1"
                      >
                        🗑️ O'chirish
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Editing Form */}
                {editingBcastId === b.id ? (
                  <div className="p-3 bg-slate-900 rounded-lg border border-emerald-500 space-y-2">
                    <label className="block text-xs font-semibold text-emerald-300">Post matnini tahrirlash (barcha Telegram chatlarda o'zgaradi):</label>
                    <textarea
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditingBcastId(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-400 rounded"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditBroadcast(b.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded font-bold"
                      >
                        Saqlash va Yangilash
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">{b.text}</p>
                    
                    {/* Media Preview Thumbnail */}
                    {b.photo_url && (
                      <img src={b.photo_url} alt="Broadcast preview" className="mt-2 w-36 h-24 object-cover rounded border border-slate-700" />
                    )}
                    {b.video_url && (
                      <video src={b.video_url} controls className="mt-2 w-48 h-28 object-cover rounded border border-slate-700" />
                    )}

                    {/* Inline Buttons Display */}
                    {b.inline_buttons && b.inline_buttons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {b.inline_buttons.map((btn, idx) => (
                          <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                            🔗 [{btn.type}] {btn.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
