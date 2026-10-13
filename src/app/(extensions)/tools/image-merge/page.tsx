import { DefaultLayout } from "@extensions";
import ImageMergeTool from "@extensions/tools/ImageMergeTool";

export const metadata = {
  title: "Image merge",
};

export default function ImageMergeToolPage() {
  return (
    <DefaultLayout>
      <ImageMergeTool />
    </DefaultLayout>
  );
}
