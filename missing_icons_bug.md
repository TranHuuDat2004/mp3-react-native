# 🐛 Hướng Dẫn Sửa Lỗi "Mất Sạch Icon" Khi Build APK Bằng Expo

Nếu bạn đang phát triển ứng dụng bằng React Native (Expo) và gặp tình trạng chạy trên **Expo Go thì hiển thị icon bình thường**, nhưng khi đóng gói thành **file APK đem cài lên máy thật thì toàn bộ icon biến mất (hoặc biến thành ô vuông/dấu chấm hỏi)**, thì đây là nguyên nhân và cách khắc phục.

## 🕵️‍♂️ Nguyên Nhân Gây Lỗi

Khi bạn chạy app trên app **Expo Go** (môi trường phát triển), ứng dụng Expo Go đã được nhúng sẵn tất cả các bộ font chữ phổ biến như Ionicons, MaterialIcons, FontAwesome... Vì vậy, khi máy ảo render lên, nó tự động lấy font có sẵn ra xài ngay lập tức.

Tuy nhiên, khi bạn build ra một **ứng dụng độc lập (Standalone APK)**, ứng dụng này "trống trơn" không hề có sẵn các font đó. Nếu chúng ta không viết code yêu cầu ứng dụng phải **"tải font về bộ nhớ trước khi vẽ ra màn hình"**, ứng dụng sẽ nỗ lực vẽ giao diện ra quá nhanh trong khi file font chưa kịp tải. Kết quả là nó không biết vẽ biểu tượng đó thế nào, đành để ô trống.

## 🛠 Cách Khắc Phục (Font Loading)

Để khắc phục, chúng ta phải can thiệp vào file cấu hình gốc của ứng dụng (trong trường hợp dùng `expo-router` là file [app/_layout.tsx](file:///c:/Users/huuda/OneDrive/Documents/GitHub/auth-react-native/app/_layout.tsx)).

Quá trình này gồm 3 bước:
1. **Chặn màn hình Splash Screen:** Không cho màn hình chờ tự động biến mất.
2. **Tải Font chữ:** Gọi hàm `useFonts` để load biểu tượng.
3. **Ẩn Splash Screen:** Chỉ ẩn màn hình chờ và để lộ giao diện ra khi và chỉ khi font đã được load xong.

### Áp dụng vào code ([app/_layout.tsx](file:///c:/Users/huuda/OneDrive/Documents/GitHub/auth-react-native/app/_layout.tsx))

Đây là đoạn code chuẩn bạn cần áp dụng để sửa lỗi:

```tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

// 1. NGĂN CHẶN MÀN HÌNH CHỜ (SPLASH SCREEN) TỰ ẨN ĐI
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 2. TẢI BỘ FONT CHO ICON
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
  });

  // Bắt lỗi nếu font không tải được (VD: mất mạng, lỗi package)
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 3. ẨN MÀN HÌNH CHỜ KHI FONT ĐÃ SẴN SÀNG
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync(); // Chỉ ẩn đi khi loaded = true
    }
  }, [loaded]);

  // Nếu font chưa tải xong, không render giao diện chính mà có thể return null 
  // (hoặc màn hình trắng/loading tùy ý)
  if (!loaded) {
    return null; 
  }

  // Khi mọi thứ đã sẵn sàng, hiển thị các màn hình bên trong
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

## 📝 Tóm lại

Lỗi mất icon không phải do code bạn gõ sai tên icon, mà là sự khác biệt về **môi trường** giữa "bản nháp" (Expo Go) và "bản thật" (APK). Chỉ cần thêm vài dòng code để ứng dụng của bạn "kiên nhẫn đợi font tải xong" là vấn đề được giải quyết triệt để! 🚀🔥
