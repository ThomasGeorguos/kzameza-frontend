// رابط الباك اند بتاع البروجيكت
// - في التطوير (dev) سيبها فاضية وهي هتشتغل بالـ proxy بتاع Vite
// - في البرودكشن حطها في .env: VITE_API_URL=https://your-app.up.railway.app
export const API_URL = import.meta.env.VITE_API_URL || "";

// نفس fetch العادي بالظبط، غير إنه بيحط رابط الباك اند في الأول تلقائي
export function apiFetch(path, options) {
  // في التطوير المحلي (API_URL فاضي) بنسيب /api زي ما هي عشان الـ Vite proxy
  // هو اللي بيشيلها قبل ما توصل للباك اند.
  // في البرودكشن (لما يبقى فيه رابط ريلواي حقيقي) بنشيلها إحنا، لأن الباك اند
  // مسجل الراوترز بتاعته من غير /api أصلاً (/users, /products, /contact...)
  const finalPath = API_URL ? path.replace(/^\/api/, "") : path;
  return fetch(`${API_URL}${finalPath}`, options);
}
