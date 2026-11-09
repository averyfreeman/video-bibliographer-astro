# make sure codex doesn't use ghostty terminfo:
unset TERMINFO
export TERM=xterm-256color
export CBM_CACHE_DIR=$CODEX_HOME/.cbm-mcp
export CBM_RUNTIME_DIR=$CODEX_HOME/.tmp
export TERMINFO_DIRS="$HOME/.local/share/terminfo"
