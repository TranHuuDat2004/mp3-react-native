# Hướng dẫn đóng gói file APK cho Máy thật

Để tạo file APK cài đặt lên điện thoại Android mà không cần máy tính (chạy độc lập), bạn hãy làm theo các bước sau:

### 1. Cài đặt EAS CLI (Nếu chưa có)
Mở terminal và chạy lệnh:
```bash
npm install -g eas-cli
```

### 2. Đăng nhập vào Expo
Nếu bạn chưa có tài khoản, hãy tạo tại [expo.dev](https://expo.dev), sau đó chạy:
```bash
eas login
```

### 3. Cấu hình Project
Chạy lệnh này để khởi tạo cấu hình build:
```bash
eas build:configure
```
*Chọn **Android** khi được hỏi.*

### 4. Tạo file app.json (Cấu hình quan trọng)
Đảm bảo file [app.json](file:///c:/Users/huuda/OneDrive/Documents/GitHub/starter-react-native/my-app/app.json) của bạn có phần `android` như sau (mình đã cập nhật cho bạn):
```json
"android": {
  "package": "com.yourname.mymusicplayer",
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/cyberpunk-icon.png",
    "backgroundColor": "#000000"
  }
}
```

### 5. Build file APK (Preview)
Mặc định Expo sẽ build file `.aab` (để up lên Store). Để lấy file `.apk` cài trực tiếp, bạn chạy lệnh:
```bash
eas build -p android --profile preview
```

---

### Lưu ý:
*   **Thời gian build:** Expo sẽ build trên server của họ, mất khoảng 5-10 phút.
*   **Kết quả:** Sau khi xong, terminal sẽ hiện một đường link. Bạn click vào đó để tải file `.apk` về điện thoại và cài đặt.
*   **Offline hoàn toàn:** Vì mình đã chuyển code về dùng local [music.json](file:///c:/Users/huuda/OneDrive/Documents/GitHub/starter-react-native/my-app/assets/data/music.json), cái APK này sẽ chứa sẵn toàn bộ nhạc của bạn bên trong, mở lên là nghe được ngay mà không cần mạng!
