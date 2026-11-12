package com.example.tourmanagement.service.impl;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;

import org.springframework.beans.BeanUtils;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.tourmanagement.service.CrudService;

/**
 * Shared CRUD logic. E = entity, D = DTO.
 * DTOs have the same field names as the entities, so mapping is done with BeanUtils.
 * Subclasses supply the repository, factories and (optionally) validation / defaults.
 */
public abstract class AbstractCrudServiceImpl<E, D> implements CrudService<D> {

    /** Never copied from a DTO onto an entity. */
    protected static final String[] IGNORED = { "id", "createdAt", "updatedAt" };

    protected abstract JpaRepository<E, Long> repo();

    protected abstract Supplier<E> newEntity();

    protected abstract Supplier<D> newDto();

    /** Fields that cannot change after creation (for example the parent id). */
    protected String[] lockedFields() {
        return new String[0];
    }

    /** Called on create and update. id is null on create. Throw ResponseStatusException to reject. */
    protected void validate(E entity, Long id) {
    }

    /** Called on create and update, after validation: fill defaults here. */
    protected void prepare(E entity) {
    }

    protected String entityName() {
        return getClass().getSimpleName().replace("ServiceImpl", "");
    }

    // ---------- mapping ----------

    protected D toDto(E entity) {
        return copy(entity, newDto());
    }

    protected E toEntity(D dto) {
        return copy(dto, newEntity(), IGNORED);
    }

    protected static <S, T> T copy(S source, Supplier<T> factory, String... ignore) {
        T target = factory.get();
        BeanUtils.copyProperties(source, target, ignore);
        return target;
    }

    protected E findEntity(Long id) {
        return repo().findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, entityName() + " not found: " + id));
    }

    protected static void requireExists(JpaRepository<?, Long> repository, Long id, String what) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, what + " is required");
        }
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, what + " not found: " + id);
        }
    }

    // ---------- CrudService ----------

    @Override
    @Transactional(readOnly = true)
    public List<D> findAll() {
        return repo().findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public D findById(Long id) {
        return toDto(findEntity(id));
    }

    @Override
    @Transactional
    public D create(D dto) {
        E entity = toEntity(dto);
        validate(entity, null);
        prepare(entity);
        return toDto(repo().save(entity));
    }

    /** Full replace: fields missing from the body become null (id, createdAt and locked fields are kept). */
    @Override
    @Transactional
    public D update(Long id, D dto) {
        E existing = findEntity(id);
        String[] ignore = Stream.concat(Arrays.stream(IGNORED), Arrays.stream(lockedFields()))
                .toArray(String[]::new);
        BeanUtils.copyProperties(dto, existing, ignore);
        validate(existing, id);
        prepare(existing);
        return toDto(repo().save(existing));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repo().delete(findEntity(id));
    }
}
