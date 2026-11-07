import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()

  const [showInstructions, setShowInstructions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    instagram: '',
    discord: ''
  })

  // إذا كان اللاعب مسجلاً مسبقاً نوجهه للمسابقة فوراً
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('playerId')
    if (savedPlayerId) {
      navigate('/hunt')
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // الخدعة السرية للدخول إلى صفحة الإدارة
    if (formData.name.trim() === 'Al Techno TYS') {
      toast.success('مرحباً بك في لوحة التحكم السريّة')
      navigate('/AL_TECHNO_TYS')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            name: formData.name,
            department: formData.department,
            instagram: formData.instagram,
            discord: formData.discord
          }
        ])
        .select()

      if (error) throw error

      localStorage.setItem('playerId', data[0].id)
      toast.success('تم التسجيل بنجاح! استعد للبحث')
      navigate('/hunt')
    } catch (error) {
      toast.error('حدث خطأ أثناء التسجيل: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { icon: '📝', title: 'سجّل بياناتك', text: 'أدخل بياناتك الحقيقية لإنشاء حسابك  .' },
    { icon: '🔍', title: 'ابحث عن الباركودات', text: 'هناك 6 باركودات (QR) مخفية في الجامعة ابحث عنها.' },
    { icon: '📱', title: 'امسح الباركود', text: 'وجّه كاميرا الموقع نحو أي باركود تجده ليُحتسب  .' }
  ]

  const inputClass =
    'w-full text-base bg-slate-50 border border-blue-200 rounded-xl pr-11 pl-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all'
  const inputLtrClass =
    'w-full text-base bg-slate-50 border border-blue-200 rounded-xl px-4 py-3 text-left text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all'

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100 px-4 py-8 font-sans"
      style={{ minHeight: '100dvh' }}
      dir="rtl"
    >
      {/* خلفية: دوائر الدارات الإلكترونية */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full opacity-[0.55]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" width="140" height="140" patternUnits="userSpaceOnUse">
              <path d="M0 35 H40 L55 50 H100 M70 0 V40 L85 55 V100 M140 105 H105 L90 120 V140 M20 140 V95 L35 80 H55"
                fill="none" stroke="#93c5fd" strokeWidth="1.2" />
              <circle cx="100" cy="50" r="3" fill="#60a5fa" />
              <circle cx="85" cy="100" r="3" fill="#60a5fa" />
              <circle cx="55" cy="80" r="3" fill="#60a5fa" />
              <circle cx="40" cy="35" r="3" fill="#bfdbfe" stroke="#60a5fa" />
            </pattern>
            <radialGradient id="fade" cx="50%" cy="50%" r="70%">
              <stop offset="30%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
          <rect width="100%" height="100%" fill="url(#fade)" />
        </svg>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/25 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-400/30 blur-[100px]" />
        {/* تروس دوّارة */}
        <svg className="gear-spin absolute -top-16 -right-16 h-56 w-56 text-blue-300/50" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 30a20 20 0 100 40 20 20 0 000-40zm0 12a8 8 0 110 16 8 8 0 010-16zM44 2h12l2 11 7 3 9-6 8 8-6 9 3 7 11 2v12l-11 2-3 7 6 9-8 8-9-6-7 3-2 11H44l-2-11-7-3-9 6-8-8 6-9-3-7-11-2V44l11-2 3-7-6-9 8-8 9 6 7-3z" fillRule="evenodd" />
        </svg>
        <svg className="gear-spin-rev absolute -bottom-20 -left-12 h-64 w-64 text-sky-300/40" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 30a20 20 0 100 40 20 20 0 000-40zm0 12a8 8 0 110 16 8 8 0 010-16zM44 2h12l2 11 7 3 9-6 8 8-6 9 3 7 11 2v12l-11 2-3 7 6 9-8 8-9-6-7 3-2 11H44l-2-11-7-3-9 6-8-8 6-9-3-7-11-2V44l11-2 3-7-6-9 8-8 9 6 7-3z" fillRule="evenodd" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-blue-500/30 via-sky-300/20 to-blue-700/30 blur-xl" />

        <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white/95 shadow-[0_20px_60px_rgba(30,64,175,0.18)] backdrop-blur-xl">
          {/* شريط علوي */}
          <div className="h-2 w-full bg-gradient-to-l from-blue-700 via-blue-500 to-sky-400" />

          <div className="p-7 sm:p-8">
            {showInstructions ? (
              <div className="animate-fade-in space-y-6">
                
                {/* --- التعديل: صورة الراعي بدل الأيقونة الزرقاء --- */}
                <div className="text-center">
                  <div className="relative mx-auto mb-4 flex h-28 items-center justify-center p-2">
                    <img 
                      src="/sponsor.png" 
                      alt="شعار الراعي" 
                      className="h-full w-auto object-contain drop-shadow-[0_8px_16px_rgba(37,99,235,0.15)]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    {/* نص بديل في حال عدم وجود الصورة بعد */}
                    <div className="hidden text-xl font-bold text-blue-800">صورة الراعي (sponsor.png)</div>
                    
                    {/* تأثير خط المسح للمحافظة على الطابع التقني */}
                    <span className="scan-line absolute right-4 left-4 h-[2px] rounded-full bg-blue-400/60 shadow-[0_0_8px_2px_rgba(96,165,250,0.5)]" />
                  </div>

                  <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                    الجامعة التكنولوجية
                  </div>
                  
                  {/* --- التعديل: تغيير الاسم إلى تحدي التكنو --- */}
                  <h1 className="bg-gradient-to-l from-blue-800 via-blue-600 to-sky-500 bg-clip-text text-4xl font-black text-transparent">
                    تحدي التكنو
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">دور · فكر · اربح</p>
                </div>

                {/* الخطوات */}
                <div className="space-y-3">
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-gradient-to-l from-white to-blue-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-200/50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-md shadow-blue-500/30">
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-blue-900">
                          <span className="ml-1 text-sky-500">0{i + 1}</span>
                          {s.title}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{s.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* الجائزة */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 p-4 text-white shadow-lg shadow-blue-500/30">
                    <div className="shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <div className="relative flex items-start gap-3">
                      <span className="text-3xl">🏆</span>
                      <div>
                        <p className="text-sm font-extrabold">الجائزة الكبرى</p>
                        <p className="mt-0.5 text-[13px] font-semibold leading-relaxed text-blue-50">
                          أول شخص يجمع الباركودات الستة يفوز بالجائزة  !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* شريط التقدم: 6 باركودات */}
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="seg h-1.5 flex-1 rounded-full bg-blue-100"
                      style={{ animationDelay: `${n * 0.25}s` }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 py-4 text-lg font-extrabold text-white shadow-[0_8px_25px_rgba(37,99,235,0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_10px_35px_rgba(37,99,235,0.6)] active:scale-95"
                >
                  فهمت، أنا مستعد للتحدي 🚀
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="mb-7 text-center">
                  <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-bold text-blue-700">
                    <span className="pulse-dot h-2 w-2 rounded-full bg-blue-500" />
                    الباركودات: 0 / 6
                  </div>
                  <h1 className="bg-gradient-to-l from-blue-800 via-blue-600 to-sky-500 bg-clip-text text-3xl font-black text-transparent">
                    سجّل دخولك للمسابقة
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">أدخل بياناتك لتبدأ رحلة جمع الباركودات</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">
                      الاسم الثلاثي <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-base">👤</span>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="مثال: أحمد محمد علي"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-blue-900">
                      القسم العلمي <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-base">🎓</span>
                      <input
                        type="text"
                        name="department"
                        required
                        value={formData.department}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="مثال: هندسة الحاسوب / شبكات"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">الانستغرام</label>
                      <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className={inputLtrClass}
                        placeholder="@username"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-blue-900">الديسكورد</label>
                      <input
                        type="text"
                        name="discord"
                        value={formData.discord}
                        onChange={handleChange}
                        className={inputLtrClass}
                        placeholder="user#123"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowInstructions(true)}
                      className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-blue-700 transition-all hover:bg-blue-100"
                      title="عودة للتعليمات"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-4 py-3.5 font-extrabold text-white shadow-[0_8px_25px_rgba(37,99,235,0.45)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          جاري التسجيل...
                        </span>
                      ) : (
                        'دخول المسابقة 🎯'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.45s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scan-line { animation: scan 2.2s ease-in-out infinite; }
        @keyframes scan {
          0%, 100% { top: 12%; opacity: 0.2; }
          50% { top: 84%; opacity: 1; }
        }
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
        .gear-spin { animation: spin 40s linear infinite; }
        .gear-spin-rev { animation: spin 55s linear infinite reverse; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .seg { animation: segFill 3s ease-in-out infinite; }
        @keyframes segFill {
          0%, 100% { background-color: #dbeafe; }
          50% { background-color: #3b82f6; }
        }
      `}</style>
    </div>
  )
}