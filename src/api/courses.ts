import { invoke } from '@tauri-apps/api/core';
import type { Course, LoadResult } from '../types/course';

export function loadCourses(): Promise<LoadResult> {
  return invoke('load_courses');
}

export function saveCourses(courses: Course[]): Promise<void> {
  return invoke('save_courses', { courses });
}