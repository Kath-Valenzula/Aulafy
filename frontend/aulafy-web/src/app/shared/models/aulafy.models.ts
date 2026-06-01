export type RoleName = 'ADMIN' | 'COLEGIO' | 'PROFESOR' | 'APODERADO' | 'ESTUDIANTE';
export type PostType = 'AVISO' | 'TAREA' | 'EVALUACION' | 'REUNION' | 'MATERIAL' | 'COMUNICADO';
export type EventType = 'PRUEBA' | 'TAREA' | 'REUNION' | 'ACTIVIDAD' | 'COMUNICADO';
export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO' | 'ATRASADO';
export type EvaluationType = 'PRUEBA' | 'CONTROL' | 'TAREA' | 'TRABAJO' | 'PROYECTO';
export type AnnotationType = 'ACADEMICA' | 'CONDUCTUAL' | 'COMUNICACION';
export type AnnotationSeverity = 'LEVE' | 'MEDIA' | 'ALTA';
export type AnnotationStatus = 'PENDIENTE' | 'LEIDA' | 'RESUELTA';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: RoleName;
  active: boolean;
  telegramChatId?: string | null;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: UserResponse;
}

export interface CourseResponse {
  id: number;
  name: string;
  level: string;
  section: string;
  schoolName: string;
  active: boolean;
  studentCount: number;
  teacherCount: number;
}

export interface CourseStudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  levelName: string;
  section: string;
  guardianId: number | null;
  studentUserId: number | null;
}

export interface SubjectResponse {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  teacherId?: number | null;
  teacherName?: string | null;
  active: boolean;
}

export interface EvaluationResponse {
  id: number;
  courseId: number;
  courseName: string;
  subjectId: number;
  subjectName: string;
  title: string;
  description: string;
  type: EvaluationType;
  evaluationDate: string;
  weight?: number | null;
  active: boolean;
}

export interface PostResponse {
  id: number;
  courseId: number;
  courseName: string;
  authorId: number;
  authorName: string;
  title: string;
  content: string;
  type: PostType;
  pinned: boolean;
  commentsEnabled: boolean;
  createdAt: string;
}

export interface CommentResponse {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CalendarEventResponse {
  id: number;
  courseId: number;
  courseName: string;
  createdByName: string;
  title: string;
  description: string;
  type: EventType;
  startAt: string;
  endAt?: string | null;
  notifyTelegram: boolean;
}

export interface GradeResponse {
  id: number;
  studentId: number;
  studentName: string;
  evaluationId: number;
  evaluationTitle: string;
  subjectName: string;
  evaluationDate: string;
  score: number;
  maxScore: number;
  observation?: string | null;
}

export interface AcademicSummaryResponse {
  studentId: number;
  studentName: string;
  gradeCount: number;
  averageScore: number;
  status: string;
  message: string;
}

export interface AttendanceResponse {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  date: string;
  status: AttendanceStatus;
  comment?: string | null;
}

export interface AttendanceSummaryResponse {
  studentId: number;
  studentName: string;
  totalRecords: number;
  presentRecords: number;
  absentRecords: number;
  justifiedRecords: number;
  lateRecords: number;
  attendancePercentage: number;
  status: string;
}

export interface NotificationLogResponse {
  id: number;
  type: string;
  recipient: string;
  message: string;
  status: string;
  detail?: string | null;
  createdAt: string;
}

export interface ChatRoomResponse {
  id: number;
  courseId: number;
  courseName: string;
  name: string;
  createdAt: string;
  latestMessage: string | null;
  latestMessageAt: string | null;
}

export interface ChatMessageResponse {
  id: number;
  roomId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AnnotationResponse {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  createdById: number;
  createdByName: string;
  type: AnnotationType;
  severity: AnnotationSeverity;
  status: AnnotationStatus;
  title: string;
  description: string;
  createdAt: string;
}
