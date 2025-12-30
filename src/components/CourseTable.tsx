import { Button, Table, InputNumber, Tag, Checkbox } from "antd";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { Course } from "../types/course";

type Props = {
  courses: Course[];
  onChange: (courses: Course[]) => void;
};

export function CourseTable({ courses, onChange }: Props) {
  const [predictScore, setPredictScore] = useState<number>(0);
  const updateScore = (index: number, score: number) => {
    const next = [...courses];
    if (!next[index].locked) {
      next[index] = { ...next[index], score };
      onChange(next);
    }
  };
  const updateLocked = (index: number, locked: boolean) => {
    const next = [...courses];
    next[index] = { ...next[index], locked };
    onChange(next);
  };
  const applyPredictScore = () => {
    const next = courses.map((c) => {
      if (!c.locked) {
        return {
          ...c,
          score: predictScore,
        };
      }
      return c;
    });
    onChange(next);
  };
  const lockedExamCount = courses.filter((c) => c.locked).length;
  const unlockedExamCount = courses.filter((c) => !c.locked).length;
  const countedExamCount = courses.filter((c) => {
    return c.score !== 0;
  }).length;

  /** 计算平均学分绩 */
  const examStats = courses.reduce(
    (acc, c) => {
      if (c.score === 0) {
        return acc;
      }
      acc.totalCredits += c.credit;
      acc.weightedSum += c.score * c.credit;
      return acc;
    },
    { totalCredits: 0, weightedSum: 0 }
  );

  const avgScore =
    examStats.totalCredits === 0
      ? 0
      : examStats.weightedSum / examStats.totalCredits;

  const columns: ColumnsType<Course> = [
    {
      title: "课程名称",
      dataIndex: "name",
      width: "33%",
      render: (name, record) => (
        <>
          <span
            style={{
              color:
                record.score < 60 && record.score !== 0 ? "#cf1322" : undefined,
              fontWeight: 520,
            }}
          >
            {name}
          </span>
          {record.locked && (
            <Tag
              color="geekblue"
              style={{
                marginLeft: 8,
                borderRadius: 999,
                paddingInline: 10,
                lineHeight: "20px",
              }}
            >
              已出分
            </Tag>
          )}
        </>
      ),
    },
    {
      title: "学期",
      dataIndex: "term",
      width: "28%",
      render: (term) => (
        <span style={{ color: "rgba(0,0,0,0.72)" }}>{term}</span>
      ),
    },
    {
      title: "学分",
      dataIndex: "credit",
      width: "10%",
      render: (credit) => (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{credit}</span>
      ),
    },
    {
      title: "成绩",
      dataIndex: "score",
      width: "17%",
      render: (_, record, index) => (
        <InputNumber
          min={0}
          max={100}
          step={1}
          value={record.score}
          disabled={record.locked}
          onChange={(value) => {
            if (value !== null) updateScore(index, value);
          }}
          style={{
            width: 110,
            borderRadius: 10,
          }}
        />
      ),
    },
    {
      title: "已出分",
      dataIndex: "locked",
      width: "12%",
      align: "center",
      render: (locked, _, index) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Checkbox
            checked={locked}
            onChange={(e) => updateLocked(index, e.target.checked)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="gpa-courseTable">
      {/* 成绩总览 */}
      <div
        className="gpa-statCard"
        style={{
          marginBottom: 14,
          padding: "18px 20px",
          borderRadius: 14,
          background:
            "linear-gradient(135deg, rgba(24,144,255,0.10) 0%, rgba(114,46,209,0.08) 45%, rgba(255,255,255,0.80) 100%)",
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow:
            "0 14px 34px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "rgba(15,23,42,0.65)",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>当前预测平均学分绩（考试课）</span>
          <span
            style={{
              height: 18,
              lineHeight: "18px",
              padding: "0 10px",
              borderRadius: 999,
              fontSize: 12,
              color: "rgba(15,23,42,0.60)",
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.55)",
            }}
          >
            自动保存
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 750,
              lineHeight: 1.05,
              letterSpacing: 0.2,
              fontVariantNumeric: "tabular-nums",
              color: "rgba(15,23,42,0.92)",
            }}
          >
            {avgScore.toFixed(3)}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(15,23,42,0.55)",
              marginTop: 6,
            }}
          >
            （学分加权）
          </div>
        </div>

        {/* 规模信息：重要，但不抢戏 */}
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "rgba(15,23,42,0.58)",
          }}
        >
          共 {courses.length} 门课程 · 考试课学分 {examStats.totalCredits} ·
          已出分 {lockedExamCount} 门 · 未出分 {unlockedExamCount} 门 · 参与预测{" "}
          {countedExamCount} 门
        </div>
      </div>

      {/* 工具区域 */}
      <div
        className="gpa-toolbar"
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          flexWrap: "wrap",
          padding: "10px 12px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span style={{ color: "rgba(15,23,42,0.72)" }}>未出分课程按</span>

        <InputNumber
          min={0}
          max={100}
          step={1}
          value={predictScore}
          onChange={(v) => {
            if (v !== null) setPredictScore(v);
          }}
          style={{
            width: 86,
            borderRadius: 10,
          }}
        />

        <span style={{ color: "rgba(15,23,42,0.72)" }}>分计算</span>

        <Button
          size="small"
          type="primary"
          onClick={() => applyPredictScore()}
          style={{
            borderRadius: 10,
            paddingInline: 14,
            height: 28,
            boxShadow: "0 10px 18px rgba(24,144,255,0.18)",
          }}
        >
          确认应用
        </Button>

        <span
          style={{
            fontSize: 12,
            color: "rgba(15,23,42,0.55)",
          }}
        >
          成绩为0的课程不会计入学分绩预测
        </span>
      </div>

      {/* 成绩表 */}
      <div
        className="gpa-tableCard"
        style={{
          background: "rgba(255,255,255,0.86)",
          padding: 8,
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
          overflow: "hidden",
          backdropFilter: "blur(6px)",
        }}
      >
        <Table
          title={() => (
            <div
              style={{
                fontWeight: 650,
                color: "rgba(15,23,42,0.86)",
                letterSpacing: 0.2,
              }}
            >
              课程成绩表
            </div>
          )}
          columns={columns}
          dataSource={courses}
          rowKey={(c, i) => `${c.name}-${i}`}
          pagination={false}
          bordered
          size="middle"
          scroll={{ y: "calc(100vh - 360px)" }}
        />
      </div>

      {/* 仅样式覆盖，不引入任何业务逻辑 */}
      <style>{`
        .gpa-courseTable .ant-input-number {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(15,23,42,0.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
          transition: box-shadow .2s ease, border-color .2s ease, transform .2s ease;
        }
        .gpa-courseTable .ant-input-number:hover {
          border-color: rgba(24,144,255,0.45);
          box-shadow: 0 10px 18px rgba(24,144,255,0.10);
        }
        .gpa-courseTable .ant-input-number-focused {
          border-color: rgba(24,144,255,0.70) !important;
          box-shadow: 0 12px 24px rgba(24,144,255,0.18) !important;
        }

        .gpa-courseTable .ant-table {
          background: transparent;
        }
        .gpa-courseTable .ant-table-container {
          border-radius: 12px;
        }
        .gpa-courseTable .ant-table-thead > tr > th {
          background: linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.04));
          color: rgba(15,23,42,0.75);
          font-weight: 650;
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }
        .gpa-courseTable .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        .gpa-courseTable .ant-table-tbody > tr:hover > td {
          background: rgba(24,144,255,0.06) !important;
        }

        .gpa-courseTable .ant-checkbox-inner {
          border-radius: 6px;
        }

        /* 更“产品化”的滚动条观感（不影响功能） */
        .gpa-courseTable .ant-table-body::-webkit-scrollbar {
          width: 10px;
        }
        .gpa-courseTable .ant-table-body::-webkit-scrollbar-thumb {
          background: rgba(15,23,42,0.16);
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.7);
        }
        .gpa-courseTable .ant-table-body::-webkit-scrollbar-track {
          background: rgba(15,23,42,0.04);
        }

        @media (max-width: 768px) {
          .gpa-courseTable .gpa-statCard { padding: 16px 16px !important; }
          .gpa-courseTable .gpa-toolbar { gap: 8px !important; }
          .gpa-courseTable .ant-input-number { width: 84px !important; }
        }
      `}</style>
    </div>
  );
}
