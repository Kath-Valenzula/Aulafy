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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(length = 20)
    private String run;

    @Column(length = 120)
    private String emergencyContact;

    public StudentProfile() {
    }

    public StudentProfile(User user, Course course, String run, String emergencyContact) {
        this.user = user;
        this.course = course;
        this.run = run;
        this.emergencyContact = emergencyContact;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Course getCourse() {
        return course;
    }

    public String getRun() {
        return run;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }
}
