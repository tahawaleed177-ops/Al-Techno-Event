import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

// خلفية الدارات الإلكترونية المشتركة بين الشاشات
function CircuitBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.55]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit-hunt" width="140" height="140" patternUnits="userSpaceOnUse">
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
          <radialGradient id="fade-hunt" cx="50%" cy="50%" r="70%">
            <stop offset="30%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-hunt)" />
        <rect width="100%" height="100%" fill="url(#fade-hunt)" />
      </svg>
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/25 blur-[100px]" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-400/30 blur-[100px]" />
    </div>
  )
}

export default function Hunt() {
  const navigate = useNavigate()
  const [playerId, setPlayerId] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [validBarcodes, setValidBarcodes] = useState([])

  // --- حالات الشاشة الترحيبية (شعار الراعي) ---
  const [showSplash, setShowSplash] = useState(true)
  const [splashOpacity, setSplashOpacity] = useState('opacity-100')

  // الكاميرا متوقفة في البداية حتى ينتهي عرض الشعار
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)

  // مراجع تحفظ آخر القيم كي لا تتأثر دالة المسح بقيم قديمة، وقفل يمنع معالجة المسح مرتين
  const playerIdRef = useRef(null)
  const validBarcodesRef = useRef([])
  const busyRef = useRef(false)
  playerIdRef.current = playerId
  validBarcodesRef.current = validBarcodes

  // 1. مؤقت الشاشة الترحيبية
  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashOpacity('opacity-0'), 2000)

    const removeTimer = setTimeout(() => {
      setShowSplash(false)
      setIsScanning(true)
    }, 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  // 2. التهيئة وجلب البيانات
  useEffect(() => {
    const id = localStorage.getItem('playerId')
    if (!id) {
      navigate('/')
      return
    }
    setPlayerId(id)
    fetchPlayerData(id)
    fetchValidBarcodes()
  }, [navigate])

  const fetchPlayerData = async (id) => {
    const { data, error } = await supabase.from('players').select('*').eq('id', id).single()
    if (data) setPlayerData(data)
  }

  const fetchValidBarcodes = async () => {
    const { data, error } = await supabase.from('barcodes').select('value')
    if (data) {
      const barcodesArray = data.map((b) => b.value)
      setValidBarcodes(barcodesArray)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('playerId')
    toast.success('تم تسجيل الخروج بنجاح')
    navigate('/')
  }

  // 3. تشغيل الكاميرا (بعد اختفاء الشعار وتغير isScanning إلى true)
  useEffect(() => {
    if (!isScanning) return

    busyRef.current = false

    scannerRef.current = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        // حجم مربع المسح يتكيف مع عرض الشاشة (هاتف أو حاسوب)
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7)
          return { width: Math.max(size, 150), height: Math.max(size, 150) }
        },
        aspectRatio: 1.0
      },
      false
    )

    scannerRef.current.render(onScanSuccess, onScanFailure)

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [isScanning])

  const onScanSuccess = async (decodedText) => {
    // قفل: المكتبة قد تستدعي الدالة أكثر من مرة للباركود نفسه
    if (busyRef.current) return
    busyRef.current = true

    setIsScanning(false)
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
    }

    const resume = (ms) =>
      setTimeout(() => {
        busyRef.current = false
        setIsScanning(true)
      }, ms)

    const pid = playerIdRef.current

    if (!validBarcodesRef.current.includes(decodedText)) {
      toast.error('هذا الباركود لا يتبع للمسابقة!')
      resume(2000)
      return
    }

    try {
      const { error: scanError } = await supabase
        .from('scans')
        .insert([{ player_id: pid, barcode_value: decodedText }])

      if (scanError) {
        if (scanError.code === '23505') {
          toast.error('لقد قمت بمسح هذا الباركود سابقاً! ابحث عن واحد آخر.', { duration: 4000 })
        } else {
          toast.error('حدث خطأ في الاتصال.')
        }
        resume(3000)
        return
      }

      // نحسب النقاط من عدد عمليات المسح الفعلية لتفادي أي قيمة قديمة
      const { count } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', pid)

      const newScore = count ?? 1

      const { error: updateError } = await supabase
        .from('players')
        .update({ score: newScore })
        .eq('id', pid)

      if (!updateError) {
        setPlayerData((prev) => ({ ...(prev || {}), score: newScore }))
        toast.success(`ممتاز! لقيت الباركود رقم ${newScore}/6 🎯`, { duration: 4000 })
      }

      resume(3000)
    } catch (error) {
      console.error(error)
      resume(1000)
    }
  }

  const onScanFailure = (error) => {}

  const score = playerData?.score || 0

  // ===================== شاشة الفوز =====================
  if (playerData?.score >= 6) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100 p-4 font-sans text-center"
        style={{ minHeight: '100dvh' }}
        dir="rtl"
      >
        <CircuitBackground />

        <div className="relative w-full max-w-md">
          <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-blue-500/40 via-sky-300/30 to-blue-700/40 blur-xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white/95 shadow-[0_20px_60px_rgba(30,64,175,0.2)]">
            <div className="h-2 w-full bg-gradient-to-l from-blue-700 via-blue-500 to-sky-400" />

            <div className="p-8 sm:p-10">
              <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-6xl shadow-[0_10px_35px_rgba(37,99,235,0.5)] animate-bounce">
                🏆
              </div>

              <h1 className="mb-2 bg-gradient-to-l from-blue-800 via-blue-600 to-sky-500 bg-clip-text text-4xl font-black text-transparent">
                مبروك يا بطل!
              </h1>
              <p className="mb-6 text-lg text-slate-600">
                🎉 تهانينا <span className="font-bold text-blue-800">{playerData.name}</span>، لقد جمعت جميع الباركودات الستة وفزت بالمسابقة!
              </p>

              <div className="mb-6 flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-600 to-sky-400" />
                ))}
              </div>

              <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 p-5 text-white shadow-lg shadow-blue-500/30">
                <div className="shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <h2 className="relative mb-2 text-sm font-bold text-blue-100">الخطوة الأخيرة لاستلام جائزتك</h2>
                <p className="relative text-lg font-extrabold leading-relaxed">
                  تواصل مع المشرفين المنسقين للفعالية لتسليمك الجائزة 🎁
                </p>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                أرِهم هذه الشاشة للتحقق من فوزك، ولا تُغلق الصفحة أو تخرج من حسابك قبل استلام الجائزة.
              </p>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white"
              >
                خروج من الحساب
              </button>
            </div>
          </div>
        </div>

        <Styles />
      </div>
    )
  }

  // ===================== الشاشة الرئيسية =====================
  return (
    <>
      {/* --- طبقة الشاشة الترحيبية (شعار الراعي) --- */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-white via-sky-50 to-blue-100 transition-opacity duration-1000 ease-in-out ${splashOpacity}`}
        >
          {/* تأكد من وضع صورة sponsor.png في مجلد public */}
          <img
            src="/sponsor.png"
            alt="الراعي الرسمي"
            className="mb-6 h-auto w-48 animate-pulse drop-shadow-[0_8px_20px_rgba(37,99,235,0.35)] md:w-64"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="mb-6 hidden animate-pulse bg-gradient-to-l from-blue-800 to-sky-500 bg-clip-text text-4xl font-black text-transparent">
            AL TECHNO TYS
          </div>
          <div className="mb-4 h-1.5 w-40 overflow-hidden rounded-full bg-blue-100">
            <div className="splash-bar h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400" />
          </div>
          <p className="text-lg font-semibold text-blue-700">نستعد للبدء...</p>
        </div>
      )}

      {/* --- واجهة الكاميرا الأساسية --- */}
      <div
        className="relative min-h-screen flex flex-col items-center overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100 p-4 font-sans text-slate-800"
        style={{ minHeight: '100dvh' }}
        dir="rtl"
      >
        <CircuitBackground />

        {/* بطاقة اللاعب */}
        <div className="relative z-10 mt-4 mb-5 w-full max-w-md overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-[0_10px_35px_rgba(30,64,175,0.15)]">
          <div className="h-1.5 w-full bg-gradient-to-l from-blue-700 via-blue-500 to-sky-400" />
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-xl text-white shadow-md shadow-blue-500/30">
                👤
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-extrabold text-blue-900">
                  {playerData?.name || 'جاري التحميل...'}
                </h2>
                <p className="truncate text-xs text-slate-500">{playerData?.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-center">
                <span className="block text-[10px] font-bold text-blue-500">النقاط</span>
                <span className="block text-lg font-black leading-tight text-blue-700">{score}/6</span>
              </div>

              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-500 transition-all hover:bg-red-500 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </div>

          {/* شريط تقدم الباركودات الستة */}
          <div className="flex gap-1.5 px-4 pb-4">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  n < score
                    ? 'bg-gradient-to-r from-blue-600 to-sky-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                    : 'bg-blue-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* بطاقة الماسح */}
        <div className="relative z-10 w-full max-w-md">
          <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-blue-500/25 via-sky-300/15 to-blue-700/25 blur-xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(30,64,175,0.18)]">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                الماسح الذكي
              </div>
              <h3 className="bg-gradient-to-l from-blue-800 via-blue-600 to-sky-500 bg-clip-text text-2xl font-black text-transparent">
                امسح الباركود هنا
              </h3>
            </div>

            {/* إطار الكاميرا بزوايا ماسح */}
            <div className="relative">
              <span className="absolute -top-1 -right-1 z-10 h-7 w-7 rounded-tr-2xl border-t-4 border-r-4 border-blue-600" />
              <span className="absolute -top-1 -left-1 z-10 h-7 w-7 rounded-tl-2xl border-t-4 border-l-4 border-blue-600" />
              <span className="absolute -bottom-1 -right-1 z-10 h-7 w-7 rounded-br-2xl border-b-4 border-r-4 border-blue-600" />
              <span className="absolute -bottom-1 -left-1 z-10 h-7 w-7 rounded-bl-2xl border-b-4 border-l-4 border-blue-600" />

              <div className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-50">
                {isScanning ? (
                  <div id="reader" className="w-full"></div>
                ) : (
                  <div className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-blue-50 to-white font-bold text-blue-600">
                    <svg className="h-8 w-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التجهيز...
                  </div>
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-slate-500">
              ابحث عن الباركودات في الأروقة ووجّه الكاميرا نحوها
            </p>
          </div>
        </div>

        <Styles />
      </div>
    </>
  )
}

function Styles() {
  return (
    <style>{`
      .pulse-dot { animation: pulseDot 1.4s ease-in-out infinite; }
      @keyframes pulseDot {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.5); opacity: 1; }
      }
      .shine { animation: shine 3.5s ease-in-out infinite; }
      @keyframes shine {
        0% { left: -40%; }
        60%, 100% { left: 130%; }
      }
      .splash-bar { width: 0; animation: splashLoad 2.6s ease-in-out forwards; }
      @keyframes splashLoad { to { width: 100%; } }

      /* تنسيق عناصر مكتبة html5-qrcode بما يناسب الثيم */
      #reader { border: none !important; }
      #reader button {
        background: linear-gradient(to right, #1d4ed8, #0ea5e9) !important;
        color: white !important;
        padding: 9px 18px !important;
        border-radius: 10px !important;
        border: none !important;
        font-family: inherit !important;
        font-weight: 700 !important;
        margin-top: 10px !important;
        cursor: pointer !important;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35) !important;
      }
      #reader select {
        background-color: #ffffff !important;
        color: #1e3a8a !important;
        border: 1px solid #bfdbfe !important;
        padding: 6px 8px !important;
        border-radius: 8px !important;
        margin-bottom: 10px !important;
      }
      #reader a { color: #2563eb !important; }
      #reader__dashboard_section_csr span,
      #reader__dashboard_section_swaplink { color: #1e3a8a !important; }
      #reader__scan_region img { display: none !important; }
    `}</style>
  )
}
