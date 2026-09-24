# Serves the exported design as a plain static site.
#
# This is a client preview, not the application. The pages in design/ are
# self-contained HTML with their own runtime (support.js, image-slot.js and the
# _ds bundle) and they cross-link to each other by their exact filenames, so
# they are served verbatim — no bundler touches them, nothing gets renamed.
#
# The React scaffold in src/ is deliberately not built here. It exists for the
# real work later; putting it in front of the preview would only get in the way.
FROM nginx:alpine

# Coolify's proxy terminates TLS and forwards to port 80, which is what the
# stock nginx image already listens on.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY design/ /usr/share/nginx/html/

EXPOSE 80
