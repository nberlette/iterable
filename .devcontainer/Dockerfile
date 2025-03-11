# [Choice] Debian OS version: bullseye, buster
ARG VARIANT=bullseye
FROM --platform=linux/amd64 mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

# update system packages and cleanup cache
ARG DEBIAN_FRONTEND=noninteractive

# install deno
ENV DENO_INSTALL=/usr/local
RUN /bin/bash -c "$(curl -fsSL https://deno.land/install.sh)" \
    && chown ${USER:-vscode} /usr/local/bin/deno

RUN sudo apt-get -y update \
    && sudo apt-get -y install --no-install-recommends gcc git-extras \
    && sudo apt-get -y upgrade && sudo rm -rf /var/lib/apt/lists/*

# default preset used for the starship terminal prompt.
# acceptable values are "bracketed-segments", "gruvbox-rainbow", "jetpack", "nerd-font-symbols", "no-empty-icons", "no-nerd-font", "no-runtime-versions", "pastel-powerline", "plain-text-symbols", "pure-preset", "tokyo-night"
ENV STARSHIP_PRESET="gruvbox-rainbow" HOME=/home/${USER:-vscode}

# add some extensions to the bottom of the .bashrc file, to ensure homebrew is
# configured correctly, install the starship CLI (if needed), and configure its
# preset configuration if none is defined yet. also adds a couple aliases.
RUN echo '[[ ":$PATH:" == *":$HOMEBREW_PREFIX:"* ]] || export PATH="$HOMEBREW_PREFIX/bin:$PATH"; eval "$(brew shellenv)";' >> ${HOME}/.bashrc \
  && echo 'command -v starship &>/dev/null || brew install starship &>/dev/null; eval "$(starship init bash)";' >> ${HOME}/.bashrc \
  && echo '[ -f "$HOME/.config/starship.toml" ] || starship preset '${STARSHIP_PRESET:-"gruvbox-rainbow"}' -o ~/.config/starship.toml' >> ${HOME}/.bashrc \
  && echo 'alias ll="ls -AlhFo --color=auto --si --group-directories-first --time-style=long-iso --file-type";\\n'\
          'alias dq="deno repl -qA --v8-flags=--expose-gc,--harmony;\\n'\
          >> ${HOME}/.bashrc

RUN sudo mkdir -p /etc/bash_completion.d && deno completions bash > /etc/bash_completion.d/deno.bash
