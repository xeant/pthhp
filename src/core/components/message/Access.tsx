import Link from 'next/link'
const Access = props => {
  return (
    <>
      <div className="text-white max-w-screen-2xl mx-auto px-3 py-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="relative flex p-5 mb-10">
                <div className="absolute -top-1 -left-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={0.5}
                    stroke="currentColor"
                    className="w-28 h-28"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="0.5"
                  stroke="currentColor"
                  className="w-16 h-16"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-thin">접근 권한이 없습니다.</h1>
            <div className="text-dark-300 text-lg">
              관리자에게 문의 하십시오.
            </div>
            <div className="flex justify-center pt-10">
              <Link
                href="/public"
                className="text-white bg-blue-600 hover:bg-blue-500 px-20 rounded-sm py-3"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Access
