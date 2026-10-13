import ResetPasswordPage from "@/modules/user/tpl/default/resetPassword";

const Page = async ({ searchParams }: { searchParams: Promise<{ token?: string }> }) => {
  const params = await searchParams;

  return <ResetPasswordPage token={params.token || ""} />;
};

export default Page;
