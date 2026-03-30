package com.campustrack.repository;

import com.campustrack.model.Issue;
import com.campustrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    Optional<Issue> findByIssueNumber(String issueNumber);

    List<Issue> findAllByOrderByCreatedAtDesc();

    List<Issue> findByStatusOrderByCreatedAtDesc(Issue.Status status);

    List<Issue> findByCategoryOrderByCreatedAtDesc(Issue.Category category);

    List<Issue> findByPriorityOrderByCreatedAtDesc(Issue.Priority priority);

    List<Issue> findByReportedByOrderByCreatedAtDesc(User user);

    List<Issue> findByAssignedToOrderByCreatedAtDesc(User user);

    // status counts
    long countByStatus(Issue.Status status);

    // category counts
    long countByCategory(Issue.Category category);

    // priority counts
    long countByPriority(Issue.Priority priority);

    // top locations
    @Query("SELECT i.location, COUNT(i) as cnt FROM Issue i GROUP BY i.location ORDER BY cnt DESC")
    List<Object[]> findTopLocations();

    // recent activity – last 10 issues updated
    @Query("SELECT i FROM Issue i ORDER BY i.updatedAt DESC")
    List<Issue> findRecentlyUpdated(org.springframework.data.domain.Pageable pageable);

    // search by keyword in title or location
    @Query("SELECT i FROM Issue i WHERE LOWER(i.title) LIKE LOWER(CONCAT('%',:kw,'%')) OR LOWER(i.location) LIKE LOWER(CONCAT('%',:kw,'%')) ORDER BY i.createdAt DESC")
    List<Issue> searchByKeyword(@Param("kw") String keyword);

    // filter by status + category
    @Query("SELECT i FROM Issue i WHERE (:status IS NULL OR i.status = :status) AND (:category IS NULL OR i.category = :category) ORDER BY i.createdAt DESC")
    List<Issue> findByFilters(@Param("status") Issue.Status status, @Param("category") Issue.Category category);
}
