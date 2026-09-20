import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import QueryProvider from "./provider/QueryProvider";
import RouterProvider from "./provider/RouterProvider";

const App = () => {
  return (
    <HelmetProvider>
      <QueryProvider>
        <RouterProvider />
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </HelmetProvider>
  );
};

export default App;
