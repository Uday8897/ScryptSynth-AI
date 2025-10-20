#!/bin/sh
# Inject runtime environment variables into built JS files

echo "Injecting runtime environment variables..."

# Wait until NGINX files exist (safety for container restarts)
if [ -d "/usr/share/nginx/html/assets" ]; then
  for file in /usr/share/nginx/html/assets/*.js; do
    if [ -f "$file" ]; then
      echo "Updating: $file"
      sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" "$file"
    fi
  done
else
  echo "Warning: assets folder not found"
fi

# Run nginx
exec "$@"
