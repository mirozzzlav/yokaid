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
INSERT INTO users ("username", "fullname", "email", "hashed_password") VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: DeleteAuthor :exec
DELETE FROM users
WHERE id = $1;