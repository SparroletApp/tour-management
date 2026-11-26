
package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.TermsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TermsRepository extends JpaRepository<TermsEntity, Long> {
    List<TermsEntity> findByCompany_Id(Long companyId);
}
