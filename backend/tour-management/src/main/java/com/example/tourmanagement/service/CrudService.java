package com.example.tourmanagement.service;

import java.util.List;

/** Common CRUD contract shared by every entity service. D is the DTO type. */
public interface CrudService<D> {

    List<D> findAll();

    D findById(Long id);

    D create(D dto);

    D update(Long id, D dto);

    void delete(Long id);
}
