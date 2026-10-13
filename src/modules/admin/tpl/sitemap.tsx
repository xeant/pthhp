"use client";

import { useMemo, useState, useTransition } from "react";
import type React from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  FolderTree,
  GripVertical,
  Layers3,
  Plus,
  Trash2,
} from "lucide-react";

import Button from "@/core/components/button/Button";
import InputField from "@/core/components/form/InputField";
import Modal from "@/core/components/modal/Modal";
import {
  moveSiteNavigationAdminAction,
  reorderSiteNavigationGroupsAdminAction,
  removeSiteNavigationAdminAction,
  removeSiteNavigationGroupAdminAction,
  saveSiteNavigationAdminAction,
  saveSiteNavigationGroupAdminAction,
} from "@/modules/admin/actions/sitemap.action";
import type {
  SiteNavigationAdminData,
  SiteNavigationGroupItem,
  SiteNavigationItem,
} from "@/modules/admin/actions/_type";

interface SitemapAdminProps {
  initialData?: SiteNavigationAdminData | null;
}

type MenuFormState = {
  id?: number;
  groupKey: string;
  parentId: string;
  name: string;
  title: string;
  href: string;
  target: string;
  icon: string;
  order: number;
  visibility: string;
  isActive: boolean;
};

type GroupFormState = {
  id?: number;
  key: string;
  title: string;
  description: string;
  area: string;
  order: number;
  isActive: boolean;
};

const defaultGroups: SiteNavigationGroupItem[] = [
  {
    id: 0,
    key: "header-main",
    title: "기본 상단 메뉴",
    description: "기본 레이아웃의 상단 네비게이션입니다.",
    area: "header",
    order: 0,
    isActive: true,
  },
];

const defaultMenuFormState = (groupKey = "header-main"): MenuFormState => ({
  groupKey,
  parentId: "",
  name: "",
  title: "",
  href: "",
  target: "",
  icon: "",
  order: 0,
  visibility: "public",
  isActive: true,
});

const defaultGroupFormState: GroupFormState = {
  key: "",
  title: "",
  description: "",
  area: "header",
  order: 0,
  isActive: true,
};

const selectClass = "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-md shadow-gray-100 outline-none transition-all hover:border-gray-300 focus:border-gray-300 focus:ring-4 focus:ring-gray-200/75 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:shadow-black/20 dark:hover:border-dark-600 dark:focus:border-dark-600 dark:focus:ring-dark-800";

const flattenNavigation = (items: SiteNavigationItem[]) => {
  const rows: SiteNavigationItem[] = [];

  const walk = (list: SiteNavigationItem[]) => {
    list.forEach((item) => {
      rows.push(item);
      if (item.children.length > 0) walk(item.children);
    });
  };

  walk(items);

  return rows;
};

const getAreaLabel = (area: string) => {
  const labels: Record<string, string> = {
    header: "Header",
    footer: "Footer",
    side: "Side",
    mobile: "Mobile",
    custom: "Custom",
  };

  return labels[area] || area;
};

const SitemapAdmin = ({ initialData }: SitemapAdminProps) => {
  const [groups, setGroups] = useState(initialData?.groups?.length ? initialData.groups : defaultGroups);
  const [items, setItems] = useState(initialData?.items || []);
  const [selectedGroupKey, setSelectedGroupKey] = useState(groups[0]?.key || "header-main");
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [menuFormState, setMenuFormState] = useState<MenuFormState>(defaultMenuFormState(selectedGroupKey));
  const [groupFormState, setGroupFormState] = useState<GroupFormState>(defaultGroupFormState);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>();
  const [groupFieldErrors, setGroupFieldErrors] = useState<Record<string, string> | undefined>();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const flatItems = useMemo(() => flattenNavigation(items), [items]);
  const selectedGroup = groups.find((group) => group.key === selectedGroupKey) || groups[0];
  const selectedGroupItems = flatItems.filter((item) => item.groupKey === selectedGroupKey);
  const selectedMenu = selectedMenuId ? flatItems.find((item) => item.id === selectedMenuId) : null;
  const activeCount = flatItems.filter((item) => item.isActive).length;
  const isMenuEditing = !!menuFormState.id || !!menuFormState.title || !!menuFormState.name || !!menuFormState.href;

  const syncData = (data?: SiteNavigationAdminData | null) => {
    if (!data) return;

    setGroups(data.groups);
    setItems(data.items);

    if (!data.groups.some((group) => group.key === selectedGroupKey)) {
      const nextKey = data.groups[0]?.key || "header-main";
      setSelectedGroupKey(nextKey);
      setSelectedMenuId(null);
      setMenuFormState(defaultMenuFormState(nextKey));
    }
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev?.[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearGroupFieldError = (key: string) => {
    setGroupFieldErrors((prev) => {
      if (!prev?.[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleMenuChange = (key: keyof MenuFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.type === "checkbox"
      ? (event.target as HTMLInputElement).checked
      : event.target.value;

    setMenuFormState((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key);
  };

  const handleGroupChange = (key: keyof GroupFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.type === "checkbox"
      ? (event.target as HTMLInputElement).checked
      : event.target.value;

    setGroupFormState((prev) => ({ ...prev, [key]: value }));
    clearGroupFieldError(key);
  };

  const resetMenuForm = (groupKey = selectedGroupKey) => {
    setSelectedMenuId(null);
    setMenuFormState(defaultMenuFormState(groupKey));
    setFieldErrors(undefined);
  };

  const resetGroupForm = () => {
    setGroupFormState(defaultGroupFormState);
    setGroupFieldErrors(undefined);
  };

  const handleSelectGroup = (groupKey: string) => {
    setSelectedGroupKey(groupKey);
    resetMenuForm(groupKey);
    setMessage(null);
  };

  const handleSelectMenu = (item: SiteNavigationItem) => {
    setSelectedMenuId(item.id);
    setMenuFormState({
      id: item.id,
      groupKey: item.groupKey,
      parentId: item.parentId ? String(item.parentId) : "",
      name: item.name,
      title: item.title,
      href: item.href,
      target: item.target || "",
      icon: item.icon || "",
      order: item.order,
      visibility: item.visibility,
      isActive: item.isActive,
    });
    setFieldErrors(undefined);
    setMessage(null);
  };

  const handleCreateMenu = () => {
    setSelectedMenuId(null);
    setMenuFormState(defaultMenuFormState(selectedGroupKey));
    setFieldErrors(undefined);
    setMessage(null);
  };

  const openCreateGroupModal = () => {
    resetGroupForm();
    setShowGroupModal(true);
  };

  const openEditGroupModal = (group: SiteNavigationGroupItem) => {
    setGroupFormState({
      id: group.id,
      key: group.key,
      title: group.title,
      description: group.description || "",
      area: group.area,
      order: group.order,
      isActive: group.isActive,
    });
    setGroupFieldErrors(undefined);
    setShowGroupModal(true);
  };

  const handleSubmitGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveSiteNavigationGroupAdminAction(formData);

      if (!result.success) {
        setGroupFieldErrors(result.fieldErrors);
        setMessage({ type: "error", text: result.message || "메뉴 그룹 저장에 실패했습니다." });
        return;
      }

      syncData(result.data);
      setGroupFieldErrors(undefined);
      setMessage({ type: "success", text: result.message || "메뉴 그룹이 저장되었습니다." });
      setShowGroupModal(false);
      resetGroupForm();
    });
  };

  const handleSubmitMenu = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveSiteNavigationAdminAction(formData);

      if (!result.success) {
        setFieldErrors(result.fieldErrors);
        setMessage({ type: "error", text: result.message || "사이트맵 저장에 실패했습니다." });
        return;
      }

      syncData(result.data);
      setFieldErrors(undefined);
      setMessage({ type: "success", text: result.message || "사이트맵이 저장되었습니다." });
      setSelectedMenuId(null);
      setMenuFormState(defaultMenuFormState(selectedGroupKey));
    });
  };

  const handleRemoveGroup = (group: SiteNavigationGroupItem) => {
    if (!window.confirm(`${group.title}\n이 그룹과 그룹 안의 메뉴를 삭제하시겠습니까?`)) return;

    startTransition(async () => {
      const result = await removeSiteNavigationGroupAdminAction(group.id);

      if (!result.success) {
        setMessage({ type: "error", text: result.message || "메뉴 그룹 삭제에 실패했습니다." });
        return;
      }

      syncData(result.data);
      setMessage({ type: "success", text: result.message || "메뉴 그룹이 삭제되었습니다." });
      setShowGroupModal(false);
      resetGroupForm();
    });
  };

  const handleRemoveMenu = (item: SiteNavigationItem) => {
    if (!window.confirm(`${item.title}\n이 메뉴와 하위 메뉴를 삭제하시겠습니까?`)) return;

    startTransition(async () => {
      const result = await removeSiteNavigationAdminAction(item.id);

      if (!result.success) {
        setMessage({ type: "error", text: result.message || "메뉴 삭제에 실패했습니다." });
        return;
      }

      syncData(result.data);
      setMessage({ type: "success", text: result.message || "메뉴가 삭제되었습니다." });
      resetMenuForm();
    });
  };

  const reorderSiblingIds = ({
    draggedId,
    targetId,
    targetGroupKey,
    parentId,
  }: {
    draggedId: number;
    targetId?: number;
    targetGroupKey: string;
    parentId: number | null;
  }) => {
    const siblingIds = flatItems
      .filter((item) => item.groupKey === targetGroupKey && item.parentId === parentId && item.id !== draggedId)
      .map((item) => item.id);

    if (!targetId) return [...siblingIds, draggedId];

    const targetIndex = siblingIds.indexOf(targetId);
    if (targetIndex < 0) return [...siblingIds, draggedId];

    return [
      ...siblingIds.slice(0, targetIndex),
      draggedId,
      ...siblingIds.slice(targetIndex),
    ];
  };

  const getDescendantIds = (itemId: number) => {
    const descendants = new Set<number>();
    const collect = (parentId: number) => {
      flatItems
        .filter((item) => item.parentId === parentId)
        .forEach((child) => {
          descendants.add(child.id);
          collect(child.id);
        });
    };

    collect(itemId);

    return descendants;
  };

  const moveDraggedMenu = ({
    itemId,
    groupKey,
    parentId,
    orderedIds,
  }: {
    itemId: number;
    groupKey: string;
    parentId: number | null;
    orderedIds: number[];
  }) => {
    startTransition(async () => {
      const result = await moveSiteNavigationAdminAction({
        itemId,
        groupKey,
        parentId,
        orderedIds,
      });
      if (!result.success) {
        setMessage({ type: "error", text: result.message || "메뉴 이동에 실패했습니다." });
        return;
      }

      syncData(result.data);
      setSelectedGroupKey(groupKey);
      setSelectedMenuId(itemId);
      setMessage({ type: "success", text: result.message || "메뉴 위치가 변경되었습니다." });
    });
  };

  const handleDropOnGroup = (itemId: number, groupKey: string) => {
    const orderedIds = reorderSiblingIds({
      draggedId: itemId,
      targetGroupKey: groupKey,
      parentId: null,
    });

    moveDraggedMenu({
      itemId,
      groupKey,
      parentId: null,
      orderedIds,
    });
  };

  const handleDropOnMenu = (itemId: number, targetItem: SiteNavigationItem, asChild = false) => {
    if (itemId === targetItem.id) return;

    if (getDescendantIds(itemId).has(targetItem.id)) {
      setMessage({ type: "error", text: "자기 하위 메뉴 안으로는 이동할 수 없습니다." });
      return;
    }

    if (asChild) {
      const orderedIds = reorderSiblingIds({
        draggedId: itemId,
        targetGroupKey: targetItem.groupKey,
        parentId: targetItem.id,
      });

      moveDraggedMenu({
        itemId,
        groupKey: targetItem.groupKey,
        parentId: targetItem.id,
        orderedIds,
      });
      return;
    }

    const orderedIds = reorderSiblingIds({
      draggedId: itemId,
      targetId: targetItem.id,
      targetGroupKey: targetItem.groupKey,
      parentId: targetItem.parentId,
    });

    moveDraggedMenu({
      itemId,
      groupKey: targetItem.groupKey,
      parentId: targetItem.parentId,
      orderedIds,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id;
    const overId = event.over?.id;

    if (!overId) return;

    if (typeof activeId === "string" && activeId.startsWith("group:")) {
      if (typeof overId !== "string" || !overId.startsWith("group:") || activeId === overId) return;

      const activeKey = activeId.replace("group:", "");
      const overKey = overId.replace("group:", "");
      const activeIndex = groups.findIndex((group) => group.key === activeKey);
      const overIndex = groups.findIndex((group) => group.key === overKey);

      if (activeIndex < 0 || overIndex < 0) return;

      const nextGroups = [...groups];
      const [movedGroup] = nextGroups.splice(activeIndex, 1);
      nextGroups.splice(overIndex, 0, movedGroup);
      setGroups(nextGroups);

      startTransition(async () => {
        const result = await reorderSiteNavigationGroupsAdminAction(nextGroups.map((group) => group.key));

        if (!result.success) {
          setMessage({ type: "error", text: result.message || "그룹 정렬에 실패했습니다." });
          return;
        }

        syncData(result.data);
        setMessage({ type: "success", text: result.message || "그룹 순서가 변경되었습니다." });
      });
      return;
    }

    const itemId = Number(activeId);
    if (!itemId) return;

    if (typeof overId === "string" && overId.startsWith("group:")) {
      handleDropOnGroup(itemId, overId.replace("group:", ""));
      return;
    }

    const targetItem = flatItems.find((item) => item.id === Number(overId));
    if (!targetItem) return;

    handleDropOnMenu(itemId, targetItem, event.delta.x > 36);
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-8 md:px-5 md:py-10 dark:text-dark-100">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Site</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-100">사이트맵</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            그룹을 고르고, 그룹 안의 메뉴를 선택한 뒤, 오른쪽에서 상세 정보를 수정합니다.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:w-[360px]">
          <div className="rounded-md border border-gray-200 bg-white px-3 py-3 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <div className="text-lg font-bold text-gray-950 dark:text-dark-100">{groups.length}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Groups</div>
          </div>
          <div className="rounded-md border border-gray-200 bg-white px-3 py-3 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <div className="text-lg font-bold text-gray-950 dark:text-dark-100">{flatItems.length}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menus</div>
          </div>
          <div className="rounded-md border border-gray-200 bg-white px-3 py-3 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <div className="text-lg font-bold text-gray-950 dark:text-dark-100">{activeCount}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Active</div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-5 rounded-md px-3 py-2 text-sm ${
          message.type === "success" ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300" : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300"
        }`}>
          {message.text}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-[300px_360px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-800">
              <div>
                <div className="text-sm font-bold text-gray-950 dark:text-dark-100">Menu groups</div>
                <div className="mt-1 text-xs text-gray-400">레이아웃에서 호출하는 메뉴 묶음</div>
              </div>
              <Button type="button" onClick={openCreateGroupModal} icon={<Plus size={14} />} className="!px-3">
                추가
              </Button>
            </div>
            <div className="max-h-[650px] overflow-y-auto p-2">
              <SortableContext items={groups.map((group) => `group:${group.key}`)} strategy={verticalListSortingStrategy}>
                {groups.map((group) => {
                  const groupItemCount = flatItems.filter((item) => item.groupKey === group.key).length;

                  return (
                    <SortableGroupButton
                      key={group.id || group.key}
                      group={group}
                      count={groupItemCount}
                      isSelected={group.key === selectedGroupKey}
                      onSelect={() => handleSelectGroup(group.key)}
                      onEdit={() => openEditGroupModal(group)}
                      onDelete={() => handleRemoveGroup(group)}
                    />
                  );
                })}
              </SortableContext>
            </div>
          </section>

          <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-800">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-gray-950 dark:text-dark-100">{selectedGroup?.title || "메뉴 그룹"}</div>
                <div className="mt-1 truncate text-xs text-gray-400">{selectedGroup?.key}</div>
              </div>
              <div className="flex gap-2">
                {selectedGroup && (
                  <Button type="button" onClick={() => openEditGroupModal(selectedGroup)} icon={<Edit3 size={14} />} className="!px-3">
                    그룹
                  </Button>
                )}
                <Button type="button" onClick={handleCreateMenu} icon={<Plus size={14} />} className="!px-3 !bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white">
                  메뉴
                </Button>
              </div>
            </div>

            <DroppableMenuList groupKey={selectedGroupKey}>
              {selectedGroupItems.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-200 px-4 py-10 text-center">
                  <div className="text-sm font-bold text-gray-400">메뉴가 없습니다.</div>
                  <p className="mt-2 text-xs leading-5 text-gray-400">오른쪽 상세 영역에서 새 메뉴를 추가할 수 있습니다.</p>
                </div>
              ) : (
                <SortableContext items={selectedGroupItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                  {selectedGroupItems.map((item) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      isSelected={selectedMenuId === item.id}
                      onSelect={() => handleSelectMenu(item)}
                    />
                  ))}
                </SortableContext>
              )}
            </DroppableMenuList>
          </section>

          <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-800">
            <div>
              <div className="text-sm font-bold text-gray-950 dark:text-dark-100">
                {menuFormState.id ? "메뉴 상세" : "새 메뉴"}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {selectedMenu ? selectedMenu.href : `${selectedGroup?.key || selectedGroupKey} 그룹에 추가`}
              </div>
            </div>
            {selectedMenu && (
              <Button type="button" onClick={() => handleRemoveMenu(selectedMenu)} icon={<Trash2 size={14} />} className="!bg-red-50 !text-red-500 hover:!bg-red-500 hover:!text-white">
                삭제
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmitMenu} className="p-4">
            {!isMenuEditing && selectedGroupItems.length > 0 ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 px-6 text-center dark:border-dark-700 dark:bg-dark-950">
                <div>
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-white text-gray-300 shadow-sm dark:bg-dark-900 dark:text-dark-500">
                    <FolderTree size={18} />
                  </div>
                  <div className="text-sm font-bold text-gray-500">수정할 메뉴를 선택하세요.</div>
                  <p className="mt-2 text-xs leading-5 text-gray-400">왼쪽 메뉴 목록에서 항목을 누르면 상세 정보가 표시됩니다.</p>
                  <Button type="button" onClick={handleCreateMenu} icon={<Plus size={14} />} className="mt-5 !bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white">
                    새 메뉴 추가
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {menuFormState.id && <input type="hidden" name="id" value={menuFormState.id} />}
                <input type="hidden" name="groupKey" value={menuFormState.groupKey || selectedGroupKey} />
                <input type="hidden" name="location" value={selectedGroup?.area || "custom"} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-dark-100">상위 메뉴</label>
                    <select name="parentId" value={menuFormState.parentId} onChange={handleMenuChange("parentId")} className={selectClass}>
                      <option value="">최상위 메뉴</option>
                      {selectedGroupItems
                        .filter((item) => item.id !== menuFormState.id && item.depth === 0)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                    </select>
                    {fieldErrors?.parentId && <div className="mt-1.5 text-xs leading-5 text-red-500">{fieldErrors.parentId}</div>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-dark-100">공개 범위</label>
                    <select name="visibility" value={menuFormState.visibility} onChange={handleMenuChange("visibility")} className={selectClass}>
                      <option value="public">Public</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    {fieldErrors?.visibility && <div className="mt-1.5 text-xs leading-5 text-red-500">{fieldErrors.visibility}</div>}
                  </div>
                  <InputField inputTitle="메뉴 이름" name="title" value={menuFormState.title} onChange={handleMenuChange("title")} error={fieldErrors?.title} placeholder="공지사항" />
                  <InputField inputTitle="메뉴 키" name="name" value={menuFormState.name} onChange={handleMenuChange("name")} error={fieldErrors?.name} placeholder="notice" />
                  <InputField inputTitle="링크 주소" name="href" value={menuFormState.href} onChange={handleMenuChange("href")} error={fieldErrors?.href} placeholder="/posts/notice" />
                  <input type="hidden" name="order" value={menuFormState.order} />
                  <InputField inputTitle="아이콘" name="icon" value={menuFormState.icon} onChange={handleMenuChange("icon")} error={fieldErrors?.icon} placeholder="선택 입력" />
                  <InputField inputTitle="링크 타겟" name="target" value={menuFormState.target} onChange={handleMenuChange("target")} error={fieldErrors?.target} placeholder="_blank 또는 비움" />
                </div>

                <label className="mt-4 flex cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-3 dark:border-dark-700 dark:bg-dark-950">
                  <span>
                    <span className="block text-sm font-bold text-gray-900 dark:text-dark-100">메뉴 사용</span>
                    <span className="mt-1 block text-xs text-gray-500">꺼두면 공개 레이아웃 메뉴에서 숨겨집니다.</span>
                  </span>
                  <input type="checkbox" name="isActive" checked={menuFormState.isActive} onChange={handleMenuChange("isActive")} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                </label>

                <div className="mt-6 flex justify-end gap-2">
                  <Button type="button" onClick={() => resetMenuForm()}>초기화</Button>
                  <Button type="submit" isLoading={isPending} icon={menuFormState.id ? <CheckCircle2 size={15} /> : <Plus size={15} />} className="!bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white">
                    {menuFormState.id ? "수정하기" : "추가하기"}
                  </Button>
                </div>
              </>
            )}
          </form>
          </section>
        </div>
      </DndContext>

      <Modal state={showGroupModal} close={setShowGroupModal} size="md" position="center" escClose overlay overlayClose>
        <form onSubmit={handleSubmitGroup} className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-gray-950 dark:text-dark-100">{groupFormState.id ? "메뉴 그룹 수정" : "메뉴 그룹 추가"}</div>
              <p className="mt-1 text-xs leading-5 text-gray-500">레이아웃에서 호출할 메뉴 묶음을 관리합니다.</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-950 text-white dark:bg-cyan-500 dark:text-dark-950">
              <FolderTree size={16} />
            </div>
          </div>

          {groupFormState.id && <input type="hidden" name="groupId" value={groupFormState.id} />}

          <div className="space-y-4">
            <InputField inputTitle="그룹 키" name="key" value={groupFormState.key} onChange={handleGroupChange("key")} error={groupFieldErrors?.key} placeholder="header-main" />
            <InputField inputTitle="그룹 이름" name="groupTitle" value={groupFormState.title} onChange={handleGroupChange("title")} error={groupFieldErrors?.title} placeholder="기본 상단 메뉴" />
            <InputField inputTitle="설명" name="description" value={groupFormState.description} onChange={handleGroupChange("description")} error={groupFieldErrors?.description} placeholder="어디에서 쓰는 메뉴인지 적어주세요." />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-dark-100">영역</label>
                <select name="area" value={groupFormState.area} onChange={handleGroupChange("area")} className={selectClass}>
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                  <option value="side">Side</option>
                  <option value="mobile">Mobile</option>
                  <option value="custom">Custom</option>
                </select>
                {groupFieldErrors?.area && <div className="mt-1.5 text-xs leading-5 text-red-500">{groupFieldErrors.area}</div>}
              </div>
              <InputField inputTitle="정렬" name="groupOrder" type="number" value={groupFormState.order} onChange={handleGroupChange("order")} error={groupFieldErrors?.order} placeholder="0" />
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-3 dark:border-dark-700 dark:bg-dark-950">
              <span>
                <span className="block text-sm font-bold text-gray-900 dark:text-dark-100">그룹 사용</span>
                <span className="mt-1 block text-xs text-gray-500">꺼두면 공개 메뉴 조회에서 제외됩니다.</span>
              </span>
              <input type="checkbox" name="groupIsActive" checked={groupFormState.isActive} onChange={handleGroupChange("isActive")} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {groupFormState.id && (
              <Button
                type="button"
                onClick={() => {
                  const targetGroup = groups.find((group) => group.id === groupFormState.id);
                  if (targetGroup) handleRemoveGroup(targetGroup);
                }}
                className="!bg-red-50 !text-red-500 hover:!bg-red-500 hover:!text-white"
              >
                삭제
              </Button>
            )}
            <Button type="button" onClick={() => setShowGroupModal(false)}>닫기</Button>
            <Button type="submit" isLoading={isPending} icon={groupFormState.id ? <CheckCircle2 size={15} /> : <Plus size={15} />} className="!bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white">
              {groupFormState.id ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const SortableGroupButton = ({
  group,
  count,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  group: SiteNavigationGroupItem;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `group:${group.key}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left transition-colors ${
        isDragging
          ? "bg-white text-gray-400 opacity-60 dark:bg-dark-900 dark:text-dark-500"
          : isOver
          ? "bg-blue-50 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-300"
          : isSelected
            ? "bg-gray-950 text-white shadow-lg shadow-gray-950/10 dark:bg-cyan-500 dark:text-dark-950 dark:shadow-cyan-950/20"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-dark-400 dark:hover:bg-white/[0.04] dark:hover:text-dark-100"
      }`}
    >
      <span
        {...attributes}
        {...listeners}
        className={`grid h-8 w-5 shrink-0 cursor-grab place-items-center rounded-md active:cursor-grabbing ${
          isSelected ? "text-white/45 hover:bg-white/10 dark:text-dark-950/55" : "text-gray-300 hover:bg-white hover:text-gray-500 dark:text-dark-600 dark:hover:bg-dark-800 dark:hover:text-dark-300"
        }`}
      >
        <GripVertical size={14} />
      </span>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 cursor-pointer text-left">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${
            isSelected ? "bg-white/10 text-white dark:bg-dark-950/15 dark:text-dark-950" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-gray-600 dark:bg-dark-800 dark:text-dark-500 dark:group-hover:bg-dark-700 dark:group-hover:text-dark-200"
          }`}>
            <Layers3 size={14} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-5">{group.title}</span>
            <span className={`mt-0.5 block truncate text-[11px] leading-4 ${
              isSelected ? "text-white/45 dark:text-dark-950/60" : "text-gray-400 dark:text-dark-500"
            }`}>
              {group.key} · {getAreaLabel(group.area)}
            </span>
          </span>
        </span>
      </button>
      <div className="ml-1 flex shrink-0 items-center gap-0.5">
        <span className={`grid h-7 min-w-7 place-items-center rounded-md px-2 text-[10px] font-bold ${
          isSelected ? "bg-white text-gray-950 dark:bg-dark-950 dark:text-cyan-300" : "bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300"
        }`}>
          {count}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className={`grid h-7 w-7 cursor-pointer place-items-center rounded-md transition-colors ${
            isSelected ? "text-white/45 hover:bg-white/10 hover:text-white dark:text-dark-950/60 dark:hover:bg-dark-950/15 dark:hover:text-dark-950" : "text-gray-300 hover:bg-white hover:text-blue-500 dark:text-dark-600 dark:hover:bg-dark-800 dark:hover:text-cyan-400"
          }`}
          aria-label={`${group.title} 그룹 수정`}
        >
          <Edit3 size={13} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className={`grid h-7 w-7 cursor-pointer place-items-center rounded-md transition-colors ${
            isSelected ? "text-white/45 hover:bg-white/10 hover:text-white dark:text-dark-950/60 dark:hover:bg-dark-950/15 dark:hover:text-dark-950" : "text-gray-300 hover:bg-red-50 hover:text-red-500 dark:text-dark-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          }`}
          aria-label={`${group.title} 그룹 삭제`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const DroppableMenuList = ({
  groupKey,
  children,
}: {
  groupKey: string;
  children: React.ReactNode;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `group:${groupKey}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`max-h-[650px] min-h-[180px] overflow-y-auto p-2 transition-colors ${
        isOver ? "bg-blue-50/40 dark:bg-cyan-500/10" : ""
      }`}
    >
      {children}
    </div>
  );
};

const SortableMenuItem = ({
  item,
  isSelected,
  onSelect,
}: {
  item: SiteNavigationItem;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    marginLeft: item.depth > 0 ? item.depth * 20 : 0,
    width: item.depth > 0 ? `calc(100% - ${item.depth * 20}px)` : "100%",
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      style={style}
      className={`relative mb-1.5 flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors ${
        isOver
          ? "border-blue-200 bg-blue-50 text-blue-600 ring-2 ring-blue-100 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/10"
          : isDragging
            ? "border-gray-200 bg-white text-gray-400 opacity-60 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-500"
            : isSelected
              ? "border-blue-200 bg-blue-50/70 text-blue-600 shadow-sm shadow-blue-50 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300 dark:shadow-none"
              : item.depth > 0
                ? "border-gray-100 bg-gray-50/80 text-gray-700 hover:border-gray-200 hover:bg-white dark:border-dark-800 dark:bg-dark-950/70 dark:text-dark-300 dark:hover:border-dark-700 dark:hover:bg-dark-800"
                : "border-gray-100 bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300 dark:hover:border-dark-700 dark:hover:bg-dark-800"
      }`}
    >
      {item.depth > 0 && (
        <svg
          className="absolute -left-5 top-1/2 h-6 w-5 -translate-y-1/2 text-gray-300"
          viewBox="0 0 20 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 3v10c0 3.314 2.686 6 6 6h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className="flex shrink-0 items-center gap-1.5">
        <span
          {...attributes}
          {...listeners}
          className="grid h-6 w-5 cursor-grab place-items-center rounded-md text-gray-300 transition-colors hover:bg-white hover:text-gray-500 active:cursor-grabbing dark:text-dark-600 dark:hover:bg-dark-800 dark:hover:text-dark-300"
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical size={13} />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-bold leading-5">{item.title}</span>
          {item.target === "_blank" && <ExternalLink size={12} className="shrink-0 text-gray-300" />}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-2">
          <span className="truncate text-xs leading-4 text-gray-400 dark:text-dark-500">{item.href}</span>
          <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:bg-dark-800 dark:text-dark-400">
            {item.visibility}
          </span>
        </span>
      </span>

      <span className={`ml-2 flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
        item.isActive ? "bg-cyan-50 text-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-300" : "bg-gray-100 text-gray-300 dark:bg-dark-800 dark:text-dark-500"
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${item.isActive ? "bg-cyan-400" : "bg-gray-300"}`} />
        {item.isActive ? "ON" : "OFF"}
      </span>
    </button>
  );
};

export default SitemapAdmin;
