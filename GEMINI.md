# 🤖 Gemini Workspace Context - FHS-showcase

File này lưu trữ ngữ cảnh và trạng thái của dự án FAHASA Showcase để chúng ta tiếp tục làm việc.

## 📌 Hiện Trạng Dự Án
- **Base:** Được clone từ dự án Music Player (đã qua debug cực kỹ).
- **SDK:** Expo SDK 54 (Ổn định, đã fix toàn bộ lỗi xung đột native modules).
- **Tính năng có sẵn:**
  - Hệ thống Auth (Login/Signup) với Supabase.
  - Cấu hình Font/Icon (Ionicons, MaterialIcons) đã được fix lỗi biến mất trên APK.
  - Cấu hình EAS Build đã sẵn sàng (cần cập nhật projectId nếu tạo project mới trên Expo Dashboard).
  - Đã làm sạch các asset nhạc cũ (1.6GB) để dự án nhẹ.

## 🎯 Mục Tiêu Dự Án FHS
1. **Ngành hàng & Sản phẩm:** Hiển thị các danh mục và sản phẩm nổi bật của FAHASA.
2. **Video Feature:** Nhúng video quảng cáo từ YouTube/TikTok vào app.
3. **Direct Link:** Nút mua hàng mở link trực tiếp đến website fahasa.com.
4. **Database:** Chuyển đổi Schema Supabase từ Music (Songs/Playlists) sang FHS (Categories/Products/Videos).

## 🛠 Việc Cần Làm Tiếp Theo (Tại dự án FHS-showcase)
- [ ] Chạy `npm install` để cài lại node_modules.
- [ ] Thiết kế Schema Database trên Supabase cho FAHASA.
- [ ] Thay thế UI màu Cyberpunk sang màu đỏ/trắng đặc trưng của FAHASA.
- [ ] Tích hợp thư viện chơi Video (YouTube/TikTok).

---
*Hãy dùng file này để nhắc mình về những việc đang dang dở nhé!*
