# Hướng dẫn cấu hình Google Login cho MyMusicPlayer

Để tính năng đăng nhập Google hoạt động, bạn cần thực hiện 2 bước cấu hình chính bên dưới:

## Bước 1: Cấu hình trên Google Cloud Console

1.  Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2.  Tạo một dự án mới (ví dụ: `MyMusicPlayer-Auth`).
3.  Vào mục **APIs & Services > OAuth consent screen**:
    *   Chọn **External**.
    *   Điền các thông tin bắt buộc (tên app, email hỗ trợ).
    *   Thêm scope: `.../auth/userinfo.email` và `.../auth/userinfo.profile`.
4.  Vào mục **APIs & Services > Credentials**:
    *   Nhấn **Create Credentials > OAuth client ID**.
    *   **Loại ứng dụng:** Chọn **Web application**.
    *   **Authorized redirect URIs:** Thêm link callback từ Supabase (lấy ở Bước 2 bên dưới). Ví dụ: `https://xxxxxx.supabase.co/auth/v1/callback`.
5.  Sau khi tạo xong, bạn sẽ nhận được **Client ID** và **Client Secret**. Hãy giữ chúng lại.

## Bước 2: Cấu hình trên Supabase Dashboard

1.  Vào dự án của bạn trên [Supabase Dashboard](https://supabase.com/dashboard).
2.  Chọn mục **Authentication > Providers > Google**.
3.  Bật (Enable) Google Provider.
4.  Dán **Client ID** và **Client Secret** bạn vừa lấy ở Bước 1 vào.
5.  **Redirect URI:** Copy địa chỉ hiển thị ở đây (thường có dạng `https://xxxx.supabase.co/auth/v1/callback`) và dán vào phần *Authorized redirect URIs* trong Google Cloud Console (Bước 1.4).
6.  Nhấn **Save**.

## Bước 3: Cấu hình URL Redirect trong Supabase

Để Supabase biết đường quay lại app của bạn sau khi đăng nhập xong:
1.  Vào **Authentication > URL Configuration**.
2.  Trong phần **Redirect URLs**, nhấn **Add URL**.
3.  Thêm URL sau: `myapp://(tabs)` (trong đó `myapp` là scheme bạn đã đặt trong [app.json](file:///c:/Users/huuda/OneDrive/Documents/GitHub/auth-react-native/app.json)).

---
**Ghi chú:** Sau khi hoàn tất 3 bước trên, bạn có thể nhấn nút "Continue with Google" trong app để trải nghiệm!
