import { createBrowserRouter } from "react-router-dom";
import HomePage from "../shared/pages/HomePage";
import GuestRoute from "../shared/common/guards/GuestRoute";
import LoginPage from "../feature/auth/pages/LoginPage";
import { UserLayout } from "../shared/layouts/UserLayout";

const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "login",
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
    ],
  },
]);

export default router;
