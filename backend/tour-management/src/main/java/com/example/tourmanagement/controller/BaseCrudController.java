package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.tourmanagement.service.CrudService;

/**
 * Generic REST endpoints: GET all, GET one, POST, PUT, DELETE.
 * Subclasses add @RestController + @RequestMapping and supply the service.
 */
public abstract class BaseCrudController<D> {

    protected abstract CrudService<D> crudService();

    @GetMapping
    public List<D> getAll() {
        return crudService().findAll();
    }

    @GetMapping("/{id}")
    public D getById(@PathVariable Long id) {
        return crudService().findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public D create(@RequestBody D body) {
        return crudService().create(body);
    }

    @PutMapping("/{id}")
    public D update(@PathVariable Long id, @RequestBody D body) {
        return crudService().update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        crudService().delete(id);
    }
}
