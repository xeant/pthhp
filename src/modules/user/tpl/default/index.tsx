"use client";


import HeaderUser from "@/modules/user/tpl/default/header";

const IndexUser = (props: any) => {


  return (
    <>
      <HeaderUser />
      <div className="flex flex-wrap gap-8 px-3 pt-10 pb-20 ">
        <div className="w-full">
          <div className="max-w-screen-md mx-auto">
            <div className="w-full">
              <div
                className="relative w-full overflow-hidden rounded-xl border border-gray-200/75 bg-gray-100 dark:bg-dark-900/75 dark:border-dark-700/75 p-5 shadow-lg dark:shadow-black/75 shadow-gray-100/90 backdrop-blur-xl lg:p-10 h-full mb-6">
                <div className="mb-8 font-semibold text-lg dark:text-white">
                  사용중인 서비스
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-1">
                    <div
                      className="rounded-2xl p-5 bg-white shadow-sm hover:shadow-md shadow-gray-900/20 dark:bg-dark-700 dark:shadow-dark-950/70">
                      <div className="text-black mb-8 font-bold dark:text-white">
                        문자 & 카카오톡
                      </div>
                      <div className="text-black text-sm dark:text-dark-200">
                        전일 대비 사용량 (84회)
                      </div>
                      <div className="flex items-center gap-8 pt-2 pb-4">
                        <div className="relative flex-1">
                          <div className="rounded-full h-2 w-full bg-blue-200/40"></div>
                          <div
                            className="absolute left-0 top-0 rounded-full h-2 hover:-top-1 hover:h-4 w-full bg-blue-400 transition-all"
                            style={{width: "80%"}}
                          ></div>
                        </div>
                        <div className="text-black text-xs dark:text-white">
                          80%
                        </div>
                      </div>
                      <div className="text-black text-sm dark:text-dark-200">
                        남은 잔액
                      </div>
                      <div className="flex gap-2 justify-center items-end py-5">
                        <div className="text-blue-400 text-3xl font-bold">
                          18,320
                        </div>
                        <div className="text-black/70 dark:text-white/70">
                          원
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div
                      className="rounded-2xl p-5 bg-white shadow-sm hover:shadow-md shadow-gray-900/20 dark:bg-dark-700 dark:shadow-dark-950/70">
                      <div className="text-black mb-8 font-bold dark:text-white">
                        홈페이지 수정
                      </div>
                      <div className="text-black text-sm dark:text-dark-200">
                        전일 대비 사용량 (84회)
                      </div>
                      <div className="flex items-center gap-8 pt-2 pb-4">
                        <div className="relative flex-1">
                          <div className="rounded-full h-2 w-full bg-lime-200/40"></div>
                          <div
                            className="absolute left-0 top-0 rounded-full h-2 hover:-top-1 hover:h-4 w-full bg-lime-400 transition-all"
                            style={{width: "80%"}}
                          ></div>
                        </div>
                        <div className="text-black text-xs dark:text-white">
                          80%
                        </div>
                      </div>
                      <div className="text-black text-sm dark:text-dark-200">
                        남은 잔액
                      </div>
                      <div className="flex gap-2 justify-center items-end py-5">
                        <div className="text-lime-300 text-3xl font-bold">
                          18,320
                        </div>
                        <div className="text-black/70 dark:text-white/70">
                          원
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div
                      className="rounded-2xl p-5 bg-white shadow-sm hover:shadow-md shadow-gray-900/20 dark:bg-dark-700 dark:shadow-dark-950/70">
                      <div className="text-black mb-8 font-bold dark:text-white">
                        Store 구매
                      </div>
                      <div className="text-black text-sm dark:text-dark-200">
                        전일 대비 사용량 (84회)
                      </div>
                      <div className="flex items-center gap-8 pt-2 pb-4">
                        <div className="relative flex-1">
                          <div className="rounded-full h-2 w-full bg-rose-200/40"></div>
                          <div
                            className="absolute left-0 top-0 rounded-full h-2 hover:-top-1 hover:h-4 w-full bg-rose-400 transition-all"
                            style={{width: "80%"}}
                          ></div>
                        </div>
                        <div className="text-black text-xs dark:text-white">
                          80%
                        </div>
                      </div>
                      <div className="text-black text-sm dark:text-dark-200">
                        남은 잔액
                      </div>
                      <div className="flex gap-2 justify-center items-end py-5">
                        <div className="text-rose-200 text-3xl font-bold">
                          18,320
                        </div>
                        <div className="text-black/70 dark:text-white/70">
                          원
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-7">
              <div className="rounded-2xl p-8">
                <div className="font-semibold text-lg dark:text-white">
                  일일 사용량
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-1 rounded-2xl p-8 bg-purple-100 dark:bg-purple-300 mb-6">
                  <div className="mb-8 font-semibold text-lg">활동 기록</div>
                </div>
                <div className="col-span-1 rounded-2xl p-8 bg-sky-100 dark:bg-sky-300 mb-6">
                  <div className="mb-8 font-semibold text-lg">1:1문의</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndexUser;
