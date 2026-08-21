"use client";

import { useEffect } from "react";

export default function WeeklyReportTool() {
  useEffect(() => {
    const stylesheetId = "weekly-report-stylesheet";
    const scriptId = "weekly-report-script";

    if (!document.getElementById(stylesheetId)) {
      const link = document.createElement("link");
      link.id = stylesheetId;
      link.rel = "stylesheet";
      link.href = "/weekly-report/styles.css";
      document.head.appendChild(link);
    }

    document.getElementById(scriptId)?.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "/weekly-report/app.js";
    script.async = false;
    document.body.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, []);

  return (
    <main className="workspace">
      <section className="editor" aria-label="보고서 입력">
        <header className="topbar">
          <div>
            <h1>주간업무보고서</h1>
            <p>시설부 작업내역과 사진을 PDF 양식으로 정리합니다.</p>
          </div>
          <div className="actions">
            <button type="button" id="printBtn" className="ghost">인쇄</button>
            <button type="button" id="pdfBtn" className="primary">PDF저장</button>
            <button type="button" id="jpgBtn" className="primary">JPG저장</button>
          </div>
        </header>

        <div className="panel compact">
          <label>
            부서명
            <input id="department" defaultValue="시설부" autoComplete="off" />
          </label>
          <label>
            작업 시작일
            <input id="startDate" type="date" />
          </label>
          <label>
            작업 종료일
            <input id="endDate" type="date" />
          </label>
          <label>
            작성일
            <input id="writtenDate" type="date" />
          </label>
        </div>

        <section className="panel">
          <div className="section-head">
            <h2>작업 내역</h2>
          </div>
          <div className="table-editor" id="workRows" aria-label="작업 내역 목록" />
        </section>

        <section className="panel">
          <div className="section-head">
            <h2>작업 사진</h2>
            <button type="button" id="addPhotoDayBtn" className="small">날짜 추가</button>
          </div>
          <div id="photoDays" className="photo-days" />
        </section>
      </section>

      <section className="preview-shell" aria-label="보고서 미리보기">
        <div id="reportPreview" className="report" />
      </section>
    </main>
  );
}
