package cl.aulafy.api.courses.entity;

import cl.aulafy.api.users.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "guardian_students")
public class GuardianStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id", nullable = false)
    private User guardian;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false, length = 80)
    private String relationship;

    public GuardianStudent() {
    }

    public GuardianStudent(User guardian, User student, String relationship) {
        this.guardian = guardian;
        this.student = student;
        this.relationship = relationship;
    }

    public Long getId() {
        return id;
    }

    public User getGuardian() {
        return guardian;
    }

    public User getStudent() {
        return student;
    }

    public String getRelationship() {
        return relationship;
    }
}
