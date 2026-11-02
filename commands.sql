-- Create the blog table used by the application. user_id and created_at
-- support the app's ownership checks and remain nullable/defaulted as needed.
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  author TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add two exercise blogs, owned by the first user in the application database.
INSERT INTO blogs (author, url, title, likes, user_id)
SELECT 'Ada Njeri', 'https://example.com/blog/learning-in-public', 'Learning in Public', 0, u.id
FROM (SELECT id FROM users ORDER BY id LIMIT 1) AS u
WHERE NOT EXISTS (
  SELECT 1 FROM blogs WHERE url = 'https://example.com/blog/learning-in-public'
);

INSERT INTO blogs (author, url, title, likes, user_id)
SELECT 'Sam Otieno', 'https://example.com/blog/keeping-a-reading-notes', 'Keeping Better Reading Notes', 0, u.id
FROM (SELECT id FROM users ORDER BY id LIMIT 1) AS u
WHERE NOT EXISTS (
  SELECT 1 FROM blogs WHERE url = 'https://example.com/blog/keeping-a-reading-notes'
);
