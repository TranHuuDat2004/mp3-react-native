# Release Notes - v1.1.0 🎵

Chúng tôi rất vui mừng thông báo bản phát hành **v1.1.0**, tập trung vào quản lý âm nhạc cá nhân và trải nghiệm duyệt web mượt mà hơn đáng kể.

## ✨ Tính năng mới

### 🎧 Danh sách phát người dùng (User Playlists)
- **Quản lý danh sách phát đầy đủ:** Tạo, xem và xóa danh sách phát tùy chỉnh của riêng bạn từ tab **Playlists**.
- **Chi tiết danh sách phát:** Khám phá các bài hát bên trong bất kỳ danh sách phát nào với chế độ xem Chi tiết mới.
- **Tạo tích hợp:** Tạo danh sách phát mới trực tiếp từ màn hình Now Playing khi đang thêm bài hát.
- **Supabase Backend:** Tất cả danh sách phát được đồng bộ hóa an toàn với tài khoản của bạn qua Supabase.

### 🔍 Trải nghiệm Explore nâng cao
- **Lọc theo nghệ sĩ:** Nhấn vào bất kỳ nghệ sĩ nào để chỉ xem các bài hát của họ.
- **Tìm kiếm vạn năng:** Tìm nhanh bất kỳ bài hát nào trong thư viện "All Songs".
- **Duyệt theo danh mục:** Chuyển đổi liền mạch giữa các đề xuất cá nhân, danh sách nghệ sĩ và toàn bộ danh mục.

## 🚀 Cải thiện hiệu suất & giao diện

- **Native Lazy Loading:** Chuyển danh sách "All Songs" sang `FlatList`, cho phép cuộn mượt mượt mà ngay cả với hàng ngàn bài hát mà không gây giật lag.
- **Điều hướng tinh chỉnh:** Cải thiện xử lý định tuyến cho các chế độ xem danh sách phát động và tích hợp trình phát.
- **Tối ưu hóa TypeScript:** Tăng cường định nghĩa kiểu (Types) trong toàn bộ ứng dụng để ngăn lỗi runtime.
- **Sửa lỗi:** Giải quyết các vấn đề với việc tải hình ảnh và hiển thị biểu tượng trong tab Explore.

## 🛠 Thay đổi nội bộ
- Cập nhật `package.json` lên phiên bản `1.1.0`.
- Cập nhật schema cơ sở dữ liệu (Supabase) để hỗ trợ lưu trữ danh sách phát và liên kết bài hát.

---
*Chúc bạn nghe nhạc vui vẻ!* 🎸
