import { useEffect, useState } from "react";
import { Layout } from "antd";
import { loadCourses, saveCourses } from "./api/courses";
import { CourseTable } from "./components/CourseTable";
import type { Course } from "./types/course";

const { Content } = Layout;

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    loadCourses().then((res) => {
      setCourses(res.courses);
    });
  }, []);

  useEffect(() => {
    if (courses.length === 0) return;
    saveCourses(courses);
  }, [courses]);

  return (
    <Layout
      className="gpa-app"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 20% 0%, rgba(24,144,255,0.14), transparent 55%), radial-gradient(900px 600px at 85% 10%, rgba(114,46,209,0.12), transparent 50%), linear-gradient(180deg, #f6f8fb 0%, #eef2f7 100%)",
      }}
    >
      <Content style={{ padding: 24 }}>
        <div
          className="gpa-content"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
          }}
        >
          <CourseTable courses={courses} onChange={setCourses} />
        </div>
      </Content>

      {/* 仅样式覆盖，不引入任何业务逻辑 */}
      <style>{`
        .gpa-app .ant-layout-header { position: sticky; top: 0; z-index: 10; }
        .gpa-content { padding-bottom: 12px; }
        @media (max-width: 768px) {
          .gpa-content { max-width: 100%; }
          .gpa-app .ant-layout-header { padding-left: 14px !important; padding-right: 14px !important; }
        }
      `}</style>
    </Layout>
  );
}
