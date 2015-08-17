###-begin-kickstarter-completion-###
#
# kickstarter command completion script
# This is stolen from NPM. Thanks @isaac!
#
# Installation: kickstarter completion >> ~/.bashrc  (or ~/.zshrc)
# Or, maybe: kickstarter completion > /usr/local/etc/bash_completion.d/kickstarter
#

if type complete &>/dev/null; then
  __kickstarter_completion () {
    local si="$IFS"
    IFS=$'\n' COMPREPLY=($(COMP_CWORD="$COMP_CWORD" \
                           COMP_LINE="$COMP_LINE" \
                           COMP_POINT="$COMP_POINT" \
                           kickstarter completion -- "${COMP_WORDS[@]}" \
                           2>/dev/null)) || return $?
    IFS="$si"
  }
  complete -F __kickstarter_completion kickstarter
elif type compdef &>/dev/null; then
  __kickstarter_completion() {
    si=$IFS
    compadd -- $(COMP_CWORD=$((CURRENT-1)) \
                 COMP_LINE=$BUFFER \
                 COMP_POINT=0 \
                 kickstarter completion -- "${words[@]}" \
                 2>/dev/null)
    IFS=$si
  }
  compdef __kickstarter_completion kickstarter
elif type compctl &>/dev/null; then
  __kickstarter_completion () {
    local cword line point words si
    read -Ac words
    read -cn cword
    let cword-=1
    read -l line
    read -ln point
    si="$IFS"
    IFS=$'\n' reply=($(COMP_CWORD="$cword" \
                       COMP_LINE="$line" \
                       COMP_POINT="$point" \
                       kickstarter completion -- "${words[@]}" \
                       2>/dev/null)) || return $?
    IFS="$si"
  }
  compctl -K __kickstarter_completion kickstarter
fi
###-end-kickstarter-completion-###
