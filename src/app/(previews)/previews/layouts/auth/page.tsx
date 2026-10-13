import AuthLayout from "@/layouts/auth/Layout";

const AuthLayoutPreviewPage = () => {
  return (
    <AuthLayout siteUrl="/previews" siteTitle="Plextype Preview">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Auth Layout</div>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950 dark:text-white">인증 레이아웃 미리보기</h1>
        <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-dark-300">
          로그인과 회원가입 화면에서 사용할 수 있는 기본 인증 레이아웃입니다.
        </p>
      </div>
    </AuthLayout>
  );
};

export default AuthLayoutPreviewPage;
