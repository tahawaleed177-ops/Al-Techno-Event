import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function Admin() {
  const [players, setPlayers] = useState([])
  const [barcodes, setBarcodes] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchLeaderboard()
    fetchBarcodes()

    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('name, department, score, instagram')
      .order('score', { ascending: false })
      .limit(10)

    if (!error && data) setPlayers(data)
  }

  // دالة جلب الباركودات من قاعدة البيانات
  const fetchBarcodes = async () => {
    const { data, error } = await supabase
      .from('barcodes')
      .select('*')
      .order('id', { ascending: true })

    if (!error && data) setBarcodes(data)
  }

  // تحديث حالة الباركودات أثناء الكتابة في حقول التعديل
  const handleBarcodeChange = (id, field, newValue) => {
    setBarcodes(barcodes.map((b) => (b.id === id ? { ...b, [field]: newValue } : b)))
  }

  // حفظ التعديلات في قاعدة البيانات
  const saveBarcodes = async () => {
    try {
      const { error } = await supabase.from('barcodes').upsert(barcodes)
      if (error) throw error

      toast.success('تم تحديث الباركودات في قاعدة البيانات بنجاح!')
      setIsEditing(false)
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ: ' + error.message)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const rankStyle = (index) => {
    if (index === 0) return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md shadow-amber-400/50'
    if (index === 1) return 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md shadow-slate-300/50'
    if (index === 2) return 'bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-md shadow-orange-300/50'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div
      className="admin-root relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100 p-4 font-sans text-slate-800 sm:p-8"
      style={{ minHeight: '100dvh' }}
      dir="rtl"
    >
      {/* خلفية الدارات الإلكترونية */}
      <div className="pointer-events-none absolute inset-0 print:hidden">
        <svg className="absolute inset-0 h-full w-full opacity-[0.55]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-admin" width="140" height="140" patternUnits="userSpaceOnUse">
              <path
                d="M0 35 H40 L55 50 H100 M70 0 V40 L85 55 V100 M140 105 H105 L90 120 V140 M20 140 V95 L35 80 H55"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="1.2"
              />
              <circle cx="100" cy="50" r="3" fill="#60a5fa" />
              <circle cx="85" cy="100" r="3" fill="#60a5fa" />
              <circle cx="55" cy="80" r="3" fill="#60a5fa" />
              <circle cx="40" cy="35" r="3" fill="#bfdbfe" stroke="#60a5fa" />
            </pattern>
            <radialGradient id="fade-admin" cx="50%" cy="50%" r="70%">
              <stop offset="30%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-admin)" />
          <rect width="100%" height="100%" fill="url(#fade-admin)" />
        </svg>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/25 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-400/30 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* الترويسة والأزرار */}
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-[0_10px_40px_rgba(30,64,175,0.15)] print:hidden">
          <div className="h-2 w-full bg-gradient-to-l from-blue-700 via-blue-500 to-sky-400" />
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/30">
                <svg viewBox="0 0 64 64" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <rect x="16" y="16" width="32" height="32" rx="5" />
                  <rect x="25" y="25" width="14" height="14" rx="2" fill="currentColor" stroke="none" />
                  <path d="M24 6v10M32 6v10M40 6v10M24 48v10M32 48v10M40 48v10M6 24h10M6 32h10M6 40h10M48 24h10M48 32h10M48 40h10" />
                </svg>
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-bold text-blue-700">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                  الجامعة التكنولوجية
                </div>
                <h1 className="bg-gradient-to-l from-blue-800 via-blue-600 to-sky-500 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                  لوحة التحكم السريّة
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">AL TECHNO TYS - إدارة المسابقة وتوليد الباركودات</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <button
                  onClick={saveBarcodes}
                  className="rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-3 font-bold text-white shadow-[0_8px_22px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.03] active:scale-95"
                >
                  حفظ التعديلات 💾
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 font-bold text-blue-700 transition-all hover:bg-blue-100"
                >
                  تعديل الباركودات ✏️
                </button>
              )}
              <button
                onClick={handlePrint}
                className="rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-3 font-bold text-white shadow-[0_8px_22px_rgba(30,58,138,0.4)] transition-all hover:scale-[1.03] active:scale-95"
              >
                طباعة الباركودات 🖨️
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* قسم عرض/تعديل الباركودات */}
          <div className="rounded-2xl border border-blue-100 bg-white/95 p-5 shadow-[0_10px_40px_rgba(30,64,175,0.12)] sm:p-6 print:border-none print:bg-white print:p-0 print:shadow-none">
            <div className="mb-5 flex items-center gap-3 print:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg text-white shadow-md shadow-blue-500/30">
                📱
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-blue-900">الباركودات الجاهزة للنشر</h2>
                <p className="text-xs text-slate-500">{barcodes.length} باركود</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 print:grid-cols-3 print:gap-4">
              {barcodes.map((qr) => (
                <div
                  key={qr.id}
                  className="flex flex-col items-center rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 p-4 transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-200/50 print:break-inside-avoid print:border-gray-300 print:bg-white print:shadow-none"
                >
                  <div className="rounded-lg border border-blue-100 bg-white p-1 shadow-sm print:border-none print:shadow-none">
                    <QRCodeSVG value={qr.value} size={120} level={'H'} includeMargin={true} fgColor="#1e3a8a" />
                  </div>

                  {isEditing ? (
                    <div className="mt-4 w-full space-y-2 print:hidden">
                      <input
                        type="text"
                        value={qr.title ?? ''}
                        onChange={(e) => handleBarcodeChange(qr.id, 'title', e.target.value)}
                        className="w-full rounded-lg border border-blue-200 bg-slate-50 p-1.5 text-center text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                        placeholder="العنوان (مثال: الباركود الأول)"
                      />
                      <input
                        type="text"
                        value={qr.value ?? ''}
                        onChange={(e) => handleBarcodeChange(qr.id, 'value', e.target.value)}
                        className="w-full rounded-lg border border-blue-200 bg-slate-50 p-1.5 text-center text-sm text-blue-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                        placeholder="القيمة السرية"
                        dir="ltr"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 text-center">
                      <p className="font-bold text-blue-900 print:text-sm print:text-black">{qr.title}</p>
                      <p className="mt-0.5 text-xs text-blue-500 opacity-80 print:hidden" dir="ltr">
                        {qr.value}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* قسم لوحة الصدارة */}
          <div className="h-[600px] max-h-[80vh] overflow-y-auto rounded-2xl border border-blue-100 bg-white/95 p-5 shadow-[0_10px_40px_rgba(30,64,175,0.12)] sm:p-6 print:hidden">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-lg text-white shadow-md shadow-blue-500/30">
                🏆
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-blue-900">لوحة الصدارة</h2>
                <p className="text-xs text-slate-500">أسرع الباحثين · تتحدث كل 10 ثوانٍ</p>
              </div>
            </div>

            <div className="space-y-3">
              {players.length === 0 ? (
                <p className="py-10 text-center text-slate-400">لم يقم أحد بمسح أي باركود حتى الآن...</p>
              ) : (
                players.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
                      index === 0
                        ? 'border-blue-300 bg-gradient-to-l from-blue-100 to-sky-50 shadow-md shadow-blue-200/60'
                        : 'border-blue-100 bg-gradient-to-l from-white to-blue-50/60'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${rankStyle(index)}`}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-blue-900">{player.name}</h3>
                        <p className="truncate text-sm text-slate-500">
                          {player.department} {player.instagram && `| ${player.instagram}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="block text-2xl font-black text-blue-700">{player.score}</span>
                      <span className="block text-xs text-slate-400">باركود</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pulse-dot { animation: pulseDot 1.4s ease-in-out infinite; }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        @media print {
          @page { margin: 1cm; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .admin-root { background: white !important; padding: 0 !important; overflow: visible !important; min-height: 0 !important; }
        }
      `}</style>
    </div>
  )
}
