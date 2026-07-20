/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4
 * component: profile-settings-page · genre: modern-minimal · theme: Cobalt (adapted to Geist/OKLCH)
 * macrostructure: Workbench · nav: N/A (inner app page) · motion: tw-animate-css
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */

"use client"

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, ArrowLeft, User, Mail, Check, AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';

// ─── helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string | undefined | null) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Avatar ring component ────────────────────────────────────────────────────
function AvatarRing({ src, name, uploading, onClick }: {
  src: string; name: string; uploading: boolean; onClick: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        className="group relative w-24 h-24 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent,oklch(0.6_0.2_250))] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
        aria-label="Change avatar"
      >
        {/* Gradient ring */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300 p-[2px]" />
        {/* Inner circle */}
        <span className="absolute inset-[2px] rounded-full overflow-hidden bg-[var(--card)]">
          {src ? (
            <img src={src} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-2xl font-semibold text-[var(--muted-foreground)] bg-[var(--muted)]">
              {getInitials(name)}
            </span>
          )}
        </span>
        {/* Upload overlay */}
        <span className={`absolute inset-[2px] rounded-full flex flex-col items-center justify-center gap-1 bg-black/60 transition-opacity duration-200
          ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {uploading
            ? <Loader2 className="w-5 h-5 text-white animate-spin" />
            : <>
                <Upload className="w-4 h-4 text-white" />
                <span className="text-[10px] text-white font-medium tracking-wide">THAY ĐỔI</span>
              </>
          }
        </span>
      </button>
      <p className="text-xs text-[var(--muted-foreground)]">JPG, PNG, GIF · tối đa 2 MB</p>
    </div>
  );
}

// ─── Input with icon ──────────────────────────────────────────────────────────
function Field({ id, label, icon: Icon, disabled, ...props }: {
  id: string; label: string; icon: React.ElementType; disabled?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--foreground)]">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
        <input
          id={id}
          disabled={disabled}
          className={`w-full h-11 pl-10 pr-4 rounded-lg border text-sm transition-all duration-150 outline-none
            bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
            focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.22_255)] focus-visible:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--muted)]`}
          {...props}
        />
      </div>
    </div>
  );
}

// ─── Toast banner ─────────────────────────────────────────────────────────────
function Toast({ type, text }: { type: 'success' | 'error'; text: string }) {
  const isOk = type === 'success';
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-lg text-sm border
      ${isOk
        ? 'bg-green-500/10 border-green-500/25 text-green-400'
        : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
      {isOk
        ? <Check className="w-4 h-4 mt-0.5 shrink-0" />
        : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profile, updateProfile, session } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setMessage({ type: 'error', text: 'Họ và tên không được để trống.' }); return; }
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile({ full_name: fullName.trim(), avatar_url: avatarUrl });
      setMessage({ type: 'success', text: 'Lưu hồ sơ thành công.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi lưu hồ sơ.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ảnh vượt quá giới hạn 2 MB. Vui lòng chọn tệp nhỏ hơn.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `${session.user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      setMessage({ type: 'success', text: 'Đã tải ảnh xong — bấm Lưu Thay Đổi để áp dụng.' });
    } catch (err: any) {
      console.error('Upload error:', err);
      // Show a more actionable error message
      if (err.message?.includes('bucket') || err.statusCode === '404' || err.statusCode === 404) {
        setMessage({ type: 'error', text: 'Không tìm thấy Storage bucket. Vui lòng tạo bucket "avatars" công khai trong Supabase.' });
      } else {
        setMessage({ type: 'error', text: `Lỗi tải lên: ${err.message || 'lỗi không xác định'}` });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[var(--background)] px-4 py-12">
      {/* Back link */}
      <div className="w-full max-w-lg mb-6">
        <Link
          href="/list/all"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-150 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
          Quay lại công việc
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">

        {/* Header band */}
        <div className="relative h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--card)] to-transparent" />
        </div>

        {/* Avatar — floats over the header band */}
        <div className="flex flex-col items-center -mt-12 px-8 pb-8">
          <AvatarRing
            src={avatarUrl}
            name={fullName || profile?.full_name || ''}
            uploading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

          <div className="mt-4 text-center">
            <h1 className="text-lg font-semibold text-[var(--foreground)]">{profile?.full_name || 'Hồ sơ của bạn'}</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{profile?.email}</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[var(--border)] my-6" />

          {/* Form */}
          <form onSubmit={handleSave} className="w-full space-y-4">
            <Field
              id="full-name"
              label="Họ và tên"
              icon={User}
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Họ và tên của bạn"
              autoComplete="name"
            />

            <div>
              <Field
                id="email"
                label="Email"
                icon={Mail}
                type="email"
                value={profile?.email ?? ''}
                disabled
                readOnly
              />
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Quản lý bởi Google — không thể thay đổi tại đây.
              </p>
            </div>

            {message && <Toast type={message.type} text={message.text} />}

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="w-full h-11 mt-2 rounded-lg text-sm font-semibold
                bg-gradient-to-r from-blue-600 to-indigo-600
                text-white shadow-md shadow-blue-500/20
                hover:from-blue-500 hover:to-indigo-500
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]
                active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                transition-all duration-150 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Đang lưu…' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
