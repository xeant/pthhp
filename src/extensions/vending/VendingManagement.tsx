"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Archive, Pencil, Plus, Settings2 } from "lucide-react";
import {
  archiveVendingMachineAdminAction,
  createVendingMachineAction,
  type VendingActionResult,
  updateVendingMachineAdminAction,
} from "./vending.action";
import type { VendingMachine } from "./types";

export default function VendingManagement({ machines }: { machines: VendingMachine[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const submit = (formData: FormData, action: (data: FormData) => Promise<VendingActionResult>) => {
    startTransition(async () => {
      const result = await action(formData);
      setMessage(result.message);
      if (result.success) window.location.reload();
    });
  };

  return <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6"><div className="flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-dark-800 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">자판기 운영</p><h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">자판기 관리</h1><p className="mt-2 text-sm text-gray-500 dark:text-dark-300">자판기를 추가하고 운영 정보와 노출 상태를 관리합니다.</p></div><button type="button" onClick={() => setShowCreate((value) => !value)} className="inline-flex h-10 items-center justify-center gap-2 bg-gray-950 px-4 text-sm font-medium text-white dark:bg-white dark:text-gray-950"><Plus size={16} />자판기 추가</button></div>{showCreate && <form onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget), createVendingMachineAction); }} className="mt-6 grid gap-3 border border-gray-200 bg-gray-50 p-4 dark:border-dark-800 dark:bg-dark-900 md:grid-cols-4"><input required name="name" placeholder="자판기 이름" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><input name="slug" placeholder="식별자 (영문 권장)" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><input name="supplyUnitCost" type="number" min="0" placeholder="판매 1건당 소모품 단가" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><button disabled={pending} className="h-10 bg-emerald-700 px-4 text-sm font-medium text-white disabled:opacity-50">추가</button><input name="description" placeholder="운영 위치 또는 메모" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950 md:col-span-3" /></form>}{message && <div className="mt-5 border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-200">{message}</div>}<section className="mt-7 grid gap-4 lg:grid-cols-2">{machines.map((machine) => <MachineCard key={machine.id} machine={machine} pending={pending} submit={submit} />)}</section></div>;
}

function MachineCard({ machine, pending, submit }: { machine: VendingMachine; pending: boolean; submit: (data: FormData, action: (data: FormData) => Promise<VendingActionResult>) => void }) {
  const [editing, setEditing] = useState(false);
  return <article className="border border-gray-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-lg font-semibold text-gray-950 dark:text-white">{machine.name}</h2>{!machine.isActive && <span className="border border-gray-200 px-2 py-0.5 text-xs text-gray-500 dark:border-dark-700 dark:text-dark-300">삭제됨</span>}</div><p className="mt-1 text-sm text-gray-500 dark:text-dark-300">{machine.description || "설명 없음"}</p></div><button type="button" aria-label={`${machine.name} 수정`} onClick={() => setEditing((value) => !value)} className="grid h-9 w-9 place-items-center border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-dark-700 dark:text-dark-200 dark:hover:bg-dark-800"><Pencil size={16} /></button></div><div className="mt-5 flex items-center justify-between border-y border-gray-100 py-3 text-sm dark:border-dark-800"><span className="text-gray-500 dark:text-dark-300">판매 1건당 소모품 단가</span><strong className="text-gray-950 dark:text-white">{machine.supplyUnitCost.toLocaleString("ko-KR")}원</strong></div>{editing && <form onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget), updateVendingMachineAdminAction); }} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="id" value={machine.id} /><input required name="name" defaultValue={machine.name} className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><input required name="supplyUnitCost" type="number" min="0" defaultValue={machine.supplyUnitCost} className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><input name="description" defaultValue={machine.description || ""} placeholder="운영 위치 또는 메모" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950 sm:col-span-2" /><button disabled={pending} className="h-10 bg-gray-950 px-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-gray-950">수정 저장</button></form>}{machine.isActive ? <div className="mt-5 flex items-center justify-between gap-3"><Link href={`/vending/${machine.slug}/dashboard`} className="inline-flex h-10 items-center gap-2 border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-700 dark:text-dark-200 dark:hover:bg-dark-800"><Settings2 size={16} />운영 화면</Link><form onSubmit={(event) => { event.preventDefault(); if (window.confirm(`${machine.name}을 삭제할까요? 기존 운영 자료는 보존됩니다.`)) submit(new FormData(event.currentTarget), archiveVendingMachineAdminAction); }}><input type="hidden" name="id" value={machine.id} /><button disabled={pending} className="inline-flex h-10 items-center gap-2 border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-950 dark:text-red-300 dark:hover:bg-red-950/30"><Archive size={16} />삭제</button></form></div> : <p className="mt-5 text-sm text-gray-400">삭제된 자판기입니다. 이전 운영 자료는 보존됩니다.</p>}</article>;
}
