# 🎧 MyMusicPlayer v1.1.0

**MyMusicPlayer** là một trình phát nhạc Offline hiện đại được xây dựng bằng React Native và Expo. Với phong cách thiết kế **Cyberpunk Neon**, ứng dụng mang lại trải nghiệm nghe nhạc độc đáo, mượt mà và hoàn toàn không cần kết nối Internet.

## ✨ Tính năng nổi bật

- 🦾 **Thiết kế Cyberpunk**: Giao diện tối với các điểm nhấn Neon Pink & Cyan.
- 📂 **Offline 100%**: Hoàn toàn không cần Database hay Internet. Nhạc và ảnh được đóng gói sẵn trong App.
- 🔍 **Tìm kiếm thông minh**: Thanh tìm kiếm tích hợp giúp tìm bài hát hoặc nghệ sĩ trong chớp mắt.
- 🎧 **Phát nhạc dưới nền**: Nhạc vẫn tiếp tục phát khi bạn thoát App hoặc tắt màn hình.
- ⏩ **Tua nhạc mượt mà**: Hỗ trợ thanh slider để tua đến bất kỳ đoạn nhạc nào bạn thích.
- 📚 **Thư viện chuyên nghiệp**: Tự động lọc nhạc theo Playlist, Nghệ sĩ và Album.

## 🛠 Công nghệ sử dụng

- **Framework**: Expo (React Native)
- **Âm thanh**: Expo-AV (Hỗ trợ Audio Sessions & Background Mode)
- **Định tuyến**: Expo-Router (File-based routing)
- **UI**: Themed Components, Ionicons, Expo-Image.

## 🚀 Bắt đầu

### Cài đặt
1. Clone dự án và truy cập vào thư mục:
   ```bash
   cd my-app
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```

### Chạy ứng dụng
Khởi động Expo Go:
```bash
npx expo start
```

### Đóng gói APK
Để tự đóng gói bản APK cài đặt cho Android:
1. Đảm bảo đã cài đặt `eas-cli`: `npm install -g eas-cli`
2. Đăng nhập: `eas login`
3. Chạy lệnh build:
   ```bash
   npx eas build -p android --profile preview
   ```

## 📝 Nhật ký phát hành
Xem chi tiết các thay đổi và cập nhật tại: [RELEASE_NOTES.md](./RELEASE_NOTES.md)

---
*Phát triển bởi huudatlego với sự hỗ trợ từ Antigravity AI.*
