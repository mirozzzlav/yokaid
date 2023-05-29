-- name: GetAUserById :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetAUser :one
SELECT * FROM users
WHERE username = $1 LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at DESC;

-- name: CreateUser :one
INSERT INTO users (
   "username", "fullname", "email", "hashed_password", "role"
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: ListPolicies :many
SELECT subject, action, resource FROM policies;

-- name: ListProfessionals :many
SELECT pro.*, u.*, ps.*, s.* FROM professionals pro, users u, professionals_services ps, services s
WHERE pro.user = u.id AND ps.professional = pro.id and ps.service = s.name;