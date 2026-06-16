import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { CommentsService } from '../../core/services/comments.service';
import { CoursesService } from '../../core/services/courses.service';
import { PostsService } from '../../core/services/posts.service';
import { CommentResponse, CourseResponse, PostResponse, PostType } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mb-5">
      <h2 class="text-2xl font-semibold text-on-background">Muro del Colegio</h2>
    </section>

    <section *ngIf="loading" class="bg-surface rounded-xl border border-outline-variant p-4 mb-4 text-sm text-on-surface-variant">
      Cargando publicaciones...
    </section>

    <section *ngIf="!loading && error" class="bg-error-container text-on-error-container rounded-xl p-4 mb-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span>{{ error }}</span>
      <button (click)="loadCoursesAndPosts()" class="px-3 py-2 rounded-lg bg-surface text-primary font-semibold">Reintentar</button>
    </section>

    <section *ngIf="!loading && !error && !courses.length" class="bg-surface rounded-xl border border-outline-variant p-4 mb-4 text-sm text-on-surface-variant">
      No hay cursos disponibles para el muro.
    </section>

    <ng-container *ngIf="!loading && !error && courses.length">
      <section class="bg-surface rounded-xl border border-outline-variant p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          class="bg-surface-container border border-outline-variant rounded-lg px-3 py-2"
          [ngModel]="selectedCourseId"
          (ngModelChange)="onCourseChange($event)"
        >
          <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
        </select>
        <select
          class="bg-surface-container border border-outline-variant rounded-lg px-3 py-2"
          [ngModel]="selectedTypeFilter"
          (ngModelChange)="selectedTypeFilter = normalizeFilter($event)"
        >
          <option value="">Todos los tipos</option>
          <option *ngFor="let type of postTypes" [value]="type">{{ type }}</option>
        </select>
      </section>

      <section *ngIf="canCreatePost" class="bg-surface rounded-xl border border-outline-variant p-5 mb-4">
        <h3 class="font-semibold text-primary mb-3">Crear publicación</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            [(ngModel)]="postDraft.title"
            class="bg-surface-container border border-outline-variant rounded-lg px-3 py-2"
            placeholder="Título"
          />
          <select
            [ngModel]="postDraft.type"
            (ngModelChange)="postDraft.type = $event"
            class="bg-surface-container border border-outline-variant rounded-lg px-3 py-2"
          >
            <option *ngFor="let type of postTypes" [value]="type">{{ type }}</option>
          </select>
          <textarea
            [(ngModel)]="postDraft.content"
            class="md:col-span-2 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 min-h-24"
            placeholder="Contenido"
          ></textarea>
          <label class="md:col-span-2 flex items-center gap-2 text-sm text-on-surface-variant">
            <input [(ngModel)]="postDraft.commentsEnabled" type="checkbox" />
            Permitir comentarios
          </label>
        </div>
        <button
          (click)="createPost()"
          [disabled]="savingPost || !canSubmitPost"
          class="mt-3 px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold disabled:opacity-50"
        >
          {{ savingPost ? 'Guardando...' : 'Publicar' }}
        </button>
      </section>

      <section *ngIf="actionMessage" class="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 mb-4">
        <p class="text-sm text-on-secondary-container">{{ actionMessage }}</p>
      </section>

      <section *ngIf="!filteredPosts.length" class="bg-surface rounded-xl border border-outline-variant p-4 text-sm text-on-surface-variant">
        No hay publicaciones para los filtros seleccionados.
      </section>

      <section *ngIf="filteredPosts.length" class="flex flex-col gap-4">
        <article *ngFor="let post of filteredPosts" class="bg-surface rounded-xl shadow-sm border border-outline-variant/20 p-5">
          <div class="flex gap-3 items-start mb-3">
            <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
              <span class="material-symbols-outlined text-sm">campaign</span>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold">{{ post.authorName }}</h3>
              <p class="text-sm text-outline">{{ post.courseName }} • {{ post.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-md" [ngClass]="postTypeClass(post.type)">{{ post.type }}</span>
          </div>
          <h4 class="font-semibold mb-1">{{ post.title }}</h4>
          <p class="text-sm text-on-surface-variant">{{ post.content }}</p>

          <div class="mt-4 border-t border-outline-variant/20 pt-3">
            <button
              class="text-sm font-semibold text-primary"
              [disabled]="loadingCommentsPostId === post.id"
              (click)="toggleComments(post.id)"
            >
              {{ isCommentsOpen(post.id) ? 'Ocultar comentarios' : 'Ver comentarios' }}
            </button>

            <div *ngIf="isCommentsOpen(post.id)" class="mt-3 space-y-3">
              <p *ngIf="loadingCommentsPostId === post.id" class="text-sm text-on-surface-variant">Cargando comentarios...</p>
              <p *ngIf="loadingCommentsPostId !== post.id && !commentsByPost[post.id]?.length" class="text-sm text-on-surface-variant">
                Sin comentarios aún.
              </p>

              <div *ngFor="let comment of commentsByPost[post.id]" class="bg-surface-container-low rounded-lg p-3">
                <p class="text-sm"><strong>{{ comment.authorName }}:</strong> {{ comment.content }}</p>
                <p class="text-xs text-outline mt-1">{{ comment.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>

              <div *ngIf="post.commentsEnabled" class="flex gap-2">
                <input
                  class="flex-1 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm"
                  placeholder="Escribe un comentario..."
                  [(ngModel)]="commentDraftByPost[post.id]"
                />
                <button
                  class="px-3 py-2 bg-primary-container text-on-primary rounded-lg text-sm font-semibold disabled:opacity-50"
                  [disabled]="savingCommentPostId === post.id || !canSubmitComment(post.id)"
                  (click)="createComment(post.id)"
                >
                  Enviar
                </button>
              </div>
              <p *ngIf="!post.commentsEnabled" class="text-sm text-outline">Comentarios deshabilitados en esta publicación.</p>
            </div>
          </div>
        </article>
      </section>
    </ng-container>
  `
})
export class FeedComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly coursesService = inject(CoursesService);
  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);

  courses: CourseResponse[] = [];
  posts: PostResponse[] = [];
  selectedCourseId: number | null = null;
  selectedTypeFilter: PostType | null = null;
  loading = true;
  error = '';
  actionMessage = '';
  savingPost = false;
  savingCommentPostId: number | null = null;
  loadingCommentsPostId: number | null = null;
  commentsOpenByPost: Record<number, boolean> = {};
  commentsByPost: Record<number, CommentResponse[]> = {};
  commentDraftByPost: Record<number, string> = {};
  postTypes: PostType[] = ['AVISO', 'TAREA', 'EVALUACION', 'REUNION', 'MATERIAL', 'COMUNICADO'];

  postDraft: {
    title: string;
    content: string;
    type: PostType;
    commentsEnabled: boolean;
  } = {
    title: '',
    content: '',
    type: 'AVISO',
    commentsEnabled: true
  };

  get canCreatePost(): boolean {
    return this.auth.hasAnyRole(['COLEGIO', 'PROFESOR']);
  }

  get canSubmitPost(): boolean {
    return Boolean(this.selectedCourseId && this.postDraft.title.trim() && this.postDraft.content.trim());
  }

  get filteredPosts(): PostResponse[] {
    if (!this.selectedTypeFilter) {
      return this.posts;
    }
    return this.posts.filter((post) => post.type === this.selectedTypeFilter);
  }

  ngOnInit(): void {
    this.loadCoursesAndPosts();
  }

  onCourseChange(value: number | string): void {
    const normalized = Number(value);
    if (!normalized || this.selectedCourseId === normalized) {
      return;
    }
    this.selectedCourseId = normalized;
    this.selectedTypeFilter = null;
    this.actionMessage = '';
    this.loadPosts(normalized);
  }

  createPost(): void {
    if (!this.canSubmitPost || !this.selectedCourseId) {
      return;
    }

    this.savingPost = true;
    this.actionMessage = '';

    this.postsService
      .create(this.selectedCourseId, {
        title: this.postDraft.title.trim(),
        content: this.postDraft.content.trim(),
        type: this.postDraft.type,
        commentsEnabled: this.postDraft.commentsEnabled
      })
      .subscribe({
        next: () => {
          this.savingPost = false;
          this.actionMessage = 'Publicación creada correctamente.';
          this.resetPostDraft();
          this.loadPosts(this.selectedCourseId!);
        },
        error: (error) => {
          console.error('Error al crear publicacion', error);
          this.savingPost = false;
          this.actionMessage = 'No fue posible crear la publicacion.';
        }
      });
  }

  toggleComments(postId: number): void {
    this.commentsOpenByPost[postId] = !this.commentsOpenByPost[postId];
    if (!this.commentsOpenByPost[postId]) {
      return;
    }

    if (this.commentsByPost[postId]) {
      return;
    }

    this.loadingCommentsPostId = postId;
    this.commentsService.findByPost(postId).subscribe({
      next: (comments) => {
        this.commentsByPost[postId] = comments;
        this.loadingCommentsPostId = null;
      },
      error: (error) => {
        console.error('Error al cargar comentarios', error);
        this.commentsByPost[postId] = [];
        this.loadingCommentsPostId = null;
        this.actionMessage = 'No fue posible cargar los comentarios.';
      }
    });
  }

  isCommentsOpen(postId: number): boolean {
    return Boolean(this.commentsOpenByPost[postId]);
  }

  canSubmitComment(postId: number): boolean {
    const content = this.commentDraftByPost[postId];
    return Boolean(content && content.trim());
  }

  createComment(postId: number): void {
    if (!this.canSubmitComment(postId)) {
      return;
    }

    this.savingCommentPostId = postId;
    this.commentsService
      .create(postId, {
        content: this.commentDraftByPost[postId].trim()
      })
      .subscribe({
        next: (comment) => {
          this.savingCommentPostId = null;
          const current = this.commentsByPost[postId] ?? [];
          this.commentsByPost[postId] = [...current, comment];
          this.commentDraftByPost[postId] = '';
        },
        error: (error) => {
          console.error('Error al crear comentario', error);
          this.savingCommentPostId = null;
          this.actionMessage = 'No fue posible registrar el comentario.';
        }
      });
  }

  postTypeClass(type: string): string {
    if (type === 'AVISO') {
      return 'bg-error-container text-on-error-container';
    }
    if (type === 'TAREA') {
      return 'bg-primary-container text-on-primary';
    }
    if (type === 'EVALUACION') {
      return 'bg-[#FEF08A] text-[#854D0E]';
    }
    return 'bg-surface-container-high text-on-surface-variant';
  }

  normalizeFilter(value: string | null): PostType | null {
    return value && value !== '' ? (value as PostType) : null;
  }

  loadCoursesAndPosts(): void {
    this.loading = true;
    this.error = '';

    this.coursesService.findAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        if (!courses.length) {
          this.loading = false;
          return;
        }

        this.selectedCourseId = courses[0].id;
        this.loadPosts(courses[0].id);
      },
      error: (error) => {
        console.error('Error al cargar cursos para muro', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  private loadPosts(courseId: number): void {
    this.loading = true;
    this.error = '';
    this.commentsOpenByPost = {};
    this.commentsByPost = {};
    this.commentDraftByPost = {};

    this.postsService.findByCourse(courseId).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar publicaciones', error);
        this.error = 'No fue posible cargar la informacion. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  private resetPostDraft(): void {
    this.postDraft = {
      title: '',
      content: '',
      type: 'AVISO',
      commentsEnabled: true
    };
  }
}
