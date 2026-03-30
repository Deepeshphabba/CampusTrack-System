package com.campustrack.config;

import com.campustrack.model.Issue;
import com.campustrack.model.User;
import com.campustrack.repository.IssueRepository;
import com.campustrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository  userRepo;
    private final IssueRepository issueRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.existsByEmail("admin@campus.edu")) {
            log.info("Database already seeded — skipping.");
            return;
        }

        log.info("Seeding demo data …");

        // ── Users ──────────────────────────────────────────────────────
        User admin = saveUser("Ravi Kumar",     "admin@campus.edu",   "password", User.Role.ADMIN, "Facilities");
        User staff1 = saveUser("Priya Sharma",  "priya@campus.edu",   "password", User.Role.STAFF, "IT");
        User staff2 = saveUser("Arun Mehta",    "arun@campus.edu",    "password", User.Role.STAFF, "Infrastructure");
        User stu1   = saveUser("Sneha Reddy",   "sneha@campus.edu",   "password", User.Role.STUDENT, "CSE");
        User stu2   = saveUser("Vikram Singh",  "vikram@campus.edu",  "password", User.Role.STUDENT, "ECE");
        User stu3   = saveUser("Ananya Gupta",  "ananya@campus.edu",  "password", User.Role.STUDENT, "MECH");

        // ── Issues ─────────────────────────────────────────────────────
        saveIssue("WiFi not working in Block A",
                "Students in Block A, floors 2–4 are unable to connect to campus Wi-Fi since morning.",
                Issue.Category.IT_NETWORK, Issue.Priority.CRITICAL, "Block A — Floor 2", stu1, staff1,
                Issue.Status.OPEN);

        saveIssue("Broken window in Library Hall",
                "Window pane on the east side of the library reading hall is cracked and poses a safety risk.",
                Issue.Category.INFRASTRUCTURE, Issue.Priority.HIGH, "Central Library", stu2, staff2,
                Issue.Status.IN_PROGRESS);

        saveIssue("Projector malfunction in Room 301",
                "The ceiling projector in lecture room 301 flickers and shuts down during presentations.",
                Issue.Category.ACADEMIC, Issue.Priority.MEDIUM, "Academic Block B — Room 301", stu1, staff1,
                Issue.Status.OPEN);

        saveIssue("Water leakage in Boys Hostel",
                "Continuous water leakage from the ceiling of the second floor corridor.",
                Issue.Category.INFRASTRUCTURE, Issue.Priority.CRITICAL, "Boys Hostel — Block 2", stu2, staff2,
                Issue.Status.IN_PROGRESS);

        saveIssue("Fire extinguisher expired in Lab",
                "The fire extinguisher near the Chemistry Lab expired last month and has not been replaced.",
                Issue.Category.SAFETY, Issue.Priority.HIGH, "Science Block — Chemistry Lab", stu3, admin,
                Issue.Status.OPEN);

        saveIssue("Elevator out of service",
                "Elevator in the main academic building has been non-functional for two weeks.",
                Issue.Category.FACILITIES, Issue.Priority.HIGH, "Main Academic Building", stu3, staff2,
                Issue.Status.OPEN);

        saveIssue("Slow internet in Computer Lab",
                "Network speeds in the computer lab are too slow for downloading course materials.",
                Issue.Category.IT_NETWORK, Issue.Priority.MEDIUM, "Computer Lab — Block C", stu1, staff1,
                Issue.Status.RESOLVED);

        saveIssue("Damaged chairs in Seminar Hall",
                "Multiple chairs in the seminar hall are broken and need replacement.",
                Issue.Category.INFRASTRUCTURE, Issue.Priority.LOW, "Seminar Hall — Ground Floor", stu2, null,
                Issue.Status.OPEN);

        saveIssue("Power outage in Girls Hostel",
                "Frequent power cuts in the Girls Hostel B during evening hours.",
                Issue.Category.INFRASTRUCTURE, Issue.Priority.CRITICAL, "Girls Hostel — Block B", stu3, staff2,
                Issue.Status.IN_PROGRESS);

        saveIssue("Lack of first-aid supplies",
                "The first-aid box in the sports complex is empty and needs restocking.",
                Issue.Category.SAFETY, Issue.Priority.MEDIUM, "Sports Complex", stu1, admin,
                Issue.Status.RESOLVED);

        saveIssue("Exam schedule not updated online",
                "The university exam portal still shows last semester's schedule.",
                Issue.Category.ACADEMIC, Issue.Priority.HIGH, "Admin Block", stu2, staff1,
                Issue.Status.OPEN);

        saveIssue("Mosquito problem in campus grounds",
                "Stagnant water near the parking lot is breeding mosquitoes.",
                Issue.Category.SAFETY, Issue.Priority.MEDIUM, "Parking Lot Area", stu3, admin,
                Issue.Status.CLOSED);

        log.info("Demo data seeded: {} users, {} issues", userRepo.count(), issueRepo.count());
    }

    private User saveUser(String name, String email, String rawPwd, User.Role role, String dept) {
        User u = User.builder()
                .fullName(name).email(email)
                .password(encoder.encode(rawPwd))
                .role(role).department(dept).build();
        return userRepo.save(u);
    }

    private void saveIssue(String title, String desc, Issue.Category cat, Issue.Priority prio,
                           String location, User reporter, User assignee, Issue.Status status) {
        Issue issue = Issue.builder()
                .issueNumber(String.format("CIT-%03d", issueRepo.count() + 1))
                .title(title).description(desc)
                .category(cat).priority(prio).status(status)
                .location(location).reportedBy(reporter).assignedTo(assignee)
                .build();
        issueRepo.save(issue);
    }
}
