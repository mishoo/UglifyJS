if command -v timeout &> /dev/null; then NATIVE=1; fi
timeout() {
    T=$1
    shift
    shift
    shift
    expect <<EOF
set timeout $T
spawn -noecho sh -c "$@"
expect timeout { exit 124 } eof
catch wait ret
exit [lindex \$ret 3]
EOF
    return $?
}
if [ $NATIVE ]; then unset -f timeout; fi

git clone --branch v1.6.0 --depth 1 https://github.com/jasongin/nvs.git ~/.nvs
while ! timeout 60 bash -c ". ~/.nvs/nvs.sh add $NODE && nvs use $NODE"; do
    cd ~/.nvs
    while !(git clean -xdf); do echo "'git clean' failed - retrying..."; done
    cd -
done
. ~/.nvs/nvs.sh --version
nvs use $NODE
node --version
npm config set audit false
npm config set optional false
npm config set save false
npm config set strict-ssl false
npm config set update-notifier false
npm --version
while !(npm install); do echo "'npm install' failed - retrying..."; done
