import { Loader } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/api/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitedUserJoinWorkspaceMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const InviteUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { inviteCode } = useParams<{ inviteCode: string }>();

  const { data: authData, isLoading: authLoading } = useAuth();
  const user = authData?.user;

  const { mutate, isPending: joinLoading } = useMutation<
    { workspaceId: string },
    Error,
    string
  >({
    mutationFn: invitedUserJoinWorkspaceMutationFn,
  });

  const returnUrl = encodeURIComponent(
    `/invite/workspace/${inviteCode}/join`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;

    mutate(inviteCode, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });
        navigate(`/workspace/${data.workspaceId}`);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to join workspace",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <Logo />
            CollabHub.
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Workspace Invitation</CardTitle>
            <CardDescription>
              You must be logged in to join this workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {authLoading ? (
              <div className="flex justify-center">
                <Loader className="h-8 w-8 animate-spin" />
              </div>
            ) : user ? (
              <form onSubmit={handleSubmit} className="flex justify-center">
                <Button type="submit" disabled={joinLoading}>
                  {joinLoading && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Join Workspace
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to={`/sign-up?returnUrl=${returnUrl}`}>
                  <Button className="w-full">Signup</Button>
                </Link>
                <Link to={`/sign-in?returnUrl=${returnUrl}`}>
                  <Button variant="secondary" className="w-full">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteUser;
