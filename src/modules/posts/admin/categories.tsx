"use client";

import React, { useState, useEffect, useTransition } from "react";
import { TreeItem } from "@/modules/posts/actions/_type";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@components/button/Button";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getCategoriesAdminAction,
  addCategoryAdminAction,
  renameCategoryAdminAction,
  removeCategoryAdminAction,
  saveCategoryTreeAdminAction,
} from "@/modules/posts/actions/category.action";

// --- Icons ---
const IconGrip = () => (
  <svg
    className="w-4 h-4 text-gray-900"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
    />
  </svg>
);
const IconEdit = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
    />
  </svg>
);
const IconPlus = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);
const IconTrash = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const IconChevron = ({ isOpen }: { isOpen: boolean }) => (
  <motion.svg
    animate={{ rotate: isOpen ? 90 : 0 }}
    className="w-3.5 h-3.5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </motion.svg>
);

const SortableTreeItem: React.FC<{
  item: TreeItem;
  level: number;
  onCollapse: (id: string) => void;
  hasChildren: boolean;
  isCollapsed: boolean;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onAdd: (parentId: string | null) => void;
  onDelete: (id: string) => void;
}> = ({
  item,
  level,
  onCollapse,
  hasChildren,
  isCollapsed,
  editingId,
  onStartEdit,
  onRename,
  onAdd,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-2">
      {/* 🧵 [Visual Guide Line] 대댓글일 때 수직 연결선 */}
      {level > 0 && (
        <div
          className="absolute border-l-2 border-gray-100 dark:border-gray-800"
          style={{
            left: level * 28 - 18,
            top: -8,
            bottom: 12,
            height: "calc(100% + 8px)",
          }}
        />
      )}

      <div
        className={`flex items-center gap-3 p-3 bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 rounded-xl transition-all duration-300 ${
          isDragging
            ? "shadow-2xl ring-2 ring-blue-500/20 opacity-50"
            : "shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
        }`}
        style={{ marginLeft: level * 28 }}
      >
        {/* 드래그 핸들 */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <IconGrip />
        </div>

        {/* 접기 버튼 */}
        <div className="w-5 flex justify-center">
          {hasChildren && (
            <button
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCollapse(item.id);
              }}
            >
              <IconChevron isOpen={!isCollapsed} />
            </button>
          )}
        </div>

        {/* 타이틀 영역 */}
        <div className="flex-1 min-w-0">
          {editingId === item.id ? (
            <input
              autoFocus
              defaultValue={item.title}
              className="w-full text-[14px] font-bold px-2 py-1 bg-gray-50 dark:bg-dark-800 border-b-2 border-blue-500 outline-none transition-all"
              onBlur={(e) => onRename(item.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  onRename(item.id, (e.target as HTMLInputElement).value);
              }}
            />
          ) : (
            <div
              className="text-[14px] font-bold text-gray-700 dark:text-gray-200 truncate py-1 cursor-text"
              onDoubleClick={() => onStartEdit(item.id)}
            >
              {item.title}
            </div>
          )}
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            onClick={() => onAdd(item.id)}
            className="!p-1.5 !bg-transparent hover:!bg-green-50 !text-green-500 !border-none"
            icon={<IconPlus />}
          />
          <Button
            onClick={() => onStartEdit(item.id)}
            className="!p-1.5 !bg-transparent hover:!bg-blue-50 !text-blue-500 !border-none"
            icon={<IconEdit />}
          />
          <Button
            onClick={() => onDelete(item.id)}
            className="!p-1.5 !bg-transparent hover:!bg-red-50 !text-red-500 !border-none"
            icon={<IconTrash />}
          />
        </div>
      </div>
    </div>
  );
};

const SortableTree: React.FC<{ moduleId: number; collapsible?: boolean }> = ({
  moduleId,
  collapsible,
}) => {
  const [items, setItems] = useState<TreeItem[]>([]);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition(); // 2. 훅 선언

  // 센서 설정 (마우스, 터치, 키보드)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const loadCategories = async () => {
    // 🌟 moduleId가 정상이 아닐 때는 아예 호출하지 않음
    if (!moduleId || isNaN(moduleId)) return;

    const res = await getCategoriesAdminAction(moduleId, "posts");

    // 🌟 success가 true면 데이터가 [] 이더라도 setItems를 실행!
    if (res.success) {
      setItems(res.data || []);
    } else {
      // 🌟 진짜 DB 오류나 서버 에러일 때만 alert
      alert(res.message || "카테고리를 불러오는데 실패했습니다.");
    }
  };

  useEffect(() => {
    loadCategories();
  }, [moduleId]); // moduleId가 바뀔 때마다 실행

  const handleCollapse = (id: string) => {
    if (!collapsible) return;
    setCollapsedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    // 1. 변경될 새로운 아이템 리스트를 먼저 계산합니다. (순수 로직)
    const activeItem = items.find((i) => i.id === active.id)!;
    const overItem = items.find((i) => i.id === over.id)!;

    let newParentId: string | null = null;
    const overHasChildren = items.some((i) => i.parentId === overItem.id);

    if (overItem.parentId === null) {
      newParentId =
        !overHasChildren && overItem.id !== activeItem.id ? overItem.id : null;
    } else {
      newParentId = overItem.parentId;
    }

    let newItems = items.map((i) =>
      i.id === activeItem.id ? { ...i, parentId: newParentId } : i,
    );

    const siblings = newItems.filter((i) => i.parentId === newParentId);
    const oldIndex = siblings.findIndex((i) => i.id === active.id);
    const newIndex = siblings.findIndex((i) => i.id === over.id);
    const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);

    let idx = 0;
    newItems = newItems.map((i) => {
      if (i.parentId === newParentId) {
        const updated = { ...reorderedSiblings[idx], order: idx };
        idx++;
        return updated;
      }
      return i;
    });

    // 2. 상태를 먼저 업데이트하여 UI를 즉시 반영합니다.
    setItems(newItems);

    // 3. 🌟 서버 액션은 상태 업데이트 "밖에서" 호출합니다.
    // startTransition을 사용하면 렌더링 우선순위를 조절하여 Router 충돌을 방지할 수 있습니다.
    startTransition(async () => {
      await saveCategoryTreeAdminAction(newItems, "posts");
    });
  };

  const handleRename = async (id: string, newTitle: string) => {
    const res = await renameCategoryAdminAction(id, newTitle);

    if (res.success && res.data) {
      // 🌟 서버에서 온 데이터를 프론트엔드 규격(String ID)에 맞게 가공합니다.
      const updatedItem: TreeItem = {
        ...res.data,
        id: res.data.id.toString(),
        parentId: res.data.parentId?.toString() ?? null,
      };

      setItems(
        (prev) => prev.map((i) => (i.id === id ? updatedItem : i)), // 가공된 데이터를 넣습니다.
      );
      setEditingId(null);
    } else {
      alert(res.message || "이름 변경에 실패했습니다.");
    }
  };

  const handleAdd = async (parentId: string | null) => {
    const siblings = items.filter((i) => i.parentId === parentId);

    const res = await addCategoryAdminAction(
      "새 항목",
      parentId,
      moduleId,
      "posts",
    );

    if (res.success && res.data) {
      // 🌟 서버에서 온 데이터를 TreeItem 규격에 완벽하게 맞춥니다.
      const actualNewItem: TreeItem = {
        ...res.data,
        id: res.data.id.toString(), // DB ID(숫자) -> DnD용 ID(문자열)
        parentId: res.data.parentId?.toString() ?? null,
        moduleId: res.data.moduleId, // 🌟 추가 (타입 에러 방지)
        moduleType: res.data.moduleType, // 🌟 추가 (타입 에러 방지)
        children: [], // 🌟 새 항목이니 빈 배열 초기화
      };

      // 순서 값 수동 보정 (현재 형제들 맨 뒤로)
      actualNewItem.order = siblings.length;

      // 2. 클라이언트 상태 업데이트 (UI 즉시 반영)
      const updatedItems = [...items, actualNewItem];
      setItems(updatedItems);
      setEditingId(actualNewItem.id);

      // 🌟 부모가 접혀있었다면 펼쳐주는 로직 유지
      if (parentId && collapsedIds.has(parentId)) {
        setCollapsedIds((prev) => {
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      }
    } else {
      alert(res.message || "항목 추가에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 하위 항목도 모두 삭제됩니다.")) return;
    await removeCategoryAdminAction(id);
    setItems((prev) => prev.filter((i) => i.id !== id && i.parentId !== id));
  };

  const renderTree = (parentId: string | null, level = 0) => {
    const childrenNodes = items
      .filter((i) => i.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return (
      <SortableContext
        items={childrenNodes.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="relative flex flex-col">
          {childrenNodes.map((node) => {
            const childNodes = items.filter((i) => i.parentId === node.id);
            const isCollapsed = collapsedIds.has(node.id);

            return (
              <div key={node.id}>
                <div className="relative">
                  <SortableTreeItem
                    item={node}
                    level={level}
                    onCollapse={handleCollapse}
                    hasChildren={childNodes.length > 0}
                    isCollapsed={isCollapsed}
                    editingId={editingId}
                    onStartEdit={(id) => setEditingId(id)}
                    // 🌟 이 부분들이 빠져있을 확률이 높습니다! 🌟
                    onRename={handleRename} // 이름 변경 함수 전달
                    onAdd={handleAdd} // 👈 이게 빠져서 에러가 났던 거예요!
                    onDelete={handleDelete} // 삭제 함수 전달
                  />
                  <AnimatePresence>
                    {!isCollapsed && childNodes.length > 0 && (
                      <motion.div
                        key={`children-${node.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="origin-top"
                      >
                        {renderTree(node.id, level + 1)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </SortableContext>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white dark:bg-dark-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm shadow-gray-200/50 dark:shadow-none overflow-hidden">
        {/* 상단 헤더바 추가 */}
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-dark-900/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              카테고리 구조 설정
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              드래그하여 순서와 계층을 조정하세요.
            </p>
          </div>
          <Button
            onClick={() => handleAdd(null)}
            className="!py-2 !px-4 !bg-blue-600 !text-white !rounded-xl !text-xs !font-bold shadow-lg shadow-blue-500/20"
            icon={<IconPlus />}
          >
            루트 추가
          </Button>
        </div>

        <div className="p-6 min-h-[400px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-dark-800 flex items-center justify-center">
                <IconPlus />
              </div>
              <p className="text-sm font-medium">등록된 카테고리가 없습니다.</p>
            </div>
          ) : (
            renderTree(null)
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-2 border-blue-500 rounded-xl shadow-2xl scale-105 rotate-1 cursor-grabbing">
            <div className="text-blue-500">
              <IconGrip />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {items.find((i) => i.id === activeId)?.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export const Wrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="max-w-2xl mx-auto p-4">{children}</div>;

const DashboardPostCategories = ({ moduleId }) => {
  return (
    <Wrapper>
      <div className="mb-6">
        <p className="text-sm text-gray-500 mt-1">
          드래그하여 순서와 구조를 변경할 수 있습니다.
        </p>
      </div>
      <SortableTree moduleId={moduleId} collapsible />
    </Wrapper>
  );
};

export default DashboardPostCategories;
