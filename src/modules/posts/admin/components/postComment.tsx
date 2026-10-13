import React from "react";

const PostComment = () => {
  return (
    <>
      <div className="px-3">
        <div className="grid grid-cols-4 gap-8 py-10">
          <div className="col-span-1">
            <div className="mb-3 text-lg font-semibold text-gray-600 dark:text-dark-100">
              댓글설정
            </div>
            <div className="text-sm text-gray-400">
              댓글 관련 설정을 합니다.
            </div>
          </div>
          <div className="col-span-3">
            <div className="grid grid-col-span-2">
              <div className="col-span-2 grid grid-cols-3 gap-6 p-5 hover:bg-gray-50 dark:hover:bg-dark-900">
                <div className="col-span-3 sm:col-span-2">
                  <label>
                    <div className="mb-3 text-sm text-black dark:text-dark-100">댓글 사용</div>
                  </label>
                  <label htmlFor="commentState" className="m-0">
                    <input
                      type="checkbox"
                      name="commentState"
                      id="commentState"
                      className="peer hidden"
                    />

                    <div className="relative block h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-transform after:content-[''] peer-checked:bg-gray-900 peer-checked:after:translate-x-5 dark:bg-dark-700 dark:after:bg-dark-300 dark:after:shadow-black/40 dark:peer-checked:bg-dark-100"></div>
                  </label>

                  <div className="pt-2 text-sm font-light text-gray-400 dark:text-dark-400">
                    댓글을 사용할지 여부를 결정합니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostComment;
