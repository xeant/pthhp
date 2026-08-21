import { getDocumentDeleteInfoAction } from "@/modules/document/actions/document.action";
import DocumentDelete from "@/modules/posts/tpl/default/delete";
import { redirect } from "next/navigation";

const Page = async ({  params: rawParams  }: { params: Promise<{ mid: string; slug?: string }> }) => {
  const { mid, slug } = await rawParams;

  const result = await getDocumentDeleteInfoAction(slug);

  if (!result.success && !result.data && result.message === "존재하지 않는 글입니다.") {
    redirect(`/posts/${mid}`);
  }

  if (!result.success || !result.data) throw new Error(result.message);

  return(
    <>
      <div className="py-20">
        <DocumentDelete document={result.data} mid={mid} />
      </div>
    </>
  )
}

export default Page
