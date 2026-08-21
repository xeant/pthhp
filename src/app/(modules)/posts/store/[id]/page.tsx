"use client";

import Image from "next/image";


const Page = () => {

  return (
    <>

      <div className="relative dark:shadow-dark-950 block bg-[url('/assets/images/bg39.jpg')] bg-cover bg-center block-line-b">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/60 to-gray-950/90 dark:from-dark-950 dark:via-dark-950/50 dark:to-dark-950"></div>
        <div className="relative mx-auto max-w-screen-lg px-3 pt-20 pb-10 md:pb-20">
          <div
            className="text-3xl md:text-5xl font-light text-white py-4 text-center pt-20"
            style={{ lineHeight: "140%" }}
          >
            To implement authentication in Next.js, familiarize yourself with
            three foundational concepts.
          </div>
          <div className="h-[230px]"></div>
          <div className="grid grid-cols-12 gap-8 pb-0 md:pb-10">
            <div className="col-span-12 md:col-span-3">
              <div className="flex gap-2">
                <div className="text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.25}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6Z"
                    />
                  </svg>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="text-gray-300 text-sm">React.js</div>
                  <div className="text-gray-300 text-sm">Next.js</div>
                  <div className="text-gray-300 text-sm">Prisma</div>
                  <div className="text-gray-300 text-sm">FrontEnd</div>
                  <div className="text-gray-300 text-sm">Redux</div>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-9">
              <div className="text-gray-300 font-medium text-lg md:text-2xl line-clamp-2 mb-6">
                Authentication verifies a users identity. This happens when a
                user logs in, either with a username and password or through a
                service like Google. Its all about confirming that users are
                really who they claim to be, protecting both the users data
                and the application from unauthorized access or fraudulent
                activities.
              </div>
              <div className="text-gray-400 font-medium text-sm md:text-base line-clamp-3">
                In this section, well explore the process of adding basic
                email-password authentication to a web application. While this
                method provides a fundamental level of security, its worth
                considering more advanced options like OAuth or passwordless
                logins for enhanced protection against @ security
                threats. The authentication flow well discuss is as follows:
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky top-0 bg-white/75 dark:bg-dark-950/75 backdrop-blur-lg z-10 pt-1 block-line-b">
        <div className="mx-auto  max-w-screen-lg px-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary-700 text-white text-xs px-4 py-1 rounded-full">
              기술공유
            </div>
            <div className="text-base md:text-lg font-light text-gray-950 dark:text-white py-4">
              <div className=" line-clamp-1">
                To implement authentication in Next.js, familiarize yourself
                with three foundational concepts
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div className="grid grid-cols-12 max-w-screen-lg mx-auto">
          <div className="col-span-12 md:col-span-2">
            <div className="hidden md:flex sticky top-[64px] py-4">
              <button className="flex items-center gap-4">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>

                </div>
                <div className="text-sm text-gray-400 hover:text-gray-950 hover:underline cursor-pointer">
                  View all posts
                </div>
              </button>
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <div className="mx-auto max-w-screen-md">
              <div className="flex items-center justify-between gap-8 pt-5 pb-3 px-3">
                <div className="flex items-center gap-4">
                  <div className="">
                    <div className="dark:bg-dark-800 dark:hover:bg-dark-700 h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-100"></div>
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <div className="line-clamp-1 text-base font-light text-black dark:text-white">
                        관리자
                      </div>
                      <button className="line-clamp-1 text-xs font-light text-secondary-500 hover:secondary-600 dark:text-white">
                        Follow +
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="dark:text-dark-400 text-sm font-light text-gray-500">
                        Next.js
                      </div>
                      <div className="flex gap-1 items-center">
                        <span className="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
                      </div>
                      <div className="flex gap-2">
                        <div className="dark:text-dark-400 text-sm font-light text-gray-500">
                          조회수
                        </div>
                        <div className="dark:text-dark-400 text-sm font-light text-gray-500">
                          1223
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        <span className="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
                      </div>
                      <div className="dark:text-dark-400 text-sm font-light text-gray-500">
                        2주전에 게시됨
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-between border-t border-b border-gray-100 dark:border-dark-800 py-2">
                <div className="flex gap-4 px-3">
                  <div className="flex gap-1 items-center">
                    <div className=" dark:text-dark-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                        />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-dark-500">
                      12
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex items-center">
                      <span className="w-5 h-5 bg-gray-500 dark:bg-dark-400 rounded-full inline"></span>
                      <span className="w-5 h-5 bg-gray-400 dark:bg-dark-500 rounded-full inline -ml-2"></span>
                      <span className="w-5 h-5 bg-gray-300 dark:bg-dark-600 rounded-full inline -ml-2"></span>
                      <span className="w-5 h-5 bg-gray-200 dark:bg-dark-700 rounded-full inline -ml-2"></span>
                      <span className="w-5 h-5 bg-gray-100 dark:bg-dark-800 rounded-full inline -ml-2"></span>
                      <span className="-ml-2 text-gray-500 hover:text-primary-600 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </span>
                    </div>
                    <div className="dark:text-dark-400 text-sm font-light text-gray-500">
                      6명의 사람들이 이 토론에 참여하였습니다.
                    </div>
                  </div>
                  <div className="hidden gap-1 items-center">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500">1232</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300/75 bg-white dark:bg-dark-800 dark:text-dark-500 dark:border-dark-600">
                      <div className="">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300/75 bg-white dark:bg-dark-800 dark:text-dark-500 dark:border-dark-600">
                      <div className="">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-3 pt-6 lg:pt-10">
              <div className="flex flex-wrap gap-8">
                <div className="lg:order-0 order-1 mx-auto max-w-screen-md">
                  <div className="">
                    <div className="pb-10">
                      <div className="mb-8 text-xl text-black dark:text-white">
                        Metadata
                      </div>
                      <div className="dark:text-dark-300 mb-5 text-base font-light text-gray-700">
                        Metadata helps search engines understand your content
                        better (which can result in better SEO), and allows
                        you to customize how your content is presented on
                        social media, helping you create a more engaging and
                        consistent user experience across various platforms.
                        The Metadata API in Next.js allows you to modify the
                        element of a page. You can configure metadata in two
                        ways: onfig-based Metadata: Export a static metadata
                        object or a dynamic generateMetadata function in a
                        layout.js or page.js file. File-based Metadata: Add
                        static or dynamically generated special files to route
                        segments. Additionally, you can create dynamic Open
                        Graph Images using JSX and CSS with imageResponse
                        constructor.
                      </div>
                      <div className="dark:text-dark-300 mb-5 text-base font-light text-gray-700">
                        Next.js /public folder can be used to serve static
                        assets like images, fonts, and other files. Files
                        inside /public can also be cached by CDN providers so
                        that they are delivered efficiently.
                      </div>
                    </div>
                    <div className="dark:bg-dark-600 relative mb-8 overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        alt="content images"
                        src="/assets/images/bg39.jpg"
                        width="768"
                        height="368"
                        loading="lazy"
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="py-10">
                      <div className="mb-8 text-xl text-black dark:text-white">
                        Production Builds
                      </div>
                      <div className="dark:text-dark-300 mb-5 text-base font-light text-gray-700">
                        Running next build generates an optimized version of
                        your application for production. HTML, CSS, and
                        JavaScript files are created based on your pages.
                        JavaScript is compiled and browser bundles are
                        minified using the Next.js Compiler to help achieve
                        the best performance and support all modern browsers.
                        Next.js produces a standard deployment output used by
                        managed and self-hosted Next.js. This ensures all
                        features are supported across both methods of
                        deployment. In the next major version, we will be
                        transforming this output into our Build Output API
                        specification.
                      </div>
                      <div className="dark:text-dark-300 mb-5 text-base font-light text-gray-700">
                        Vercel, the creators and maintainers of Next.js,
                        provide managed infrastructure and a developer
                        experience platform for your Next.js applications.
                        Deploying to Vercel is zero-configuration and provides
                        additional enhancements for scalability, availability,
                        and performance globally. However, all Next.js
                        features are still supported when self-hosted. Learn
                        more about Next.js on Vercel or deploy a template for
                        free to try it out.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-screen-md px-3 pt-10 relative">
              <div className="mb-5 text-lg text-black dark:text-white block-line-t">
                Comments (6)
              </div>
              <div className="dark:bg-dark-900 dark:shadow-dark-950 dark:border-dark-700/90 dark:border-t-dark-600/60 relative w-full overflow-hidden rounded-xl border border-gray-200/75 bg-gray-100 p-5 shadow-lg shadow-gray-100/90 backdrop-blur-xl h-full">
                <div className="">
                  <textarea
                    className="w-full hover:border outline-none text-sm text-gray-900 dark:text-white rounded-xl p-5 dark:bg-dark-950 dark:border-dark-950 dark:hover:border-primary-600"
                    rows={4}
                    placeholder="Generate a project kickoff presentation for /meeting"
                  ></textarea>
                </div>
                <div className="flex justify-between gap-4 pt-2 px-3">
                  <div className="flex gap-8">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.25}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.25}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pb-20">
                <div className="dark:border-dark-800 border-b border-gray-200 py-10">
                  <div className="flex gap-4">
                    <div className="dark:bg-dark-700 h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-4">
                        <div className="dark:text-dark-100 text-base font-semibold text-gray-700">
                          Coreamericano
                        </div>
                        <div className="dark:text-dark-500 text-xs text-gray-400">
                          1일전
                        </div>
                      </div>
                      <div className="dark:text-dark-400 text-sm font-light text-gray-500">
                        involves capturing the rendered output of a component
                        and saving it to a snapshot file. When tests run, the
                        current rendered output of the component is compared
                        against the saved snapshot. Changes in the snapshot
                        are used to indicate unexpected changes in behavior.
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs">
                            <div className="text-rose-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-5 w-5"
                              >
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                              </svg>
                            </div>
                            <div className="dark:text-dark-500 text-gray-400">
                              56 Likes
                            </div>
                          </div>

                          <div className="dark:text-dark-500 text-xs text-gray-400">
                            Reply
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="dark:text-dark-500 text-xs text-gray-400">
                            Modify
                          </div>
                          <div className="dark:text-dark-500 text-xs text-gray-400">
                            Delete
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-4 pl-12 pt-10">
                      <div className="dark:bg-dark-700 h-8 w-8 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-4">
                          <div className="dark:text-dark-100 text-base font-semibold text-gray-700">
                            Coreamericano
                          </div>
                          <div className="dark:text-dark-500 text-xs text-gray-400">
                            1일전
                          </div>
                        </div>
                        <div className=" dark:text-dark-400 text-sm font-light text-gray-500">
                          Since async Server Components are new to the React
                          ecosystem, some tools do not fully support them. In
                          the meantime, we recommend using End-to-End Testing
                          over Unit Testing for async components.
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <div className="dark:text-dark-500 flex items-center gap-1 text-xs text-gray-400">
                            <div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1}
                                stroke="currentColor"
                                className="h-5 w-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                />
                              </svg>
                            </div>
                            <div>56 Likes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 pl-12 pt-10">
                      <div className="dark:bg-dark-700 h-8 w-8 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-4">
                          <div className="dark:text-dark-100 text-base font-semibold text-gray-700">
                            Coreamericano
                          </div>
                          <div className="dark:text-dark-500 text-xs text-gray-400">
                            1일전
                          </div>
                        </div>
                        <div className=" dark:text-dark-400 text-sm font-light text-gray-500">
                          Since async Server Components are new to the React
                          ecosystem, some tools do not fully support them. In
                          the meantime, we recommend using End-to-End Testing
                          over Unit Testing for async components.
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <div className="dark:text-dark-500 flex items-center gap-1 text-xs text-gray-400">
                            <div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1}
                                stroke="currentColor"
                                className="h-5 w-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                />
                              </svg>
                            </div>
                            <div>56 Likes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-10">
                  <div className="flex gap-4">
                    <div className="dark:bg-dark-700 h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-4">
                        <div className="dark:text-dark-100 text-base font-semibold text-gray-700">
                          Coreamericano
                        </div>
                        <div className="dark:text-dark-500 text-xs text-gray-400">
                          1일전
                        </div>
                      </div>
                      <div className=" dark:text-dark-400 text-sm font-light text-gray-500">
                        involves capturing the rendered output of a component
                        and saving it to a snapshot file. When tests run, the
                        current rendered output of the component is compared
                        against the saved snapshot. Changes in the snapshot
                        are used to indicate unexpected changes in behavior.
                      </div>
                      <div className="flex items-center gap-4 pt-6">
                        <div className="dark:text-dark-500 flex items-center gap-1 text-xs text-gray-400">
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1}
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                              />
                            </svg>
                          </div>
                          <div>56 Likes</div>
                        </div>
                        <div className="text-dark-500 text-xs">Reply</div>
                      </div>
                    </div>
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

export default Page;
