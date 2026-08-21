"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { Download, FileText, GripVertical, ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";

type UploadedImage = {
  id: string;
  name: string;
  src: string;
};

const MAX_IMAGES = 6;
const EXPORT_WIDTH = 1241;
const PAGE_PADDING = 40;
const PHOTO_HEIGHT = 460;
const CAPTION_HEIGHT = 40;
const CELL_HEIGHT = PHOTO_HEIGHT + CAPTION_HEIGHT;

const readImage = (file: File) => new Promise<UploadedImage>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, src: String(reader.result) });
  reader.onerror = () => reject(new Error(`${file.name} 파일을 읽지 못했습니다.`));
  reader.readAsDataURL(file);
});

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
  image.src = src;
});

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error("이미지 파일을 만들지 못했습니다."));
  }, type, quality);
});

const triggerDownload = (blob: Blob, fileName: string) => {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
};

const drawCoverImage = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  context.restore();
};

export default function ImageMergeTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("작업사진");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .sort((left, right) => left.name.localeCompare(right.name, "ko", { numeric: true, sensitivity: "base" }));
    const available = MAX_IMAGES - images.length;

    if (available <= 0) {
      setMessage(`이미지는 최대 ${MAX_IMAGES}장까지 넣을 수 있습니다.`);
      return;
    }

    const selected = validFiles.slice(0, available);
    if (!selected.length) {
      setMessage("이미지 파일만 추가할 수 있습니다.");
      return;
    }

    try {
      const nextImages = await Promise.all(selected.map(readImage));
      setImages((current) => [...current, ...nextImages]);
      setMessage(validFiles.length > available ? `${available}장만 추가했습니다. 최대 ${MAX_IMAGES}장까지 가능합니다.` : `${nextImages.length}장을 추가했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사진을 추가하지 못했습니다.");
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void addFiles(event.dataTransfer.files);
  };

  const removeImage = (id: string) => setImages((current) => current.filter((image) => image.id !== id));

  const reorder = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    setImages((current) => {
      const sourceIndex = current.findIndex((image) => image.id === draggedId);
      const targetIndex = current.findIndex((image) => image.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
  };

  const safeFileName = () => title.trim().replace(/[\\/:*?"<>|]/g, "") || "work-log";

  const createExportCanvas = async () => {
    if (!images.length) throw new Error("먼저 작업 사진을 한 장 이상 추가해 주세요.");

    const [photoImages, logo] = await Promise.all([
      Promise.all(images.map((image) => loadImage(image.src))),
      loadImage("/assets/images/work-log-logo.png").catch(() => null),
    ]);
    const rowCount = Math.ceil(photoImages.length / 2);
    const cellWidth = (EXPORT_WIDTH - PAGE_PADDING * 2) / 2;
    const gridTop = 130;
    const footerTop = gridTop + rowCount * CELL_HEIGHT + 20;
    const logoScale = logo ? Math.min(200 / logo.naturalWidth, 56 / logo.naturalHeight, 1) : 0;
    const logoWidth = logo ? logo.naturalWidth * logoScale : 0;
    const logoHeight = logo ? logo.naturalHeight * logoScale : 0;
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_WIDTH;
    canvas.height = Math.ceil(footerTop + logoHeight + (logo ? 20 : 0) + PAGE_PADDING);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("브라우저가 이미지 합성을 지원하지 않습니다.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111827";
    context.font = "bold 40px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(title.trim() || "작업사진", canvas.width / 2, 75);

    photoImages.forEach((image, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = PAGE_PADDING + column * cellWidth;
      const y = gridTop + row * CELL_HEIGHT;

      drawCoverImage(context, image, x, y, cellWidth, PHOTO_HEIGHT);
      context.strokeStyle = "#111827";
      context.lineWidth = 2;
      context.strokeRect(x, y, cellWidth, CELL_HEIGHT);
      context.fillStyle = "#f9fafb";
      context.fillRect(x, y + PHOTO_HEIGHT, cellWidth, CAPTION_HEIGHT);
      context.fillStyle = "#111827";
      context.font = "bold 18px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(`사진 ${index + 1}`, x + cellWidth / 2, y + PHOTO_HEIGHT + CAPTION_HEIGHT / 2);
    });

    if (logo) {
      context.drawImage(logo, canvas.width - PAGE_PADDING - logoWidth, footerTop, logoWidth, logoHeight);
    }

    return canvas;
  };

  const downloadJpg = async () => {
    setIsExporting(true);
    try {
      const canvas = await createExportCanvas();
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      triggerDownload(blob, `${safeFileName()}.jpg`);
      setMessage("JPG 파일을 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "JPG 파일을 저장하지 못했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPdf = async () => {
    setIsExporting(true);
    try {
      const canvas = await createExportCanvas();
      const imageData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      for (let offset = 0; offset < imageHeight; offset += pageHeight) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, -offset, pageWidth, imageHeight, undefined, "FAST");
      }

      pdf.save(`${safeFileName()}.pdf`);
      setMessage("PDF 파일을 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDF 파일을 저장하지 못했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-screen-xl px-4 py-10 sm:px-6">
      <div className="border-b border-gray-200 pb-7 dark:border-dark-700">
        <p className="text-sm font-semibold text-primary-600">IMAGE MERGE</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">작업사진 병합</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-dark-300">사진을 드래그하여 순서를 바꾸고, 작업일지 형식의 JPG 또는 PDF로 저장합니다.</p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid gap-5 sm:grid-cols-[16rem_minmax(0,1fr)]">
          <label className="grid gap-2 text-sm font-semibold text-gray-800 dark:text-dark-100">
            제목
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 border border-gray-300 bg-white px-3 text-base font-normal text-gray-950 outline-none focus:border-gray-950 dark:border-dark-600 dark:bg-dark-950 dark:text-white dark:focus:border-white" placeholder="예: 01월 02일 작업사진" />
          </label>
          <div className="grid gap-2 text-sm font-semibold text-gray-800 dark:text-dark-100">
            <span>사진 추가</span>
            <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="flex h-28 items-center justify-center gap-2 border border-dashed border-gray-400 bg-gray-50 px-4 text-sm font-normal text-gray-600 hover:border-gray-950 hover:bg-gray-100 dark:border-dark-600 dark:bg-dark-900 dark:text-dark-300 dark:hover:border-white dark:hover:bg-dark-800">
              <Upload className="h-5 w-5" /> 클릭하거나 사진을 놓으세요. 최대 {MAX_IMAGES}장
            </button>
            <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
          </div>
        </div>
        <div className="flex gap-2 lg:items-end">
          <button type="button" onClick={() => { setImages([]); setMessage("사진을 모두 초기화했습니다."); }} className="inline-flex h-11 items-center justify-center gap-2 border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:border-dark-600 dark:text-dark-100 dark:hover:bg-dark-800"><RotateCcw className="h-4 w-4" /> 초기화</button>
          <button type="button" onClick={downloadJpg} disabled={isExporting} className="inline-flex h-11 items-center justify-center gap-2 bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-gray-950"><Download className="h-4 w-4" /> JPG 저장</button>
          <button type="button" onClick={downloadPdf} disabled={isExporting} className="inline-flex h-11 items-center justify-center gap-2 border border-gray-300 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60 dark:border-dark-600 dark:text-dark-100 dark:hover:bg-dark-800"><FileText className="h-4 w-4" /> PDF 저장</button>
        </div>
      </div>

      <div className="mt-5 border border-gray-200 bg-gray-50 p-3 dark:border-dark-700 dark:bg-dark-900">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-dark-100"><ImagePlus className="h-4 w-4" /> 사진 순서</div>
        {images.length ? (
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div key={image.id} draggable onDragStart={() => setDraggedId(image.id)} onDragEnd={() => setDraggedId(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(image.id)} className={`relative h-24 w-24 border bg-white ${draggedId === image.id ? "opacity-50" : ""}`}>
                <img src={image.src} alt={`${index + 1}번 사진`} className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 flex w-full items-center justify-between bg-black/70 px-1.5 py-1 text-xs text-white"><span>{index + 1}</span><GripVertical className="h-3.5 w-3.5" /></div>
                <button type="button" onClick={() => removeImage(image.id)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gray-950 text-white hover:bg-red-700" aria-label={`${index + 1}번 사진 삭제`}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        ) : <p className="py-7 text-sm text-gray-500 dark:text-dark-300">사진을 추가하면 여기서 순서를 바꿀 수 있습니다.</p>}
      </div>
      <p className="mt-3 min-h-6 text-sm text-gray-500 dark:text-dark-300" role="status">{message}</p>

      <div className="mt-7 overflow-x-auto border border-gray-200 bg-gray-100 p-4 dark:border-dark-700 dark:bg-dark-950">
        <div className="mx-auto w-[1241px] bg-white px-10 pb-5 pt-10 text-gray-950">
          <h2 className="mb-10 text-center text-4xl font-bold">{title || "작업사진"}</h2>
          <div className="grid grid-cols-2 gap-0">
            {images.map((image, index) => <div key={image.id} className="border-2 border-gray-950"><img src={image.src} alt={`${index + 1}번 작업사진`} className="h-[460px] w-full object-cover" /><div className="flex h-10 items-center justify-center bg-gray-50 text-lg font-bold">사진 {index + 1}</div></div>)}
            {images.length % 2 === 1 && <div />}
          </div>
          <div className="mt-5 flex justify-end"><img src="/assets/images/work-log-logo.png" alt="로고" className="max-h-14 max-w-52 object-contain" /></div>
        </div>
      </div>
    </section>
  );
}
