date=$(date '+%Y%m%d_%T' | tr -d :)
7zz a ./release/$date.zip  \
fanbox-downloader.js manifest.json jszip.min.js LICENSE event_page.js icon_*.png