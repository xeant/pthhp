import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname } from "next/navigation";

interface ListProps  {
  document : any
}

function BoardList({ document }: ListProps){
  const [documentList, setDocumentList] = useState<{[key: string]: any}>()
  const params = usePathname();
  // const queries = router.query;

  useEffect(() => {
    document && setDocumentList(document)
  }, [])

  return (
    <>
    
    <div className="">
      
      <table className="w-full">
        <thead>
          <tr className="bg-black bg-opacity-50 backdrop-blur-lg">
            <th scope="col" className="text-xs text-dark-300 uppercase py-2 px-3 w-32">No</th>
            <th scope="col" className="text-xs text-dark-300 uppercase py-2 px-3 w-32">Category</th>
            <th scope="col" className="w-auto text-xs text-dark-300 uppercase py-2 px-3">Title</th>
            <th scope="col" className="text-xs text-dark-300 uppercase py-2 px-3 w-32">Writer</th>
            <th scope="col" className="text-xs text-dark-300 uppercase py-2 px-3 w-32">Regdate</th>
            <th className="py-2 px-3 w-12"><input type="checkbox" className="checked:bg-lime-400"></input></th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-dark-600 bg-black bg-opacity-25 hover:bg-dark-500 hover:bg-opacity-25">
            <td className="text-dark-300 text-xs py-2 px-3 text-center">:: 공지 ::</td>
            <td className="text-dark-300 text-xs py-2 px-3 text-center"></td>
            <td className="text-dark-200 hover:text-white text-sm py-2 px-3">댓글 시 광고 및 비방 관련 공지 입니다.</td>
            <td className="text-dark-300 text-sm py-2 px-3 text-center">지제이웍스</td>
            <td className="text-dark-300 text-xs py-2 px-3 text-center">20.12.17</td>
            <td className="px-3 py-2 text-center"><input type="checkbox" className="checked:bg-lime-400"></input></td>
          </tr>
          <tr className="border-b border-dark-600 bg-black bg-opacity-25 hover:bg-dark-500 hover:bg-opacity-25">
            <td className="text-dark-300 text-xs py-2 px-3 text-center">:: 공지 ::</td>
            <td className="text-dark-300 text-xs py-2 px-3 text-center"></td>
            <td className="text-dark-200 hover:text-white text-sm py-2 px-3">블로그 포스팅 관련 FAQ 입니다.</td>
            <td className="text-dark-300 text-sm py-2 px-3 text-center">지제이웍스</td>
            <td className="text-dark-300 text-xs py-2 px-3 text-center">20.12.17</td>
            <td className="px-3 py-2 text-center"><input type="checkbox" className="checked:bg-lime-400"></input></td>
          </tr>
          { 
          documentList &&
          Object.entries(documentList).map( (item, index) => {
            return (
              <tr key={index} className="border-b border-dark-700 hover:bg-dark-500 hover:bg-opacity-25">
                <td className="text-dark-300 text-xs py-3 px-3 text-center">34333</td>
                <td className="text-dark-300 text-xs py-3 px-3 text-center">Update</td>
                <td className="py-3 px-3">
                  <Link href={`${params}/${item[1].id}`} as={`${params}/${item[1].id}`} className="text-dark-200 hover:text-white text-sm">
                    {item[1].title}
                  </Link>
                  
                </td>
                <td className="text-dark-300 text-sm py-3 px-3 text-center">지제이웍스</td>
                <td className="text-dark-300 text-xs py-3 px-3 text-center">20.12.17</td>
                <td className="px-3 py-3 text-center"><input type="checkbox" className="checked:bg-lime-400"></input></td>
              </tr>
            )
          })}
          
        </tbody>
      </table>
    </div>
    </>
  )
}

export default BoardList
