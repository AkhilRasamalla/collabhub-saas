import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: false,            // ❗ DO NOT auto-run
    retry: false,              // ❗ stop 401 loop
    staleTime: 0,
  });

  return query;
};

export default useAuth;
