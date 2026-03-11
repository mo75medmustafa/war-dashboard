import { createClient } from '@supabase/supabase-js';

// إعداد الاتصال بقاعدة البيانات
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // السماح للمتصفح بقراءة البيانات (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // 1. جلب البيانات من الجداول
    const { data: events } = await supabase.from('events').select('*');
    const { data: news } = await supabase.from('official_news').select('*').order('id', {ascending: false}).limit(5);

    // 2. حساب مؤشر التصعيد
    let totalScore = 0;
    if (events && events.length > 0) {
        // لو في بيانات في الجدول، احسب المتوسط بناءً على المدخلات
        events.forEach(ev => totalScore += (ev.severity || 5) * 10);
        totalScore = Math.min(100, Math.round(totalScore / events.length));
    } else {
        // لو الجداول فاضية، اظهر رقم 45 كاختبار للاتصال لنتأكد أن المحرك يعمل
        totalScore = 45; 
    }

    // 3. إرسال النتيجة النهائية للموقع
    res.status(200).json({
      military_escalation: totalScore,
      military_trend: totalScore > 60 ? "تصعيد مرتفع" : "هدوء حذر",
      official_news: news || [],
      war_duration: Math.round(totalScore * 0.8),
      war_duration_trend: "توقعات استمرار العمليات"
    });

  } catch (error) {
    // في حالة وجود خطأ في الاتصال، يظهر لنا نوع الخطأ
    res.status(500).json({ error: error.message });
  }
}