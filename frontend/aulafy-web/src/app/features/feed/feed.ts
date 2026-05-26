import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { CoursesService } from '../../core/services/courses.service';
import { PostsService } from '../../core/services/posts.service';
import { CourseResponse, PostResponse, PostType } from '../../shared/models/aulafy.models';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">Muro del curso</span>
        <h2>Publicaciones</h2>
      </div>
      <select [value]="selectedCourseId || ''" (change)="selectCourse($event)">
        <option value="" disabled>Seleccione curso</option>
        <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
      </select>
    </section>

    <section class="work-area" *ngIf="canPublish()">
      <h3>Nueva publicacion</h3>
      <form class="form-grid" [formGroup]="form" (ngSubmit)="create()">
        <label>
          Titulo
          <input formControlName="title" />
        </label>
        <label>
          Tipo
          <select formControlName="type">
            <option *ngFor="let type of postTypes" [value]="type">{{ type }}</option>
          </select>
        </label>
        <label class="wide">
          Contenido
          <textarea rows="4" formControlName="content"></textarea>
        </label>
        <label class="inline-check">
          <input type="checkbox" formControlName="commentsEnabled" />
          Permitir comentarios
        </label>
        <button class="button primary" type="submit" [disabled]="form.invalid || !selectedCourseId">Publicar</button>
      </form>
    </section>

    <section class="feed-list">
      <article class="post-card" *ngFor="let post of posts">
        <header>
          <span class="badge">{{ post.type }}</span>
          <small>{{ post.authorName }} · {{ post.createdAt | date:'short' }}</small>
        </header>
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <footer>
          <span *ngIf="post.pinned">Fijada</span>
          <span>{{ post.commentsEnabled ? 'Comentarios abiertos' : 'Comentarios cerrados' }}</span>
        </footer>
      </article>
      <p class="empty-state" *ngIf="!posts.length">No hay publicaciones cargadas para este curso.</p>
    </section>
  `
})
export class FeedComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly coursesService = inject(CoursesService);
  private readonly postsService = inject(PostsService);
  private readonly auth = inject(AuthService);

  courses: CourseResponse[] = [];
  posts: PostResponse[] = [];
  selectedCourseId?: number;
  postTypes: PostType[] = ['AVISO', 'TAREA', 'EVALUACION', 'REUNION', 'MATERIAL', 'COMUNICADO'];
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    content: ['', [Validators.required]],
    type: ['AVISO' as PostType, [Validators.required]],
    commentsEnabled: [true]
  });

  ngOnInit(): void {
    this.coursesService.findAll().subscribe((courses) => {
      this.courses = courses;
      this.selectedCourseId = courses[0]?.id;
      this.loadPosts();
    });
  }

  selectCourse(event: Event): void {
    this.selectedCourseId = Number((event.target as HTMLSelectElement).value);
    this.loadPosts();
  }

  create(): void {
    if (!this.selectedCourseId || this.form.invalid) {
      return;
    }
    this.postsService.create(this.selectedCourseId, this.form.getRawValue()).subscribe((post) => {
      this.posts = [post, ...this.posts];
      this.form.reset({ title: '', content: '', type: 'AVISO', commentsEnabled: true });
    });
  }

  canPublish(): boolean {
    return this.auth.hasAnyRole(['ADMIN', 'COLEGIO', 'PROFESOR']);
  }

  private loadPosts(): void {
    if (!this.selectedCourseId) {
      this.posts = [];
      return;
    }
    this.postsService.findByCourse(this.selectedCourseId).subscribe((posts) => this.posts = posts);
  }
}
