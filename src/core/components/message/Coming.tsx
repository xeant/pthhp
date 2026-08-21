"use client";

const Coming = () => {
  return (
    <div className="bg-dots relative w-full">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transpanrent to-white/90"></div> */}
      <div className="">
        {/* <div className="absolute inset-0 bg-gray-950/10"></div> */}
        <div className="relative mx-auto h-[calc(100vh-236px)] max-w-screen-xl px-3 md:h-[calc(100vh-162px)]">
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-2xl text-gray-900">Coming Soon</div>
          </div>
        </div>
      </div>
      {/* <Image
        src="/assets/images/bg11.jpg"
        alt="Main Visual Image"
        width="1265"
        height="468"
        loading="lazy"
        className="rounded-2xl"
      /> */}
    </div>
  );
};
export default Coming;
