package com.campustrack.service;

import com.campustrack.dto.Dtos;
import com.campustrack.exception.AppException;
import com.campustrack.model.User;
import com.campustrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;

    public List<Dtos.UserSummary> getAllUsers() {
        return userRepo.findAll().stream().map(this::toSummary).collect(Collectors.toList());
    }

    public List<Dtos.UserSummary> getStaffAndAdmins() {
        return userRepo.findByRoleIn(List.of(User.Role.STAFF, User.Role.ADMIN))
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    public Dtos.UserSummary getUserById(Long id) {
        return userRepo.findById(id).map(this::toSummary)
                .orElseThrow(() -> AppException.notFound("User not found: " + id));
    }

    private Dtos.UserSummary toSummary(User u) {
        return Dtos.UserSummary.builder()
                .id(u.getId()).fullName(u.getFullName()).email(u.getEmail())
                .initials(u.getInitials()).role(u.getRole().name())
                .department(u.getDepartment()).build();
    }
}
