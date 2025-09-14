import { logoutApi } from "@/app/api/logout/route";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";

export const useLogout = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['user']});
            localStorage.removeItem("access_token");
            window.location.href = '/';
            toast.success("Logged out successfully");
        },

        onError: (error: any) => {
            console.error("Logout failed:", error);
            toast.error(error?.message || "Logout failed");
        },
    })
}