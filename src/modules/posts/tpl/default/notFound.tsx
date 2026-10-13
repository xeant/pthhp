"use client";

import Image from "next/image";

const PostNotFound = () => {
  return (
    <>
      <div className={`flex justify-center gap-8 py-20`}>
        <div>
          <div className={`mb-12`}>
            <Image
              src={`/assets/images/robot/sosbot_9.png`}
              className={``}
              alt={`robot`}
              width="300"
              height="300"
            />
          </div>
          <div
            className={`bg-gray-200/75 max-w-screen-sm mx-auto rounded-xl py-4 px-8`}
          >
            <div className={`text-base text-gray-600 text-center`}>
              게시판을 찾을 수 없습니다.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostNotFound;
