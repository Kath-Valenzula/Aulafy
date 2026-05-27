package cl.aulafy.api.academic.entity;

import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.entity.Subject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description = "Evaluacion academica";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EvaluationType type = EvaluationType.PRUEBA;

    @Column(nullable = false)
    private LocalDate evaluationDate;

    @Column
    private Integer weight;

    @Column(nullable = false)
    private boolean active = true;

    public Evaluation() {
    }

    public Evaluation(Course course, Subject subject, String title, LocalDate evaluationDate, Integer weight) {
        this.course = course;
        this.subject = subject;
        this.title = title;
        this.evaluationDate = evaluationDate;
        this.weight = weight;
    }

    public Evaluation(Course course, Subject subject, String title, String description,
                      EvaluationType type, LocalDate evaluationDate, Integer weight) {
        this.course = course;
        this.subject = subject;
        this.title = title;
        this.description = description;
        this.type = type;
        this.evaluationDate = evaluationDate;
        this.weight = weight;
    }

    public Long getId() {
        return id;
    }

    public Course getCourse() {
        return course;
    }

    public Subject getSubject() {
        return subject;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EvaluationType getType() {
        return type;
    }

    public void setType(EvaluationType type) {
        this.type = type;
    }

    public LocalDate getEvaluationDate() {
        return evaluationDate;
    }

    public void setEvaluationDate(LocalDate evaluationDate) {
        this.evaluationDate = evaluationDate;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
