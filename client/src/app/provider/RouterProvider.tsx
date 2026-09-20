import { RouterProvider as ReactRouterProvider } from "react-router-dom";
import router from "../router";

export function RouterProvider() {
  return <ReactRouterProvider router={router} />;
}

export default RouterProvider;
