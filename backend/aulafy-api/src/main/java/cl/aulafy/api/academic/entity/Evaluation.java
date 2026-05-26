package cl.aulafy.api.academic.entity;

import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.entity.Subject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(nullable = false)
    private LocalDate evaluationDate;

    @Column(nullable = false)
    private Integer weight;

    public Evaluation() {
    }

    public Evaluation(Course course, Subject subject, String title, LocalDate evaluationDate, Integer weight) {
        this.course = course;
        this.subject = subject;
        this.title = title;
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

    public LocalDate getEvaluationDate() {
        return evaluationDate;
    }

    public Integer getWeight() {
        return weight;
    }
}
