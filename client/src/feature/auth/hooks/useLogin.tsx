import { useMutation } from "@tanstack/react-query";
import type { LoginResponse, LoginSchema } from "../type";
import { authService } from "../service";
import { useAuthStore } from "../store";
import { toast } from "sonner";

const useLogin = () => {
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation<LoginResponse, Error, LoginSchema>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (response) => {
      setToken(response.token, response.user.role);
      toast.success("Login successfully")
    },
    onError: (error) => {
      // toast.error(error.message);
    },
  });
};

export default useLogin;
