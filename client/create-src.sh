#!/bin/bash
# Chạy script này ngay trong thư mục gốc project (nơi có folder src)

set -e

# ===== app =====
mkdir -p src/app/provider
touch src/app/provider/QueryProvider.tsx
touch src/app/provider/RouterProvider.tsx
touch src/app/App.tsx
touch src/app/router.tsx

# ===== feature/admin =====
mkdir -p src/feature/admin/hooks
mkdir -p src/feature/admin/pages
touch src/feature/admin/pages/DashBoardPage.tsx
touch src/feature/admin/service.ts

# ===== feature/auth =====
mkdir -p src/feature/auth/hooks
mkdir -p src/feature/auth/pages
touch src/feature/auth/hooks/useLogin.tsx
touch src/feature/auth/pages/LoginPage.tsx
touch src/feature/auth/rule.ts
touch src/feature/auth/service.ts
touch src/feature/auth/store.ts
touch src/feature/auth/type.ts

# ===== lib =====
mkdir -p src/lib
touch src/lib/axios.ts
touch src/lib/env.ts
touch src/lib/queryClient.ts

# ===== shared =====
mkdir -p src/shared/common/guards
touch src/shared/common/guards/GuestRoute.tsx
touch src/shared/common/guards/ProtectRoute.tsx

mkdir -p src/shared/hooks
touch src/shared/hooks/useDebounce.ts

mkdir -p src/shared/layouts
touch src/shared/layouts/AdminLayout.tsx
touch src/shared/layouts/UserLayout.tsx

mkdir -p src/shared/pages
touch src/shared/pages/HomePage.tsx

mkdir -p src/shared/service
touch src/shared/service/BaseService.ts
touch src/shared/service/type.ts

echo "✅ Đã tạo xong cấu trúc src/ hoàn chỉnh"